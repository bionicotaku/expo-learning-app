# Fullscreen Video Pager Widget

`widgets/fullscreen-video-pager` 负责沉浸式纵向视频页的 widget 壳层、播放会话和 row 装配。

当前输入模型已经对齐为：

- canonical `VideoListItem`
- 再叠加 `video-runtime` 后的 `effective` item

## 当前结构

当前 fullscreen 不再采用“pager 顶层统一 HUD”的旧结构，而是固定分成三类附着域：

- `page-attached overlays`
  - `TopChromeOverlay`
  - `PagerShellLoadingPill`
- `row-attached overlays`
  - `RowOwnedVideoOverlay`
  - `RowPlaybackHudOverlay`
  - `RowSurfaceStatusOverlay`
- `row-local interaction layer`
  - `RowPlaybackInteractionLayer`
    - `BackgroundGestureRegion`
    - `RowPlaybackSeekBarOverlay`

对应的组件树是：

```text
FullscreenVideoPager
├── FlatList
│   └── FullscreenVideoRow
│       ├── RowPlaybackMediaLayer
│       │   └── PlayableVideoSurface
│       ├── RowPlaybackInteractionLayer
│       │   └── RowPlaybackSeekBarOverlay
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
- `model/row-progress-snapshot.ts`
  - row-local progress snapshot shape
  - `timeUpdate` payload -> seek bar display snapshot
- `model/row-playback-seek-bar-store.ts`
  - row-local seek bar runtime store
  - 持有真实 `progressSnapshot` 与 row-local `seekController`
  - 支持 optimistic seek 和外部订阅
- `model/render-props.ts`
  - row 与 player surface 的 memo compare contract
- `ui/fullscreen-video-pager.tsx`
  - FlatList 壳层
  - mount-scoped `entryIndex` 初始定位与 post-load alignment
  - active row 切换装配
  - 通过 `onActiveVideoChange(itemId, index)` 向 session 层报告当前 active video
  - 透传 row action rail 的本地动作
  - 持有 description measurement cache；cache 跟随当前 pager/session 生命周期，而不是挂在模块全局
  - cache 是有上限的 session-scoped 插入序缓存；读取只做纯命中，不在 render 路径里改共享顺序
  - page-attached overlays 渲染
- `ui/fullscreen-video-row.tsx`
  - 单条 fullscreen row
  - 装配 row-local media layer、interaction layer、content overlay、HUD overlay、surface status overlay
- `ui/row-owned-video-overlay.tsx`
  - row-owned 内容层
  - 持有标题与底部内容文案区的排版壳
  - 标题与 description 共用同一条文本列宽；内容区整体向左扩并缩小 rail 前留白
  - title / description / `展开 / 收起` 固定视觉尺寸，显式关闭字体缩放；该约束只作用于 row-owned overlay 自身
  - 父层只负责 title + description 区整体向上/向下的布局动画，不再持有 description 的内部展开态或按钮显隐态
  - 消费 `expandable-overlay-description` 模块导出的完整 layout contract，并把文本列与固定 action lane 分别挂到动画树内外
  - 折叠态不为 action lane 预留底部空行，`展开` 与 description 第二行并排；展开态由 layout contract 驱动内容列整体上抬，为 `收起` 单独留一行
  - 装配右侧 action rail 与 row-local 的可展开 description
- `ui/expandable-overlay-description.tsx`
  - row-local description 状态模块 + presenter
  - 默认最多 2 行；折叠态直接使用 native tail ellipsis，让 `...` 跟在 description 文本后面
  - 持有 description 的 measurement 与 `expandedExpansionKey`；当前 `isExpanded` 由 `activeVisitToken + measurementKey` 同步派生，active visit 一变更就首帧失效，不再靠 effect 事后清理
  - 同一模块同时导出 description state hook、完整 layout contract、文本 presenter 和固定 `展开 / 收起` action presenter，不再通过父子 callback 桥同步按钮显隐
  - 先做 hidden text measurement，再进入稳定的 `measuring | static | collapsed | expanded` 渲染阶段
  - measurement key 只绑定 description measurement typography、宽度和 description 文本；title / action / lane 样式调整不再误伤 description measurement cache
  - `展开 / 收起` action presenter 挂在父层 absolute sibling，避开内容列的 layout animation；折叠态与第二行同 baseline，展开态作为独立最后一行；标签只在固定槽位里做 opacity crossfade，不再通过 enter/exit 重新挂载
- `ui/row-playback-media-layer.tsx`
  - row 内 player / progress / seek controller 的局部装配层
  - 持有 row-local `surfacePresentation`
  - 把真实 `progressSnapshot` 与 row-local `seekController` 写入 seek bar store
  - 把 progress 的高频更新限制在 media layer 内
- `ui/row-playback-interaction-layer.tsx`
  - row 内唯一正式 interaction owner
  - 内部拆成 `BackgroundGestureRegion` 和底部 `SeekBarControlLane`
  - 持有 seek bar draft state，并把背景手势与 seek bar 命中区几何分离
- `ui/playable-video-surface.tsx`
  - 播放器执行层
  - 同步 `shouldPlay` / `playbackRate`
  - 暴露 active controller、row-local `seekController` 与 row-local surface presentation
  - 通过 `timeUpdate + bounded resync` 向 active row 上报 progress snapshot
- `ui/row-playback-hud-overlay.tsx`
  - row-local pause / seek / rate HUD
- `ui/row-playback-seek-bar-overlay.tsx`
  - interaction layer 内的 seek bar presenter/control strip
  - 只负责渲染左当前时间、中间 rail + thumb、右总时长
  - 不再直接订阅 store，也不再向背景层注册手势 blocker
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
- 只为当前 active row 挂 row-local interaction layer
- 把 HUD state 绑定到 `videoId`，但只在对应 row 内渲染
- 把 player surface 的 loading / error / retry 收口到 row-local presenter
- 在 row 内维护 center owner，避免 pause / loading / seek 之间的布局抖动
- 只为 active row 订阅 progress，并在 row 内局部渲染底部 seek bar
- 让 description 展开态保持 row-local UI state，不并入 page 或 runtime

当前 widget 不承担：

- feed 数据请求本身
- 跨页面恢复定位状态
- 全局 toast
- pager 顶层播放器 HUD
- 多 row 的播放器实例管理策略以外的业务逻辑
- runtime store 本身的定义
- 跨视频记忆 description 展开态

## 播放会话模型

`useFullscreenPlaybackSession` 当前固定持有：

- `activeIndex`
- `activeItemId`
- `activeVisitToken`
- `basePausedByUser`
- `transientHoldState`
- `activeSurfaceState`
- `activePlayerControllerRef`
- `rowPlaybackHudStateByVideoId`

其中：

- `activeVisitToken` 是当前 active row 的访问轮次；只要真实 active video 发生切换就递增，用来让 row-local description 展开态首帧同步失效
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

`RowPlaybackInteractionLayer` 当前固定为 row 内唯一正式 interaction owner：

- `BackgroundGestureRegion`
  - 只覆盖视频背景，不覆盖底部 seek bar control lane
  - `single tap` 使用 `Pressable`
  - `double tap + long press` 使用 `GestureDetector`
- `SeekBarControlLane`
  - 只负责 rail + thumb 的 `tap-to-seek`
  - 只负责 drag preview 和 release commit
  - 左右时间文本属于底部 control lane，但保持 inert

当前实现不再依赖 `railGestureBlockers` / `externalGestureBlockers` 这类跨组件 bridge。背景区和底部 control lane 因几何上不重叠而天然隔离：

- 点视频空白背景：pause / resume
- 点 rail 或 thumb：seek
- 点左右时间文本：不 seek，也不 pause
- drag 期间背景手势不会命中 seek bar lane

`PlayableVideoSurface` 当前固定为执行层，不再直接渲染 loading / error UI。它只负责：

- 本地持有 `VideoPlayer`
- 同步 `shouldPlay`
- 同步 `playbackRate`
- 暴露最小 active controller `{ seekBy, surfaceState }`
- 向 row 上报 `surfacePresentation`
- 仅在 active row 存在 progress callback 时开启 `timeUpdate`，向 row 上报 progress snapshot

`RowSurfaceStatusOverlay` 负责：

- loading 时显示中心 glass spinner
- error 时显示 dark scrim + error message + `Retry`
- 在 active row error 时自然压住背景手势与 HUD

## Row Seek Bar

row-local seek bar 是独立于 `RowPlaybackHudOverlay` 的持续型 playback control layer：

- 只绑定 active row
- 不进入 `useFullscreenPlaybackSession`
- 不进入 pager-level render props compare contract
- 由 `PlayableVideoSurface` 通过 `timeUpdate` 向 `RowPlaybackMediaLayer` 上报真实 `progressSnapshot`
- 由 `RowPlaybackMediaLayer` 把真实 `progressSnapshot` 与 row-local `seekController` 写入 `row-playback-seek-bar-store`
- `seekBy()`、`seekTo()` 与 `readyToPlay` 边界都会触发受控 resync，避免暂停态 seek 卡在旧位置
- 由 `RowPlaybackInteractionLayer` 持有 draft state 和 seek 交互
- 由 `RowPlaybackSeekBarOverlay` 在底部 control lane 内渲染左当前时间、中间 rail + thumb、右总时长

这一层当前固定为：

- 常驻显示
- 左时间 + 中间 rail + thumb + 右总时长
- 非 glass
- rail + thumb 区域支持 tap-to-seek
- 左右时间文本继续只读，不参与 seek
- rail + thumb 区域可直接开始拖动
- 拖动过程中只更新本地 preview，不实时 seek
- tap-to-seek 与 drag release 共用同一条 rail-local 几何换算和 `commitSeek` 链
- tap 后立即做一次 row-local `seekTo(seconds)`，不显示额外 seek HUD
- 松手时只做一次 row-local `seekTo(seconds)`
- scrubbing 期间继续播放视频，但背景区因几何分离不会命中
- `error` 时隐藏

## 当前动作状态

fullscreen 右侧 action rail 当前固定为：

- `like`
  - 对应 `isLiked`
  - active 时 heart 变红
- `favorite`
  - 对应 `isFavorited`
  - active 时 star 变黄
- `share`
- `annotate`

当前 `like / favorite` 只做本地 runtime toggle，不调真实 API。

但这层 runtime toggle 不是长期真值：

- 当前会话里，点击后会立即覆盖当前 row 的 canonical 值
- 只要后续 `feed` 成功 fetch 到同一 `videoId` 的新数据，就重新以新的 source 值为准
- fullscreen 不再保留“本地状态永远压过后续 source refresh”的语义

当前颜色更新链固定为：

- `FullscreenVideoPager`
  - 继续消费 canonical `VideoListItem[]`
- `FullscreenVideoRow`
  - 通过 `video-runtime` 按 `videoId` 直接订阅当前 `isLiked / isFavorited`
  - `like / favorite` 也在 row 内直接写入 runtime
  - `share / annotate` 如有外部 handler 再向外冒泡

也就是说，fullscreen 的 action active state 不再依赖整表 effective items、page relay 或 `FlatList.extraData` 才能刷新。

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

1. `RowPlaybackInteractionLayer` 的 `BackgroundGestureRegion` 识别单击
2. session hook toggle `basePausedByUser`
3. session hook 为当前 `videoId` 写入 pause HUD
4. `FullscreenVideoRow` 把该 state 交给 `RowPlaybackHudOverlay`

### Double tap

1. `RowPlaybackInteractionLayer` 的 `BackgroundGestureRegion` 识别左右区
2. session hook 通过当前 active controller 调 `seekBy(±5)`
3. 成功后只给当前 `videoId` 写入 seek HUD
4. HUD 跟随所属 row 渲染并自动消失

### Long press

1. `RowPlaybackInteractionLayer` 的 `BackgroundGestureRegion` 识别左右/中间区
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
