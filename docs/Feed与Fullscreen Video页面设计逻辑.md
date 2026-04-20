# Feed 与 Fullscreen Video 页面设计逻辑

## 1. 文档目标

本文档专门定义当前产品中 `Feed 列表页` 与 `Fullscreen Video 页` 的页面关系、视觉分工、交互逻辑、共享数据模型与实现边界。

这份文档回答以下问题：

- 首页 Feed 应该长什么样，它解决什么问题
- Fullscreen Video 页应该长什么样，它解决什么问题
- 两个页面为什么不是冲突关系，而是同一套内容系统的两种视图
- 它们如何共享 feed 数据、页面间恢复状态和返回定位
- 在 Expo + 当前轻量 FSD 结构中，这套逻辑应该落在哪些层

本文档是页面设计逻辑说明，不单独定义整套风格系统。视觉系统与组件抽象总规范见 [编辑纸感UI设计规范](./编辑纸感UI设计规范.md)。

`Fullscreen Video` 的 overlay 架构与手势设计已单独收口到：

- [Fullscreen Video Overlay架构设计规范](./Fullscreen%20Video%20Overlay架构设计规范.md)
- [Fullscreen Video Gesture设计规范](./Fullscreen%20Video%20Gesture设计规范.md)

## 2. 页面关系总览

### 2.1 一句话模型

当前产品中的 `Feed 列表页` 与 `Fullscreen Video 页` 不是两套独立产品思路，而是同一份内容源的两种页面投影：

- `Feed 列表页` 是内容发现入口，形态接近 YouTube 首页
- `Fullscreen Video 页` 是沉浸式消费入口，形态接近 TikTok 视频详情

用户路径固定如下：

1. 用户打开 App 后，先进入 `登录入口页`
2. 用户点击登录主按钮后进入 `Feed 列表页`
3. 用户浏览卡片流，选择感兴趣的视频
4. 点击视频卡片后，通过 `router.navigate()` 进入根 `Stack` 上的 `video/[videoId]` singular detail route
5. 在 `Fullscreen Video 页` 中继续上下滑动浏览视频
6. 用户返回后，`Feed 列表页` 自动恢复到最后播放视频对应的卡片位置

### 2.2 为什么需要两种页面

这两个页面各自承担不同目标：

- `Feed 列表页`
  - 降低进入成本
  - 让用户快速判断内容值不值得点开
  - 承担搜索、筛选、列表浏览、刷新和回看定位
- `Fullscreen Video 页`
  - 最大化观看沉浸感
  - 提供连续滑动消费
  - 承担播放中的理解、保存、分享、返回等动作

如果只有列表页，沉浸感不足；如果只有全屏视频流，入口成本太高，也不利于回看和定位。

### 2.3 与产品总览的关系

产品总览中“主内容区”承载：

- 内容流入口
- 视频播放与切换
- 详情或沉浸式观看入口
- 基础学习辅助能力
- 回到列表后的状态保持

`Feed 列表页` 与 `Fullscreen Video 页` 正是这五项能力的页面化拆分：

- 列表页负责“入口”和“回到列表后的状态保持”
- 视频页负责“播放与切换”和“沉浸式观看”
- 学习辅助能力沿视频页展开，并在后续扩展时向收藏、沉淀等页面外溢

## 3. Feed 列表页设计逻辑

### 3.1 页面角色

`Feed 列表页` 是登录后的主首页，也是内容驱动型学习产品的低门槛入口。

它的设计目标不是“替代播放页”，而是：

- 让用户在不进入沉浸式播放前先筛选内容
- 提供更轻、更可比较的内容决策环境
- 保持较强的信息密度，但不做传统文本列表

### 3.2 页面结构

当前最小实现下，列表页结构固定为两段：

1. `Header block`
   - 日期或轻量 meta 信息
   - serif 主标题
   - 一个右上角轻操作位，例如搜索
2. `Card stream`
   - 多张视频内容卡片顺序排列
   - 每张卡片都同时表达主题、调性、时长和点击意图

当前最小实现已经通过 `NativeTabs` 引入一级主导航：

- `Feed` 是主首页 tab
- `Save` 与 `Me` 暂时是空白占位 tab

底部 tab 仍应属于 `app shell`，而不是页面内容本身。

这一结构决定了列表页不是“瀑布流资讯页”，也不是“短视频全屏播放器”。

### 3.3 卡片设计目标

每张卡片都必须同时承载四类信息：

