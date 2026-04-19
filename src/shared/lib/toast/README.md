# shared/lib/toast

`shared/lib/toast` 是全局 `Top Toast` 的命令层和状态层。

它只负责：

- 暴露 `toast.show / dismiss / clear`
- 维护模块级 toast store
- 定义 toast 的内部类型和生命周期状态

它不负责：

- React 渲染
- 动画
- 手势
- safe area
- blur 视觉实现

目录说明：

- `types.ts`
  - `ToastKind`、`ToastId`、`ToastPhase`、`ToastConfig`、`ToastRecord`
- `constants.ts`
  - 默认时长和容量上限
- `store.ts`
  - 模块级单例 store
  - 维护 `items`
  - 提供 `enqueue / markVisible / markExiting / remove / clearAll`
- `service.ts`
  - 面向业务层的最小 imperative API
- `index.ts`
  - 正式入口，只导出 `toast`

边界约束：

- 业务代码只从 `@/shared/lib/toast` 读取 `toast`
- `ToastHost` 和 `ToastCard` 属于 `shared/ui/toast`
- Fullscreen Video 的局部 HUD 不进入这里
