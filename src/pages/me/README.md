# Me Page

`pages/me` 是 `/me` tab 的 Desk 页面装配层。

当前职责：

- 渲染硬编码的 `Editorial Paper` Desk UI 原型
- 展示 profile summary、学习统计、Week issue 文案卡和两组 action list
- 保持 NativeTabs 下的滚动留白、`Editorial Paper` 背景与状态栏风格

边界约束：

- 当前不接真实账户数据，姓名、数值和菜单文案全部硬编码
- 当前不实现 Week issue 小图表，只保留文案型状态卡
- 当前按钮只保留按压反馈和 accessibility role，不执行导航、退出登录或其它业务动作
- 后续真实内容再在这一层向下接入 feature presenter 或业务数据源
