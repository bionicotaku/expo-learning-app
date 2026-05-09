# Feed Page

`pages/feed` 是 `(tabs)` shell 下 `/feed` 首页 tab 的装配层。

当前职责：

- 消费共享 feed source
- 把 canonical `VideoListItem[]` 映射成 `MediaFeatureCard` 所需的展示 props
- 顶部下拉刷新，保留当前页面内容直到新的 source 成功替换
- 当当前已加载尾 item 进入可见区时请求下一批
- 列表末尾 `onEndReached` 也会触发同一套尾部续接逻辑，便于续接失败后用户再次手动触发
- 尾部续接通过 `createTailRequestGate()` 区分 in-flight 与 fulfilled：失败后释放 gate，成功后同一 tail 不重复请求
- 在续接读取进行中显示底部 footer loader
- 始终渲染同一个 `FlatList` 壳；`initial loading / error / empty` 都通过 `ListEmptyComponent` 在列表区域展示
- 首屏读取失败时只在空列表区域显示 `加载失败`，同时触发全局 error toast；失败后只能通过下拉刷新重新拉取
- 下拉刷新失败时保留当前列表或当前空态，并触发全局 error toast：`刷新失败`
- 点击卡片后使用 `router.navigate()` 进入 `Fullscreen Video`
- 页面重新获得 focus 时，根据 `pendingRestoreVideoId` 恢复到目标卡片
- 恢复调度使用 `requestIdleCallback`
- 只有目标卡片真正进入可见区后才清空恢复状态

边界约束：

- page 不直接实现 feed repository
- page 不直接实现 `videoId -> runtime override`
- page 不直接实现播放器细节
- page 不拥有视频卡 JSX 本体；卡片复合视图由 `widgets/media-feature-card` 提供
- page 负责派生当前列表展示字段，例如 `statsLabel / tagLabel / fallbackTone`
- page 不在 route 文件里展开路由参数解析
- page 不定义 `dangerouslySingular`；这属于 `app/_layout.tsx` 的导航层职责
