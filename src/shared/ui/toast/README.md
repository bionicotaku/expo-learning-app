# shared/ui/toast

`shared/ui/toast` 是全局 `Top Toast` 的视图层。

它只负责：

- 在根布局前景渲染 toast stack
- 呈现单条 toast 的固定视觉
- 执行 enter / exit 动画
- 执行 auto-dismiss 定时器和向上滑 dismiss

它不负责：

- 对业务暴露 imperative API
- 持有模块级状态
- 处理页面业务逻辑
- 替代 Fullscreen Video 的局部 HUD

目录说明：

- `ToastHost.tsx`
  - 根部唯一宿主
  - 订阅 `shared/lib/toast/store`
  - 读取 safe area
  - 渲染顶部 stack
- `ToastCard.tsx`
  - 单条 toast 视图
  - 负责动画、定时器、手势和退出后删除回调
- `toast-design.ts`
  - 固定视觉常量
  - 功能色、图标名、交互阈值
- `index.ts`
  - 仅导出 `ToastHost`

边界约束：

- `ToastHost` 只挂在 `src/app/_layout.tsx`
- `toast/` 独立于 `editorial-paper/`
- 业务层不要直接 import `ToastCard`
