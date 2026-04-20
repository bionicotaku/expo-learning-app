# Editorial Paper UI 设计规范

## 1. 文档目标

本文档定义当前项目的正式 UI 风格系统 `Editorial Paper`，中文描述为“编辑纸感风格”。

这份文档用于回答四个问题：

- 当前参考稿真正稳定下来的视觉语言是什么
- 这套视觉语言在 Expo + React Native + 当前轻量 FSD 结构中应该如何抽象
- 哪些内容属于 `shared/theme` 与 `shared/ui`，哪些应停留在 `features / widgets / pages / app`
- 这套风格如何服务当前产品模型：当前最小运行态是 `登录页 -> NativeTabs(Feed / Save / Me) -> Fullscreen Video 页`

本文档是实现导向规范，不是设计赏析文档。默认约束如下：

- 当前只定义 `light theme`
- 以 `iOS first` 为设计和实现基准
- Web 参考稿中的 CSS 能力不直接视为最终实现方式
- 路由、数据流和组件落位必须遵循 [项目规范](./项目规范.md) 与 [技术栈选型](./技术栈选型.md)

## 2. 风格系统命名与参考源

### 2.1 正式命名

- 风格系统名：`Editorial Paper`
- 中文名：`编辑纸感风格`
- 实现层 style key：`editorial-paper`

### 2.2 参考源

当前视觉参考源为：

- `style-reference/style-reference-main.jsx`

该文件只作为视觉与版式参考，不是正式实现结构。后续实现不得直接把参考稿文件结构迁入 `src/`。

### 2.3 适用范围

`Editorial Paper` 适用于以下页面与视觉场景：

- 当前已落地：
  - `YouTube-like Feed` 首页
  - `Fullscreen Video` 详情/沉浸式播放页
- 后续可扩展：
  - 收藏夹与学习沉淀页
  - 我的页与学习概览页
  - 登录与认证入口页
  - app 启动阶段的 native splash / JS launch screen

不适用范围：

- Android 单独派生视觉系统
- Dark mode 单独设计
- Web 正式端视觉适配

## 3. 风格定义

### 3.1 核心气质

`Editorial Paper` 的核心不是单一材质，而是四层叠加：

1. `编辑感`
   标题像杂志页，正文像产品界面，辅助信息像边注。
2. `纸面感`
   页面背景是暖米白和浅纸面，不采用纯白科技面板。
3. `压印感`
   全局主要表面由 `raised` 与 `inset` 两种压印结构组成。
4. `克制的玻璃感`
   玻璃只用于底部导航、悬浮动作、图片 overlay 等局部焦点层。

### 3.2 排版系统

排版固定为三层：

- `Display / Title`：`Fraunces`
- `Body / UI text`：平台原生 sans-serif
- `Meta / Data / Tag`：平台原生 sans-serif（通过字重、字距、大小形成标签感）

使用规则：

- 页面主标题、卡片标题、关键 section title 使用 `Fraunces`
- 正文、按钮、列表、解释文本使用 iOS / Android 各自原生 sans-serif
- 日期、标签、计数、状态、小型辅助文案也使用原生 sans-serif，但通过 `uppercase + spacing + weight` 形成 meta 语气

禁止事项：

- 不允许为单个页面再引入第四套风格字体
- 不允许为 meta 文本重新引入另一套展示性字体
- 不允许让所有文本都只用同一套 sans-serif

### 3.3 色彩系统

全局颜色命名采用语义名，不使用页面内散落的原始十六进制。

#### 基础色

- `background`：页面主背景，暖纸面底色
- `surface`：卡片和内层表面
- `ink`：主文字
- `ink-soft`：次级正文与次要说明
- `ink-mute`：最弱辅助信息

#### 强调色

- `accent`：偏砖橙的主强调色
- `gold`：偏柔和金色，用于轻强调与收藏/进度
- `cocoa`：偏棕色，用于稳定、沉着、内容型强调

