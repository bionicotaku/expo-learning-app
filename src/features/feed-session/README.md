# Feed Session Feature

`features/feed-session` 负责 Feed 列表页与 Fullscreen Video 页之间的短期会话状态。

当前职责：

- 只维护一个一次性的 `pendingRestoreVideoId`
- 在 Fullscreen Video 退出时写入恢复目标
- 在 Feed 真正恢复到目标卡片可见后清空恢复目标

边界约束：

- 不持有 UI
- 不访问网络
- 不替代 feed query cache
- 只服务页面之间的恢复定位
