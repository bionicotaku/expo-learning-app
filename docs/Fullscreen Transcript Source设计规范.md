# Fullscreen Transcript Source 设计规范

## 1. 文档目标

本文档定义 `Fullscreen Video 页` 在 transcript 读取上的目标 source 结构。

当前代码已经按本文档完成 fullscreen transcript source 的 data-layer 落地；当前尚未接 subtitle / transcript UI。

这份文档重点回答：

- fullscreen 场景下 transcript 应该由哪一层发起读取
- 为什么 transcript 不能进入 `video-runtime`
- 为什么 transcript 当前阶段应只使用 React Query 内存缓存
- 进入 fullscreen 与 active video 切换时，transcript 应该如何请求与预取
- 当前 active transcript 应该如何定义与暴露

这份文档只覆盖：

- transcript source/read/cache/ownership
- fullscreen active transcript 的数据流
- transcript feature 的最小接口与状态契约

这份文档当前 **不覆盖**：

- subtitle / transcript UI 呈现
- token 点击
- 句子高亮
- seek-to-sentence
- transcript 与播放器时间同步的高频派生
- 本地持久化缓存

相关文档：

- API 契约见 [Transcript API设计](./Transcript%20API设计.md)
- 视频真值与 runtime 分层见 [Video 真值与 Runtime 设计规范](./Video%20真值与%20Runtime%20设计规范.md)
- fullscreen overlay 边界见 [Fullscreen Video Overlay架构设计规范](./Fullscreen%20Video%20Overlay架构设计规范.md)
- 页面关系见 [Feed与Fullscreen Video页面设计逻辑](./Feed%E4%B8%8EFullscreen%20Video%E9%A1%B5%E9%9D%A2%E8%AE%BE%E8%AE%A1%E9%80%BB%E8%BE%91.md)

## 2. 核心结论

当前 fullscreen transcript source 设计固定锁定以下结论：

1. transcript 是按 `videoId` 键控的 interactive-read 子资源。
2. transcript 不属于 `video-runtime`，因为它不是 local runtime override。
3. transcript 不属于 fullscreen row，也不属于 `useFullscreenPlaybackSession`。
4. transcript 的当前缓存层只允许使用 React Query 内存缓存。
5. transcript 的 query key 固定为：

```ts
['transcript', videoId]
```

6. 当前 active transcript 不是独立长期 store，而是：

```ts
activeTranscript = queryCache[['transcript', activeTranscriptVideoId]]
```

7. 进入 fullscreen 时，以实际 `targetIndex` 命中的 `videoId` 作为初始 transcript key，而不是直接信 route param。
8. fullscreen 滑动切换时，只使用 `onActiveItemChange(itemId, index)` 作为 active transcript 切换输入。
9. 预取窗口固定为 `active ±1`。
10. 当前阶段不做本地持久化缓存，不定义任何 L2 cache 协议。

一句话收口：

- transcript 属于按 `videoId` 读取的 source/server state
- 当前阶段必须由 page/feature 层通过 React Query 管理
- 不进入 row，不进入 pager session，不进入 runtime store

## 3. 为什么 transcript 不属于 `video-runtime`

当前项目的主结构已经由 [Video 真值与 Runtime 设计规范](./Video%20真值与%20Runtime%20设计规范.md) 锁定为：

- canonical/source truth -> `React Query`
- runtime override -> `Zustand`

`features/video-runtime` 当前只负责：

- `videoId` 维度的本地 override
- source membership registry

典型字段是：

- `isLiked`
- `isFavorited`
- 未来的 `isMuted`
- 未来的 `lastWatchPosition`

transcript 不满足 runtime override 的语义，因为它：

- 不是本地临时覆盖值
- 不是用户即时写入状态
- 不是 UI-only ephemeral state
- 是可复用、可缓存、可失效的远程读资源

因此 transcript 当前明确 **不能**：

