# Feed 与 Fullscreen Video 页面设计逻辑

## 1. 文档目标

本文档定义 `Feed 列表页` 与 `Fullscreen Video 页` 的目标页面关系、交互职责与共享数据模型。

重点回答：

- Feed 与 Fullscreen 为什么是同一内容系统的两种页面投影
- Fullscreen 的 page lifetime 与 session lifetime 应如何拆开
- Fullscreen 页面的 row 内结构应该如何组织
- 视频背景区与底部 seek bar control lane 的职责如何分离

相关文档：

- [Fullscreen Video Overlay架构设计规范](./Fullscreen%20Video%20Overlay架构设计规范.md)
- [Fullscreen Video Gesture设计规范](./Fullscreen%20Video%20Gesture设计规范.md)
- [Fullscreen Video Seek Bar Overlay设计规范](./Fullscreen%20Video%20Seek%20Bar%20Overlay设计规范.md)
- [Fullscreen Transcript Source设计规范](./Fullscreen%20Transcript%20Source设计规范.md)
- [Video 真值与 Runtime 设计规范](./Video%20%E7%9C%9F%E5%80%BC%E4%B8%8E%20Runtime%20%E8%AE%BE%E8%AE%A1%E8%A7%84%E8%8C%83.md)

## 2. 页面关系总览

`Feed 列表页` 与 `Fullscreen Video 页` 不是两套独立产品，而是同一套 canonical video truth 的两种页面投影。当前实现仍然共享 `feed source`，但两边的长期依赖模型已经不再是 `FeedItem`，而是：

- source 输出的 canonical `VideoListItem`
- 再叠加 `video-runtime` 的本地 override

也就是说，这两个页面当前共享的是：

- `Feed 列表页`
  - 负责内容发现、比较与进入
- `Fullscreen Video 页`
  - 负责沉浸式播放、连续浏览与播放中交互

当前共享数据链固定为：

```text
feed source snapshot (FeedItem[])
-> canonical VideoListItem[]
-> effectiveVideoItem[]
-> FeedPage / VideoDetailPage / Fullscreen Video
```

其中：

- `features/feed-source` 负责前两段
- `features/video-runtime` 负责 `canonical -> effective` 聚合
- 页面和 widget 不自己做局部 merge

## 3. Feed 列表页职责

列表页继续承担：

- 浏览卡片流
- 下拉刷新
- 尾部续接
- 点击卡片进入 fullscreen
- 返回后恢复 anchor

列表页不承担：

- 背景手势播放控制
- seek bar
- fullscreen row HUD

## 4. Fullscreen Video 页面结构

fullscreen 的当前结构固定为：

1. `VideoDetailPage`
2. `FullscreenVideoSession`
3. `FullscreenVideoPager`
4. `RowPlaybackMediaLayer`
5. `RowPlaybackInteractionLayer`
6. `RowOwnedVideoOverlay`
7. `RowPlaybackHudOverlay`
8. `RowSurfaceStatusOverlay`
9. `Page shell overlays`

其中 page / session / pager 的正式层级固定为：

```text
VideoDetailPage
└── FullscreenVideoSession
    ├── useFullscreenTranscriptSource(...)
    └── FullscreenVideoPager
        └── useFullscreenPlaybackSession(...)
```

### 4.1 `VideoDetailPage`

`VideoDetailPage` 当前职责固定为 page-lifetime 装配：

- 从 route param 读取 `videoId`
- 消费共享 `feed source`
- 维护页面退出时需要写回的 `latestActiveItemIdRef`
- 计算当前 route 对应的 `fullscreenSessionKey`
- 渲染 `FullscreenVideoSession`

它不再直接持有：

- transcript active state
- pager active state
- route change 与 pager retarget 的兼容逻辑

### 4.2 `FullscreenVideoSession`

这是 fullscreen 页面结构中的新增核心层。

它承担 session-lifetime 职责：

- 根据 `routeVideoId + canonicalItems` 解析本次 session 的 entry target
- 持有 `pagerReportedActive`
- 派生 transcript source 输入
- 接收 pager active change
- 收口 near-tail `requestMore()` 触发
- 渲染 `FullscreenVideoPager`

它是：

- route target 与 pager active 的对齐层
- transcript source 的正式 owner

### 4.3 `FullscreenVideoPager`

pager 继续承担 widget-lifetime 职责：