- 内容主题
- 内容氛围或学习价值
- 基础消费信息，如时长或热度
- “点击后进入视频页”的明确暗示

参考稿中的 `MediaFeatureCard` 已经说明了这一逻辑：

- 大尺寸视觉缩略区
- 左上统计信息贴片
- 底部 tag/learning cue
- 右下播放动作
- 下方 serif 标题

因此 Feed 卡片不是纯海报图，也不是单纯文字摘要，而是“编辑化内容卡片”。

### 3.4 列表页的交互职责

列表页至少承担以下交互：

- 向下滚动浏览卡片流
- 下拉刷新当前 feed source
- 当当前尾卡进入可见区时请求下一批 batch
- 点击任意卡片进入对应视频的 `Fullscreen Video 页`
- 从视频页返回后恢复到对应卡片位置

列表页不承担的职责：

- 自动播放全屏视频
- 复杂播放控制
- 右侧视频动作列
- 纵向视频 pager 本体

### 3.5 列表页的状态要求

列表页必须具备真实运行态，而不是只有设计稿态。

至少需要：

- `initial loading`
- `error`
- `empty`
- `restored anchor`

其中最关键的是两点：

- feed source 刷新后要保持页面状态稳定
- 从 `Fullscreen Video 页` 返回后，要能恢复到最后播放的视频卡片

## 4. Fullscreen Video 页面设计逻辑

### 4.1 页面角色

`Fullscreen Video 页` 是从列表页点击进入的沉浸式详情视图。

它不是首页，也不是孤立详情页，而是：

- 某一视频卡片的深入消费层
- 纵向连续浏览视频的容器
- 播放中学习辅助和行为动作的主要承载页

### 4.2 页面结构

当前目标结构可拆为六层：

1. `Full-bleed video background`
   - 视频内容占据全部画面
2. `Active video gesture surface`
   - 只存在于当前 active row
   - 承担 single tap / double tap / long press 识别
3. `Row-attached content overlay`
   - 跟视频 row 一起滑动的右侧 action rail
   - 跟视频 row 一起滑动的标题、说明和底部可读性 scrim
4. `Row-attached playback HUD overlay`
   - 当前 video row 的 pause / seek / 临时 `2x` HUD
   - HUD 生命周期由 pager 会话控制，但视觉上跟随所属 row
5. `Row-attached surface status overlay`
   - 当前 row 的 loading / error / retry
6. `Page shell overlays`
   - 固定的当前序号 counter
   - 首屏读取时的底部 loading 提示

这一结构说明该页面是“播放优先，row 绑定播放器表面与内容，page shell 只保留壳层 UI”的模式，而不是图文详情页，也不是把所有交互都堆在 pager 顶层的一层壳上。

详细分层规则见 [Fullscreen Video Overlay架构设计规范](./Fullscreen%20Video%20Overlay架构设计规范.md)。

### 4.3 视频页的交互职责

视频页必须承担：

- 当前视频默认有声自动播放
- 上下滑动切换视频
- 支持系统右滑返回手势
- 通过点击 active row 的视频背景切换播/停
- 通过双击 active row 左右半区执行 `-5s / +5s`
- 通过长按 active row 左右区进入临时 `2x`
- 在不打断沉浸感的前提下保留右侧动作位

当前实现下还应明确两点：

- 右侧 action rail 这轮只完成结构落位，不接真实收藏/分享/标注写操作
- 静音切换本轮移除，不保留旧入口
- center hold 只保留接口，不产生当前业务效果

视频页消费的是和列表页同一份共享 feed source。

当前默认行为是：

- 当 active item 进入当前已加载序列的最后 3 条时，页面请求下一批 batch
- 这个动作不依赖分页参数，而是重复读取同一个无状态 feed 接口

### 4.4 视频页与列表页的关系

视频页的第一页不是重新随机决定的，而是：

- 由用户点击的列表项决定进入位置
- 进入后以该视频所在 index 为初始 active item
- 后续继续上下滑动浏览同一 feed source 中的相邻视频

也就是说，视频页不是“从列表页跳去一个孤立详情页”，而是“从某张卡片进入同一序列的沉浸式浏览器”。

### 4.5 视频页不承担的职责

视频页不负责：

- 定义底部 tab
- 维护独立的第二份 feed 列表
- 接管首页搜索或列表排序
- 重复实现另一套播放器数据源

## 5. 两个页面的共享数据逻辑