#### 柔和动作色

- `soft-action-rose`
- `soft-action-peach`
- `soft-action-butter`
- `soft-action-pistachio`
- `soft-action-lavender`
- `soft-action-sky`

这些颜色只用于：

- segmented 当前项
- 小型徽标
- 统计卡数字强调
- 进度条
- 弱彩色按钮表面

禁止事项：

- 不把柔和动作色升级为页面主背景
- 不把品牌原色图标直接打断整体色温
- 不在正文大面积使用高饱和纯色

### 3.4 表面与阴影系统

全局只允许三类核心表面：

- `elevation-raised`
  凸起表面，用于卡片、按钮、主要容器
- `elevation-soft`
  轻凸起表面，用于胶囊按钮、统计卡、icon capsule
- `elevation-inset`
  内凹表面，用于输入框、segmented 容器、筛选底板

实现原则：

- 视觉深度来自统一阴影逻辑，不来自随意添加不同 shadow
- `raised` 与 `inset` 是系统原语，不是单页特效
- 同一页面内的层级最多控制在 3 级

### 3.5 圆角与间距

圆角采用大圆角、连续曲线的 iOS first 风格。

建议圆角层级：

- `radius-card-lg`：28-32
- `radius-card-md`：22-24
- `radius-control`：18-22
- `radius-pill`：999

建议间距节奏：

- 页面横向内边距：`22`
- 页面首屏标题起点：约 `58-62`
- 卡片之间纵向节奏：`12 / 16`
- 小组件内部节奏：`6 / 8 / 10 / 12 / 16`

### 3.6 玻璃使用规则

玻璃感允许存在，但必须克制。

允许场景：

- `app shell` 底部导航
- 图片缩略图信息贴片
- 全屏视频页悬浮动作
- 少量 overlay 信息层

禁止场景：

- 整页主背景
- 普通表单卡主体
- 普通列表卡主体
- 大量嵌套 blur / glass

## 4. 设计原语与基础层

本节只定义 `shared/theme` 与 `shared/ui` 层可承载的内容，不混业务语义。

### 4.1 Theme Tokens

推荐目录：

```text
src/shared/theme/editorial-paper/
  tokens.ts
  typography.ts
  spacing.ts
  radius.ts
  elevation.ts
```

`EditorialPaperTokens` 必须覆盖：

- color
- typography
- spacing
- radius
- elevation
- glass

要求：

- 页面与 widgets 不允许继续散落硬编码颜色
- 所有 surface、文字、辅助色统一从 token 读取
- 不为单个页面新增“私有主题色板”

### 4.2 Shared UI 原语

推荐目录：

```text
src/shared/ui/editorial-paper/
  raised-surface.tsx
  inset-surface.tsx
  adaptive-glass.tsx
  editorial-title.tsx
  meta-label.tsx
  soft-action-button.tsx
  segmented-filter-bar.tsx
  icon-pill.tsx
src/shared/ui/startup/
  launch-screen.tsx
```

原语职责固定如下：

- `RaisedSurface`
  负责凸起表面和圆角/阴影语言
- `InsetSurface`
  负责输入与底板类内凹表面
- `AdaptiveGlass`
  负责 iOS glass 与 blur fallback
- `EditorialTitle`
  负责主标题与 section title 的 serif 表达
- `MetaLabel`
  负责 mono 辅助标签与小型元信息
- `SoftActionButton`
  负责柔和动作按钮外壳，不承载业务文案逻辑
- `SegmentedFilterBar`
  负责筛选/模式切换容器与选中态外壳
- `IconPill`
  负责小型圆角图标胶囊或圆形 icon capsule
- `LaunchScreen`
  负责 app 启动后的正式 JS 过渡屏
  不承担业务页面模板职责，但必须复用 `Editorial Paper` 主题和品牌语言

### 4.3 Shared 层禁止进入的内容