- 首屏定位
- row 分页
- viewability -> active row change
- row / overlay / playback session 装配

它不再承担：

- route retarget
- page-level session reset
- transcript source read/cache

其中：

- `RowPlaybackMediaLayer`
  - 承载播放器与真实进度快照
- `RowPlaybackInteractionLayer`
  - 是 row 内唯一交互 owner
  - 内部分成：
    - `BackgroundGestureRegion`
    - `SeekBarControlLane`
- `RowOwnedVideoOverlay`
  - 承载标题、说明、右侧动作列与底部 scrim
- `RowPlaybackHudOverlay`
  - 承载 pause / seek / `2x` HUD
- `RowSurfaceStatusOverlay`
  - 承载 loading / error / retry

## 5. Fullscreen 的 session 结构

当前 fullscreen 已显式拆开：

1. `page lifetime`
2. `fullscreen session lifetime`
3. `pager widget lifetime`

这是因为 `video/[videoId]` 通过 `dangerouslySingular` 复用 page instance。

也就是说：

- route 从 `/video/a` 切到 `/video/b` 时
- `VideoDetailPage` 不一定重挂
- 但从业务语义上，这已经是一个新的 fullscreen browsing session

因此当前结构固定要求：

- route target change = new fullscreen session

### 5.1 session key

每次 route target 变化，都必须开启新的 fullscreen session。

推荐的 session key 固定为：

```ts
fullscreenSessionKey = `route:${normalizedVideoId ?? '__default__'}`
```

这个 key 属于：

- page -> session 子树的重建边界

不属于：

- pager 内部 active state
- transcript cache key

### 5.2 为什么必须引入 session 层

如果 page 直接持有：

- pager active
- transcript active

就会把以下两种生命周期混在一起：

- page instance 生命周期
- 当前 route target 对应的 fullscreen session 生命周期

一旦 route reuse 发生，局部 state 就会粘住旧 session。

session 层的作用就是：

- 把 page instance reuse 与业务 session reset 显式拆开

### 5.3 为什么不把 pager 改成 route-controlled

最佳结构里，pager 继续保持 mount-scoped widget，不改成 fully controlled retarget 组件。

原因是：

- route retarget 本质上是新 session，不是同一 pager 会话里的普通 active 变化
- 为了 route retarget 把 pager 改成受控组件，会把 widget API 变脏
- 正确做法是让 page 用 session key 重建整个 session 子树，而不是强行让 pager 承担 route reset

## 6. 三类 active 概念必须拆开

fullscreen 当前必须显式区分三类概念：

### 6.1 route target

route target 表示：

- 当前 route 想进入哪条 fullscreen 视频

建议统一命名为：

- `routeVideoId`
- `entryIndex`
- `entryVideoId`

它来自：

- route param
- `canonicalItems`
- route miss -> fallback first item

### 6.2 pager active

pager active 表示：

- pager 已经真正 commit 到哪条视频

建议结构固定为：

```ts
type FullscreenPagerReportedActive = {
  itemId: string;
  index: number;
};
```

它只由 pager 上报，不由 route 直接写入。

### 6.3 transcript active

transcript active 不应由 page 单独维护一组“只 seed 一次”的 state。

它应当由 fullscreen session 当前上下文派生：

```ts
transcriptVideoId = pagerReportedActive?.itemId ?? entryVideoId
transcriptIndex = pagerReportedActive?.index ?? entryIndex
```

也就是：

- pager 尚未回调时，用 route entry target
- pager 回调后，以真正的 pager active 为准

## 7. Fullscreen 页面交互职责

fullscreen 页固定承担：

- 当前视频有声自动播放
- 上下滑动切换视频
- 系统右滑返回
- 视频背景区 `single tap` 切 pause/resume
- 视频背景区 `double tap` 做 `-5s / +5s`
- 视频背景区 `long press` 做临时 `2x`
- 底部 seek bar lane 做：
  - rail + thumb 的 `tap-to-seek`
  - drag preview
  - release commit
- 右侧 action rail 做：
  - `like` 本地 toggle
  - `favorite` 本地 toggle
  - `share / annotate` 的现有 UI 行为

### 5.1 背景区职责

视频背景区只负责：

- pause / resume
- `±5s`
- 临时 `2x`

### 5.2 底部 control lane 职责

底部 seek bar control lane 只负责：

- 当前时间预览
- rail + thumb 定位
- 绝对 seek

