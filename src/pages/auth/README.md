# Auth Page

`pages/auth` 是 `/auth` 路由的页面装配层。

当前职责：

- 只实现登录页的视觉和页面内导航
- 使用固定页壳，不做整页滚动；通过紧凑 spacing 保证 footer 留在屏幕内
- 在单一路由里切换 4 个 UI 状态：
  - `login + password`
  - `login + code`
  - `forgotPassword`
  - `register`
- 登录主按钮通过 `router.replace('/feed')` 进入 NativeTabs 里的主页 tab
- `/ -> /(tabs)` 的根栈转场显式使用 `fade`，避免 mock 登录进入主页时出现 stack 滑入感
- 复用 `Editorial Paper` 主题和 auth feature 组件组合页面

边界约束：

- 不接真实登录、注册、找回密码业务
- 不维护真实表单值
- 不把 auth 状态扩散到全局
- 不把 auth 变体拆成多个 route
