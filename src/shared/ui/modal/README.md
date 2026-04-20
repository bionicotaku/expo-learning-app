# shared/ui/modal

`shared/ui/modal` 是全局 modal 基座的视图层。

它只负责：

- 在根布局前景渲染 modal stack
- 渲染共享 backdrop
- 渲染 `dialog` / `sheet` 两种 frame
- 执行 enter / exit 动画
- 执行 V1 的 sheet 下滑关闭

它不负责：

- 暴露业务层 imperative API
- 持有模块级 stack 状态
- 注册任何业务 modal
- 处理页面业务副作用

目录说明：

- `ModalHost.tsx`
  - 根部唯一宿主
  - 订阅 `shared/lib/modal/store`
- `ModalBackdrop.tsx`
  - 单一共享 backdrop
- `ModalFrame.tsx`
  - `dialog` / `sheet` 视觉壳
- `ModalItem.tsx`
  - 单条 modal 的动画和手势封装
- `modal-design.ts`
  - overlay 专属视觉与动效常量
- `modal-gesture.ts`
  - sheet 关闭阈值判定
- `modal-layout.ts`
  - dialog / sheet 布局和 topmost 派生逻辑
- `index.ts`
  - 仅导出 `ModalHost`

边界约束：

- `ModalHost` 只挂在 `src/app/_layout.tsx`
- 业务层不要直接 import `ModalFrame` 或 `ModalItem`
- web 当前不挂载 `ModalHost`
