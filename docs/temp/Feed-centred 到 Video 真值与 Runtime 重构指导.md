# Feed-centred 到 Video 真值与 Runtime 重构指导

## 当前执行状态

- Phase 0：已完成
- Phase 1：已完成
- Phase 2：已完成
- Phase 3：已完成
- Phase 4：已完成
- Phase 5：已完成
- Phase 6：已完成

## 当前结果总览

这份 runbook 对应的重构已经执行完成。当前真实代码已经落到：

- `entities/feed`
  - 只保留 source-specific truth
- `entities/video`
  - 已正式化为 canonical video entity
- `features/feed-source`
  - 继续负责 React Query 的 feed source cache / refresh / append / merge
  - 但输出已经是 canonical `VideoListItem[]`
- `features/video-runtime`
  - 已使用 `Zustand` 维护 `videoId -> runtime override`
- `FeedPage`、`VideoDetailPage`、`Fullscreen Video`
  - 已改成统一消费 `effectiveVideoItem`
- `features/favorite` / `entities/favorite`
  - 已删除，不再是现行结构的一部分

因此，下文第 2 章及各阶段中的“当前基线”描述应视为**重构起点的历史记录**，不是现在的代码现状。

## 1. 文档目标

本文档是一份**阶段化重构 runbook**，用于指导当前仓库从现有的 `feed-centred` 读链，迁移到 [Video 真值与 Runtime 设计规范](../Video%20真值与%20Runtime%20设计规范.md) 已经锁定的目标结构。

这份文档的定位必须明确：

- 它是**执行指导文档**
- 它不是新的主设计真值
- 它不负责重写其他主设计文档
- 它不描述 current-vs-target 的抽象比较，而是描述**从当前真实代码出发，如何分阶段完成迁移**

本轮目标只做一件事：

- 把当前“`FeedItem` 直接作为 UI 长期模型”的结构拆开

最终依赖方向必须变成：

```text
feed/history/... -> canonical video -> runtime override -> UI
```

相关真值文档：

- [Video 真值与 Runtime 设计规范](../Video%20真值与%20Runtime%20设计规范.md)
- [项目规范](../项目规范.md)
- [Feed API设计](../Feed%20API设计.md)

本文档明确不做的事：

- 不改其他主设计文档
- 不重写 `src/**/README.md`
- 不把“先补一点本地 feed 状态”当成最终方案

## 2. 重构起点基线（历史）

当前仓库的读链是典型的 `feed-centred` 结构，中心问题不是 API 形式，而是 **`FeedItem` 直接穿透到了 UI 长期消费层**。

### 2.1 重构起点入口

当前真实代码链如下：

```text
entities/feed
  -> features/feed-source
     -> pages/feed
     -> pages/video-detail
        -> widgets/fullscreen-video-pager
```

对应当前真实实现：

- `src/entities/feed`
  - `FeedItem`
  - `FeedResponse`
  - `fetchFeed()`
- `src/features/feed-source/model/feed-source.ts`
  - `FEED_QUERY_KEY = ['feed', 'main']`
  - `FeedSourceSnapshot = { items: FeedItem[]; isRefreshing; isExtending }`
  - `requestMore() / refresh() / merge / dedupe`
- `src/features/feed-source/model/use-feed-source.ts`
  - 当前直接输出 `items: FeedItem[]`
- `src/pages/feed/ui/feed-page.tsx`
  - 当前直接消费 `FeedItem[]`
- `src/pages/video-detail/ui/video-detail-page.tsx`
  - 当前直接消费 `FeedItem[]`
- `src/widgets/fullscreen-video-pager/ui/fullscreen-video-pager.tsx`
  - 当前 props 仍然是 `items: FeedItem[]`
- `src/widgets/fullscreen-video-pager/ui/fullscreen-video-row.tsx`
  - 当前 `video: FeedItem`
