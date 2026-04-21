# Feed-centred 到 Video Runtime Membership 难点处理复盘

## 1. 文档目标

本文档不是主设计真值，也不是执行 runbook。  
它是一份**难点处理复盘文档**，用于回答这类面试问题：

- 你在这个项目里遇到过什么真正难的架构问题？
- 为什么原来的设计不够好？
- 你是怎么一步一步分析出问题根因的？
- 最后为什么会落到现在这版结构？

这份文档关注的不是“做了哪些文件改动”，而是：

- 问题是什么
- 当时为什么难
- 你排除了哪些看起来简单但实际上不对的方案
- 最后为什么当前解法是更优结构

相关真值文档：

- [Video 真值与 Runtime 设计规范](../Video%20真值与%20Runtime%20设计规范.md)
- [Feed-centred 到 Video 真值与 Runtime 重构指导](./Feed-centred%20到%20Video%20真值与%20Runtime%20重构指导.md)
- [Feed API设计](../Feed%20API设计.md)

## 2. 一句话总结整个难点

这次重构真正难的地方，不是“怎么切换一个按钮颜色”，而是要把视频系统里的三种东西彻底拆开：

1. **source truth**
   - `feed` / `history` 这些来源返回了什么
2. **video truth**
   - 一个视频本身的 canonical 语义是什么
3. **runtime state**
   - 当前前端会话里，本地交互临时把它改成了什么

如果这三层没拆开，系统会持续出现三类问题：

- UI 长期绑在某个来源上
- 本地状态和服务端 snapshot 打架
- 多 source 时无法定义谁才是当前最新真值

所以这套演进的核心，不是“把状态放进 Zustand”这么简单，而是把：

```text
feed-centred UI
-> canonical video + runtime override
-> source membership + source authority
```

这一整条边界彻底收正。

## 3. 第一阶段难点：为什么 `feed-centred` 结构本身就是问题

### 3.1 原始结构

一开始系统是典型的 `feed-centred` 读链：

```text
entities/feed
  -> features/feed-source
     -> FeedPage
     -> VideoDetailPage
        -> FullscreenVideoPager
```

问题在于：

- `FeedItem` 不只是 source item
- 它直接穿透成了 UI 的长期模型

这意味着：

- feed page 直接吃 `FeedItem`
- fullscreen 直接吃 `FeedItem`
- 以后如果有 `history`、`favorites`、`search`
- fullscreen 仍然会被迫依赖 `feed` 语义

### 3.2 这个问题为什么难

这不是一个“字段重命名”问题，而是一个**owner 错位**问题。

原结构里这几层被混在一起了：

- `feed` 这个来源返回了什么
- 一个视频本身是什么
- 当前 UI 应该呈现什么状态

短期内它看起来能跑，因为：

- 只有一个 source
- `FeedItem` 字段又刚好够 UI 用

但只要引入：

- fullscreen 里的本地 like/favorite
- 未来的 `history-source`

问题就立刻暴露：

- 本地状态没地方放
- UI 又不能一直绑死 feed
- 同一个 `videoId` 在不同 source 里也没法共用状态

### 3.3 第一轮解决思路

第一轮真正要解决的，不是加状态库，而是先把模型拆开：

- `entities/feed`
  - 只保留 source-specific truth
- `entities/video`
  - 提供 canonical `VideoListItem`
- `features/feed-source`
  - 继续负责 React Query cache / refresh / append / merge
  - 但输出 canonical `VideoListItem[]`
- `features/video-runtime`
  - 独立负责 `videoId -> runtime override`

### 3.4 这一轮的核心收益

做到这里之后，系统第一次具备了正确的依赖方向：

```text
source truth -> canonical video truth -> runtime override -> UI
```

这一步的关键价值不是“更优雅”，而是：

- fullscreen 不再依赖 `FeedItem`
- runtime state 不再绑在 `feed-source`
- `history-source` 以后终于有了可以复用的结构入口

## 4. 第二阶段难点：为什么 runtime 不能只做“整表 effective merge”

### 4.1 最开始的直觉方案

在 canonical video + runtime override 分层之后，一个很自然的第一版实现是：

- source 输出 canonical `items`
- runtime 提供 `useEffectiveVideoItems()`
- 页面把整表 merge 后再喂给 fullscreen

这个方案一开始看起来很合理，因为概念上确实成立：

```ts
effectiveVideoItem = canonicalVideoItem + runtimeOverride
```

### 4.2 实际暴露的问题

到了 fullscreen 这种高交互场景，这条链就暴露了一个很隐蔽的问题：

- 点了 heart/star 后
- store 里的状态其实已经变了
- 但颜色不一定立刻更新
- 有时还要点一下 pause、seek 或 HUD 变化后才会追上

### 4.3 根因分析

根因不是“toggle 没执行”，而是：

- runtime 改动先触发整表 merge
- 再通过 pager `items`
- 再经过 `FlatList`
- 再喂回当前 row

于是一个本来只该影响当前 `videoId` 的局部状态，错误地走上了整表 data 链。

这条链中间有很多地方会吞更新或延后更新：

