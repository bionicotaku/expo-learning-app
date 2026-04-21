# Video Playback Feature

`features/video-playback` 负责 Fullscreen Video 播放会话的纯规则层。

当前职责：

- `model/player-window.ts`
  - 只为当前与前后 2 条挂载 player 的窗口策略
- `model/playback-session.ts`
  - single tap / double tap / long press 的分区规则
  - `basePausedByUser` 的 toggle 规则
  - active row 变化时的 pause / hold reset 规则
  - `activeIndex + basePausedByUser + transientHoldState -> shouldPlay / playbackRate / gestureLock` 的派生规则

边界约束：

- 不直接发起 feed 数据请求
- 不定义页面 overlay 文案
- 不持有 React state
- 不在这里渲染播放器 UI
- 不直接调用 `expo-video` player 的实例方法