- 进入 `overridesByVideoId`
- 进入 `sourceVideoIds`
- 进入 `useVideoRuntimeStore()`
- 被建模为 `effective video item` 的 runtime 补丁

如果把 transcript 放进 runtime store，会直接把 query cache、in-flight 去重、错误状态与失效策略重新造一遍，这是错误边界。

## 4. 为什么 transcript 不属于 fullscreen row / pager session

### 4.1 row 不是 transcript 的读取 owner

`FullscreenVideoRow` 当前的职责是：

- row-local media layer
- row-local interaction layer
- row-local HUD / surface status

row 当前不是业务读取 owner。

transcript 如果放到 row，会立刻带来三个结构问题：

1. 它与 virtualization 生命周期耦合
2. 周边 row 可能因为 player 挂载窗口而误发请求
3. row 卸载会误导实现去清理 transcript 数据，而 transcript 缓存并不该跟 row 生命周期绑定

### 4.2 `useFullscreenPlaybackSession` 不是 transcript 的读取 owner

`useFullscreenPlaybackSession` 当前只负责：

- active row
- pause / hold base state
- row HUD lifecycle
- active player controller / surface gating

它是播放交互会话中心，不是 transcript source state owner。

一旦 transcript 网络读取进入这层：

- widget 会同时持有交互会话和 interactive-read
- `useFullscreenPlaybackSession` 的边界会和 query cache 混在一起
- row HUD 和 transcript 数据状态会被迫共享一个高频 hook

这是当前结构明确要避免的。

## 5. 正式归属模型

fullscreen transcript 的正式归属固定为：

1. `entities/transcript`
2. `features/transcript-source`
3. `pages/video-detail`

其中：

- `entities/transcript`
  - 只负责 `fetchTranscript(videoId)`
  - 只负责 DTO -> domain 边界
- `features/transcript-source`
  - 负责 query key
  - 负责 active transcript query
  - 负责邻近预取
  - 负责当前 active transcript 的派生暴露
- `pages/video-detail`
  - 负责把 fullscreen 当前 active `videoId` 喂给 transcript source
  - 负责 future subtitle UI 的 transcript 下传入口

当前明确不允许：

- `widgets/fullscreen-video-pager` 直接发 transcript 请求
- `FullscreenVideoRow` 直接依赖 transcript query
- `useFullscreenPlaybackSession` 持有 transcript 数据或请求状态

## 6. 缓存层策略

### 6.1 当前阶段只允许 L1 内存缓存

当前 transcript 缓存层固定为 React Query 内存缓存：

```ts
queryKey = ['transcript', videoId]
```

query 选项固定为：

```ts
staleTime: Infinity
gcTime: 30 * 60 * 1000
refetchOnMount: false
refetchOnReconnect: false
refetchOnWindowFocus: false
retry: false
```

语义解释：

- `staleTime: Infinity`
  - 同一会话里，只要缓存存在，就直接复用
- `gcTime: 30min`
  - transcript 不永久驻留内存，避免无限增长
- 关闭 mount/reconnect/windowFocus 自动重抓
  - 当前阶段 transcript 以“命中缓存即复用”为主，不追求自动刷新
- `retry: false`
  - 保持当前项目的 query client 默认，不为 transcript 单独打开自动重试

### 6.2 为什么本地持久化缓存暂缓

当前阶段明确不做：

- AsyncStorage transcript cache
- SQLite transcript cache
- File-based transcript cache

原因是：

- 当前仓库还没有 transcript 的本地缓存基础设施
- transcript payload 相对较重
- 一旦落盘，必须同时定义：
  - cache version
  - invalidation
  - migration
  - eviction
  - 容量策略

这超出了当前阶段“为 fullscreen 准备 transcript source”的范围。

因此当前结构明确为：

- L1 memory cache only
- no L2 storage cache

## 7. Fullscreen 数据流

### 7.1 初次进入 fullscreen

进入 fullscreen 时，transcript key 不应直接来自 route param。

