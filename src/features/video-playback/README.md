# Video Playback Feature

`features/video-playback` 负责 Fullscreen Video 播放会话的纯规则层。

当前职责：

- `model/player-window.ts`
  - 只为当前/上一条/下一条挂载 player 的窗口策略
- `model/playback-session.ts`
  - 背景点按时的播/停切换规则
  - active row 变化时的手动暂停重置规则
  - `activeIndex + pausedByUser -> shouldPlay` 的派生规则

边界约束：

- 不直接发起 feed 数据请求
- 不定义页面 overlay 文案
- 不持有 React state
- 不在这里渲染播放器 UI
