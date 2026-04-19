# Favorite Feature

`features/favorite` 是收藏交互的最小写入样板。

当前职责：

- `model/favorite-query.ts`
  - 收藏列表 query key
  - `useFavoriteIdsQuery()`
- `model/set-favorite-mutation.ts`
  - 收藏写入 mutation
  - 同资源同动作的 pending 去重
  - optimistic update 与失败回滚

边界约束：

- 这里只负责收藏动作和收藏 query 接入
- 不在这里定义收藏领域数据结构
- 不放 UI 组件

为什么这个切片作为 write 样板：

- 它能验证 `interactive-write` 的标准路径
- 它不需要先改页面就能把 mutation 边界跑通
- 它和 feed 一起，足够覆盖 read / write 两类网络消费方式