### 5.1 Shared Feed Source

`Feed 列表页` 与 `Fullscreen Video 页` 必须共享同一份全局 feed source。

共享内容至少包括：

- `feed items`
- `assembled source state`
- `query cache`
- `id -> index` 映射
- 当前已加载尾 item 和续接状态

这意味着：

- 列表页下拉到底加载的内容，视频页也能直接使用
- 视频页和列表页消费同一份 assembled feed source，返回列表页后也能直接恢复到原卡片
- 两个页面不能各自维护一份独立 list

### 5.2 FeedSourceContract

未来实现层必须存在一个明确契约，至少表达：

- 如何读取当前 feed items
- 如何通过 `videoId` 找到 index
- 如何在刷新后保持 `videoId -> index` 映射稳定

这份契约属于内容数据模型，不属于页面模板本身。

### 5.3 FeedSessionContract

除了共享 feed source，还必须有一层轻量 session 状态，用于页面间衔接。

当前最小实现中，这层状态只需要：

- `pendingRestoreVideoId`

作用固定为：

- 在 `Fullscreen Video` 离开时记录最后一次活跃的视频 id
- 在 `Feed` 重新获得 focus 时恢复滚动锚点
- 只有目标卡片真正进入可见区后才清空恢复目标

这层状态不属于主题系统，也不属于实体持久化字段，而是页面导航与会话联动所需的短期状态。

## 6. 路由与导航设计逻辑

### 6.1 路由模型

当前运行态的路由关系如下：

- `Feed 列表页`
  - 登录后的主首页 route
- `Fullscreen Video 页`
  - 由列表项点击后进入的 stack detail route

进入方式：

- 点击卡片后使用 `router.navigate()`
- 根 `Stack` 对 `video/[videoId]` 启用 `dangerouslySingular`
- 默认使用从右到左的原生 iOS push 动画

返回方式：

- 从左到右滑动的系统返回手势

### 6.2 为什么要给 `video/[videoId]` 启用 `dangerouslySingular`

单靠 `router.navigate()` 并不能保证“快速连点卡片时只出现一个 fullscreen stack”。

原因是：

- `navigate()` 的复用前提是目标 route 已经在当前已提交的栈状态里存在
- 当用户在第一次跳转真正完成前连续点击卡片，第二次导航发生时，栈里可能还没有可复用的 fullscreen route
- 这类问题的本质是导航时序，而不是 feed page 的点击逻辑本身

因此当前设计把“fullscreen video 只保留一个栈实例”的约束放到根 `Stack`：

- `video/[videoId]` 在 `app/_layout.tsx` 中显式声明
- 通过 `dangerouslySingular` 为该 route 指定固定 singular id
- 这样无论当前是从哪个 feed card 进入，导航层都优先复用同一个 fullscreen route，而不是继续叠加新的 stack entry

这条设计意味着：

- 去重责任属于导航层，不属于 `Feed page`
- `Feed page` 仍只负责发起“进入某个视频”的意图，不额外维护点击 gate
- `Fullscreen Video page` 仍只负责消费 `videoId`、装配 pager 和回写 `pendingRestoreVideoId`

这也同时限定了当前运行态的语义：

- `Fullscreen Video` 是单实例 stack detail
- 它不是“允许同一时刻压入多个 `/video/:id` detail 层”的多实例详情栈
- 如果后续产品改成真正的多层视频详情导航，这个 singular 约束必须重新评估

### 6.3 为什么视频页不应内嵌主导航壳

当前最小运行态已经通过 `NativeTabs` 提供底部 tab。

`Fullscreen Video 页` 仍应保持为 stack detail，不应内嵌 tab。理由有两个：

- 视觉上会破坏沉浸感
- 导航语义上它不是一级页面，而是内容详情层

因此当前结论固定为：

- `Auth`、`Feed / Save / Me` tabs 与 `Fullscreen Video` 构成当前最小运行态
- 底部主导航只属于 `app shell`
- `Fullscreen Video` 仍保持在 stack detail 体系内

### 6.4 返回恢复规则

从视频页返回列表页时，页面不应该回到顶部，也不应该丢失上下文。

恢复规则固定为：

- 返回后，列表页自动滚动到最后播放视频所在卡片
- 如果用户从列表页点击第 N 个卡片进入视频页
- 在视频页滑到第 N+K 个视频后返回
- 列表页应恢复到 `pendingRestoreVideoId` 对应卡片位置，而不是最初点击的卡片位置

