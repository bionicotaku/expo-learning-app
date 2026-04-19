# shared/ui

`shared/ui` 只放可跨页面复用的视觉原语，不放业务模板。

当前正式入口是 `editorial-paper/`：

- `editorial-paper/`
  - `RaisedSurface`、`InsetSurface`、`AdaptiveGlass`
  - `EditorialTitle`、`MetaLabel`
  - `SoftActionButton`、`SegmentedFilterBar`、`IconPill`

这里的组件只负责视觉壳和基础交互约束：

- 不持有业务状态
- 不处理路由、分页、收藏、登录等业务逻辑
- 不承载 `FeedCard`、`AuthCard`、`ProfileSummary` 这类页面模板

页面级模板应继续放在 `widgets/`、`features/`、`pages/`，不要回流到 `shared/ui`。
