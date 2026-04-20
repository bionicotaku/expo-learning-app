# Fullscreen Video Overlay 架构设计规范

## 1. 文档目标

本文档定义当前 `Fullscreen Video 页` overlay 的正式架构。

这份文档重点回答：

- fullscreen 的 overlay 应该按什么维度分层，而不是沿用旧的“三层 overlay”口径
- 哪些 UI 必须附着在 row 上，哪些 UI 必须固定在 pager 壳层
- 为什么 `pause / seek / 2x` 的状态应该页级持有，但渲染必须跟随 row
- `loading / error / retry` 与播放器本体的最佳边界是什么
- 未来重构时，`widgets/fullscreen-video-pager`、`features/video-playback` 与 row 内部组件各自该承担什么职责

相关文档：

- 页面关系与共享数据逻辑见 [Feed与Fullscreen Video页面设计逻辑](./Feed与Fullscreen%20Video页面设计逻辑.md)
- 手势设计见 [Fullscreen Video Gesture设计规范](./Fullscreen%20Video%20Gesture设计规范.md)
- 全局视觉系统见 [编辑纸感UI设计规范](./编辑纸感UI设计规范.md)

## 2. 文档定位

本文档是当前 fullscreen overlay 的权威设计说明，也是当前代码结构的维护基线。

需要明确区分：

- `docs/` 下的设计文档：定义目标结构、边界和约束
- `src/` 目录下的 `README.md`：描述当前已落地实现

因此：

- `src/` 中的实现应与本文档保持一致
- 后续重构必须继续以本文档为准
- 旧的 `Fullscreen Video Overlay设计规范.md` 已废弃，不再作为有效设计依据

## 3. 设计成功标准

当前 fullscreen overlay 只有同时满足以下条件，才算结构正确：

1. `pause / seek / 2x` 的 HUD 跟随所属 video row 一起移动，而不是固定在 pager 顶层
2. `Top chrome` 与 `pager shell loading pill` 继续固定在 pager 壳层
3. row 内的 `loading / error / retry` 与播放器表面绑定，不再被顶层手势或页级 HUD 影响
4. 播放会话状态仍由 pager 集中管理，不把计时器和业务状态分散到每个 row
5. active row 切换时，不会把旧 row 的 HUD 瞬移到新 row
6. `gesture surface` 继续作为独立输入层存在，不并入任何 overlay
7. `features/video-playback` 继续只承载纯规则，不持有 React state，不渲染 UI
8. 右侧 action rail 的命中优先级保持正确，不被 row HUD 或背景手势吞掉

## 4. 为什么旧文档必须废弃

旧的 `Fullscreen Video Overlay设计规范.md` 把 fullscreen 概括为：

1. `Row-owned content overlay`
2. `Top chrome overlay`
3. `Active ephemeral overlay`

这套模型在早期是够用的，但现在已经出现三个根本问题：

### 4.1 它把“状态归属”和“渲染附着点”混在了一起

`pause / seek / 2x` 这类 HUD 的计时器、生命周期和 active-row 切换规则，本质上是页级播放会话状态。

但它们的视觉附着点又必须跟随 row。

旧文档把这两件事合并成了一个 `active ephemeral overlay`，结果会自然滑向“既在 pager 持有状态，也在 pager 顶层渲染”的结构。

### 4.2 它已经无法表达 row-following HUD

一旦 `pause / seek / 2x` 改成跟随 row，就不再是“当前屏幕中心固定的一层 HUD”。

旧模型没有“row-attached playback HUD”这个独立概念，因此会逼迫实现继续用 pager 顶层 overlay 去承载播放器反馈。

### 4.3 它对播放器表面相关 UI 的归属不完整

当前 `loading / error / retry` 已经明显是 row-local 的。

如果 `pause / seek / 2x` 也要跟随 row，那么所有播放器表面相关 UI 都应该统一进入 row-attached 域。

旧文档把这一类 UI 拆成了两半：

- `loading / error` 跟 row
- `pause / seek / 2x` 跟 pager

这不是一个稳定的长期结构。

## 5. 新的核心模型

当前 fullscreen overlay 不再用“固定三层 overlay”描述，而是改为：

1. `Page-attached overlays`
2. `Row-attached overlays`
3. `Row-local input surface`

其中：

