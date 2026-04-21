# Fullscreen Transcript Source 设计规范

## 1. 文档目标

本文档定义 fullscreen 场景下 transcript 的 source/read/cache 结构。

这份文档重点回答：

- transcript 应该由哪一层发起读取
- 为什么 transcript 不能进入 `video-runtime`
- 为什么 transcript 不能进入 row / pager playback session
- 当前 active transcript 应该如何定义与暴露
- transcript 缓存当前为什么只做 React Query 内存缓存

这份文档当前只覆盖：

- transcript source ownership
- transcript query key 与缓存策略
- active transcript 的派生规则
- transcript feature 的最小接口

这份文档当前 **不覆盖**：

- fullscreen page / session 结构
- route reuse 下的 page-lifetime / session-lifetime 拆分
- subtitle / transcript UI
- token 点击
- 句子高亮
- seek-to-sentence
- transcript 与播放器时间同步的高频派生
- 本地持久化缓存

相关文档：

- transcript API 契约见 [Transcript API设计](./Transcript%20API设计.md)
- fullscreen page / session 结构见 [Feed与Fullscreen Video页面设计逻辑](./Feed%E4%B8%8EFullscreen%20Video%E9%A1%B5%E9%9D%A2%E8%AE%BE%E8%AE%A1%E9%80%BB%E8%BE%91.md)
- 视频真值与 runtime 分层见 [Video 真值与 Runtime 设计规范](./Video%20真值与%20Runtime%20设计规范.md)

## 2. 核心结论

fullscreen transcript source 固定锁定以下结论：

1. transcript 是按 `videoId` 键控的 interactive-read 子资源。
2. transcript 不属于 `video-runtime`，因为它不是 local runtime override。
3. transcript 不属于 fullscreen row，也不属于 `useFullscreenPlaybackSession`。
4. transcript 当前只允许使用 React Query 内存缓存。
5. transcript 的 query key 固定为：

```ts
['transcript', videoId]
```

6. 当前 active transcript 不是独立长期 store，而是由 fullscreen session 提供的 active target 与 query cache 派生得到。
7. 当前阶段只做 `active ±1` transcript 预取。
8. 当前阶段不做本地持久化缓存，不定义 L2 cache 协议。

一句话收口：

- transcript 属于 `videoId` 维度的 source/server state
- 它应由 page/session 层消费 `features/transcript-source`
- 不进入 row、不进入 pager session、不进入 runtime store

## 3. 为什么 transcript 不属于 `video-runtime`

当前项目已经由 [Video 真值与 Runtime 设计规范](./Video%20真值与%20Runtime%20设计规范.md) 固定为：

- canonical/source truth -> `React Query`
- runtime override -> `Zustand`

`features/video-runtime` 当前只负责：

- `videoId` 维度的本地 override
- source membership registry

典型 runtime 字段是：

- `isLiked`
- `isFavorited`
- 未来的 `isMuted`
- 未来的 `lastWatchPosition`

transcript 不满足 runtime override 语义，因为它：

- 不是本地临时覆盖值
- 不是用户即时写入状态
- 不是 UI-only ephemeral state
- 是可复用、可缓存、可失效的远程读资源

因此 transcript 当前明确 **不能**：

- 进入 `overridesByVideoId`
- 进入 `sourceVideoIds`
- 进入 `useVideoRuntimeStore()`
- 被建模为 `effectiveVideoItem` 的 runtime patch

如果把 transcript 放进 runtime store，本质上是在 Zustand 里重造 query cache、in-flight 去重、错误状态与失效策略。

## 4. 为什么 transcript 不属于 row / pager session

### 4.1 row 不是 transcript 的读取 owner

`FullscreenVideoRow` 当前是 row-local media / interaction / overlay 的 owner。

它不是业务读取 owner。

如果把 transcript 放到 row，会立刻带来三个问题：

1. transcript 生命周期与 virtualization 绑定
2. 周边 row 可能因为 player 挂载窗口而误发请求
3. row 卸载会误导实现去清理 transcript 数据，而 transcript cache 本不该跟 row 生命周期绑定

