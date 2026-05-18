# Choice Question Feature

`features/choice-question` 维护选择题题组 dialog 的展示入口和内容 UI。单题也是题组的一种调用形式：传入只包含一个题目的 `questions` 数组。

当前职责：

- 定义 `ChoiceQuestionKind`、`ChoiceQuestionOption`、`ChoiceQuestionData` 和 `ChoiceQuestionSetDialogData`
- 暴露 `usePresentChoiceQuestionSetDialog()`
- 使用 shared modal 的 `dialog` presentation 展示选择题
- 支持四种 MVP 题型：语境释义选择题、通用释义选择题、语境填空选择题、反向识别题
- `title` 是可选大标题；语境释义选择题和通用释义选择题用单词作大标题，语境填空选择题和反向识别题默认不传大标题
- 在题组 dialog 内维护当前题进度和本地单选状态：错选只标红错项并允许继续选择，选对后锁定所有选项
- 首次直接选对时，正确项变绿并锁定，1 秒后自动进入下一题；如果当前是最后一题，则 1 秒后关闭 modal
- 如果用户先错选再选对，底部显示 `answerDetail`：词的 label、pos、chineseLabel，以及正确选项解释
- 题目切换时，稳定 chrome 不参与切换动画；题组父组件先保存 outgoing 题目快照，再让 `QuestionContentTransition` 同帧渲染旧题和新题做 crossfade，避免 effect 后补 previous content 造成刷新感
- `answerDetail` 出现时由 `AnimatedQuestionViewport` 统一测量题目内容高度并伸缩 modal；解析面板本身只负责内容淡入，不再嵌套第二层 height 动画
- `answerDetail` 底部显示手动推进按钮：当前为最后一题时显示“完成”，否则显示“下一个”
- `showProgress` 可选；为 `true` 时右上角显示由题组 index 派生的 `x/n`
- 右上角固定显示圆形 `×` 按钮，点击后通过 shared modal dismiss 关闭弹窗；当前选择题弹窗禁用 backdrop 点击关闭
- 每个选项显示从 1 开始的数字序号
- 题目切换和答案解析都通过 `AnimatedQuestionViewport` 作为唯一高度动画 owner；题目切换使用较慢的 `questionSwitch` profile，答案解析使用较快的 `answerReveal` profile

边界约束：

- 当前不请求 API，不接题库，不做持久化写入
- 当前不记录答题结果，不触发 toast，不执行正确或错误回调
- 当前不实现分数、提交按钮或远程下一题加载
- 错选后不直接显示正确答案；只有用户选中正确项后，正确项才变为正确状态
- 首次直接选对不显示额外解析，避免把每道题都变成自动讲解卡
- 选项正确性由调用方通过 `isCorrect` 传入；后续接真实题库时再替换数据来源
- 内容区只提供右上角 `×` 作为显式关闭入口；不接保存、提交或放弃确认逻辑
- 内容区不使用 `ScrollView`；选择题 dialog 依赖 modal 自身随内容延长，不在题目内部放滚动盒
