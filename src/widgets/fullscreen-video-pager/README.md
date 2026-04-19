# Fullscreen Video Pager Widget

`widgets/fullscreen-video-pager` 负责沉浸式纵向视频页的复合视图。

当前职责：

- 纵向分页滚动
- 初次进入和翻页都只显示底部小 loading 动画，不渲染整页 loading 项
- 只为当前/前后 1 个视频挂载 player
- 左上角 debug overlay
- 底部标题与描述 overlay
- 点击任意位置切换静音

边界约束：

- widget 不直接请求 feed 数据
- widget 不直接决定何时分页
- widget 不持有跨页面恢复定位状态
- widget 不使用自动 safe-area content inset；否则会破坏 `initialScrollIndex` 的首屏整页吸附