- `src/widgets/fullscreen-video-pager/ui/playable-video-surface.tsx`
  - 当前 `video: FeedItem`

### 2.2 当前中心耦合点

当前结构的核心问题不在于“feed-source 代码写得是否够干净”，而在于职责边界：

1. `entities/feed` 当前既代表 source truth，又被 UI 当成长期消费模型。
2. `features/feed-source` 当前既负责 source cache/orchestration，又隐含承担了“最终视频列表真值出口”的角色。
3. `FeedItem` 当前直接穿透到：
   - `FeedPage`
   - `VideoDetailPage`
   - `FullscreenVideoPager`
   - `FullscreenVideoRow`
   - `PlayableVideoSurface`
4. fullscreen 这条链因此被 source-specific 模型绑死，未来无法自然复用 `history` 或其他视频来源。

### 2.3 当前 `entities/video` 的真实状态

当前 `src/entities/video` 还不是正式 entity。它目前只是一个过渡辅助目录，主要承载 mock clip catalog 相关内容，不具备：

- canonical video type
- source -> video mapper
- 正式的 entity 边界

这意味着：

- 当前仓库还没有正式的 source-agnostic video truth
- 这正是本次重构必须建立的第一层结构

## 3. 目标结构

本次迁移的目标结构不在本文重新定义，统一以 [Video 真值与 Runtime 设计规范](../Video%20真值与%20Runtime%20设计规范.md) 为准。

本文只锁定最终要落到的执行形态：

```text
entities/feed            // source-specific truth
entities/video           // canonical video truth
features/feed-source     // feed source cache / refresh / append / merge / mapping
features/video-runtime   // videoId keyed runtime override
UI                       // consume effectiveVideoItem
```

最终 UI 消费模型固定为：

```ts
effectiveVideoItem = canonicalVideoItem + runtimeOverride
```

这意味着：

- `FeedItem` 只允许停留在 source 层
- fullscreen 和 feed page 的长期模型不再是 `FeedItem`
- `video-runtime` 必须独立于 `feed-source`

## 4. 迁移不变量

整个重构过程必须始终遵守以下不变量；违反其中任意一条，都不算对齐目标结构。

1. `entities/feed` 仍然只表示 **source-specific truth**
2. `video-runtime` 不读 `FEED_QUERY_KEY` 这类 source-specific query key
3. runtime override 必须按 `videoId` 存，不复制整份列表
4. `effectiveVideoItem` 必须是统一聚合出口，不能让 fullscreen 或单个 widget 自己局部 merge
5. `FeedItem` 只能停留在 source 层，不能继续穿透到最终 UI 长期消费层
6. 不保留兼容壳，不长期双轨
7. 不把 `video state set` 建成 entity
8. 不把 source-agnostic runtime state 继续塞进 `feed-source`

## 5. 阶段化重构计划

## 阶段 0：基线冻结与命名统一

### 目标

冻结当前真实结构，统一迁移用词，避免后续一边重构一边改变概念。

### 具体改动面

- 确认 `entities/feed` 仍然是 source truth
- 确认 `features/feed-source` 仍然是当前 feed cache/source orchestration
- 确认 fullscreen 和 feed page 当前仍直接消费 `FeedItem`
- 在代码和文档层统一后续术语：
  - `Canonical video item`
  - `Runtime override`
  - `Effective video item`

### 决策说明

这一阶段不改行为，只建立词汇表和判断标准。  
后续任何实现如果仍然把 `FeedItem` 直接叫“video model”，都视为边界未收紧。

### 完成标志

- 团队对“source truth / video truth / runtime override / effective video item”四组词不再混用
- 后续实现文档和代码注释开始按这套命名收口

### 禁止事项

- 不引入新状态库
- 不写 mapper
- 不修改页面消费模型

### 验收方式

- 代码层无需改动
- 从本阶段开始，后续每一阶段都要在本 runbook 中更新状态和结论

