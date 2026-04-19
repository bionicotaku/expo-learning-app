# Shared API

这里放统一的业务 HTTP 基础层。

当前包含：

- `api-error.ts`
  - 项目级 `ApiError`
- `request.ts`
  - `requestJson(...)`
  - `RequestAuthMode`
- `token-registry.ts`
  - 注册统一 token getter

边界约束：

- 这里只负责通用传输问题
- 不放业务 query key
- 不放 feed / favorite / telemetry 业务语义
- 不直接承载 mock repository

为什么这里不直接接 mock repository：

- 当前 MVP 的 mock 数据仍然是业务仓储的一部分
- `shared/api` 代表未来真实业务 API 的通用传输边界
- 页面只消费 repository + query / mutation，不直接知道底层是 mock 还是远程
