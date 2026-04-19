# shared/ui/startup

这里放应用级启动视觉表面。

当前包含：

- `launch-screen.tsx`
  - JS 启动后的正式过渡屏
  - 负责 `Editorial Paper` 风格的抽象符号、`learnability` 字标和轻动效
- `launch-screen-design.ts`
  - 启动屏的稳定视觉参数
  - 供测试和视图共同消费

边界约束：

- 这里只负责启动期视觉，不放业务页面模板
- 不放 native splash 资产生成逻辑
- 不处理路由决策、字体加载副作用或原生 splash API 调用

维护约束：

- native splash 与 JS launch screen 必须共享同一视觉语言
- 如需调整品牌启动画面，优先同步更新 `launch-screen.tsx`、`launch-screen-design.ts` 与对应 native splash 资产
