# Fullscreen Video Overlay 架构设计规范

## 1. 文档目标

本文档定义 `Fullscreen Video 页` 的目标 overlay 架构。

这份文档重点回答：

- fullscreen 的正式层级应该如何划分
- 哪些 UI 属于 page shell，哪些 UI 绑定 row
- 为什么交互 owner 必须从 bridge-driven 模式改成单一 interaction layer
- HUD、seek bar、surface status 与内容层之间的边界是什么

相关文档：

- 页面关系见 [Feed与Fullscreen Video页面设计逻辑](./Feed与Fullscreen%20Video页面设计逻辑.md)
- 手势设计见 [Fullscreen Video Gesture设计规范](./Fullscreen%20Video%20Gesture设计规范.md)
- seek bar 设计见 [Fullscreen Video Seek Bar Overlay设计规范](./Fullscreen%20Video%20Seek%20Bar%20Overlay设计规范.md)

## 2. 核心模型

fullscreen 的目标结构不再采用“背景手势组件 + seek bar blocker bridge”的模型，而固定分成：

1. `Page-attached overlays`
2. `Row-attached overlays`
3. `RowPlaybackInteractionLayer`

一句话收口：

- page shell 只保留真正的 pager 级 UI
- content / HUD / surface status 都继续附着在 row 上
- row 内交互只保留一个正式 interaction owner

## 3. Page-attached overlays

只承载真正的 pager 壳层 UI：

- `TopChromeOverlay`
- `PagerShellLoadingPill`

明确不应放入：

- 背景手势
- seek bar
- pause / seek / rate HUD
- row surface loading / error / retry
- 右侧 action rail
- 标题与说明

## 4. Row 内正式结构

目标组件树固定为：

```text
FullscreenVideoRow
├── RowPlaybackMediaLayer
├── RowPlaybackInteractionLayer
│   ├── BackgroundGestureRegion
│   └── RowPlaybackSeekBarOverlay
├── RowOwnedVideoOverlay
├── RowPlaybackHudOverlay
└── RowSurfaceStatusOverlay
```

row 内正式顺序固定为：

1. `RowPlaybackMediaLayer`
2. `RowPlaybackInteractionLayer`
3. `RowOwnedVideoOverlay`
4. `RowPlaybackHudOverlay`
5. `RowSurfaceStatusOverlay`

## 5. 各层职责

### 5.1 `RowPlaybackMediaLayer`

负责：

- 挂载 `PlayableVideoSurface`
- 持有真实 `progressSnapshot`
- 持有 row-local `surfacePresentation`
- 暴露 row-local `seekController`

它是播放器执行与真实快照 owner，不处理交互冲突。

### 5.2 `RowPlaybackInteractionLayer`

这是目标结构中的新增核心层。

它固定满足：

- 不是 HUD
- 不是 content overlay
- 是 row 内唯一正式 interaction owner

它内部固定拆成两个互斥命中区：

- `BackgroundGestureRegion`
- `SeekBarControlLane`

### 5.3 `RowOwnedVideoOverlay`

负责：

- 基础字幕
- 标题
- 说明
- 底部可读性 scrim
- 右侧 action rail

这层继续只承担内容表达，不承担高频交互协调。

当前基础字幕是 token-level word detail 入口，但仍属于内容展示层：

- 它位于 title 上方，锚定同一个 row-owned 内容列
- 它通过 absolute sibling 脱离 title / description 的 normal flow，字幕高度变化不得触发 title / description 跳动
- description 展开让内容列整体上移时，字幕跟随同一锚点上移
- 它优先渲染当前 `TranscriptSentence.tokens`，没有 token 时才 fallback 显示 `TranscriptSentence.text`
- 它使用比 title 更轻的文字层级，避免和视频标题混淆
- 它不固定为两行，当前句文本按实际长度自然换行显示
- 它复用 row-local `seekBarStore` 的 `progressSnapshot.currentTimeSeconds`，不新增播放器时间监听
- `BasicSubtitleOverlay` 只负责渲染 token 与发出 `onTokenPress`，不直接 import modal hook
- 当前播放 token 使用纯色高亮；高亮只改变 `color` 和 `textShadow`，不改变字号、行高、字重、间距或自然换行行为
- 字幕显隐由 `features/playback-settings` 的全局 session 偏好控制；关闭字幕只是不挂载 `BasicSubtitleOverlay`，不停止 transcript source 读取或缓存
- 所有 token 都可点击；点击经 `FullscreenVideoRow` 转成 `features/word-detail` dialog payload，`semantic_element.coarse_id` 可以是 `null`
- 字幕空白区不拦截背景手势
- 点击 token 不暂停、不 seek、不改变播放状态，也不做收藏、学习状态或 API 请求

