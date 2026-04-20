# Video 真值与 Runtime 设计规范

## 1. 文档目标

本文档定义当前项目视频数据结构的主设计真值。

这份文档要解决的不是“某个页面现在怎么拿数据”，而是更上层的结构问题：

- `feed entity` 和 `video entity` 的区别是什么
- 为什么 `entities/feed` 不能继续承担前端实时状态
- 为什么 `video-runtime` 应该是 feature/runtime 层，而不是 entity
- 为什么状态层固定采用 **React Query + Zustand**
- `feed-source`、`video-runtime`、`feed entity`、`video entity` 各自的职责和边界是什么
- `feed`、`history`、未来其他视频来源如何复用同一套 video 真值与 runtime 模型

这份文档是**当前主结构**的权威设计，不描述 current-vs-target 对照，也不描述迁移步骤。
当前代码已经按这份设计落下：

- `entities/video` 已正式化
- `features/feed-source` 已输出 canonical `VideoListItem[]`
- `features/video-runtime` 已用 `Zustand` 承担 `videoId` 维度 runtime override
- `FeedPage`、`VideoDetailPage`、`Fullscreen Video` 已改成消费 canonical/effective video 模型

相关文档：

- [Feed API设计](./Feed%20API设计.md)
- [Feed与Fullscreen Video页面设计逻辑](./Feed%E4%B8%8EFullscreen%20Video%E9%A1%B5%E9%9D%A2%E8%AE%BE%E8%AE%A1%E9%80%BB%E8%BE%91.md)
- [Fullscreen Video Overlay架构设计规范](./Fullscreen%20Video%20Overlay%E6%9E%B6%E6%9E%84%E8%AE%BE%E8%AE%A1%E8%A7%84%E8%8C%83.md)
- [项目规范](./项目规范.md)

## 2. 核心结论

这套设计固定锁定以下结论：

1. `feed` 只是一个 **source**，不是 fullscreen 和视频交互的长期真值模型。
2. `entities/feed` 只负责描述“feed 这个来源返回了什么”。
3. `entities/video` 负责描述“一个视频本身是什么”，它是 source-agnostic 的 canonical truth。
4. `features/feed-source` 负责 feed source 的读取、缓存、续接与 source 级编排。
5. `features/video-runtime` 负责 `videoId` 维度的本地 runtime override。
6. UI 直接消费的不是 `FeedItem`，而是：

```ts
effectiveVideoItem = canonicalVideoItem + runtimeOverride
```

7. 当前状态层固定采用：
   - `React Query` 管 source/server state cache
   - `Zustand` 管 client/runtime state store

一句话收口：

当前结构必须从 “`feed` 直接驱动 UI” 收口成 “`source truth -> canonical video truth -> runtime override -> UI`”。

## 3. 概念边界

### 3.1 `Feed truth`

`Feed truth` 指：

- `feed` 这个来源返回了什么
- 它以什么顺序返回
- 它有哪些 source-specific 字段

`Feed truth` 是 source-specific truth，不是全应用的视频总真值。

### 3.2 `Video truth`

`Video truth` 指：

- 一个视频本身的稳定、可复用语义
- 不依赖它是从 `feed`、`history`、还是其他来源进入 UI

它是 source-agnostic canonical truth。

### 3.3 `Source state`

`Source state` 指：

- 某个来源的读取状态
- query key
- refresh / append / merge
- source snapshot 在前端 cache 中的当前值

典型例子：

- `feed-source`
- 未来的 `history-source`

### 3.4 `Runtime state`

`Runtime state` 指：

- 当前前端会话里的本地状态覆盖
- 不依赖某个 source key
- 以 `videoId` 为主键组织

典型例子：

- `isLiked`
- `isFavorited`
- 未来的 `lastWatchPosition`
- 未来的 `isMuted`

### 3.5 `Effective video state`

`Effective video state` 指 UI 真正消费的最终状态：

```ts
effectiveVideoItem = canonicalVideoItem + runtimeOverrideByVideoId[videoId]
```

它既不是原始 source snapshot，也不是单独的 runtime map，而是两者合成后的结果。

## 4. Entity 设计

## 4.1 `entities/feed`

`entities/feed` 的职责固定为：

- feed repository
- feed DTO / domain type
- feed 这个来源返回的原始契约
- feed item 的 source-specific 字段

它回答的问题是：

- `feed` 这个来源这次返回了什么
- 每个 item 在 feed 里长什么样

典型字段：

- `videoId`
- `title`
- `description`
- `videoUrl`
- `coverImageUrl`
- `durationSeconds`
- `viewCount`
- `tags`
- `isLiked`
- `isFavorited`

这里需要特别强调：

- 即使 `FeedItem` 当前已经包含 `isLiked / isFavorited`
- 它也仍然只是 **feed source 在读取时给出的 snapshot**
- 它不等于前端当前会话里的实时用户态

`entities/feed` 不负责：

- fullscreen 运行时状态
- 本地 like/favorite toggle
- optimistic state
- 多 source 聚合
- UI 最终状态合成

一句话：

