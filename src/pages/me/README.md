# Me Page

`pages/me` 是 `/me` tab 的 Desk 页面装配层。

当前职责：

- 渲染硬编码的 `Editorial Paper` Desk UI 原型
- 展示 profile summary、学习统计、Week issue 文案卡和两组 action list
- 展示四个 toast 颜色触发按钮，用于验证全局 ToastHost 的 success、error、warning、info 视觉
- 展示 playback settings sheet 测试按钮，用于打开全局播放倍速设置面板
- 展示 word detail dialog 测试按钮，用硬编码 `convinced` payload 打开单词详情弹窗
- 保持 NativeTabs 下的滚动留白、`Editorial Paper` 背景与状态栏风格

边界约束：

- 当前不接真实账户数据，姓名、数值和菜单文案全部硬编码
- 当前不实现 Week issue 小图表，只保留文案型状态卡
- 当前 action list 按钮只保留按压反馈和 accessibility role，不执行导航、退出登录或其它业务动作
- 当前 toast 按钮只触发全局四种颜色示例，不接真实业务状态或持久化写入
- 当前 playback settings 按钮只打开 shared modal sheet 测试面板
- 当前 word detail 按钮只打开 shared modal dialog 测试面板，不接真实单词来源或查询
- 后续真实内容再在这一层向下接入 feature presenter 或业务数据源
