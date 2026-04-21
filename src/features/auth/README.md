# Auth Feature

`features/auth` 只承载登录页专属的复合 UI 和最小页面内状态模型。

当前职责：

- 提供 auth 页内部的本地状态切换模型
- 提供登录入口卡、结构化表单卡、tabs、假输入壳、主按钮和第三方登录行
- 只服务 `/auth` 页面，不承担真实登录业务
- 登录入口卡和结构化卡片共用同一套 auth 标题样式；登录标题固定为 `登录`
- `AuthModeTabs` 只保留 auth item 配置；滑块动画、拖动吸附和 tone 渐变都来自 shared `SegmentedFilterBar`

边界约束：

- 不接 API，不做表单校验，不维护真实输入值
- 不把 auth 专属组合沉到 `shared/ui`
- 不负责 Expo Router 路由文件
- `Fraunces` 不承担中文；结构化卡片标题遇到 CJK 时显式使用 `TW-Kai-98_1`
