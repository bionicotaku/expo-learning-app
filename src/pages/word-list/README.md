# Word List Page

`pages/word-list` 是 `/word-list` tab 的单词列表页面装配层。

当前职责：

- 渲染 `Editorial Paper` Word List UI
- 通过 `features/word-list-source` 读取未学习单词 source，并使用 `FlatList` 展示 `Learning shelf`、`单词列表`、三段筛选和单词行
- 单词行采用信息密集型列表结构，展示单词、浅色简写词性、单行省略解释、按进度连续渐变的进度条和固定粉色收藏入口，两个单词之间只用虚线分隔线区分
- 页面组件通过 `showFavoriteAction` 和 `showProgress` 参数控制收藏入口和进度条是否显示
- 支持初次页内 loading、下拉刷新、触底加载更多和底部 loading
- 保持 NativeTabs 下的滚动留白、`Editorial Paper` 背景与状态栏风格

边界约束：

- 当前不接真实收藏列表或学习数据源
- 当前不接 `features/video-runtime`
- 当前 `SegmentedFilterBar` 只改变本地选中态；只有 `unlearned` source 已接入，`learned` / `favorites` 暂不切换数据源
- 当前星标按钮只保留按压反馈和 accessibility role，不执行持久化写入
- 当前词性字段允许为空字符串；为空时解释行不渲染词性前缀
- 当前列表已经使用 `FlatList` 的虚拟窗口参数，后续真实数据接入时优先复用当前行渲染和分隔结构
- 页面不直接访问 mock repository 或真实 API；数据读取边界在 `features/word-list-source`
