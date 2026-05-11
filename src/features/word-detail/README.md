# Word Detail Feature

`features/word-detail` 维护单词详情 dialog 的展示入口和内容 UI。

当前职责：

- 定义 `WordDetailDialogData` 和 `WordDetailDialogSection`
- 暴露 `usePresentWordDetailDialog()`
- 暴露 `createWordDetailDialogDataFromTranscriptToken(...)`
- 使用 shared modal 的 `dialog` presentation 展示单词详情
- 允许非字幕入口直接构造 `WordDetailDialogData` 并调用 `usePresentWordDetailDialog()`
- `usePresentWordDetailDialog` 支持 `onDismissComplete` 回调，供调用方在 dialog 完全消失后释放业务侧临时状态
- `usePresentWordDetailDialog` 返回 `boolean`；shared modal 已有 current modal 时返回 `false`
- 展示调用方传入的 `title`、可选 `subtitle` 和有序 `sections`
- 可通过 `sentenceAudio` 在 `subtitle` 右侧显示一句音频播放按钮；按钮使用调用方传入的 HLS 视频 URL 和句子 `startMs/endMs` 创建临时无头播放器
- 句子音频加载或播放失败时显示全局 `音频加载失败` error toast
- 右上角显示本地收藏按钮；当前只在 dialog 生命周期内切换颜色，不绑定业务动作

## Transcript token 接入

`createWordDetailDialogDataFromTranscriptToken(...)` 是 fullscreen 字幕 token 到 word detail dialog 的唯一映射入口：

- `title` 来自 `TranscriptToken.text`
- `subtitle` 来自 `TranscriptToken.semanticElement.baseForm`
- `sections[0]` 是 `上下文释义`，body 来自 `TranscriptToken.explanation`
- `sections[1]` 是 `字典释义`，body 来自 `TranscriptToken.semanticElement.dictionary`
- `sentenceAudio` 由 fullscreen row 组合层用当前 `VideoListItem.videoUrl` 和当前 `TranscriptSentence.start/end` 注入；只有字幕入口默认提供
- `TranscriptToken.semanticElement.coarseId` 当前不进入展示数据；后续如果业务动作需要 coarse id，应由调用方 action 状态单独持有

非字幕入口如果已经有同形详情字段，可以直接构造 `WordDetailDialogData`。例如 word list page 使用当前列表项里的 `label`、词性简写、`chineseLabel` 和 `chineseDefinition` 组装 title 与 sections；`features/word-detail` 不反向依赖 word-list source。

边界约束：

- 当前不接真实词库、收藏列表或视频 runtime
- 当前不请求 API，不做持久化写入
- 详情内容不接收或展示解释原因字段
- 当前内容区不提供 Close 按钮，关闭依赖 shared modal 的 backdrop / imperative dismiss
- word detail 只控制可选的句子音频临时播放器，不控制 fullscreen 主播放器；fullscreen 字幕入口会在打开 dialog 前申请 playback hold，并通过 `onDismissComplete` 释放
- `sentenceAudio` 是 shared dialog 内容的可选能力；非字幕入口不传时不显示声音按钮、不创建播放器
- 句子音频播放器不渲染 `VideoView`，由 `expo-video` player 自身随组件卸载释放；卸载时不手动调用 native player 方法
- 收藏按钮是纯本地 UI 状态，关闭 dialog 后状态丢弃；当前不接 API、不写入收藏状态、不触发 toast
- 如果 shared modal 拒绝本次展示，fullscreen 字幕入口会立即释放 playback hold
- 上下文释义和字典释义以纯文本区块展示，不使用额外卡片外框
