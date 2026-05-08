# Playback Settings Feature

`features/playback-settings` 维护当前 app session 内的全局播放偏好。

当前职责：

- 保存全局默认 `playbackRate`
- 暴露 `usePlaybackRate()` 和 `useSetPlaybackRate()`
- 通过 shared modal sheet 展示播放设置面板
- 暴露 `usePresentPlaybackSettingsSheet()`，供 Me 页测试入口和 fullscreen center 长按入口复用

边界约束：

- 当前不做持久化，app 重启后恢复 `1.0x`
- 当前不调用后端 API
- 当前不直接操作 `expo-video` player
- `分享 / 测试题 / 反馈` 是 sheet 内的纯 UI 占位按钮，不执行业务动作
