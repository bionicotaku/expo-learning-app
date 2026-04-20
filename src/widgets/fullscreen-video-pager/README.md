# Fullscreen Video Pager Widget

`widgets/fullscreen-video-pager` 负责沉浸式纵向视频页的 widget 壳层、播放会话和 row 装配。

## 当前结构

当前 fullscreen 不再采用“pager 顶层统一 HUD”的旧结构，而是固定分成三类附着域：

- `page-attached overlays`
  - `TopChromeOverlay`
  - `PagerShellLoadingPill`
- `row-attached overlays`
  - `RowOwnedVideoOverlay`
  - `RowPlaybackHudOverlay`
  - `RowSurfaceStatusOverlay`
- `row-local input surface`
  - `ActiveVideoGestureSurface`

对应的组件树是：

```text
FullscreenVideoPager
├── FlatList
│   └── FullscreenVideoRow
│       ├── PlayableVideoSurface
│       ├── ActiveVideoGestureSurface
│       ├── RowOwnedVideoOverlay
│       ├── RowPlaybackHudOverlay
│       └── RowSurfaceStatusOverlay
├── TopChromeOverlay
└── PagerShellLoadingPill
```

## 目录职责

- `model/use-fullscreen-playback-session.ts`
  - fullscreen 播放会话入口
  - 持有 `activeIndex`、`activeItemId`、`basePausedByUser`、`transientHoldState`
  - 持有当前 active row 的 `activePlayerControllerRef`
  - 持有 `videoId -> rowPlaybackHudState` 的稀疏 HUD store
  - 管理 pause / seek / rate 的生命周期与 timer
- `model/row-playback-hud-state.ts`
  - row HUD store 的纯数据结构与更新 helper
- `model/row-hud-layout.ts`
  - row HUD 的中心位 owner 规则
  - pause fade-out reservation 时长
  - row HUD slot 派生 helper
- `model/row-surface-presentation.ts`
  - row surface presenter contract
- `model/render-props.ts`
  - row 与 player surface 的 memo compare contract
- `ui/fullscreen-video-pager.tsx`
  - FlatList 壳层
  - 初始定位与 post-load alignment
  - active row 切换装配
  - page-attached overlays 渲染
- `ui/fullscreen-video-row.tsx`
  - 单条 fullscreen row
  - 装配 player、gesture、content overlay、HUD overlay、surface status overlay
- `ui/playable-video-surface.tsx`
  - 播放器执行层
  - 同步 `shouldPlay` / `playbackRate`
  - 暴露 active controller 与 row-local surface presentation
- `ui/row-playback-hud-overlay.tsx`
  - row-local pause / seek / rate HUD
- `ui/row-hud-anchors.tsx`
  - row HUD 固定锚点布局
  - `center / leftCenter / rightCenter / top` 四个 slot
- `ui/row-surface-status-overlay.tsx`
  - row-local loading / error / retry presenter

## 核心职责

当前 widget 固定承担：

- 纵向分页滚动
- 首屏定位与空列表回填后的 post-load alignment
- 只为当前视频与前后 2 个视频挂载 player
- 维护当前 fullscreen 播放会话
- 只为当前 active row 挂真实背景手势层
- 把 HUD state 绑定到 `videoId`，但只在对应 row 内渲染
- 把 player surface 的 loading / error / retry 收口到 row-local presenter
- 在 row 内维护 center owner，避免 pause / loading / seek 之间的布局抖动

当前 widget 不承担：

- feed 数据请求本身
- 跨页面恢复定位状态
- 全局 toast
- pager 顶层播放器 HUD
- 多 row 的播放器实例管理策略以外的业务逻辑

## 播放会话模型

`useFullscreenPlaybackSession` 当前固定持有：

- `activeIndex`
- `activeItemId`
- `basePausedByUser`
- `transientHoldState`
- `activeSurfaceState`
- `activePlayerControllerRef`
- `rowPlaybackHudStateByVideoId`

其中：

