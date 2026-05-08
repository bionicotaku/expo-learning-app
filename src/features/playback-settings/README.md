# Playback Settings Feature

`features/playback-settings` 维护当前 app session 内的全局播放偏好。

当前职责：

- 保存全局默认 `playbackRate`
- 保存全局字幕显示模式 `subtitleDisplayMode`
- 暴露 `usePlaybackRate()`、`useSetPlaybackRate()`、`useSubtitleDisplayMode()`、`useCycleSubtitleDisplayMode()` 和 `useSetSubtitleDisplayMode()`
- 通过 shared modal sheet 展示播放设置面板
- 暴露 `usePresentPlaybackSettingsSheet()`，供 Me 页测试入口和 fullscreen center 长按入口复用

边界约束：

- 当前不做持久化，app 重启后恢复 `1.0x` 和 `subtitleDisplayMode='english'`
- 当前不调用后端 API
- 当前不直接操作 `expo-video` player
- 字幕显示模式只控制 fullscreen subtitle UI 显示为 `off / english / bilingual`，不控制 transcript source 读取或缓存
- `分享 / 测试题 / 反馈` 是 sheet 内的纯 UI 占位按钮，不执行业务动作
