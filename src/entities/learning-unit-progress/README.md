# Learning Unit Progress Entity

`entities/learning-unit-progress` 定义当前用户学习单元进度列表的 API 层契约。

当前职责：

- `api/unit-progress-repository.ts`
  - `fetchUnlearnedUnitProgressPage(params?)`
  - `fetchLearnedUnitProgressPage(params?)`
- `api/mock-unit-progress-repository.ts`
  - `fetchMockUnlearnedUnitProgressPage(params?)`
  - 生成可无限滚动的未学习分页 mock 数据
- `model/dto.ts`
  - 保持后端 snake_case response shape
- `model/mappers.ts`
  - 把后端 DTO 映射为前端 camelCase domain shape
- `model/types.ts`
  - 对外暴露前端领域类型和分页参数

路径映射：

- `fetchUnlearnedUnitProgressPage` -> `GET /learning/unit-progress/unmastered`
- `fetchLearnedUnitProgressPage` -> `GET /learning/unit-progress/mastered`

边界约束：

- 这里只处理 API 层，不接 `pages/word-list`。
- 当前不提供 React Query hook；后续页面接入时再在 feature/page 层定义 query key 和分页读取。
- 当前 mock repository 只覆盖未学习列表；真实 API repository 已保留 learned / unlearned 两个入口。
- `cursor` 是后端返回的 opaque token，前端只透传，不解析。
- `user_id` 来自认证上下文，API 参数不暴露 `userId`。
- `pos` 只归一为空值，不映射成 `n.` / `v.` / `adj.` / `adv.`。
- 不构造 `display_text`，也不伪造数据库不存在的展示字段。