## 阶段 1：正式建立 `entities/video`

### 目标

把未来 `entities/video` 正式化为 canonical video truth 所在地。

### 具体改动面

- 在 `src/entities/video` 建立正式 entity 结构
- 明确引入 canonical `VideoListItem` 或等价模型
- 建立至少一条 source mapper：
  - `FeedItem -> VideoListItem`

### 决策说明

这一步的目标不是“先做个别名 type”，而是把 source truth 和 video truth 的边界真正拆开。

必须明确：

- `FeedItem` 是 feed source item
- `VideoListItem` 是 source-agnostic canonical video item

如果后续 fullscreen 仍然直接依赖 `FeedItem`，则这一阶段没有真正完成。

### 完成标志

- `entities/video` 成为正式 entity，而不是 mock 辅助目录
- 存在可复用的 canonical video type
- 存在 `feed -> video` mapper

### 禁止事项

- 不在这一阶段引入 runtime state
- 不让 `entities/video` 直接依赖 React Query 或页面上下文

### 验收方式

- 类型测试 / mapper 测试
- `entities/video` 目录级 README 更新为当前实现真值

## 阶段 2：把 `features/feed-source` 收口成 source 编排层

### 目标

让 `feed-source` 继续只负责 feed source 的读取、缓存、refresh、append、merge 和 source 级编排，但开始输出 canonical video item，而不是继续直接输出 UI 长期依赖的 `FeedItem[]`。

### 具体改动面

- 保留 `React Query` 作为 feed source/server state cache
- 保留 `requestMore() / refresh() / merge / dedupe`
- 把 `feed-source` 的输出模型从 `FeedItem[]` 转向 canonical video item
- 清理 feed-source 中不该继续承担的长期 UI 语义

### 决策说明

`feed-source` 可以继续依赖：

- `FEED_QUERY_KEY`
- feed source snapshot
- feed append / refresh 语义

但它不该继续承担：

- source-agnostic runtime state
- 最终 UI 有效状态聚合
- fullscreen 的长期数据模型

为什么不直接把 runtime state 继续塞进 Query cache：

- 一旦未来存在 `history-source`、`favorites-source` 等多个来源，runtime state 就不能再绑在单个 source key 上
- `videoId` 维度的本地 override 必须与 source 解耦

### 完成标志

- `feed-source` 成为明确的 source 编排层
- `FeedItem` 不再是 UI 长期依赖出口
- `feed-source` 的公共输出已经朝 canonical video item 收口

### 禁止事项

- 不在 `feed-source` 内部维护 source-agnostic runtime override
- 不把 `effectiveVideoItem` 聚合逻辑塞回 `feed-source`

### 验收方式

- `feed-source` controller / hook 测试
- 验证 `feed-source` 输出不再直接绑定 `FeedItem` 作为最终 UI 模型

## 阶段 3：引入 `features/video-runtime`

### 目标

建立独立的 `videoId` 维度 runtime override 层。

### 具体改动面

- 引入 `Zustand`
- 建立 `features/video-runtime`
- store 只维护 `videoId -> runtime override`

目标 state shape 至少包含：

```ts
type VideoRuntimeOverride = {
  isLiked?: boolean;
  isFavorited?: boolean;
};

type VideoRuntimeState = {
  overridesByVideoId: Record<string, VideoRuntimeOverride>;
  toggleLiked(videoId: string): void;
  toggleFavorited(videoId: string): void;
};
```

### 决策说明

为什么这层是 feature/runtime，而不是 entity：

- 它是前端会话态
- 它会被本地交互持续改写
- 它不代表服务端原始真值
- 它以 `videoId` 为键聚合多来源共享的本地状态

为什么固定采用 `Zustand`：

- 目标状态是 `videoId -> runtime override` map
- 它不应依赖单个 source query key
- 它比继续硬塞进 React Query 更适合 source-agnostic local runtime state

