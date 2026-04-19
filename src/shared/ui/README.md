# shared/ui

`shared/ui` 只放可跨页面复用的视觉原语，不放业务模板。

当前正式入口包括：

- `editorial-paper/`
  - `RaisedSurface`、`InsetSurface`、`AdaptiveGlass`
  - `EditorialTitle`、`MetaLabel`
  - `SoftActionButton`、`SegmentedFilterBar`、`IconPill`
  - `AdaptiveGlass` 支持默认 paper-tinted 与 `clear` 无色透明两种玻璃外观
  - `SegmentedFilterBar` 负责共享的滑块 segmented 动画、tone 渐变切换，以及整条拖动后带轻微速度偏置的 spring 吸附切换
- `toast/`
  - `ToastHost`
  - 应用级全局 top toast 视图实现
  - 独立于 `Editorial Paper`，不作为页面原语使用

这里的组件只负责视觉壳和基础交互约束：

- 不持有业务状态
- 不处理路由、分页、收藏、登录等业务逻辑
- 不承载 `FeedCard`、`AuthCard`、`ProfileSummary` 这类页面模板

页面级模板应继续放在 `widgets/`、`features/`、`pages/`，不要回流到 `shared/ui`。

补充约束：

- `toast/` 是全局 overlay UI，不是页面 primitive
- `toast/` 不并入 `editorial-paper/`
- Fullscreen Video 内部的局部 HUD 也不进入 `toast/`
