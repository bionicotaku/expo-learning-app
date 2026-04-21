# Video Detail Page

`pages/video-detail` 是 Fullscreen Video 页的页面装配层。

相关设计文档：

- [Fullscreen Transcript Source设计规范](../../../docs/Fullscreen%20Transcript%20Source设计规范.md)
- [Fullscreen Video Overlay架构设计规范](../../../docs/Fullscreen%20Video%20Overlay架构设计规范.md)
- [Video 真值与 Runtime 设计规范](../../../docs/Video%20真值与%20Runtime%20设计规范.md)

当前职责：

- 从 route param 读取 `videoId`
- 依赖根 `Stack` 上 `video/[videoId]` 的 `dangerouslySingular` 配置，确保 fullscreen video 只复用一个栈实例
- 复用共享 feed source 找到进入位置
- 通过 `resolveVideoDetailRouteTarget(...)` 计算当前 route 对应的 `entryIndex / entryVideoId / sessionKey`
- 用 `key={sessionKey}` 渲染 `FullscreenVideoSession`
- 在离开页面时把最后一次上报的 `activeItemId` 写入 `pendingRestoreVideoId`
- route `videoId` 找不到匹配项时回退到第一个视频

当前组件树：

```text
VideoDetailPage
└── FullscreenVideoSession
    ├── useFullscreenTranscriptSource(...)
    └── FullscreenVideoPager
```

其中 `FullscreenVideoSession` 负责：

- 持有 `pagerReportedActive`
- 用 `pagerReportedActive ?? entryTarget` 派生 transcript source 输入
- 通过 `onActiveVideoChange(itemId, index)` 接收 pager 当前 active video 的变化
- 当 active video 进入当前已加载序列的最后 3 条时请求下一批

边界约束：

- page 不维护 transcript active state；这部分属于 `FullscreenVideoSession`
- page 不维护 `activeIndex / activeItemId` 本地状态；这部分属于 pager 内部播放会话
- page 不维护 `basePausedByUser`、`transientHoldState`、HUD 或任何 row 级交互状态
- page 不直接实现播放器窗口策略
- page 不直接定义 feed repository
- page 不直接实现 transcript query cache；这层属于 `features/transcript-source`，由 session 组件消费
- page 不直接定义 runtime store 结构
- page 不持有跨页面长期状态
- page 不定义 `dangerouslySingular`；route 单实例约束属于 `app/_layout.tsx`
- fullscreen row 的 `isLiked / isFavorited` 读写都不经过 page relay，而是在 row 内按 `videoId` 直接进入 runtime
