# Feed Page

`pages/feed` 是 `(tabs)` shell 下 `/feed` 首页 tab 的装配层。

当前职责：

- 消费共享 feed source
- 把 `FeedItem` 映射成 `MediaFeatureCard` 所需的展示 props
- 当前映射 helper 落在 `ui/media-feature-card-props.ts`
- 顶部下拉刷新，保留当前页面内容直到第一页成功返回后再整体替换
- 滚动到底继续追加
- 点击卡片后使用 `router.navigate()` 进入 `Fullscreen Video`
- feed page 不自己做点击去重；避免重复 fullscreen stack 由根 `Stack` 上 `video/[videoId]` 的 `dangerouslySingular` 配置负责
- 页面重新获得 focus 时，根据 `pendingRestoreVideoId` 恢复到目标卡片
- 恢复调度使用 `requestIdleCallback`，不再依赖已弃用的 `InteractionManager`
- 恢复使用原生列表滚动动画，而不是无动画跳转
- 只有目标卡片真正进入可见区后才清空恢复状态
- NativeTabs 接管底部安全区后，page 不再手动为 tab bar 预留额外高度

边界约束：

- page 不直接实现 feed repository
- page 不直接实现播放器细节
- page 不拥有视频卡 JSX 本体；卡片复合视图由 `widgets/media-feature-card` 提供
- page 负责派生当前 Feed 专属的展示字段，例如 `views / duration / tone / tag`
- 这些展示字段不进入 `entities/feed`，也不进入 `widgets/media-feature-card` 的内部逻辑
- page 不在 route 文件里展开路由参数解析
- page 不定义 `dangerouslySingular`；这属于 `app/_layout.tsx` 的导航层职责
