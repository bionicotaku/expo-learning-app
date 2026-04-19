# React Query Client

这里放应用级 React Query 基础设施。

当前只包含：

- `query-client.ts`
  - 创建应用级 `QueryClient`
  - 定义全局 query / mutation 默认行为

边界约束：

- 这里只放通用客户端配置
- 不放具体业务 query key
- 不放 feed、auth 等具体模块的请求逻辑