它不属于背景点击区，因此：

- 不触发 pause
- 不触发背景双击 `±5s`
- 不触发背景长按 `2x`

### 5.3 右侧 action rail 的数据语义

fullscreen 右侧 action rail 当前固定消费 `effective video item`：

- `isLiked === true`
  - heart 显示为红色
- `isFavorited === true`
  - star 显示为黄色

当前这两个动作都只修改 `features/video-runtime`：

- 不调 API
- 不复用旧的 `features/favorite`
- 不把本地 toggle 混回 `feed-source`

## 8. Shared Feed Source

`Feed 列表页` 与 `Fullscreen Video 页` 当前共享同一份 `feed source`，并且页面长期消费模型已经收口为 canonical/effective video：

- `feed items`
- source state
- query cache
- `id -> index`
- 当前已加载尾 item 与续接状态

这意味着：

- fullscreen 不是独立播放器数据源
- feed 返回定位仍以同一份 source 为准
- fullscreen 不再长期直接依赖 `FeedItem`
- 未来多个 source 进入 UI 时，应先映射到同一套 `VideoListItem`
- 页面最终渲染态统一来自 `effectiveVideoItem`

## 9. Fullscreen 数据流

### 9.1 初次进入 fullscreen

当前流程固定为：

1. `VideoDetailPage` 读取 route `videoId`
2. `useFeedSource()` 返回 `canonicalItems`
3. page 解析：
   - `entryIndex`
   - `entryVideoId`
   - `fullscreenSessionKey`
4. page 渲染：

```tsx
<FullscreenVideoSession
  key={fullscreenSessionKey}
  entryIndex={entryIndex}
  entryVideoId={entryVideoId}
  items={canonicalItems}
  isInitialLoading={isInitialLoading}
  requestMore={requestMore}
  onLatestActiveVideoIdChange={...}
/>
```

5. session 先用 `entryVideoId` 建立 transcript source 输入
6. pager mount 后再通过 `onActiveVideoChange(...)` 报告真正 active item

### 9.2 fullscreen 内滑动切换

当前流程固定为：

1. pager 内部 viewability 识别出新的 active row
2. pager 上报 `onActiveVideoChange(itemId, index)`
3. session 更新 `pagerReportedActive`
4. transcript source 自动切到新的 `itemId`
5. session 继续根据该 `index` 判断是否接近尾部，并触发 `requestMore()`

### 9.3 singular route 下切到另一条视频

这是当前最关键的结构要求。

当前流程固定为：

1. route 从 `/video/a` 变到 `/video/b`
2. `VideoDetailPage` 复用 page instance，但重新计算出新的 `fullscreenSessionKey`
3. 旧 `FullscreenVideoSession` 整体卸载
4. 新 `FullscreenVideoSession` 按新的 route target 重建
5. transcript source 立即使用新的 route target，而不是继续粘旧视频
6. pager 重新用新的 `entryIndex` 初始化

### 9.4 页面退出

退出 fullscreen 时，page 继续保持当前页面级语义：

- 只写回 `latestActiveItemIdRef`
- 不写回 transcript state
- 不清理 transcript query cache

transcript cache 继续交给 React Query 的 `gcTime` 回收。

## 10. 目标结构中的关键设计结论

fullscreen 的当前页面逻辑固定采用：

- row-local media layer
- row-local single interaction owner
- row-local content / HUD / surface status overlays
- page shell 只保留 pager 级 UI
- page lifetime 与 session lifetime 显式拆开
- session 绑定 route target，而不是绑定 page instance

不再采用：

- 独立的 `ActiveVideoGestureSurface`
- seek bar 通过 bridge 与背景层协调
- 底部 lane 被视为背景区的一部分
- page 直接持有 transcript active state
- pager 被改造成 route-controlled retarget widget

## 11. 成功标准

页面逻辑只有同时满足以下条件，才算正确：

1. Feed 与 Fullscreen 继续共享同一份 source
2. Fullscreen route reuse 时，会开启新的 fullscreen session
3. `VideoDetailPage` 不再直接持有 transcript active state
4. Fullscreen row 内只存在一个正式 interaction owner
5. 视频背景区与 seek bar control lane 的职责完全分离
6. 底部 control lane 不再属于背景点击区
7. 页面级、session 级、row 级 UI 边界清晰，不再靠 bridge 协调手势
