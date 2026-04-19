# Feed Page

`pages/feed` 是首页 Feed 列表页的装配层。

当前职责：

- 消费共享 feed source
- 顶部下拉刷新，保留当前页面内容直到第一页成功返回后再整体替换
- 滚动到底继续追加
- 点击卡片后进入 `Fullscreen Video`
- 页面重新获得 focus 时，根据 `pendingRestoreVideoId` 恢复到目标卡片
- 恢复调度使用 `requestIdleCallback`，不再依赖已弃用的 `InteractionManager`
- 恢复使用原生列表滚动动画，而不是无动画跳转
- 只有目标卡片真正进入可见区后才清空恢复状态

边界约束：

- page 不直接实现 feed repository
- page 不直接实现播放器细节
- page 不在 route 文件里展开路由参数解析
