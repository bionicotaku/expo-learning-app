# Video Detail Page

`pages/video-detail` 是 Fullscreen Video 页的页面装配层。

当前职责：

- 从 route param 读取 `videoId`
- 依赖根 `Stack` 上 `video/[videoId]` 的 `dangerouslySingular` 配置，确保 fullscreen video 只复用一个栈实例
- 复用共享 feed source 找到进入位置
- 初次进入时通过 pager 自身的 loading item 等待共享 source 返回
- 通过 `onActiveItemChange(itemId, index)` 接收 pager 当前 active video 的变化
- 当 active video 进入当前已加载序列的最后 3 条时请求下一批
- 在离开页面时把最后一次上报的 `activeItemId` 写入 `pendingRestoreVideoId`
- route `videoId` 找不到匹配项时回退到第一个视频

边界约束：

- page 不维护 `activeIndex / activeItemId` 本地状态；这部分属于 pager 内部播放会话
- page 不维护 `basePausedByUser`、`transientHoldState`、HUD 或任何 row 级交互状态
- page 不直接实现播放器窗口策略
- page 不直接定义 feed repository
- page 不持有跨页面长期状态
- page 不定义 `dangerouslySingular`；route 单实例约束属于 `app/_layout.tsx`
