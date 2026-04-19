# Video Playback Feature

`features/video-playback` 当前只保留视频窗口策略。

当前职责：

- `model/player-window.ts`
  - 只为当前/上一条/下一条挂载 player 的窗口策略

边界约束：

- 不直接发起 feed 数据请求
- 不定义页面 overlay 文案
- 不持有跨页面播放状态
- 不在这里渲染播放器 UI