`entities/feed` 只描述 **feed 这个来源返回了什么**，不描述前端当前应该显示成什么。

## 4.2 `entities/video`

`entities/video` 负责 canonical video truth。

它的职责固定为：

- 定义 source-agnostic 的 `VideoListItem` 或等价 canonical video type
- 提供 source item -> canonical video item 的 mapper
- 承载多个来源都能复用的视频本体字段

它回答的问题是：

- 一个视频本身是什么
- 不管这个视频来自 `feed`、`history` 还是未来其他来源，UI 可以稳定依赖什么字段

典型字段：

```ts
type VideoListItem = {
  videoId: string;
  title: string;
  description: string;
  videoUrl: string;
  coverImageUrl?: string | null;
  durationSeconds: number;
  viewCount: number;
  tags: string[];
  isLiked: boolean;
  isFavorited: boolean;
};
```

这里的重点不是字段名本身，而是它的语义：

- 这是一个 canonical video item
- 不是 `feed item`
- 不是 `history item`

当前 `src/entities/video` 已经正式化为 canonical video entity；mock clip catalog 仍然保留在该 entity 内，作为 feed / transcript mock 的共享资源目录。

## 4.3 `feed entity` 和 `video entity` 的区别

这是这套设计里最重要的边界之一。

`feed entity` 描述的是：

- 这条视频如何出现在 `feed` 里
- `feed` 这个来源返回了什么

`video entity` 描述的是：

- 这个视频本身是什么
- 它在不同来源之间共享的稳定语义是什么

一句话收口：

- `feed entity` 是 **来源语义**
- `video entity` 是 **视频本体语义**

## 5. Feature 设计

## 5.1 `features/feed-source`

`features/feed-source` 负责：

- `feed` 来源的 React Query 入库
- refresh / append / merge
- `id -> index` 等 source 级辅助能力
- 把 `FeedItem[]` 映射成 canonical `VideoListItem[]`

它是 source state 层，不是 runtime state 层。

它回答的问题是：

- `feed` 来源现在在 cache 里是什么状态
- 这个来源的列表怎么续接

它不负责：

- `videoId -> 本地 runtime override`
- like/favorite 的最终前端状态
- fullscreen 直接使用的长期数据模型

## 5.2 `features/video-runtime`

`features/video-runtime` 负责：

- `videoId` 维度的本地 runtime override
- runtime selector
- runtime update action
- source-agnostic 的视频本地状态管理

它典型承载的内容包括：

```ts
type VideoRuntimeOverride = {
  isLiked?: boolean;
  isFavorited?: boolean;
};

type VideoRuntimeState = {
  overridesByVideoId: Record<string, VideoRuntimeOverride>;
};
```

未来如果继续扩展，也应优先放在这里：

- `lastWatchPosition`
- `isMuted`
- `hasPendingAnnotation`

它不负责：

- API 读取
- 分页续接
- source snapshot 入库

## 5.3 为什么 `video-runtime` 不是 entity

`video-runtime` 不应该做成 entity，原因是：

1. 它本质上是前端内存中的运行时覆盖
2. 它会被本地交互持续改写
3. 它不代表某个来源返回的真值
4. 它不等于一个稳定的业务对象

如果把它做成 entity，就会混掉两件事：

- 服务端 source truth
- 前端当前会话里的 runtime override

因此 `video-runtime` 固定属于 feature/runtime 层，而不是 entity。

## 5.4 未来的并行 source

未来如果增加：

- `features/history-source`
- `features/favorites-source`
- `features/search-source`

它们和 `features/feed-source` 的关系应当是并行的。

它们各自负责：

- 读取自己的 source
- 把自己的 source item 映射成 `VideoListItem`

它们不各自维护一套独立 runtime 逻辑，而是复用同一套 `features/video-runtime`。

## 6. 状态库选择与原因

## 6.1 固定方案：React Query + Zustand

当前状态层固定采用：

- `React Query`
- `Zustand`

这是一个**已锁定**的设计结论，不再保留开放式比较。

## 6.2 为什么 `React Query` 负责 source/server state

`React Query` 适合：

- source snapshot cache
- refresh / append / invalidation
- server state 的前端缓存
- source 级加载状态

它不应被描述成“内存数据库”。  
更准确的表述是：

- `React Query = source/server state cache`

在这个项目里，它继续适合：

- `feed-source`
- 未来的 `history-source`

## 6.3 为什么 `Zustand` 负责 runtime state

`Zustand` 适合：

- `videoId -> runtime override` 的 keyed map
- UI 会话内本地覆盖
- 不依赖某个 query key 的 client state

更准确的表述是：

- `Zustand = client/runtime state store`

它特别适合这类状态：

```ts
overridesByVideoId[videoId]
```

## 6.4 为什么不选 “只用 React Query”

不再采用“只用 Query 同时承担 source state 和 runtime state”，原因是：

1. runtime state 会重新耦合到某个 source key
2. `feed` 和 `history` 同一个 `videoId` 的本地状态难统一
3. source truth 和 runtime override 的边界会混掉

## 6.5 为什么不选 Redux / Jotai / MobX / 纯手写 store

