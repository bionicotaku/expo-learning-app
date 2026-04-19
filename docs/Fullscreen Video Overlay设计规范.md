# Fullscreen Video Overlay 设计规范

## 1. 文档目标

本文档专门定义 `Fullscreen Video 页` 的 overlay 分层设计。

这份文档回答以下问题：

- `Fullscreen Video` 的 overlay 为什么不应该只有一层
- 哪些信息应该绑定在 row 上，哪些应该只为当前 active video 渲染
- 为什么 active-only overlay 还要继续拆分为稳定层与瞬时层
- 未来加入字幕、点赞、收藏、手势、提示反馈后，如何保持结构清晰和性能稳定
- 在当前 Expo + 轻量 FSD 结构中，这套 overlay 应该如何落位

本文档只讨论 `Fullscreen Video` 的 overlay 设计，不重复定义整套页面关系或全局视觉系统。

相关文档：

- 页面关系与共享数据逻辑见 [Feed与Fullscreen Video页面设计逻辑](./Feed与Fullscreen%20Video页面设计逻辑.md)
- 全局视觉系统见 [编辑纸感UI设计规范](./编辑纸感UI设计规范.md)

## 2. 设计前提

### 2.1 页面前提

当前产品中的 `Fullscreen Video 页` 具备以下稳定前提：

- 页面本质是纵向分页的沉浸式视频浏览器
- 每次屏幕上真正处于消费焦点的只有一个 active video
- Feed 列表页与视频页共享同一份 feed source
- 视频页可以继续上下滑动切换相邻视频

这意味着：

- 不是所有“属于某个 video 的信息”都必须绑定在 row 上
- 也不是所有“当前只显示一个”的 overlay 都应该放在同一层

### 2.2 性能前提

当前 `Fullscreen Video Pager` 的单个 row 成本本来就较高，因为它可能挂载：

- `VideoView`
- `useVideoPlayer`
- 播放状态监听
- loading / error 覆盖层

因此 overlay 分层设计必须同时服务两个目标：

- 视觉结构清晰
- 避免高频状态把整批 row 拉进重复渲染

## 3. 总体原则

`Fullscreen Video` 的 overlay 不应按“页面上有什么就都叠在一层”来设计，而应按下面三条原则分层：

1. 先判断内容是否应跟着 row 一起滚动
2. 再判断内容是否只对当前 active video 有意义
3. 最后判断该内容是低频稳定状态，还是高频瞬时状态

按这三个判断标准，`Fullscreen Video` 的 overlay 结构固定为三层：

1. `Row-bound overlay`
2. `Active-only stable overlay`
3. `Active-only ephemeral overlay`

## 4. 三层 Overlay 模型

### 4.1 Layer 1: Row-bound overlay

#### 定义

`Row-bound overlay` 是绑定在每个视频 row 上的内容层。

它跟随该 row 一起出现、一起离开、一起滚动，天然属于这个视频本身，而不是当前播放会话的全局提示层。

#### 适合放入的内容

- 视频 `title`
- 视频 `description`
- 轻量、低频的静态标签
- 与视频本体强绑定的只读信息
- 可选的小型“已点赞 / 已收藏”状态标记

#### 不适合放入的内容

- 字幕
- 手势反馈
- 当前播放中的 toast / HUD
- 主要交互按钮列
- 只对 active video 才需要出现的统一动作层

#### 设计理由

`title` 和 `description` 视觉上天然属于当前视频内容本身，而不是“播放器外壳”。

把它们绑定在 row 上有两个好处：

- 视频在翻页切换时，信息跟着视频一起运动，视觉关系自然
- row 自己就能表达该视频最基础的内容上下文，而不必完全依赖页面级 overlay

#### 约束

- 这一层只允许承载低频、稳定、视频自带的信息
- 不允许让高频状态进入 row-bound overlay
- 不允许把手势、字幕、当前播放反馈塞回每个 row

### 4.2 Layer 2: Active-only stable overlay

#### 定义

`Active-only stable overlay` 只为当前 active video 渲染，但它表达的是低频、相对稳定的当前视频动作和状态。

它不是绑定在每个 row 上，而是由 pager 顶层统一渲染一次，并根据 `activeItemId` 切换内容。

#### 适合放入的内容

- 点赞按钮
- 收藏按钮
- 当前视频的动作 rail
- debug / counter 信息
- mute / sound 状态提示
- 与当前视频相关但更新频率较低的控制层

#### 为什么点赞/收藏更适合放在这一层

点赞和收藏虽然是“每个 video 不同”的状态，但它们的主要交互对象通常只有当前 active video。

所以它们更适合做成：

- 顶层只渲染一次的动作层
- 通过 `activeItemId` 读取当前视频的状态
- 当前视频变化时切换按钮状态

而不是把整套交互按钮复制到每个 row 上。

#### 设计理由

这样做的核心收益是：

- 点赞/收藏状态更新时，只影响当前 active overlay
- 不会因为每个视频都有自己不同的互动状态，就强迫一批 row 跟着一起重渲
- 行为入口更统一，后续扩展分享、更多、笔记、复习入口也更自然

#### 约束

- 这一层只承载低频、稳定、当前视频级别的动作与状态
- 不承载逐帧变化的内容
- 不承载依赖播放器当前时间轴的内容

### 4.3 Layer 3: Active-only ephemeral overlay

#### 定义

`Active-only ephemeral overlay` 也只为当前 active video 渲染，但它承载的是高频、瞬时、播放过程中的反馈层。

这一层必须与 row 和稳定动作层进一步隔离。

#### 适合放入的内容

- 字幕
- 双击点赞反馈
- 手势反馈
- 音量/静音 toast
- 拖动、长按、临时 HUD
- 当前视频播放过程中的瞬时提示

