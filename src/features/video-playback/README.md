# Video Playback Feature

`features/video-playback` 负责 Fullscreen Video 播放会话的纯规则层。

当前职责：

- `model/player-window.ts`
  - 只为当前与前后 2 条挂载 player 的窗口策略
- `model/playback-session.ts`
  - single tap / double tap / long press 的分区规则
  - `basePausedByUser` 的 toggle 规则
  - active row 变化时的 pause / hold reset 规则
  - `activeIndex + basePausedByUser + transientHoldState + defaultPlaybackRate -> shouldPlay / playbackRate / gestureLock` 的派生规则
  - 上层 fullscreen session 可把 screen unfocused 映射为 `isPlaybackHeld=true`，从而暂停 active row 但不修改 `basePausedByUser`

边界约束：

- 不直接发起 feed 数据请求
- 不定义页面 overlay 文案
- 不持有 React state
- 不在这里渲染播放器 UI
- 不直接调用 `expo-video` player 的实例方法
- 不持有全局播放偏好；默认倍速由 `features/playback-settings` 注入