以下内容不得进入 `shared/ui`：

- 登录业务组合
- 收藏词卡业务结构
- 个人中心业务组
- 视频动作列业务结构
- 页面专用 header block
- 业务领域特定的卡片标题与字段组合

这些内容都有明确的业务语义，应停留在 `features / widgets / pages`。

### 4.4 Expo 落地要求

- Glass/blur 统一通过 `expo-glass-effect` + `expo-blur` fallback
- 不保留 web `backdropFilter` 作为实现标准
- 所有交互原语默认满足最小触达尺寸
- 原语只负责视觉和交互外壳，不持有业务状态
- 圆角默认使用连续曲线风格，不做尖锐方角体系

## 5. 模板层与 FSD 落位

模板层是 `Editorial Paper` 的实现核心。后续页面扩展应优先复用模板，而不是重复设计页面。

### 5.1 Page Shell Templates

以下模板属于 `pages` 语义，不落到 `shared/ui`：

- `EditorialFeedPageTemplate`
- `FullscreenVideoPagerTemplate`
- 后续扩展模板：
  - `CollectionListPageTemplate`
  - `ProfileDashboardPageTemplate`
  - `AuthEntryPageTemplate`

推荐职责：

- 定义页面骨架、滚动区、首屏节奏、header block、底部留白
- 接收 widgets 与 feature UI 作为内容槽位
- 不直接持有底层 repository 或 SDK 调用

### 5.2 Widget Templates

以下模板属于页面内大块复合视图区，落在 `widgets/`：

- `MediaFeatureCard`
- `CollectionItemCard`
- `ProfileSummaryCard`
- `StatsStrip`
- `InsightCard`
- `GroupedActionList`

这些模板负责：

- 复合展示布局
- token 与 shared 原语组合
- 局部可复用的视觉节奏

这些模板不负责：

- 路由切换
- app shell 导航
- 跨页面共享的会话逻辑

### 5.3 Feature-bound Templates

以下模板与单一业务能力强耦合，应落在 `features/<domain>/ui`：

- Auth form card
- Auth mode switch
- Code send row
- Favorite/save small actions
- Video action rail

这些组件允许直接表达业务动作，但不应进入 `shared/ui`。

### 5.4 当前 FSD 映射

`Editorial Paper` 在当前仓库中的正式落位应遵循：

- `app/`
  - 路由壳、stack、NativeTabs、modal、header 配置
  - 当前最小运行态已在 `app/` 中引入 tabs / app shell
- `pages/`
  - 页面组合与模板实例
- `widgets/`
  - 复合展示区块
- `features/`
  - 用户动作与能力相关 UI
- `entities/`
  - `feed / video / favorite` 的实体与映射
- `shared/`
  - token、原语、底层视觉能力
  - app 启动期的共享视觉与状态基础设施

### 5.5 推荐目录形态

推荐新增目录组织如下：

```text
src/
  app/
  pages/
    feed/
    video-detail/
    # 后续扩展候选
    vocab/
    me/
    auth/
  widgets/
    media-feature-card/
    collection-item-card/
    profile-summary-card/
    stats-strip/
    insight-card/
    grouped-action-list/
  features/
    auth/ui/
    favorite/ui/
    video-playback/ui/
  entities/
    feed/
    video/
    favorite/
  shared/
    theme/editorial-paper/
    ui/editorial-paper/
```

## 6. 路由与页面关系

### 6.1 页面模型

当前产品模型固定如下：

1. App 首屏是 `登录页`
2. 用户通过登录页主按钮进入 `YouTube-like Feed`
3. 用户点击任意视频卡片
4. 通过 `Stack push` 进入 `Fullscreen Video`
5. `Fullscreen Video` 支持纵向滑动切视频
6. 视频页滑到阈值时触发统一分页请求
7. 返回 Feed 页后恢复到最后播放视频的卡片位置

### 6.2 Feed 与 Video 的关系

