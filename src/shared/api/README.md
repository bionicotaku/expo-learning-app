# Shared API

这里放统一的业务 HTTP 基础层。

当前包含：

- `api-error.ts`
  - 项目级 `ApiError`
- `request.ts`
  - `requestJson(...)`
  - `RequestAuthMode`
  - 默认 10s timeout
  - 默认 `Accept: application/json`
  - 业务 API base URL 拼接、token 注入、JSON body encode
- `json-response.ts`
  - 统一 JSON response 解析和 invalid JSON 错误归一化
- `fetch-json-resource.ts`
  - `fetchJsonResource(...)`
  - 用于读取完整 URL 的 JSON asset，不拼接 API base URL，不附带 auth
- `request-abort-controller.ts`
  - 统一管理外部 abort signal、timeout 和 cleanup
- `token-registry.ts`
  - 注册统一 token getter

边界约束：

- 这里只负责通用传输问题
- 不放业务 query key
- 不放 feed / favorite / telemetry 业务语义
- 不直接承载 mock repository
- `requestJson` 面向业务 API endpoint；`fetchJsonResource` 面向 URL-addressed static/CDN JSON resource
- 不在基础层做自动 retry；基础层只标记 `retryable`

为什么这里不直接接 mock repository：

- 当前 MVP 的 mock 数据仍然是业务仓储的一部分
- `shared/api` 代表未来真实业务 API 的通用传输边界
- 页面只消费 repository + query / mutation，不直接知道底层是 mock 还是远程