正式流程固定为：

1. `VideoDetailPage` 从 route 读取 `videoId`
2. 通过 canonical `VideoListItem[]` 找到 `targetIndex`
3. 如果 `videoId` 找不到，回退到第一个视频
4. 用实际 `targetIndex` 命中的 `videoId` 作为：

```ts
initialActiveVideoId
```

5. transcript source 对这个 `initialActiveVideoId` 发起 active transcript query

这样可以保证：

- route 非法时不会先打一枪错误 transcript 请求
- transcript 请求与 fullscreen 实际进入的视频保持一致

### 7.2 active 视频切换

active transcript 的切换事件，固定只来自：

```ts
onActiveItemChange(itemId, index)
```

不允许：

- 监听 raw scroll offset
- 监听 view token 之外的滚动中间态
- 在 row mount/unmount 时发 transcript 请求

正式流程固定为：

1. `FullscreenVideoPager` 识别 active row 变化
2. `VideoDetailPage` 收到 `onActiveItemChange(itemId, index)`
3. page 更新：

```ts
activeTranscriptVideoId = itemId
activeTranscriptIndex = index
```

4. transcript source 以新的 `activeTranscriptVideoId` 执行 active query
5. transcript source 对 `index - 1` 与 `index + 1` 做后台预取

### 7.3 当前 active transcript 的定义

当前 active transcript 不能被设计成“另一个长期 store”。

它的正式定义固定为：

```ts
activeTranscriptVideoId: string | null
activeTranscript: Transcript | null
activeTranscriptStatus: 'idle' | 'loading' | 'success' | 'error'
activeTranscriptError: Error | null
```

其中：

- `activeTranscriptVideoId`
  - 是 page/feature 层持有的当前 active 身份
- `activeTranscript`
  - 是按当前 `activeTranscriptVideoId` 从 query cache/query result 派生出来的值

这里要特别强调：

- `activeTranscript` 不是一份长期复制品
- 它只是当前 active key 的派生读结果

### 7.4 严格禁止 keep previous transcript

当前 fullscreen transcript source 必须遵守一条硬规则：

- **新 active `videoId` 切换后，如果新 key 没有缓存命中，则 `activeTranscript` 立即为 `null`**

也就是说当前设计明确禁止：

- `keepPreviousData`
- 继续展示上一条视频 transcript 直到新请求回来
- 用旧 transcript 做 placeholder

当前目标是：

- 身份正确优先于视觉连续性

因此新 key 切换后的行为固定为：

- cache hit
  - `activeTranscript` 立即可用
  - `status = success`
- cache miss
  - `activeTranscript = null`
  - `status = loading`

## 8. 预取策略

当前预取窗口固定为：

- `active - 1`
- `active + 1`

也就是：

- `active ±1`

不采用：

- 只请求 active
- `active ±2`

原因：

- transcript payload 比普通 flags 重
- 当前阶段还没有 transcript UI
- `±1` 足够覆盖最常见的上下滑一条场景

预取规则固定为：

1. 只在 `activeIndex !== null` 且邻近项存在时触发
2. 只对邻近项做 `prefetchQuery`
3. 已命中缓存的 key 不重复发请求
4. 预取失败不升级为 fullscreen 可见错误

## 9. feature 接口设计

当前目标 feature 固定命名为：

- `features/transcript-source`

最小公开接口固定为：

```ts
getTranscriptQueryKey(videoId: string)
useFullscreenTranscriptSource({
  activeVideoId,
  activeIndex,
  items,
})
```

其中：

```ts
type UseFullscreenTranscriptSourceInput = {
  activeVideoId: string | null;
  activeIndex: number | null;
  items: VideoListItem[];
};
```

```ts
type UseFullscreenTranscriptSourceResult = {
  activeTranscript: Transcript | null;
  activeTranscriptStatus: 'idle' | 'loading' | 'success' | 'error';
  activeTranscriptError: Error | null;
};
```

