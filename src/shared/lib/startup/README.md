# shared/lib/startup

这里放应用启动阶段的非视觉基础逻辑。

当前包含：

- `launch-bootstrap.ts`
  - root 启动阶段的最小状态机
  - 约束 `native splash -> js launch screen -> app shell` 的切换时序
  - 稳定暴露最小可验证常量：
    - `LAUNCH_SCREEN_MINIMUM_VISIBLE_MS`
    - `LAUNCH_SCREEN_FADE_DURATION_MS`

边界约束：

- 这里只放启动阶段的状态与时序，不放 React 视图
- 不放主题 token，不放原生资产路径，不放业务页面逻辑
- 不处理 feed / auth / favorite 等业务状态

维护约束：

- 新的启动阶段需求优先在这里扩展状态机，再由 `app/_layout.tsx` 消费
- 不把 splash/launch 的可视化实现塞回 `shared/lib`
