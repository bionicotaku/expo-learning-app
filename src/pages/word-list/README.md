# Word List Page

`pages/word-list` 是 `/word-list` tab 的单词列表页面装配层。

当前职责：

- 渲染硬编码的 `Editorial Paper` Word List UI 原型
- 展示 `Learning shelf`、`单词列表`、三段筛选和三张硬编码单词卡
- 保持 NativeTabs 下的滚动留白、`Editorial Paper` 背景与状态栏风格

边界约束：

- 当前不接真实收藏列表或学习数据源
- 当前不接 `features/video-runtime`
- 当前 `SegmentedFilterBar` 只改变本地选中态，不过滤列表
- 当前星标按钮只保留按压反馈和 accessibility role，不执行持久化写入
- 后续真实内容再在这一层向下接入 feature presenter 或业务数据源
