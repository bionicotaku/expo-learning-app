# Favorite Entity

`entities/favorite` 定义收藏领域的最小读写边界。

当前职责：

- `api/favorite-repository.ts`
  - 收藏领域的公开读写入口
- `api/mock-favorite-repository.ts`
  - 当前 MVP 的 mock 数据实现
- `model/types.ts`
  - 收藏写入参数类型

边界约束：

- 这里只描述收藏数据和收藏读写
- 不放 query key
- 不放 optimistic update
- 不放 pending 去重

当前这里仍然是 mock repository，但接口语义已经按真实异步读写实现。