- list virtualization
- row memo compare
- 外层 props 扩散

### 4.4 真正正确的修法

不是继续修 `FlatList.extraData`，而是把 runtime 读链下沉到 row：

- page / pager 继续只吃 canonical `items`
- `FullscreenVideoRow` 按 `videoId` 直接订阅 runtime
- overlay 只拿当前 row 的有效 flags

也就是：

```text
canonical list for paging
+ per-row runtime subscription for action state
```

### 4.5 这一轮的核心收益

这一步解决的是**状态更新粒度**问题。

从此之后：

- paging / playback 继续由 canonical list 驱动
- like/favorite 的显示由 per-row runtime 驱动

这让 fullscreen 的读链第一次真正对齐了变化粒度。

## 5. 第三阶段难点：为什么“toggle 能切，但第一次有时不生效”

### 5.1 表面现象

后面又出现了另一个更像业务 bug 的问题：

- 某些视频按钮本来就是亮的
- 第一次点击却完全没变化

看起来像“点击失效”，但实际上不是渲染问题。

### 5.2 真正根因

当时 runtime 的读写模型是不对称的：

- 读路径是：
  - `override ?? base`
- 写路径却是：
  - `!(override ?? false)`

这会导致一个关键错误：

- 如果 canonical/base 本来就是 `true`
- 且当前没有 override
- 第一次 toggle 时，系统错误地把“当前值”当成了 `false`
- 然后又写回 `true`

结果就是：

- 用户点了
- runtime 也写了
- 但写进去的是和当前显示完全一样的值
- 所以颜色不会变

### 5.3 为什么这个问题容易被误判

因为从 UI 看，它和“没重渲染”非常像。

但这次其实是另一类问题：

- 不是 render path bug
- 而是 write semantics bug

### 5.4 最终修法

把 runtime 写接口统一改成基于**当前有效值**：

```ts
effective = override ?? base
next = !effective
```

并且把“值回到 base 时删掉 override”的稀疏语义一并锁住。

### 5.5 这一轮的核心收益

这一轮的关键，不是多写几个测试，而是把 runtime 的读写模型彻底对称了：

- 读：`override ?? base`
- 写：基于 `override ?? base` 推导 next

这一步之后，本地 toggle 才真正具备了可靠的语义闭环。

## 6. 第四阶段难点：为什么“source fetch 永远最新”没有想象中那么简单

### 6.1 新问题是什么

当本地 toggle 正常、fullscreen 也能立即刷新之后，出现了一个更高层的问题：

- 本地点亮了 like/favorite
- 下一次 feed fetch 回来
- 到底谁才是最新真值？

用户这里明确给出了产品规则：

- **新的 fetch 永远比本地 runtime 更新鲜**

也就是：

- 本地改了，只在下一次 fetch 之前有效
- 只要 source fetch 成功回来了，同一视频必须重新以 source truth 为准

### 6.2 第一版修法为什么还不够

第一版很自然会想到：

- 对本次 fetch 返回的 ids，直接删掉 runtime override

这就是早期的 `acceptSourceTruth(videoIds)` 思路。

它解决了最直接的问题：

- fetch 到的 id 会重新以 source truth 为准

但它还不够，因为它没有回答：

- 如果以后还有 `history-source`
- 同一个 `videoId` 同时存在于 `feed` 和 `history`
- 某个 source refresh 后把这个视频删掉了
- runtime 到底该不该清？

### 6.3 难点真正升级到了哪里

难点从“覆盖哪些 ids”升级成了：

- **一个 `videoId` 当前属于哪些 source 的最新 snapshot**

也就是说，系统需要回答的不再只是：

- 这个视频有没有 override

而是：

- 这个视频当前还在不在 `feed`
- 还在不在 `history`
- 如果它从 `feed` 消失了，但还在 `history`
- 那它是不是 orphan？

这时仅靠 `overridesByVideoId` 已经不够了。

## 7. 第五阶段难点：为什么最终会落到 membership 设计

### 7.1 被讨论过但最终放弃的方案

#### 方案 A：只有 `feed refresh` 可以全局清 runtime

这个方案实现最简单，但问题很大：

- 它把 authority 绑在页面层级上
- `feed` 会变成全局特权 source
- `history` 只是借用 runtime，没有对等 authority

这和多 source 的长期结构是冲突的。

#### 方案 B：谁 fetch 到了，就只清谁返回的 ids

这个方案比 A 干净很多，也确实是中间过渡态。

但它还回答不了：

- 如果一个 id 已经不在某个 source 当前 snapshot 里了
- runtime 是否已经变成 orphan garbage

它能解决 handoff，但不能解决 lifecycle。

#### 方案 C（最终方向）：source membership + source-scoped cleanup

最终确定的结构是：

- runtime override 仍然只记录值
- 另外维护一层独立的 source membership registry

不是：

```ts
override.tags = ['feed', 'history']
```

而是：

```ts
sourceVideoIds = {
  feed: Record<videoId, true>,
  history: Record<videoId, true>,
}
```

### 7.2 为什么不能把 tag 塞进每个 runtime item