- `Page-attached overlays` 解决页面壳层与全局阅读位置问题
- `Row-attached overlays` 解决随视频单元一起移动的内容、播放 HUD 与表面状态
- `Row-local input surface` 只负责输入识别，不算 overlay

一句话收口：

- **状态在 pager 集中**
- **渲染在 row 局部附着**
- **输入层独立于 overlay**

## 6. Page-attached overlays

### 6.1 定义

`Page-attached overlays` 固定附着在 pager 壳层，不跟随任意单条视频 row 滑动。

它们只能承载真正的 page shell UI。

### 6.2 当前应放入内容

- `TopChromeOverlay`
  - 右上当前序号 counter
- `PagerShellLoadingPill`
  - 首屏或续接时的底部 loading pill

### 6.3 明确不应放入内容

- `pause` HUD
- `seek` HUD
- `2x` HUD
- `loading / error / retry`
- 右侧 action rail
- 标题、说明、底部 scrim
- 字幕

### 6.4 设计理由

这些 UI 的语义都不属于“页面壳”，而属于“当前视频单元”。

只有真正不跟随 row、也不依附播放器表面的信息，才应留在 pager 顶层。

## 7. Row-attached overlays

### 7.1 总定义

`Row-attached overlays` 绑定在 `FullscreenVideoRow` 上。

它们跟随该 row 一起进入、一起离开、一起滑动。

当前 row-attached overlays 固定拆成三类：

1. `RowOwnedContentOverlay`
2. `RowPlaybackHudOverlay`
3. `RowSurfaceStatusOverlay`

### 7.2 `RowOwnedContentOverlay`

负责：

- 标题
- 说明文本
- 底部可读性 scrim
- 右侧 action rail

这部分仍然是内容型 UI，低频、稳定、跟视频单元一起移动。

它的交互边界保持不变：

- metadata block 继续 `pointerEvents="none"`
- action rail 继续独立命中
- 不把高频 HUD 并回这一层

### 7.3 `RowPlaybackHudOverlay`

这是当前结构中的核心层。

负责：

- 暂停态的中心 glass icon
- 左右 `seek` HUD
- 左右 hold 期间的 `2x` HUD
- 未来属于当前视频 row 的字幕、词义提示、时间轴反馈等播放型 HUD

这层必须满足两个条件：

1. **视觉上跟随 row**
2. **状态上不自治**

也就是说：

- HUD 的出现、消失、定时器、hold 生命周期，仍由 pager 会话层统一管理
- 但 HUD 的具体渲染位置、动画和附着点必须在 row 内完成

### 7.4 `RowSurfaceStatusOverlay`

负责：

- row-local loading spinner
- row-local error overlay
- `Retry` 恢复路径

这层是播放器表面状态的 presenter，不属于 page shell，也不属于内容型 overlay。

它必须位于 row 内最高层，原因是：

- `error` 时必须接管点击
- `Retry` 不能再被背景手势或 HUD 覆盖

### 7.5 为什么 `RowPlaybackHudOverlay` 与 `RowSurfaceStatusOverlay` 必须分开

两者虽然都附着在 row 上，但职责完全不同：

- `RowPlaybackHudOverlay`
  - 只渲染播放反馈
  - `pointerEvents="none"`
  - 生命周期受 pager 会话控制
- `RowSurfaceStatusOverlay`
  - 渲染 loading / error / retry
  - 需要在 error 时接管点击
  - 生命周期受 player surface 状态控制

把它们合并只会重新制造“高频 HUD 和恢复路径共享一层”的问题。

## 8. Gesture surface 不是 overlay

`ActiveVideoGestureSurface` 继续保留为 row-local input surface。

它：

- 位于 `PlayableVideoSurface` 之上
- 位于所有 row overlay 之下
- 只在当前 active row 真实挂载
- 只负责 single tap / double tap / long press 识别

它不是：

- content overlay
- playback HUD overlay
- surface status overlay
- page shell overlay

这条边界必须保持稳定，否则后续字幕、HUD、右侧动作位、错误态恢复路径都会重新纠缠到背景手势层里。

## 9. 最佳状态归属

### 9.1 Pager 会话状态

以下状态继续由 `FullscreenVideoPager` 或其内部 session hook 持有：

- `activeIndex`
- `activeItemId`
- `basePausedByUser`
- `transientHoldState`
- 当前 active row 的最小 controller
- 当前 active row 的 surface gating state

这些状态之所以要留在 pager，是因为它们都属于“当前 fullscreen 播放会话”，而不是某一条 row 的私有状态。

