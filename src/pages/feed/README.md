# Feed Page

`pages/feed` 是 `(tabs)` shell 下 `/feed` 首页 tab 的装配层。

当前职责：

- 消费共享 feed source
- 把 canonical `VideoListItem[]` 映射成 `MediaFeatureCard` 所需的展示 props
- 顶部下拉刷新，保留当前页面内容直到新的 source 成功替换
- 当当前已加载尾 item 进入可见区时请求下一批
- 在续接读取进行中显示底部 footer loader
- 处理 `initial loading / error / empty / success` 四态
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