### 4.2 `useFullscreenPlaybackSession` 不是 transcript 的读取 owner

`useFullscreenPlaybackSession` 当前只负责：

- active row
- pause / hold / seek / HUD
- active player controller

它是播放交互会话，不是 transcript source owner。

一旦 transcript 读取进入这层：

- widget 会同时持有交互会话和 interactive-read
- playback session 的边界会和 query cache 混在一起
- row HUD state 与 transcript 状态会共享同一个高频 hook

这是当前结构明确要避免的。

## 5. 正式归属模型

fullscreen transcript 的正式归属固定为：

1. `entities/transcript`
2. `features/transcript-source`
3. fullscreen page/session 层

其中：

- `entities/transcript`
  - 只负责 `fetchTranscript(videoId)`
  - 只负责 DTO -> domain 边界
- `features/transcript-source`
  - 负责 query key
  - 负责 active transcript query
  - 负责邻近预取
  - 负责 `activeTranscript / status / error` 派生暴露
- fullscreen page/session 层
  - 当前由 `FullscreenVideoSession` 负责把 fullscreen active target 喂给 transcript source
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
  - 保持当前 query client 默认，不为 transcript 单独打开自动重试

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

这超出了当前阶段“准备 fullscreen transcript source”的范围。

因此当前结构明确为：

- L1 memory cache only
- no L2 storage cache

## 7. Active transcript 的正式定义

当前 active transcript 不是另一份长期 store，而是由 fullscreen session 当前提供的 active target 派生得到。

推荐的派生结果固定为：

```ts
activeTranscript: Transcript | null
activeTranscriptStatus: 'idle' | 'loading' | 'success' | 'error'
activeTranscriptError: Error | null
```

语义固定为：

- active target 不存在：
  - `activeTranscript = null`
  - `status = 'idle'`
- active key 命中缓存：
  - 直接返回缓存
  - `status = 'success'`
- active key 未命中缓存：
  - `activeTranscript = null`
  - `status = 'loading'`
- active query 失败：
  - `activeTranscript = null`
  - `status = 'error'`
  - `activeTranscriptError = query.error`

这里必须明确一条硬规则：

- 不能继续暴露上一条视频的 transcript
- 不使用 `placeholderData`
- 不使用 `keepPreviousData`

## 8. Feature 接口

`features/transcript-source` 的最小公开接口固定为：

```ts
getTranscriptQueryKey(videoId: string): readonly ['transcript', string]

useFullscreenTranscriptSource(args: {
  activeVideoId: string | null;
  activeIndex: number | null;
  items: VideoListItem[];
}): {
  activeTranscript: Transcript | null;
  activeTranscriptStatus: 'idle' | 'loading' | 'success' | 'error';
  activeTranscriptError: Error | null;
}
```

hook 内部职责固定为：

- 对 active `videoId` 执行 `useQuery`
- 命中缓存则直接返回缓存
- 对 `activeIndex - 1` 和 `activeIndex + 1` 执行 `prefetchQuery`
- 只做 `±1` 预取，不扩成 `±2`

明确不做：

- route param 解析
- page/session key 管理
- subtitle UI
- 本地持久化缓存

## 9. Mock 与缓存身份

当前 mock transcript 底层仍存在 `clip1..8` 复用：

- `video-1`
- `video-9`

可能命中同一个 transcript URL。

但这不改变 fullscreen transcript cache 的公开身份。

当前必须继续以：

```ts
['transcript', videoId]
```

作为唯一缓存 key。

不能改成：

- `transcriptUrl`
- `clipNumber`

否则会把 mock 资源组织方式泄漏进正式结构。

## 10. 成功标准

fullscreen transcript source 只有同时满足以下条件，才算结构正确：

1. transcript 不进入 `video-runtime`
2. transcript 不进入 row / pager playback session
3. transcript 缓存按 `videoId` 键控
4. active transcript 由 active target + query cache 派生，而不是独立长期 store
5. 不继续暴露上一条视频 transcript
6. 预取窗口固定为 `active ±1`
7. 当前只使用 React Query 内存缓存
