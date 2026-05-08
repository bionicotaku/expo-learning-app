# Word Detail Feature

`features/word-detail` 维护单词详情 dialog 的展示入口和内容 UI。

当前职责：

- 定义 `WordDetailDialogPayload`
- 暴露 `usePresentWordDetailDialog()`
- 暴露 `createWordDetailDialogPayloadFromTranscriptToken(...)`
- 使用 shared modal 的 `dialog` presentation 展示单词详情
- 展示 `text`、`semantic_element.base_form`、上下文释义和字典释义

## Transcript token 接入

`createWordDetailDialogPayloadFromTranscriptToken(...)` 是 fullscreen 字幕 token 到 word detail dialog 的唯一映射入口：

- `text` 来自 `TranscriptToken.text`
- `explanation` 来自 `TranscriptToken.explanation`
- `semantic_element.base_form` 来自 `TranscriptToken.semanticElement.baseForm`
- `semantic_element.dictionary` 来自 `TranscriptToken.semanticElement.dictionary`
- `semantic_element.coarse_id` 来自 `TranscriptToken.semanticElement.coarseId`
- `coarseId === null` 时返回 `null`，调用方不得打开 dialog

边界约束：

- 当前不接真实词库、收藏列表或视频 runtime
- 当前不请求 API，不做持久化写入
- `semantic_element.coarse_id` 只作为入参保留，不在 UI 中展示
- 详情内容不接收或展示解释原因字段
- 当前内容区不提供 Close 按钮，关闭依赖 shared modal 的 backdrop / imperative dismiss
- 上下文释义和字典释义以纯文本区块展示，不使用额外卡片外框