`Feed 列表页` 与 `Fullscreen Video 页` 不是两套数据模型，而是同一份 feed source 的两种投影视图：

- Feed 页：编辑化卡片流
- Video 页：沉浸式纵向 pager

它们必须共享：

- 同一 query key
- 同一 feed items 数据源
- 同一分页结果
- 同一 `id -> index` 映射

### 6.3 路由壳归属

- 当前最小运行态先使用 `NativeTabs` 承担底部 tab bar
- 若未来需要更高品牌化的悬浮玻璃胶囊，再评估 custom tab shell
- 底部 tab bar 只属于 `app shell`，不是 shared 组件
- `Fullscreen Video` 是 stack detail，不显示 tab
- 页面自定义 header 不能替代全部原生导航能力
- 一级页面允许保留 editorial header block
- 二级页面优先使用 `Stack title / toolbar`

### 6.4 返回定位规则

从 `Fullscreen Video` 返回 `Feed` 后，Feed 页面必须自动恢复到最后播放视频对应的卡片位置。

当前最小实现下，这层 session 语义只需要：

- `pendingRestoreVideoId`

它不属于 theme，不属于单个 widget，也不属于 entity 持久字段，而是页面间恢复滚动位置所需的短期状态。

## 7. Expo 实现约束

### 7.1 Route 结构

- route 文件只放在 `src/app`
- 页面实现继续放在 `src/pages`
- 不在 route 文件中展开业务控制逻辑
- 不把共享 UI 原语直接塞进 `app/`

### 7.2 Scroll 与 Safe Area

- 页面 route 首子节点优先使用 `ScrollView` / `FlatList`
- 普通滚动页面默认优先开启 `contentInsetAdjustmentBehavior="automatic"`
- `FullscreenVideoPager` 因整页定位依赖 `initialScrollIndex + pagingEnabled`，必须禁用自动 content inset
- 页面模板需要显式考虑顶部与底部 safe area
- 内容滚动留白与 tab shell 留白由页面模板统一处理

### 7.3 Header 与 Toolbar

- 需要原生标题和动作时，优先使用 `Stack header / toolbar`
- 不为了统一视觉而在所有页面里手写伪导航条
- 一级首页可使用自定义 editorial header block
- 二级详情页、设置页、辅助页优先回归原生导航能力

### 7.4 Glass 与 Blur

- `AdaptiveGlass` 必须做 availability check
- iOS 26+ 优先 `expo-glass-effect`
- fallback 使用 `expo-blur`
- 不允许在普通页面结构内层层嵌套 glass
- `NativeTabs`、`AdaptiveGlass` 及其祖先节点不允许通过 `opacity: 0 -> 1` 的启动淡入来显隐；物理机上这会导致 liquid glass 整体不渲染
- app 启动阶段若需要过渡，只允许淡出最上层 launch overlay，底下的 app shell 必须从首帧开始保持非透明

### 7.5 Fullscreen Video 的实现边界

- `FullscreenVideoPagerTemplate` 以现有视频 feed/pager 能力为基础
- 当前真实实现落在 `pages/video-detail + widgets/fullscreen-video-pager`；这里的 template 是页面级抽象名，不等同于单个组件文件
- 不重复创造新的播放器壳
- 视频切换、预取阈值、active item 选择继续依附现有 feed/video 能力模型
- 该页面的工作重点是 page template、overlay、动作布局与导航关系，而不是推翻现有播放内核
- 其中 `Fullscreen Video` 的 overlay 分层设计单独定义在 [Fullscreen Video Overlay设计规范](./Fullscreen%20Video%20Overlay设计规范.md)

### 7.6 Theme 收口要求

- 颜色与视觉 token 不允许继续散落在页面文件中
- 所有 `Editorial Paper` 视觉变量统一进入 `shared/theme/editorial-paper`
- 页面只能消费语义 token，不直接写临时视觉数值作为长期方案