- `basePausedByUser` 是正常播/停基态
- `transientHoldState` 是左右/中间长按期间的临时覆盖态
- `activeSurfaceState` 只反映当前 active row 的 `loading | ready | error`
- `rowPlaybackHudStateByVideoId` 允许旧 row 的 HUD 在 active row 切换后继续跟随该 row 自然消失

### HUD store

每个 row 的 HUD state 结构是：

```ts
type FullscreenRowPlaybackHudState = {
  pauseIndicatorVisible: boolean;
  transientFeedback:
    | null
    | { kind: 'seek'; deltaSeconds: -5 | 5 }
    | { kind: 'rate'; label: '2x' };
};
```

行为固定为：

- `single tap`
  - toggle `basePausedByUser`
  - 当前 `activeItemId` 的 pause HUD 显示约 `3s`
- `double tap`
  - seek 成功后只给当前 `activeItemId` 写入 `seek` HUD
  - 约 `700ms` 后自动清掉
- `hold start`
  - 左右区写入 `rate` HUD
  - 不自动 dismiss
- `hold end`
  - 清当前 active row 的 `rate` HUD
- `row unmount`
  - 清该 row 的 HUD timers 与 HUD store entry

## 手势与播放器边界

`ActiveVideoGestureSurface` 当前固定为 row-local input surface：

- `single tap`
  - 使用 `Pressable`
  - 等待 double tap / long press 失败后才触发
- `double tap + long press`
  - 使用 `GestureDetector`
  - 只挂在 active row

`PlayableVideoSurface` 当前固定为执行层，不再直接渲染 loading / error UI。它只负责：

- 本地持有 `VideoPlayer`
- 同步 `shouldPlay`
- 同步 `playbackRate`
- 暴露最小 active controller `{ seekBy, surfaceState }`
- 向 row 上报 `surfacePresentation`

`RowSurfaceStatusOverlay` 负责：

- loading 时显示中心 glass spinner
- error 时显示 dark scrim + error message + `Retry`
- 在 active row error 时自然压住背景手势与 HUD

## Row HUD 布局

row 内 HUD 不再靠各组件各自定位，而是走固定 slot：

- `center`
  - `pause` 或 `loading`
- `leftCenter`
  - backward seek
- `rightCenter`
  - forward seek
- `top`
  - `2x`

中心位 owner 由 `row-hud-layout.ts` 决定：

- `pause` 优先于 `loading`
- pause 消失后，会继续保留一段与 fade-out 对齐的 center reservation
- reservation 结束后，如果 surface 仍处于 `loading`，中心位才切到 loading
- `seek` 和 `rate` 不参与中心位竞争

## 调用链

### Single tap

1. `ActiveVideoGestureSurface` 识别单击
2. session hook toggle `basePausedByUser`
3. session hook 为当前 `videoId` 写入 pause HUD
4. `FullscreenVideoRow` 把该 state 交给 `RowPlaybackHudOverlay`

### Double tap

1. `ActiveVideoGestureSurface` 识别左右区
2. session hook 通过当前 active controller 调 `seekBy(±5)`
3. 成功后只给当前 `videoId` 写入 seek HUD
4. HUD 跟随所属 row 渲染并自动消失

### Long press

1. `ActiveVideoGestureSurface` 识别左右/中间区
2. session hook 写入 `transientHoldState`
3. 左右区写入 `rate` HUD
4. row 内持续显示 `2x` HUD，直到 `hold end`

### Active row 切换

切换时同步执行：

- reset `basePausedByUser`
- clear `transientHoldState`
- clear current active controller
- clear `activeSurfaceState`
- 清旧 active row 的 `rate` HUD

但不会全局清空 `pause / seek` HUD store；旧 row 仍按自己的生命周期或 unmount 清理。

## 维护约束

- 不要把 row-local HUD 再提回 pager 顶层
- 不要把 `RowPlaybackHudOverlay` 并回 `RowOwnedVideoOverlay`
- 不要把 loading / error presenter 再塞回 `PlayableVideoSurface`
- 不要让 `features/video-playback` 持有 React state 或 UI
- 只在 active row 上注册 active controller
- active row `surfaceState === 'error'` 时，背景手势必须关闭，让 `Retry` 直接接管点击