### 9.2 Row playback HUD store

当前实现使用一个 `videoId -> rowPlaybackHudState` 的稀疏 store。

原因是：

- row A 的 pause HUD 可能还在 3 秒窗口内
- 用户已经滑到 row B
- row B 又可能触发新的 seek 或 `2x`

如果 HUD 仍然只有一份“当前 active HUD”，它就会在 active row 变化时被错误抢走。

因此最佳结构不是：

- 单一 `playbackFeedback`
- 单一 `isPauseIndicatorVisible`

而是：

- `rowPlaybackHudStateByVideoId`

当前形态如下：

```ts
type RowPlaybackHudState = {
  pauseIndicatorVisible: boolean;
  transientFeedback:
    | null
    | {
        kind: 'seek';
        deltaSeconds: -5 | 5;
      }
    | {
        kind: 'rate';
        label: '2x';
      };
};
```

`visibleUntil / expiresAt` 不再存进 store；当前实现由 session hook 用 timeout map 管理生命周期，而 store 只保留当前渲染所需的最小状态。

这个 store 仍由 pager 会话层更新与清理，但只会被所属 row 渲染。

### 9.3 Player-local surface snapshot

每个 mounted row 继续本地持有自己的 player 实例。

播放器表面状态的最佳归属是：

- 事件源来自 `PlayableVideoSurface`
- 呈现层归 `RowSurfaceStatusOverlay`

当前 row 内使用一个合并后的 surface presentation 边界：

```ts
type FullscreenRowSurfacePresentation = {
  surfaceState: 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  retry: (() => void) | null;
};
```

其中：

- `retry` 主要服务 `RowSurfaceStatusOverlay`
- `seekBy` 仍只存在于 active controller，不进入 row-local presentation contract

pager 不需要读取每一条 row 的完整 surface snapshot，只需要当前 active row 的最小 gating projection。

### 9.4 Feature 纯规则层

`features/video-playback` 继续只负责纯规则：

- tap / hold zone 解析
- `basePausedByUser` toggle
- active row 变化后的 reset 规则
- `effectiveShouldPlay`
- `effectivePlaybackRate`
- `isGestureLocked`

它不持有 React state，不关心 HUD 附着点，不直接操作 player。

## 10. 当前组件结构

当前组件树如下：

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

当前职责如下：

### 10.1 `FullscreenVideoPager`

负责：

- FlatList 分页
- active row 决策
- page shell overlays
- 播放会话状态
- HUD store 与计时器
- active row controller 注册

不负责：

- 直接渲染 row-following HUD
- 直接渲染 row surface status

### 10.2 `useFullscreenPlaybackSession`

当前使用独立 hook `useFullscreenPlaybackSession`，用于从 pager 里抽走以下逻辑：

- `basePausedByUser`
- `transientHoldState`
- `rowPlaybackHudStateByVideoId`
- active row 切换清理
- pause / seek / rate 的 timer 与生命周期
- `handleSingleTap / handleDoubleTap / handleHoldStart / handleHoldEnd`

这样 pager 本身只负责：

- list shell
- renderItem
- top chrome / loading pill

### 10.3 `FullscreenVideoRow`

当前已将 `FullscreenVideoItem` 重命名为 `FullscreenVideoRow`。

原因不是语法洁癖，而是 ownership 更准确：

- 这里承载的是一整条 fullscreen row
- 不只是普通 list item
- 它同时拥有 player、gesture、content overlay、HUD overlay 与 surface status overlay

### 10.4 `PlayableVideoSurface`

最佳职责应收窄为：

- 挂载 player
- 同步 `shouldPlay` 与 `playbackRate`
- 暴露 local surface snapshot / actions
- 不直接渲染 loading / error UI

也就是说，当前 `PlayableVideoSurface` 更像播放器执行层，而不是 presenter。

### 10.5 `RowPlaybackHudOverlay`

负责：

- 根据 row 自己的 HUD state 渲染 pause / seek / rate
- 承担 HUD 动画和布局
- 不持有 timer
- 不推导业务规则

### 10.6 `RowSurfaceStatusOverlay`

负责：

- 渲染 loading glass spinner
- 渲染 error 与 retry
- 依据 row-local surface snapshot 做 UI 呈现

## 11. 关键调用链

### 11.1 Single tap