## 8. 接口级抽象契约

本节定义未来实现必须具备的接口边界。这里写语义契约，不要求当前立即实现全部 symbol。

### 8.1 EditorialPaperTokens

应至少覆盖：

```ts
type EditorialPaperTokens = {
  color: {
    background: string;
    surface: string;
    ink: string;
    inkSoft: string;
    inkMute: string;
    accent: string;
    gold: string;
    cocoa: string;
    softAction: {
      rose: string;
      peach: string;
      butter: string;
      pistachio: string;
      lavender: string;
      sky: string;
    };
  };
  typography: {
    display: unknown;
    title: unknown;
    body: unknown;
    meta: unknown;
  };
  spacing: unknown;
  radius: unknown;
  elevation: unknown;
  glass: unknown;
};
```

### 8.2 FeedSourceContract

应至少表达：

- Feed list page 与 video page 共享的 feed items
- paging 能力
- `id -> index` 映射
- 根据 `videoId` 获取当前 index
- 在分页后保持列表一致性

### 8.3 FeedSessionContract

应至少表达：

- `pendingRestoreVideoId`
- Feed 页返回恢复滚动位置的依据

### 8.4 PageTemplateContract

页面模板至少接收：

- `headerBlock`
- `contentBlock`
- `bottomReservedArea`
- `safeAreaPolicy`

模板负责骨架，不负责业务请求与实体读写。

### 8.5 WidgetVariantContract

widgets 至少要有以下变体语义：

- `tone`
- `density`
- `emphasis`

适用对象包括：

- `MediaFeatureCard`
- `CollectionItemCard`
- `GroupedActionList`

这些变体必须受 token 系统约束，不允许自由发散成每页一套风格。

## 9. 约束与非目标

### 9.1 当前阶段不做的事情

- 不定义 dark mode
- 不为 Android 单独派生另一套视觉系统
- 不把所有页面都抽成通用模板
- 不把导航壳、业务模板、视觉原语混成同一层
- 不把参考稿里的每个局部技巧都升级为系统规则
- 不为未来未知页面预先设计重型 design system

### 9.2 文档验收

文档完成后应满足：

- 工程实现者能明确区分 token、原语、模板、页面实例
- 工程实现者能明确每类组件应落在哪个 FSD 层
- 文档不再使用旧的临时参考名作为正式系统名
- 文档对 Feed 列表页与 Fullscreen Video 页的关系描述一致且无冲突
- 文档明确说明 Expo 下 glass、header、navigation 的实现约束

### 9.3 未来实现验收

后续按本规范实现时，应满足：

- 当前已落地的 Feed 与 Fullscreen Video 共享同一套 `Editorial Paper` token 和表面语言
- 后续扩展到收藏夹、我的、登录时，也继续复用这套 token 和表面语言
- Feed list 与 Fullscreen Video 共用全局 feed source
- 从 Fullscreen Video 返回 Feed 后恢复到对应卡片位置
- tab shell 只出现在主页面，不侵入 Fullscreen Video
- `shared/theme` 与 `shared/ui` 不承载业务模板
- Auth、Feed、Profile 等页面不再各自发明独立风格

## 10. 默认实现结论

为避免后续实现阶段再次出现高层决策漂移，本规范在当前阶段锁定以下默认结论：

- 风格系统正式名固定为 `Editorial Paper`
- 视觉参考源与正式实现结构分离
- 当前只设计 `light theme`
- `FullscreenVideoPagerTemplate` 以现有视频播放页能力为基础演进
- `YouTube-like Feed` 是主首页，不再把首页和沉浸式视频页混为一个模板
- 当前最小运行态只落地 `Auth + NativeTabs(Feed / Save / Me) + Fullscreen Video`
- `shared/theme + shared/ui + widgets + features + pages + app` 是正式抽象层次；当前 tabs 也只允许落在 `app` 这一层