### Redux

不选原因：

- 对当前仓库过重
- 当前仓库没有这套组织约定
- 目标问题只是 runtime keyed map，不需要更重的全局事件系统

### Jotai

不选原因：

- 当前问题更像 keyed map，而不是大量原子状态
- `videoId -> override` 用 Zustand 更直接

### MobX

不选原因：

- 会引入另一套响应式模型
- 与当前仓库的 Query + hook 风格不一致

### 纯手写 `useSyncExternalStore`

不选原因：

- 能做，但长期维护成本不如 Zustand
- 更适合 seek bar 这种局部热路径，而不是未来全局视频 runtime 层

## 7. 真值与合成模型

## 7.1 Canonical video item

UI 不再长期依赖 `FeedItem`。  
当前统一依赖 canonical `VideoListItem`：

```ts
type VideoListItem = {
  videoId: string;
  title: string;
  description: string;
  videoUrl: string;
  coverImageUrl?: string | null;
  durationSeconds: number;
  viewCount: number;
  tags: string[];
  isLiked: boolean;
  isFavorited: boolean;
};
```

## 7.2 Runtime override

本地运行时覆盖固定按 `videoId` 组织：

```ts
type VideoRuntimeOverride = {
  isLiked?: boolean;
  isFavorited?: boolean;
};
```

## 7.3 Effective video item

UI 消费的最终模型固定为：

```ts
effectiveVideoItem = {
  ...canonicalVideoItem,
  ...runtimeOverrideByVideoId[videoId],
}
```

这层结果可以叫：

- `effectiveVideoItem`
- `effectiveVideoState`

但含义固定不变：

- 它是 UI 最终真值
- 不是原始 feed item
- 不是单独的 runtime map

## 7.4 聚合发生在哪一层

聚合应当发生在 source feature 输出到页面/selector 的边界，或者发生在专门的 selector 层。

固定原则是：

- `video-runtime` 不直接绑死 `FEED_QUERY_KEY`
- UI 不自己拼装 source + override
- 要有明确的一层负责把 canonical video item 与 runtime override 合成

当前实现已经把这层收口到：

- `features/video-runtime/model/merge-video-runtime-overrides.ts`
- `features/video-runtime/model/use-effective-video-items.ts`

## 8. 多 source 模型

## 8.1 `feed`

`feed` 继续只是 source 之一：

- `FeedItem`
- `feed repository`
- `feed-source`

它的输出会被映射到 canonical `VideoListItem`。

## 8.2 `history`

未来的 `history` 也是 source 之一：

- `HistoryItem`
- `history repository`
- `history-source`

它的输出同样会被映射到 canonical `VideoListItem`。

## 8.3 为什么 runtime override 必须和 source 解耦

如果 runtime override 仍然绑在 `feed` 上，会出现三个问题：

1. fullscreen 只能天然依赖 `feed`
2. `history` 和 `feed` 的同一 `videoId` 无法共享本地状态
3. 一旦 source 增多，runtime 逻辑会在多个 source feature 里重复

因此 runtime override 必须固定按 `videoId` 独立维护，而不是按 `feed item` 或某个 query key 维护。

## 9. 对之前疑惑的明确回答

### 9.1 `entities/feed` 是不是服务器真值

是，但更准确地说：

- 它是 **feed 这个来源的服务器 snapshot truth**
- 它不是前端当前实时状态真值

### 9.2 要不要新的 `video state set`

要，但它不应该叫 entity。  
更准确的目标是：

- 一个 `videoId -> runtime override` 的 runtime store

### 9.3 它该不该叫 entity

不该。

原因是：

- 它是会话态
- 它是本地覆盖
- 它不是稳定的领域真值对象

### 9.4 `feed-source` 和 `video-runtime` 还需不需要

都需要。

- `feed-source` 管 source state
- `video-runtime` 管 runtime state

它们不互相替代。

### 9.5 `feed entity` 和 `video entity` 的区别

- `feed entity` 是来源语义
- `video entity` 是视频本体语义

### 9.6 `React Query` 和 `Zustand` 怎么分工

- `React Query` 管 source/server state cache
- `Zustand` 管 client/runtime state store

### 9.7 fullscreen 以后还该不该依赖 `FeedItem`

不该。

fullscreen 当前和后续都应依赖：

- canonical `VideoListItem`
- `video-runtime` 合成后的 `effectiveVideoItem`

## 10. 成功标准

当前代码结构只有同时满足以下条件，才算真正对齐这套设计：

1. `feed` 只是 source，而不是 fullscreen 的长期真值模型
2. `entities/video` 已经正式化为 canonical video entity
3. `features/feed-source` 只负责 feed source state，不负责 runtime override
4. `features/video-runtime` 已经独立承载 `videoId` 维度的本地 runtime override
5. 状态层固定采用 `React Query + Zustand`
6. UI 统一消费 `effectiveVideoItem`
7. `history`、`feed`、未来其他来源都能映射到同一套 canonical video truth
8. `video-runtime` 不再直接绑定 `FEED_QUERY_KEY` 这类 source-specific key