1. active row 的 `ActiveVideoGestureSurface` 识别 single tap
2. pager session toggle `basePausedByUser`
3. pager session 为当前 `activeItemId` 写入 `pauseIndicator.visibleUntil`
4. 当前 row 通过 `rowPlaybackHudStateByVideoId[videoId]` 渲染 pause HUD

### 11.2 Double tap

1. active row 的 `ActiveVideoGestureSurface` 识别左右区
2. pager 通过当前 active controller 调 `seekBy(±5)`
3. 成功后，pager session 为当前 `activeItemId` 写入 `transientFeedback = seek`
4. 该 HUD 只在所属 row 渲染，超时自动清掉

### 11.3 Long press

1. active row 的 `ActiveVideoGestureSurface` 识别左右 / 中间区
2. pager session 写入 `transientHoldState`
3. 左右 hold 时，pager 为当前 `activeItemId` 写入 `transientFeedback = rate`
4. 当前 row 持续渲染 `2x` HUD
5. `hold end` 时，pager 清空 hold 与该 row 的 `rate` HUD

### 11.4 Active row 切换

active row 变化时，pager 必须同步执行：

1. `basePausedByUser` 重置为 `false`
2. `transientHoldState` 清空
3. 当前 active controller 清空
4. 当前 active gating state 清空

但 **不能** 直接暴力清空整个 `rowPlaybackHudStateByVideoId`。

因为：

- 旧 row 的 HUD 可能还在生命周期内
- 它应继续跟着旧 row 一起滑出
- 而不是在 row 切换瞬间消失，或瞬移到新 row

因此，HUD store 的清理必须按：

- 自身到期
- hold end
- row unmount
- 显式 session cleanup

分别处理。

### 11.5 Loading / error

1. `PlayableVideoSurface` 产生 local surface snapshot
2. `FullscreenVideoRow` 把 snapshot 传给 `RowSurfaceStatusOverlay`
3. `loading` 时只显示 row-local glass spinner
4. `error` 时显示 row-local error + retry
5. 若该 row 正是 active row，则 pager 只额外读取其 `surfaceState`，用于关闭背景手势

## 12. 放弃的方案与 tradeoff

### 12.1 不再使用 pager-level playback HUD

放弃原因：

- HUD 不会跟随 row
- state ownership 与 render attachment 强绑定
- active row 切换时更容易瞬移 HUD

### 12.2 不让每个 row 自己持有 HUD timer

虽然这样最“局部”，但它不是最佳结构。

问题是：

- pause / seek / hold 语义都由 active 会话触发
- timer 分散到每个 row 后，会让 row 自己开始理解业务规则
- active row 切换、hold lock、seek 成功与否都会分散处理

这会把 pager 会话逻辑打碎。

### 12.3 不把 playback HUD 并回 `RowOwnedContentOverlay`

因为：

- 内容 overlay 是低频稳定 UI
- playback HUD 是高频瞬时 UI
- 两者合层只会扩大重渲染范围，并混淆交互语义

### 12.4 是否要把 loading / error 继续留在 `PlayableVideoSurface`

这是唯一一个有真实 tradeoff 的点。

保留在 `PlayableVideoSurface` 内部的优点是：

- 实现更短
- `retry` 与 `error.message` 离 player 更近

当前实现已经拆成 `RowSurfaceStatusOverlay`，原因是：

- 它们本质上是 overlay presenter，不是 player executor
- 与 `RowPlaybackHudOverlay` 一起收回到 row 域后，overlay 结构会更完整
- `PlayableVideoSurface` 能真正收窄为播放器执行层

如果这轮只追求最小改动，可以暂时不拆。

但如果目标是“最佳长期结构”，应该拆。

## 13. 最终设计口径

当前 fullscreen overlay 的正式结构收口为：

- `Page shell overlays`
  - `TopChromeOverlay`
  - `PagerShellLoadingPill`
- `Row-attached overlays`
  - `RowOwnedContentOverlay`
  - `RowPlaybackHudOverlay`
  - `RowSurfaceStatusOverlay`
- `Row-local input surface`
  - `ActiveVideoGestureSurface`

对应的设计原则是：

- **状态在 pager 集中**
- **HUD 在 row 渲染**
- **内容层与 HUD 层分开**
- **输入层与 overlay 分开**
- **播放器执行层与表面 presenter 分开**

这就是当前 fullscreen overlay 的唯一有效设计基线。
