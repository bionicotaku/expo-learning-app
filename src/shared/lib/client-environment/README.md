# shared/lib/client-environment

`shared/lib/client-environment` 提供当前客户端运行环境的只读 snapshot。

它是通用基础能力，不属于 telemetry，也不绑定任何具体 API。

## 当前能力

- `getClientEnvironment()`
  - 正式读取入口
  - 首次调用时同步采集环境信息
  - 后续调用返回模块级缓存的同一个 frozen snapshot
- `createClientEnvironmentSnapshot()`
  - 直接创建一份新 snapshot
  - 主要用于测试或少数需要绕过缓存的场景
- `toAnalyticsClientContext(...)`
  - 把通用 camelCase snapshot 映射为 analytics API 使用的 snake_case `client_context`

## 数据来源

v1 只使用现有依赖：

- `react-native/Platform`
- `expo-constants`
- `expo-device`

不新增 `expo-application`，因此 v1 不承诺 native build number。

## 边界

这里只放稳定、低频、非业务语义的客户端环境信息，例如 app version、bundle/package id、OS version、device model。

这里不放：

- route / page / surface
- watch session id
- recommendation run id
- auth user id
- locale / timezone
- network / screen / battery 等运行态信息

业务入口和事件上下文应由具体 feature 自己放进 payload。
