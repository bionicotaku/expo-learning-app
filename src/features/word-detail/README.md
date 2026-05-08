# Word Detail Feature

`features/word-detail` 维护单词详情 dialog 的展示入口和内容 UI。

当前职责：

- 定义 `WordDetailDialogPayload`
- 暴露 `usePresentWordDetailDialog()`
- 暴露 `createWordDetailDialogPayloadFromTranscriptToken(...)`
- 使用 shared modal 的 `dialog` presentation 展示单词详情
- `usePresentWordDetailDialog` 支持 `onDismissComplete` 回调，供调用方在 dialog 完全消失后释放业务侧临时状态
- `usePresentWordDetailDialog` 返回 `boolean`；shared modal 已有 current modal 时返回 `false`
- 展示 `text`、`semantic_element.base_form`、上下文释义和字典释义

## Transcript token 接入

`createWordDetailDialogPayloadFromTranscriptToken(...)` 是 fullscreen 字幕 token 到 word detail dialog 的唯一映射入口：

- `text` 来自 `TranscriptToken.text`
- `explanation` 来自 `TranscriptToken.explanation`
- `semantic_element.base_form` 来自 `TranscriptToken.semanticElement.baseForm`
- `semantic_element.dictionary` 来自 `TranscriptToken.semanticElement.dictionary`
- `semantic_element.coarse_id` 来自 `TranscriptToken.semanticElement.coarseId`
- `semantic_element.coarse_id` 可以是 `null`；调用方仍然可以打开 dialog

边界约束：

- 当前不接真实词库、收藏列表或视频 runtime
- 当前不请求 API，不做持久化写入
- `semantic_element.coarse_id` 只作为入参保留，不在 UI 中展示
- 详情内容不接收或展示解释原因字段
- 当前内容区不提供 Close 按钮，关闭依赖 shared modal 的 backdrop / imperative dismiss
- word detail 自身不直接控制视频播放；fullscreen 字幕入口会在打开 dialog 前申请 playback hold，并通过 `onDismissComplete` 释放
- 如果 shared modal 拒绝本次展示，fullscreen 字幕入口会立即释放 playback hold
- 上下文释义和字典释义以纯文本区块展示，不使用额外卡片外框
