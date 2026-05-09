# Word List Page

`pages/word-list` 是 `/word-list` tab 的单词列表页面装配层。

当前职责：

- 渲染 `Editorial Paper` Word List UI
- 通过 `features/word-list-source` 读取未学习、已学习和收藏夹三种 mode source，并使用 `FlatList` 展示 `Learning shelf`、`单词列表`、三段筛选和单词行
- 单词行采用信息密集型列表结构，展示单词、浅色简写词性、单行省略解释、按进度连续渐变的进度条和固定粉色收藏入口，两个单词之间只用虚线分隔线区分
- 已学习列表不展示进度条；未学习列表仍受页面 `showProgress` 参数控制
- 单词行整体可点击，点击后通过 `features/word-detail` 的 shared dialog modal 展示单词详情；列表入口隐藏 base form，`label` 作为标题，`词性简写 + chineseLabel` 作为 `简要翻译`，`chineseDefinition` 作为字典释义
- 页面组件通过 `showFavoriteAction` 和 `showProgress` 参数控制收藏入口和进度条是否显示
- 支持初次页内 loading、下拉刷新、触底加载更多和底部 loading；当前显示哪个 mode，就调用哪个 mode 的 refresh / requestMore
- 首屏读取失败时保留页面结构，列表空态显示 `加载失败`，并对 active mode 弹一次 `加载失败` toast；错误空态不提供 retry 按钮，只能下拉刷新
- 下拉刷新失败时保留旧列表或当前失败空态，并弹 `刷新失败` toast
- 触底加载更多失败时保留旧列表，结束底部 loading，并弹 `加载更多单词失败` toast；失败后可以再次触发加载更多
- Header 与三段筛选固定在列表内容区上方，未学习、已学习、收藏夹列表 pane 使用 fade 切换
- 保持 NativeTabs 下的滚动留白、`Editorial Paper` 背景与状态栏风格

边界约束：

- 未学习列表当前继续使用 mock infinite source
- 已学习列表当前继续使用 mock infinite source；真实 Learning Unit Progress API 已保留在 entity 层，后续可切回
- 收藏夹列表当前为空 source，不接 API、不 mock 无限滚动
- 当前不接 `features/video-runtime`
- 当前 `SegmentedFilterBar` 只控制本页 mode；第一次切到已学习时启用已学习 source，之后保留缓存和滚动状态
- 当前星标按钮只保留按压反馈和 accessibility role，不执行持久化写入
- 当前点击单词行只打开本地已加载数据对应的详情 dialog，不额外请求详情 API
- 当前词性字段允许为空字符串；为空时解释行不渲染词性前缀
- 当前列表已经使用 `FlatList` 的虚拟窗口参数，后续真实数据接入时优先复用当前行渲染和分隔结构
- 页面不直接访问 mock repository 或真实 API；数据读取边界在 `features/word-list-source`