为什么不把 `video state set` 做成 entity：

- entity 负责领域真值与稳定契约
- runtime override 是前端本地会话态
- 它的自然落点是 feature/runtime，而不是 entity

### 完成标志

- 存在独立的 `features/video-runtime`
- 可以按 `videoId` 进行 `like/favorite` 本地 toggle
- 不依赖真实写 API

### 禁止事项

- 不接真实 mutation API
- 不让 `video-runtime` 直接绑定 `FEED_QUERY_KEY`

### 验收方式

- store / selector 测试
- 本地 toggle 行为测试

## 阶段 4：建立 `effectiveVideoItem` 聚合出口

### 目标

把“canonical video truth + runtime override”收成统一聚合出口，不允许页面或 widget 自己局部 merge。

### 具体改动面

- 在 `video-runtime` 的 selector / hook 层建立聚合入口
- 输入：
  - canonical video item 列表
  - runtime override map
- 输出：
  - `effectiveVideoItem[]`

### 决策说明

这一步是整个重构的中心收口点。

必须固定两条规则：

1. 聚合逻辑必须是统一出口，不能每个页面自己拼
2. fullscreen 不能再直接读 `FeedItem` 做局部判断

推荐放置位置：

- `features/video-runtime` 的 selector / hook 层

不推荐：

- 放在单个页面里
- 放在 fullscreen widget 里
- 放在 `feed-source` 里与 source cache 混在一起

### 完成标志

- 存在唯一的 `effectiveVideoItem` 聚合出口
- 页面和 widget 已经有能力消费统一聚合结果

### 禁止事项

- 不让 fullscreen / feed page 自己 merge runtime override
- 不复制整份实时列表作为新的唯一真值

### 验收方式

- `effectiveVideoItem` 合成逻辑测试
- `like/favorite` 本地 toggle 不依赖真实 API 的结构验证

## 阶段 5：页面与 widget 消费迁移

### 目标

按真实调用链把 UI 消费方从 `FeedItem` 迁到 canonical/effective 模型。

### 具体改动面

迁移顺序固定为：

1. feed card props 映射
2. video detail 入口定位逻辑
3. fullscreen pager / row / surface 读链

当前真实迁移重点：

- `src/pages/feed/ui/media-feature-card-props.ts`
- `src/pages/feed/ui/feed-page.tsx`
- `src/pages/video-detail/ui/video-detail-page.tsx`
- `src/widgets/fullscreen-video-pager/ui/fullscreen-video-pager.tsx`
- `src/widgets/fullscreen-video-pager/ui/fullscreen-video-row.tsx`
- `src/widgets/fullscreen-video-pager/ui/playable-video-surface.tsx`

### 决策说明

需要重点观察两个边界：

1. `findFeedItemIndex` 这类 feed-specific helper 是否仍然必须停留在 source 层
2. fullscreen 是否还残留 `FeedItem` 类型穿透

阶段目标不是“只让按钮能变色”，而是让 fullscreen 最终消费 `effectiveVideoItem[]`。

### 完成标志

- feed page 不再把 `FeedItem` 当成长期 UI 目标模型
- video detail 不再以 `FeedItem[]` 作为长期 fullscreen 数据输入
- fullscreen pager / row / surface 不再直接依赖 `FeedItem`

### 禁止事项

- 不留临时 adapter 长期并存
- 不让 feed page 和 fullscreen 各自消费不同的最终视频模型

### 验收方式

- feed page / video detail / fullscreen 相关 source tests 或 integration 范围
- fullscreen 的 like/favorite 按钮状态正确消费 runtime override

## 阶段 6：删旧结构与文档收尾

### 目标

删除过渡结构，完成文档与知识图收尾。

### 具体改动面

- 删除 feed-centred 的 UI 长期依赖
- 删除仅因过渡保留的 mapper / adapter / 旧 helper
- 统一更新：
  - 主设计文档
  - 目录级 README
  - graphify

