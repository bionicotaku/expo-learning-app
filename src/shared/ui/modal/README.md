# shared/ui/modal

`shared/ui/modal` 是全局 modal 基座的视图层。

它只负责：

- 在根布局前景渲染当前 singleton modal
- 渲染共享 backdrop
- 渲染 `dialog` / `sheet` 两种 frame
- 执行 enter / exit 动画
- 执行 V1 的 sheet 下滑关闭
- 向内容层提供当前 frame 内部可用高度预算

它不负责：

- 暴露业务层 imperative API
- 持有模块级 modal 状态
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
- `modal-content-layout.tsx`
  - 向 modal 内容提供 `contentMaxHeight`，供业务内容决定自身滚动边界
- `ModalItem.tsx`
  - 单条 modal 的动画和手势封装
- `modal-design.ts`
  - overlay 专属视觉与动效常量
- `modal-gesture.ts`
  - sheet 关闭阈值判定
- `modal-layout.ts`
  - dialog / sheet 布局逻辑
- `index.ts`
  - 导出 `ModalHost` 和内容高度预算 hook

边界约束：

- `ModalHost` 只挂在 `src/app/_layout.tsx`
- 业务层不要直接 import `ModalFrame` 或 `ModalItem`
- 业务层可以读取 `useModalContentLayout()` 提供的高度预算，但滚动策略仍由业务内容自行决定
- web 当前不挂载 `ModalHost`
