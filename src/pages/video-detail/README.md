# Video Detail Page

`pages/video-detail` 是 Fullscreen Video 页的页面装配层。

当前职责：

- 从 route param 读取 `videoId`
- 复用共享 feed source 找到进入位置
- 维护页面级 `isMuted`
- 初次进入时也通过 pager 列表自身的 loading item 等待第一页，不额外渲染全屏 loading 页
- 通过 `onActiveItemChange(itemId, index)` 接收 pager 当前 active video 的变化
- 根据 pager 上报的 active index 触发下一页预取
- 在离开页面时把最后一次上报的 `activeItemId` 写入 `pendingRestoreVideoId`

边界约束：

- page 不维护 `activeIndex / activeItemId` 本地状态；这部分属于 pager 内部播放会话
- page 不直接实现播放器窗口策略
- page 不直接定义 feed repository
- page 不持有跨页面长期状态
