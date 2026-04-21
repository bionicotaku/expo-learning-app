# shared/lib/modal

`shared/lib/modal` 是全局 modal 基座的命令层和状态层。

它只负责：

- 维护模块级 modal stack
- 暴露 `present / dismiss / dismissTop / clear`
- 定义 modal 的内部类型、phase 和 dismiss reason

它不负责：

- React 渲染
- backdrop / glass 视觉
- 动画和手势
- safe area 与布局
- 任何业务 modal 的注册或参数协议

目录说明：

- `types.ts`
  - `ModalDescriptor`、`ModalRecord`、`ModalController` 等运行时类型
- `store.ts`
  - 模块级单例 store
  - 维护 stack item 与 phase 变化
- `service.ts`
  - 供 hook 和 UI 层复用的内部 imperative API
- `use-modal-controller.ts`
  - 面向业务层的正式入口
- `index.ts`
  - 仅导出 `useModalController`

边界约束：

- 业务层只从 `@/shared/lib/modal` 读取 `useModalController`
- `ModalHost` 与具体视觉壳属于 `shared/ui/modal`
- `shared/lib/modal` 不做业务 modal name registry