### 5.4 `RowPlaybackHudOverlay`

负责低频、瞬时、feedback-driven 的播放 HUD：

- pause icon
- 左右 seek HUD
- `2x` HUD

它继续跟随 row 渲染，但不承担底部 seek bar control strip。

### 5.5 `RowPlaybackSeekBarOverlay`

它保留为目标组件名，但定位已经变化：

- 它属于 `RowPlaybackInteractionLayer` 内部的 seek bar control strip
- 它是 presenter/control strip
- 它不再是向外暴露手势 blocker 的独立交互节点

### 5.6 `RowSurfaceStatusOverlay`

负责：

- row-local loading
- row-local error
- `Retry`

它继续位于 row 内最高层，以保证错误态接管。

## 6. 为什么必须去掉 bridge

bridge-driven 模式的问题不在于“代码不够干净”，而在于它建立在一个错误的交互前提上：

- seek bar 与背景点击共享命中区
- 所以 seek bar 必须向外暴露 rail 手势
- 背景层必须等待这些手势失败

这会把交互边界扩散成：

- bridge state
- blocker props
- 额外协调语义

目标结构通过 **control lane 与背景区不重叠** 来消除这一前提，因此不再需要：

- `ActiveVideoGestureSurface`
- `SeekBarGestureBlockers`
- `railGestureBlockers`
- `externalGestureBlockers`
- `onRailGesturesChange(...)`

## 7. 状态归属

### 7.1 Pager / session hook

继续持有低频播放会话态：

- active row
- pause / hold base state
- row HUD lifecycle state

### 7.2 Media layer

继续持有真实播放器快照与 surface presenter。

### 7.3 Interaction layer

持有 row-local 交互中间态：

- seek bar draft
- 背景区与 seek bar lane 的交互 owner 逻辑

它不再通过 bridge 和外部背景手势层通信，因为背景手势本身已经并入 interaction layer。

## 8. 目标结构中的边界

### 8.1 `RowPlaybackInteractionLayer` 不是 HUD

它不负责：

- pause icon
- seek HUD
- `2x` HUD

这些仍属于 `RowPlaybackHudOverlay`。

### 8.2 `RowPlaybackInteractionLayer` 不是 content overlay

它不负责：

- 基础字幕
- 标题
- 说明
- action rail
- 底部 scrim

这些仍属于 `RowOwnedVideoOverlay`。

### 8.3 `RowPlaybackSeekBarOverlay` 不是 pager control

它：

- 继续 row-local
- 继续 active-only
- 继续跟随当前 row 滑动

它不是固定在 page shell 上的全局控制条。

## 9. 成功标准

overlay 架构只有同时满足以下条件，才算正确：

1. row 内只存在一个正式 interaction owner
2. seek bar 与背景手势不再靠 blocker bridge 协调
3. `RowPlaybackSeekBarOverlay` 降级为 interaction layer 内部的 presenter/control strip
4. `ActiveVideoGestureSurface` 不再属于目标结构中的正式组件
5. page shell 只保留真正的 pager 级 UI
6. HUD、seek bar、surface status、内容层的职责完全分开
7. 基础字幕只作为 `RowOwnedVideoOverlay` 的内容展示层，不进入 interaction layer 或 HUD layer
8. 可点击字幕只把 token 点击转交给 row 组合层打开 word detail dialog，不在 subtitle presenter 内直接持有业务弹层