这条规则保证用户的上下文感连续。

## 7. 视觉分工逻辑

### 7.1 列表页的视觉关键词

列表页的关键词是：

- 编辑化
- 可比较
- 信息密度适中
- 内容发现

因此它更强调：

- 卡片之间的对照关系
- 题目和 tag 的判断价值
- 缩略图与标题的并置

### 7.2 视频页的视觉关键词

视频页的关键词是：

- 沉浸
- 连续
- 低干扰
- 行为叠加

因此它更强调：

- 视频本体占据视觉中心
- 动作与信息作为 overlay 轻叠加
- 底部文本只保留最必要的标题与说明

### 7.3 为什么两页风格可以统一

虽然两页视觉重心不同，但它们仍属于同一套 `Editorial Paper` 风格：

- 列表页通过纸面背景、serif 标题、柔和压印卡片来表达风格
- 视频页通过暖色 overlay、柔和按钮表面、信息块排版节奏来延续风格

统一的不是布局，而是：

- token
- 字体系统
- 表面语言
- 强调色温
- 操作层级

## 8. 在 Expo + FSD 中的实现边界

### 8.1 app 层

`app/` 负责：

- route entry
- stack detail route
- `video/[videoId]` 的 singular route 约束
- header / toolbar 配置
- 页面切换动画和原生导航关系

当前最小运行态已经在 `app/` 中引入 app shell / tabs。

不负责：

- 页面模板
- 业务播放逻辑
- feed 数据选择与派生

### 8.2 pages 层

`pages/feed` 负责：

- 列表页骨架
- header block
- 列表 widgets 装配
- 返回时的恢复策略

`pages/video-detail` 负责：

- Fullscreen Video 页骨架
- 当前视频的沉浸式布局
- 与 pager widget 的装配

### 8.3 widgets 层

`widgets` 负责复合视图：

- `MediaFeatureCard`
- `VideoPager`
- `VideoOverlay`
- `ProfileSummaryCard`
- `CollectionItemCard`

其中：

- 列表页主要消费 `card/list` 型 widgets
- 视频页主要消费 `pager/overlay/action` 型 widgets

### 8.4 features 层

`features` 负责：

- feed source 续接能力
- 收藏/保存动作
- 播放切换与 active item
- 返回锚点与会话恢复

视频页右侧动作列、列表页小型保存动作等都应归入 feature 语义，而不是 shared。

### 8.5 entities 层

`entities/feed` 负责：

- feed item 类型
- id/index 映射辅助
- 领域级数据读取与映射

不负责：

- 页面跳转
- 返回恢复策略
- 视觉组件

### 8.6 shared 层

`shared` 只负责：

- `Editorial Paper` token
- `RaisedSurface / InsetSurface / AdaptiveGlass`
- 通用 icon pill、segmented bar、title 原语

不负责：

- tab 导航壳
- 视频动作列
- 列表卡业务字段结构
- 页面级 header block

## 9. 页面级验收标准

### 9.1 Feed 列表页验收

- 首屏是列表 feed，不是全屏视频页
- 卡片能清楚表达“点进去看视频”
- 列表页有真实读取、刷新和尾部续接
- 从视频页返回后，列表恢复到最后播放视频卡片位置
- 页面仍保持 `Editorial Paper` 的纸面与编辑感，而不是退化成通用资讯列表

### 9.2 Fullscreen Video 页验收

- 进入方式是从列表卡片 stack push
- 页面支持上下滑动切换视频
- 页面和列表页共享同一份 feed source
- 页面不显示 tab
- 系统右滑手势可返回列表页
- 页面视觉保持沉浸，但动作层和文案层仍延续 `Editorial Paper`

### 9.3 系统级验收

- Feed 与 Fullscreen Video 共用全局 feed source
- 两个页面不维护独立的列表数据
- 返回定位基于 `pendingRestoreVideoId`
- 导航壳、页面模板、数据模型、视觉原语四层边界清楚

## 10. 默认实现结论

当前关于这两个页面，默认结论固定如下：

- `Feed 列表页` 是登录后的主首页
- `Fullscreen Video 页` 是 stack detail
- 两个页面共享同一份 feed source
- 视频页是列表页的沉浸式投影视图，不是另一套首页
- 返回列表页时恢复到最后播放视频对应卡片
- 列表页负责内容发现，视频页负责沉浸消费
- 两个页面共同构成主内容区的完整闭环
