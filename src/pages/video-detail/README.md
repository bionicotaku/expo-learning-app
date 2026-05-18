# Video Detail Page

`pages/video-detail` 是 Fullscreen Video 页的页面装配层。

相关设计文档：

- [Fullscreen Video Resources设计规范](../../../docs/Fullscreen%20Transcript%20Source设计规范.md)
- [Fullscreen Video Overlay架构设计规范](../../../docs/Fullscreen%20Video%20Overlay架构设计规范.md)
- [Video 真值与 Runtime 设计规范](../../../docs/Video%20真值与%20Runtime%20设计规范.md)

当前职责：

- 从 route param 读取 `videoId`
- 依赖根 `Stack` 上 `video/[videoId]` 的 `dangerouslySingular` 配置，确保 fullscreen video 只复用一个栈实例
- 复用共享 feed source 找到进入位置
- 通过 `resolveVideoDetailRouteTarget(...)` 计算当前 route 对应的 `entryIndex / entryVideoId / sessionKey`
- 用 `key={sessionKey}` 渲染 `FullscreenVideoSession`
- 维护 page-lifetime 的 `latestRestoreVideoId`
- route/session 变化时先用 `routeTarget.entryVideoId` 预置 restore target
- pager 后续上报 committed active 时再覆盖 restore target
- 在离开页面时把 `latestRestoreVideoId` 写入 `pendingRestoreVideoId`
- route `videoId` 找不到匹配项时回退到第一个视频

当前组件树：

```text
VideoDetailPage
└── FullscreenVideoSession
    ├── useFullscreenVideoResources(...)
    ├── useVideoEndQuiz(...)
    ├── useVideoWatchProgressReporter(...)
    └── FullscreenVideoPager
```

其中 `FullscreenVideoSession` 负责：

- 持有 `pagerReportedActive`
- 用 `pagerReportedActive ?? entryTarget` 派生 fullscreen resources 输入
- 接收 `features/fullscreen-video-resources` 返回的 active transcript 与 video meta map，并把结果传给 `FullscreenVideoPager`
- 通过 `onActiveVideoChange(itemId, index)` 接收 pager 当前 active video 的变化
- 持有 `features/video-watch-progress` reporter，并把 pager 转发的 active row progress sample 交给 reporter
- 持有 `features/video-end-quiz` controller，在 entry video 和 active video change 时预取视频末尾题目
- 把 end quiz 的 `presentEndQuizBeforeAdvance` 传给 pager，让视频结束时可先展示题组再切下一条
- 读取 video screen focus 状态，并把 `isScreenFocused` 传给 `FullscreenVideoPager`
- 负责 watch-progress focused `10s` 定时 flush、active video switch flush 和 video screen blur / unfocus flush
- 在 video screen blur / unfocus 时停止定时 flush；pager 同步暂停 active row 播放、停止 progress sample 转发并关闭背景手势
- 当 active video 进入当前已加载序列的最后 3 条时请求下一批
- near-tail 续接通过 `createTailRequestGate()` 区分 in-flight 与 fulfilled：失败后允许用户再次进入尾部区域手动触发，成功后同一 tail 不重复请求
- 通过 `usePresentPlaybackSettingsSheet()` 把 fullscreen 中间长按接到播放设置 sheet

边界约束：

- page 不维护 fullscreen resource active state；这部分属于 `FullscreenVideoSession`
- page 不维护 `activeIndex / activeItemId` 本地状态；这部分属于 pager 内部播放会话
- page 维护的是 restore target，不是“只等 pager committed active 才存在的 latest active state”
- page 不维护 `basePausedByUser`、`transientHoldState`、HUD 或任何 row 级交互状态
- page 只注入 center hold 的 sheet presenter，不接管 row 级手势识别
- page 不直接实现播放器窗口策略
- page 不直接定义 feed repository
- page 不直接实现 video meta 或 transcript asset query cache；这层属于 `features/fullscreen-video-resources`，由 session 组件消费
- page 不直接持有 watch-progress reporter；这层属于 `FullscreenVideoSession`
- page 不直接取 End Quiz 题目；这层属于 `FullscreenVideoSession` 消费的 `features/video-end-quiz`
- page 不直接处理 video screen focus gate；这层属于 `FullscreenVideoSession`
- page 不直接消费或渲染 transcript 内容；基础字幕展示由 session 把 active transcript 下传给 fullscreen pager/row 后完成
- 字幕显示模式由 `features/playback-settings` 提供，session 只把当前全局 `subtitleDisplayMode` 传给 pager；关闭字幕不影响 fullscreen resources 读取
- page 不直接定义 runtime store 结构
- page 不持有跨页面长期状态
- page 不定义 `dangerouslySingular`；route 单实例约束属于 `app/_layout.tsx`
- fullscreen row 的 `isLiked / isFavorited` base 值来自 `VideoMeta`，读写不经过 page relay，而是在 row 内按 `videoId` 进入 runtime
