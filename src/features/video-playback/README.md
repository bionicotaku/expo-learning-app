# Video Playback Feature

`features/video-playback` 负责 feed 场景里的播放状态与播放策略。

当前结构：

- `model/feed-playback.ts`
  - 当前激活项
  - 当前激活索引
  - 全局静音状态
- `model/player-window.ts`
  - 只为当前/上一条/下一条挂载 player 的窗口策略

边界约束：

- 不直接发起 feed 数据请求
- 不定义页面 overlay 文案
- 不持有视频列表实体
- 不在这里渲染播放器 UI
