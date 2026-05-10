# Choice Question Feature

`features/choice-question` 维护选择题 dialog 的展示入口和内容 UI。

当前职责：

- 定义 `ChoiceQuestionKind`、`ChoiceQuestionOption` 和 `ChoiceQuestionDialogData`
- 暴露 `usePresentChoiceQuestionDialog()`
- 使用 shared modal 的 `dialog` presentation 展示选择题
- 支持四种 MVP 题型：语境释义选择题、通用释义选择题、语境填空选择题、反向识别题
- `title` 是可选大标题；语境释义选择题和通用释义选择题用单词作大标题，语境填空选择题和反向识别题默认不传大标题
- 在 dialog 内维护本地单选状态：错选只标红当前错项并允许继续选择，选对后锁定所有选项
- 每个选项显示从 1 开始的数字序号

边界约束：

- 当前不请求 API，不接题库，不做持久化写入
- 当前不记录答题结果，不触发 toast，不执行正确或错误回调
- 当前不实现下一题、分数、解释或提交按钮
- 错选后不直接显示正确答案；只有用户选中正确项后，正确项才变为正确状态
- 选项正确性由调用方通过 `isCorrect` 传入；后续接真实题库时再替换数据来源
- 内容区不提供 Close 按钮，关闭依赖 shared modal 的 backdrop / imperative dismiss