#### 为什么字幕必须在这一层

字幕不是“某个视频的静态补充文本”，而是：

- 依赖当前 active video
- 依赖当前播放时间轴
- 更新频率显著高于普通 UI 状态

如果把字幕绑定在 row 上，或者和点赞/收藏、标题、动作 rail 混在同一个 overlay 里，会带来两个问题：

- 字幕更新会带着其它低频 UI 一起频繁重渲
- 结构上难以区分“当前视频级别的稳定信息”和“当前播放时刻的瞬时信息”

#### 约束

- 这一层只服务当前 active video
- 不允许把它扩散到所有 visible rows
- 不允许它反向拖动稳定 overlay 和 row-bound overlay 一起更新

## 5. 为什么 Active-only 还要再拆两层

虽然 `Active-only stable overlay` 和 `Active-only ephemeral overlay` 都只显示当前视频，但它们的状态来源和更新节奏完全不同。

### 5.1 稳定层的状态来源

稳定层通常依赖：

- `activeItemId`
- 当前视频对应的点赞/收藏状态
- 当前视频级别的控制状态

它的更新通常发生在：

- 切到新视频时
- 用户点击点赞/收藏时
- 用户切静音时

也就是说，它是低频、事件驱动的。

### 5.2 瞬时层的状态来源

瞬时层通常依赖：

- 当前视频时间轴
- 当前手势过程
- 临时交互反馈

它的更新可能非常频繁，例如：

- 字幕持续变化
- 手势过程中连续变化
- toast 短时间出现又消失

也就是说，它是高频、过程驱动的。

### 5.3 不拆分会带来的问题

如果把两类状态混在一起：

- 字幕变化会连带动作 rail、点赞按钮、标题块一起更新
- 手势反馈会把低频稳定状态一起拉进 render
- 以后很难判断某次性能问题到底来自字幕、手势还是交互状态

所以把 active-only 再拆成“稳定层”和“瞬时层”，不是抽象洁癖，而是为了：

- 控制更新范围
- 降低耦合
- 保证后续功能扩展不会把 overlay 结构迅速污染

## 6. 状态归属建议

未来 overlay 扩展时，状态归属应固定为四类：

### 6.1 Feed / Video 基础实体

属于 `FeedItem` 或 `video asset` 的基础内容：

- `id`
- `uri`
- `title`
- `subtitle`
- 其它低频元数据

这一层不应并入：

- 点赞状态
- 收藏状态
- 播放时字幕内容
- 当前播放会话状态

### 6.2 全局播放偏好

适合作为全局偏好的内容：

- `isMuted`
- `showSubtitles`

这一层不按每个 video 分开建模。

### 6.3 按 videoId 索引的交互状态

适合独立建模为 `videoId -> state` 的内容：

- `favoriteIds`
- 未来的 `likedIds`

这类状态不应回写进 feed source，而应通过独立 query / mutation 或独立状态源消费。

### 6.4 当前播放会话中的瞬时状态

适合只为当前 active video 存在的内容：

- 当前字幕片段
- 当前手势反馈
- 当前视频 loading / error HUD
- 临时 toast

这类状态不应成为共享列表数据的一部分。

## 7. 组件落位建议

推荐的组件层次如下：

### 7.1 Row 层

`FullscreenVideoItem`

负责：

- 视频画面
- row-bound overlay
- row 内最小 loading / error 覆盖层

### 7.2 当前视频稳定动作层

`ActiveVideoOverlay`

负责：

- 点赞/收藏按钮
- debug / counter
- 动作 rail
- 当前视频级别的低频控制信息

### 7.3 当前视频瞬时反馈层

`ActiveSubtitleOverlay`

负责：

- 字幕
- 时间轴驱动的文本提示

`PlaybackFeedbackOverlay`

负责：

- 手势反馈
- mute toast
- 点按后的短暂 HUD

## 8. 性能约束

这套三层 overlay 设计的目标之一，就是为未来的性能优化提前设边界。

必须遵循以下约束：

1. `Row-bound overlay` 只承载低频内容
2. `Active-only stable overlay` 只根据 `activeItemId` 和低频交互状态更新
3. `Active-only ephemeral overlay` 高度隔离，不得牵连 row 或稳定动作层一起更新
4. 点赞/收藏等 per-video 状态即使按 video 不同，也不等于必须回写到 row 或 feed item
5. 字幕不能进入每个 row，也不能并入共享 feed items

## 9. 与当前实现的对应关系

当前 `FullscreenVideoPager` 中已有的 overlay 关系可以作为过渡参考：

- 左上角 debug overlay：未来应归入 `Active-only stable overlay`
- 底部标题与描述：未来更适合回到 `Row-bound overlay`
- mute toast：更适合归入 `Active-only ephemeral overlay`

也就是说，当前实现不是推倒重来，而是沿下面的方向收口：

- `title / description` 下放到 row
- 当前动作和状态集中到稳定 active overlay
- 字幕和手势反馈集中到瞬时 active overlay

## 10. 验收标准

这份设计真正落地后，应满足以下标准：

- `title / description` 跟着视频 row 自然滚动
- 点赞/收藏状态虽然按 video 不同，但只驱动当前 active 的主要交互层
- 字幕和手势反馈不会把整批 row 拉进高频更新
- overlay 结构清晰，不再把所有信息混在一层里
- 新增点赞、收藏、字幕、手势功能后，`Fullscreen Video` 的组件边界仍然可维护

## 11. 非目标

本文档不定义以下内容：

- 点赞/收藏 API 细节
- 字幕数据获取协议
- 播放器内核实现
- Feed 列表页卡片设计
- 整个 App 的统一 design system

这些内容分别由实体层、feature 层、播放内核和全局 UI 规范文档负责。
