# Fullscreen Video Overlay 设计规范

## 1. 文档目标

本文档定义当前 `Fullscreen Video 页` 的 overlay 分层模型，重点回答：

- 哪些 UI 必须跟着视频 row 一起滑动
- 哪些 UI 应固定在 pager 顶层
- 哪些 UI 只服务当前 active video 的瞬时反馈
- 在当前 Expo + 轻量 FSD 结构中，这些层分别落在哪个组件

相关文档：

- 页面关系与共享数据逻辑见 [Feed与Fullscreen Video页面设计逻辑](./Feed与Fullscreen%20Video页面设计逻辑.md)
- 全局视觉系统见 [编辑纸感UI设计规范](./编辑纸感UI设计规范.md)

## 2. 当前稳定前提

当前 `Fullscreen Video 页` 有以下稳定前提：

- 页面本质是纵向分页的沉浸式视频浏览器
- 每次真正处于消费焦点的只有一个 active video
- Feed 列表页与视频页共享同一份 feed source
- pager 只为当前/前后 1 个视频挂载 player
- 当前视频默认有声自动播放
- 背景主点击手势是播/停，不再承担静音切换

因此 overlay 设计必须同时满足两件事：

- 视觉上让“视频内容 + 内容型 UI”像同一个对象一起滑动
- 工程上把页面 chrome、瞬时反馈和 row 内容拆开，避免把状态更新范围拉得过大

## 3. 三层 Overlay 模型

当前 `Fullscreen Video` 固定采用以下三层模型：

1. `Row-owned content overlay`
2. `Top chrome overlay`
3. `Active ephemeral overlay`

这三层不是视觉稿名词，而是当前实现边界。

## 4. Layer 1: Row-owned content overlay

### 4.1 定义

`Row-owned content overlay` 绑定在每个视频 row 上。

它跟随该 row 一起出现、一起离开、一起滑动，视觉上属于这个视频本身，而不是播放器壳层。

### 4.2 当前放入内容

- 标题
- 说明文本
- 底部可读性 scrim
- 右侧 action rail

### 4.3 设计理由

当前产品要更接近 TikTok-like 的内容归属感，所以底部文案和右侧 rail 都必须跟着视频走。

这样做的收益是：

- 用户会把“视频 + 文案 + 动作位”感知为一个完整内容单元
- 翻页切换时，内容型 overlay 跟视频一起运动，沉浸感更自然
- 顶层 pager 不再需要维护一整套稳定动作镜像

### 4.4 交互边界

这一层里需要明确区分两类区域：

- `metadata block`
  - 只读
  - 不接收点击
- `action rail`
  - 独立接收事件
  - 不能依赖整页背景点击层

因此当前实现里：

- 文案层保持 `pointerEvents="none"`
- rail 和按钮必须作为独立交互层存在
- rail 即使本轮还没接真实业务动作，也必须有正确的命中区域和层级

### 4.5 当前限制

- rail 这轮只完成结构落位，不接真实收藏/分享/标注写操作
- 这一层不承载字幕、HUD、时间轴驱动文案或全局页面控件

## 5. Layer 2: Top chrome overlay

### 5.1 定义

`Top chrome overlay` 固定在 pager 顶层，不跟着 row 滑动。

它只承载页面级 chrome，而不是视频内容型 UI。

### 5.2 当前放入内容

- 右上当前序号 counter

### 5.3 设计理由

当前保留在顶层的只有 counter，它的语义更接近观看位置提示，而不是视频内容本身。

因此它应固定在顶部，而不是并入 row-owned content overlay。

### 5.4 当前限制

- 不在这一层放右侧 rail
- 不在这一层放静音提示、播/停 HUD 或字幕
- 不把它做成“当前视频所有稳定信息的总容器”

## 6. Layer 3: Active ephemeral overlay

### 6.1 定义

`Active ephemeral overlay` 只服务当前 active video 的瞬时反馈层。

它必须与 row-owned content overlay 和 top chrome overlay 隔离。

### 6.2 当前放入内容

- 播/停 HUD

### 6.3 未来适合放入的内容

- 字幕
- 手势反馈
- 临时提示
- 其它时间轴或过程驱动的 HUD

### 6.4 设计理由

这类状态更新频率高、持续时间短，不能反向拖动 row 内容层或顶部 chrome 一起重渲。

## 7. 状态归属建议

未来 Fullscreen Video 扩展时，状态应固定分为四类：

### 7.1 Feed / Video 基础实体

属于 `FeedItem` 或 `video asset` 的基础内容：

- `id`
- `uri`
- `title`
- `subtitle`

### 7.2 当前播放会话状态

只属于当前 fullscreen 播放会话：

- `activeIndex`
- `pausedByUser`
- 当前 HUD 文案

这类状态由 `widgets/fullscreen-video-pager` 持有，不回写到 page 或 feed source。

### 7.3 播放规则纯逻辑

属于纯规则层而非 UI state：

- player window 策略
- 背景点按后的播/停切换规则
- active row 变化后的暂停重置规则
- `activeIndex + pausedByUser -> shouldPlay`

这类逻辑归 `features/video-playback`。

### 7.4 未来按 videoId 索引的交互状态

未来真正接收藏/点赞/保存时，再独立建模：

- `favoriteIds`
- `likedIds`
- 其它 `videoId -> state`

这类状态不应直接塞回共享 feed source。

## 8. 组件落位

当前推荐组件层次如下：

### 8.1 `FullscreenVideoItem`

负责：

- 视频画面
- 背景点击层
- row-owned content overlay
- row 内最小 loading / error 覆盖层

### 8.2 `TopChromeOverlay`

负责：

- 顶部 counter

### 8.3 `PlaybackFeedbackOverlay`

负责：

- 当前 active video 的播/停 HUD
- 未来的字幕/手势/临时反馈

## 9. 性能约束

必须遵循以下约束：

1. row-owned content overlay 只承载低频、内容型 UI
2. top chrome overlay 只承载固定页面 chrome
3. active ephemeral overlay 的高频更新不得牵连前两层
4. player 是否挂载由 `shouldMountPlayer()` 决定
5. player 是否播放由 `shouldPlayVideo()` 决定
6. active row 变化后，`pausedByUser` 必须重置为 `false`

## 10. 当前实现真相

当前落地实现已经收口为：

- `row-owned content overlay`
  - 标题、说明、scrim、右侧 rail
- `top chrome overlay`
  - counter
- `active ephemeral overlay`
  - 播/停 HUD

不再保留的旧口径包括：

- 页面级 `isMuted`
- “点击任意位置切换静音”
- “右侧 rail 由 pager 顶层统一渲染”