hook 内部职责固定为：

- 对 active `videoId` 执行 `useQuery`
- 用稳定 query key 命中当前内存缓存
- 在 active index 可用时，对 `±1` 视频执行 `prefetchQuery`
- 不向外暴露 row 级状态
- 不向外暴露 query client 本身

当前阶段 hook 不负责：

- token 命中
- 当前句子派生
- 时间轴同步
- subtitle UI 布局

## 10. 页面与 widget 边界

### 10.1 `pages/video-detail`

page 是 fullscreen transcript source 的正式 owner。

它负责：

- 计算 `initialActiveVideoId`
- 维护当前 `activeTranscriptVideoId`
- 把 active video 切换事件喂给 transcript source
- 未来把 `activeTranscript` 下传给 fullscreen 子树

当前 page 明确不负责：

- transcript query cache 的底层实现
- row 级 transcript 渲染
- transcript UI 本身

### 10.2 `widgets/fullscreen-video-pager`

pager 继续保持 transcript-agnostic。

它不应新增：

- transcript props
- transcript query
- transcript cache
- transcript error state

它继续只负责：

- active row 切换
- playback session
- row 装配

### 10.3 `FullscreenVideoRow`

row 当前明确不承担 transcript 读取。

row 不应：

- 在 mount/unmount 时发 transcript 请求
- 直接消费 `useQuery(fetchTranscript...)`
- 把 transcript 状态并入 HUD / seek bar / surface status

未来即使 row 需要显示 subtitle UI，也应由 page/feature 先准备好 active transcript，再把渲染所需数据往下传。

## 11. 错误与加载状态

当前阶段 transcript 的 loading / error 只停留在数据层。

也就是说：

- active transcript query 失败时
  - hook 暴露 `activeTranscriptError`
  - hook 状态为 `error`
- 邻近预取失败时
  - 只停留在 query cache / hook 内部
  - 不新增 fullscreen 可见错误 UI

当前阶段明确不做：

- fullscreen transcript 错误占位
- transcript loading spinner
- transcript toast
- 全局错误提示

这轮的目标只是把数据流、ownership 和缓存层锁定。

## 12. 与 mock clip 复用的关系

当前 mock 层存在一个特殊点：

- `video-1` 与 `video-9` 可能命中同一个底层 clip transcript URL

但 fullscreen transcript source 当前必须继续以：

- `videoId`

作为公开缓存身份。

不能因为 mock 的底层 `clip 1..8` 复用，就把 query key 改成：

- `transcriptUrl`

原因是：

- `videoId` 是业务主键
- fullscreen active 身份是 `videoId`
- mock 的底层 clip 复用语义不能泄漏到正式缓存键设计

因此当前 query key 规则固定为：

- `['transcript', videoId]`

而不是：

- `['transcript', transcriptUrl]`

## 13. 成功标准

Fullscreen transcript source 只有同时满足以下条件，才算结构正确：

1. transcript 不进入 `video-runtime`
2. transcript 不进入 row 和 pager playback session
3. 当前 active transcript 由 `activeVideoId + query cache` 派生
4. 初次进入 fullscreen 只请求实际进入的视频 transcript
5. active 切换只使用 `onActiveItemChange(itemId, index)`
6. 预取窗口固定为 `active ±1`
7. 缓存仅使用 React Query 内存缓存
8. 新 active key 未命中缓存时，不继续显示上一条 transcript
9. 当前阶段 failure handling 只停留在数据层，不新增可见 UI

## 14. 当前阶段的非目标

本轮明确不做以下事情：

- subtitle UI
- token 可点击
- 句子级定位
- 句子高亮
- 时间驱动的 transcript 当前句子派生
- 本地存储缓存
- transcript 跨页面全局共享 presenter
- transcript 失败可见反馈

一句话收口：

当前阶段只把 fullscreen transcript 的读取 owner、active transcript 派生方式和内存缓存策略定义清楚，不做显示层。