因为那会把两层职责混掉：

- override 本该只记录“值”
- membership 本该只记录“这个 id 当前属于哪些 source”

如果把它们塞进同一个对象里，`video-runtime` 就会从：

- source-agnostic runtime store

退化成：

- source-aware value + cleanup 混合体

后续 source 一多，复杂度会越来越重。

### 7.3 membership 设计真正解决了什么

它解决的是两类问题：

1. **authority handoff**
   - 谁刚成功 fetch 到某个 `videoId`
   - 谁就能让这个 id 重新以 source truth 为准

2. **orphan cleanup**
   - 某个 id 从一个 source 消失后
   - 如果它还在别的 source 里，就不能删
   - 只有完全脱离所有 source 时，才是 orphan garbage

### 7.4 最终的 source 规则

#### full refresh / full snapshot replacement

- 读取旧 `sourceVideoIds[source]`
- 对旧集合做 scoped cleanup
- 清空并替换该 source 的 membership
- 对新返回 ids 执行 source-truth acceptance

#### append / requestMore

- 只把返回 ids union 进该 source 的 membership
- 对这些 ids 执行 source-truth acceptance
- 不做 prune

### 7.5 为什么这个结构是长期最优

因为它终于把 authority 规则建立在：

- **哪个 source 刚成功 fetch 到了哪些 `videoId`**

而不是建立在：

- 哪个页面在导航栈下层
- 哪个页面“看起来更主”
- 只有 feed 特判才算最新

这一步把系统从“页面驱动真值”真正推进到了“source 驱动真值”。

## 8. 这整套难点里最重要的分析方法

如果面试官问“你是怎么分析出来的”，最值得讲的不是某个 API 名，而是这套方法：

### 8.1 不先修现象，先判定是哪一层 owner 错了

每次遇到 bug，我先区分它属于哪一层：

- source truth 错了
- canonical model 错了
- runtime semantics 错了
- UI subscription 粒度错了

这一步很关键，因为：

- “点了没变色”
- 可能是没重渲染
- 也可能是写路径语义错了

如果一上来只补 UI，很容易越修越乱。

### 8.2 优先找“不对称”

这次几个关键问题，本质上都是“不对称”：

- 读路径和写路径不对称
- source 和 runtime 权限边界不对称
- `feed` 和未来 `history` 的 authority 不对称

一旦看到系统出现“有时候可以、有时候不行”这类问题，我会优先排查：

- 同一个概念是不是在不同路径上用了两套语义

### 8.3 先定义 owner，再决定技术方案

这次不是先说“用 React Query 还是 Zustand”，而是先定义：

- source 归谁管
- runtime 归谁管
- UI 到底应该读谁

只有 owner 定清楚以后，技术方案才自然成立。

## 9. 面试时可以怎么讲

如果要压缩成 1 到 2 分钟，我会这样讲：

### 9.1 简版答案

> 我遇到的一个比较难的问题，是把一个最初完全 `feed-centred` 的视频系统，重构成支持多 source 的 canonical video + runtime 架构。  
> 最初 `FeedItem` 直接穿透到 feed page 和 fullscreen，导致本地 like/favorite 状态没有合适 owner，后续也无法自然接 `history-source`。  
> 我先把 source truth、video truth、runtime state 三层拆开；接着发现 fullscreen 的 runtime 状态不能走整表 merge，而要按 `videoId` 下沉到 row 级订阅。  
> 再往后又遇到 source fetch 和本地 runtime 冲突的问题，最后引入了独立的 source membership registry，让 authority handoff 和 orphan cleanup 都基于 source snapshot，而不是基于页面层级。  
> 这个难点本质上不是某个按钮逻辑，而是多层真值边界和 owner 的重新划分。

### 9.2 更强调分析过程的答案

> 这个问题最难的地方，是表面现象都很像 UI bug，比如按钮有时不变色、刷新后状态不一致，但真正根因分别在不同层：有的是 subscription 粒度错了，有的是 runtime 读写语义不对称，有的是 source authority 定义不清。  
> 我的处理方法是每次先判断 owner 错在哪一层，再决定修 source、修 runtime、还是修 UI。最后系统才收敛到 `source truth -> canonical video truth -> runtime override -> UI`，并进一步加上 source membership 解决多 source cleanup 问题。

## 10. 最终收获

这次重构最后留下来的，不只是一个“能工作的实现”，而是一套可以复用到其它产品的思考方式：

1. 当系统开始出现多个来源时，UI 不能继续长期依赖某个 source item。
2. runtime state 一旦要跨页面、跨 source 复用，就必须从 source cache 里独立出来。
3. 本地状态与服务端 snapshot 的冲突，最终一定会演变成 authority 问题，而不是单纯的状态库问题。
4. 一旦进入多 source 场景，必须显式回答 membership 与 cleanup，不能只回答“怎么覆盖新值”。

一句话收口：

这次真正解决的，不是 “feed page 和 fullscreen 怎么共享数据”，而是 **在多 source 视频系统里，谁拥有真值、谁拥有本地状态，以及谁有权在什么时候接管它**。