### 决策说明

本仓库不保留兼容壳。  
因此一旦 canonical video + runtime 模型成为主路径，就必须清掉仍然以 `FeedItem` 为长期 UI 模型的旧接口和旧调用链。

### 完成标志

- `FeedItem` 只停留在 source 层
- fullscreen / feed page 都消费 `effectiveVideoItem`
- 其他设计文档与 README 完成统一收口

### 禁止事项

- 不保留“以后再删”的旧 UI 长期依赖
- 不保留 source-agnostic runtime state 在 feed-source 内的残留

### 验收方式

- 文档同步完成
- `graphify update .` 已执行

## 6. 测试与验收矩阵

本节定义阶段化实施时的默认验收标准。当前这轮只是写 runbook，不提前执行这些命令。

### 阶段 1-2

需要覆盖：

- canonical type / mapper 测试
- `feed-source` controller / hook 测试
- `feed-source` 输出不再直接绑定 UI 长期模型的结构验证

### 阶段 3-4

需要覆盖：

- `video-runtime` store / selector 测试
- `effectiveVideoItem` 合成逻辑测试
- `like/favorite` 本地 toggle 不依赖真实 API

### 阶段 5

需要覆盖：

- feed page 相关 source tests
- video detail 相关 source tests
- fullscreen pager / row / surface 范围测试
- fullscreen 的按钮状态正确消费 runtime override

### 最终统一验收

重构代码全部完成后，统一执行：

```bash
npx vitest run src/features/feed-source src/features/video-runtime src/pages/feed src/pages/video-detail src/widgets/fullscreen-video-pager
npm run quick-check
npm run check
npx expo prebuild -p ios
graphify update .
```

说明：

- 日常快速回归默认先跑 `npm run quick-check`
- 模块级改动补对应测试
- 标准最终验收跑 `npm run check`
- 如果改动影响 fullscreen / Expo 页面 / 原生播放，补 `npx expo prebuild -p ios`
- 如果改动了代码文件，最后跑 `graphify update .`

## 7. 收尾与文档同步

当前 runbook 只负责指导重构，不联动修改主设计文档。  
真正的文档统一收口放在阶段 6 之后执行。

重构完成后，需要统一更新：

- `docs/` 下已经存在的主设计文档
- 相关目录级 `README.md`
- graphify 输出

本轮明确不做：

- 提前重写其他主设计文档
- 在 runbook 未落地前让主设计文档进入“半迁移状态”

## 8. 执行规则

重构落地时，执行顺序和验收必须遵守以下规则：

1. 每完成一个阶段，先更新这份 runbook 的阶段状态或阶段结论，再进入下一阶段
2. 默认先做模块边界收口，再做页面消费迁移
3. 任何阶段都不允许把 source-agnostic runtime state 重新塞回 `feed-source`
4. 任何阶段都不允许让 fullscreen 长期继续依赖 `FeedItem`
5. 最终统一收尾前，不改其他主设计文档

## 9. 成功标准

只有同时满足以下条件，这次重构才算真正完成：

1. `entities/feed` 只表示 source truth
2. `entities/video` 成为正式 canonical video entity
3. `features/feed-source` 只负责 feed source cache / refresh / append / merge / mapping
4. `features/video-runtime` 独立维护 `videoId -> runtime override`
5. UI 消费的统一模型是 `effectiveVideoItem`
6. fullscreen 不再长期依赖 `FeedItem`
7. `video-runtime` 不依赖 `FEED_QUERY_KEY`
8. 旧的 feed-centred UI 长期依赖全部清理完成
9. 主设计文档、README 和 graphify 在收尾阶段统一更新完成

一句话收口：

这次重构的最终目标不是“让 feed 再多带一点状态”，而是**让 feed 退回 source truth，让 video 成为本体真值，让 runtime 成为会话状态，让 UI 只消费有效聚合结果**。
