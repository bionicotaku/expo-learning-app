# Fullscreen Video Pager Widget

`widgets/fullscreen-video-pager` 负责沉浸式纵向视频页的 widget 壳层、播放会话和 row 装配。

当前输入模型已经对齐为：

- canonical `VideoListItem`
- 再叠加 `video-runtime` 后的 `effective` item

## 当前结构

当前 fullscreen 不再采用“pager 顶层统一 HUD”的旧结构，而是固定分成三类附着域：

- `page-attached overlays`
  - `TopChromeOverlay`
  - `PagerShellLoadingPill`
- `row-attached overlays`
  - `RowOwnedVideoOverlay`
  - `RowPlaybackHudOverlay`
  - `RowSurfaceStatusOverlay`
- `row-local interaction layer`
  - `RowPlaybackInteractionLayer`
    - `BackgroundGestureRegion`
    - `RowPlaybackSeekBarOverlay`

对应的组件树是：

```text
FullscreenVideoPager
├── FlatList
│   └── FullscreenVideoRow
│       ├── RowPlaybackMediaLayer
│       │   └── PlayableVideoSurface
│       ├── RowPlaybackInteractionLayer
│       │   └── RowPlaybackSeekBarOverlay
│       ├── RowOwnedVideoOverlay
│       ├── RowPlaybackHudOverlay
│       └── RowSurfaceStatusOverlay
├── TopChromeOverlay
└── PagerShellLoadingPill
```

## 目录职责

- `model/use-fullscreen-playback-session.ts`
  - fullscreen 播放会话入口
  - 持有 `activeIndex`、`activeItemId`、`basePausedByUser`、`transientHoldState`
  - 持有 session-scoped playback hold；业务 modal 可临时遮罩 active row 的 `shouldPlay`
  - 持有当前 active row 的 `activePlayerControllerRef`
  - 持有 `videoId -> rowPlaybackHudState` 的稀疏 HUD store
  - 持有 `FlatList` viewability 的稳定 handler；active 判定读取 session refs，不让 `FlatList` 注册入口跟随 active state 换引用
  - 管理 pause / seek / rate 的生命周期与 timer
  - 读取 `features/playback-settings` 的全局默认倍速并注入播放派生规则
- `model/row-playback-hud-state.ts`
  - row HUD store 的纯数据结构与更新 helper
- `model/row-hud-layout.ts`
  - row HUD 的中心位 owner 规则
  - pause fade-out reservation 时长
  - row HUD slot 派生 helper
- `model/row-surface-presentation.ts`
  - row surface presenter contract
- `model/row-progress-snapshot.ts`
  - row-local progress snapshot shape
  - `timeUpdate` payload -> seek bar display snapshot
- `model/current-transcript-sentence.ts`
  - 基础字幕的当前句解析 helper
  - 优先检查上次命中的句子，再检查相邻前后句，最后回退二分搜索
  - 读取的是 `entities/transcript` 已经 prepared 的 sentence 时间
- `model/current-transcript-token.ts`
  - 基础字幕的当前 token 解析 helper
  - 在当前句 tokens 内优先检查上次命中的 token，再检查相邻前后 token，最后回退二分搜索
  - token 时间保持 transcript asset 原始词级时间，不使用 sentence padding
- `model/transcript-token-display.ts`
  - 基础字幕 token 文本拼接 helper
  - 只处理 token 后置空格与常见前置标点，不承担完整排版引擎职责
- `model/row-playback-seek-bar-store.ts`
  - row-local seek bar runtime store
  - 持有真实 `progressSnapshot` 与 row-local `seekController`
  - 支持 optimistic seek 和外部订阅
- `model/render-props.ts`
  - row 与 player surface 的 memo compare contract
- `model/fullscreen-video-overlay-theme.ts`
  - row-owned overlay 的固定视觉尺寸 theme
  - 统一提供 subtitle / title / description / `展开 / 收起` 的文本指标
  - 统一提供 description action lane 的几何常量
- `ui/fullscreen-video-pager.tsx`
  - FlatList 壳层
  - mount-scoped `entryIndex` 初始定位与 post-load alignment
  - 注册稳定的 viewability handler，并把 active row 切换交给 playback session
  - 通过 `onActiveVideoChange(itemId, index)` 向 session 层报告当前 active video
  - 持有 fullscreen watch-progress reporter；只接收 active row 的 progress sample
  - 每 `15s` 定时 flush watch-progress queue；active video 切换、completed sample 与 pager unmount 也会触发 flush
  - 用户 pause / resume 不触发 watch-progress flush
  - 透传 row action rail 的本地动作
  - 持有 description measurement cache；cache 跟随当前 pager/session 生命周期，而不是挂在模块全局
  - cache 是有上限的 session-scoped 插入序缓存
  - page-attached overlays 渲染
- `ui/fullscreen-video-row.tsx`
  - 单条 fullscreen row
  - 装配 row-local media layer、interaction layer、content overlay、HUD overlay、surface status overlay
  - 作为 row 组合层接入 `features/word-detail`，把字幕 token 点击转换成 shared dialog payload
  - token word detail dialog 打开期间申请 playback hold；dialog 完全消失后释放
  - 使用 `video.likeCount / favoriteCount` 与 `VideoMeta + video-runtime` 的有效用户态派生 action rail 统计显示值
- `ui/row-owned-video-overlay.tsx`
  - row-owned 内容层
  - 持有基础字幕、标题与底部内容文案区的排版壳
  - 基础字幕、标题与 description 共用同一条文本列宽；内容区整体向左扩并缩小 rail 前留白
  - 基础字幕位于 title 上方，锚定同一个内容列，但通过 absolute sibling 脱离 title / description 的 normal flow
  - 基础字幕文本高度变化只向上增长，不重新布局 title / description；description 展开导致内容列上移时，字幕仍跟随锚点上移
  - 基础字幕优先渲染当前 `TranscriptSentence.tokens`；没有 token 时才 fallback 到整句 `TranscriptSentence.text`
  - 当前播放 token 使用纯色高亮；高亮只改变 token 的 `color` 与 `textShadow`，不改变字号、行高、字重、间距或换行模型
  - 所有 token 都可点击；点击后经 row 层打开 `features/word-detail` 的 shared dialog，payload 中的 `semantic_element.coarse_id` 可以是 `null`
  - 字幕 presenter 不直接 import modal hook，只通过 `onSubtitleTokenPress` 向 row 组合层发出 token 事件
  - 字幕显示由 `features/playback-settings` 的 `subtitleDisplayMode` 全局 session 偏好控制：`off` 不显示，`english` 只显示英文，`bilingual` 在英文下方显示当前句 `explanation`
  - 字幕显示模式只控制 UI 展示，不停止 fullscreen video resources 读取或缓存
  - 基础字幕使用区别于 title 的轻量视觉层级；不复用 title 的粗字重和强阴影
  - 基础字幕不限制为固定两行，当前句文本按实际长度自然换行显示
  - 基础字幕复用 row-local `seekBarStore` 的 `progressSnapshot.currentTimeSeconds` 做时间同步，不直接监听播放器
  - 当前句显示时间来自 `entities/transcript` 在缓存前完成的 sentence timing normalization；当前 token 高亮仍使用原始 token 时间
  - 点击字幕 token 不 seek、不触发 pause HUD；word detail dialog 打开期间只通过 session playback hold 临时暂停 active row
  - 字幕空白区不拦截背景手势
  - 从 widget-level overlay theme 取 title 样式与 description lane 几何，并显式关闭字体缩放；该约束只作用于 row-owned overlay 自身
  - 父层只负责 title + description 区整体向上/向下的布局动画，不持有 description 的内部展开态
  - 只消费 description 模块导出的语义结果 `actionPlacement`，再把它映射成自身的底部几何偏移
  - 折叠态不为 action lane 预留底部空行，`展开` 与 description 第二行并排；展开态由 `actionPlacement='footer'` 驱动内容列整体上抬，为 `收起` 单独留一行
  - 装配右侧 action rail 与 row-local 的可展开 description
- `ui/expandable-overlay-description.tsx`
  - row-local description 状态模块 + presenter
  - 默认最多 2 行；折叠态直接使用 native tail ellipsis，让 `...` 跟在 description 文本后面
  - 持有 description 的 measurement 与 row-local 展开态；当前展开身份由 `activeVisitToken + measurementKey` 同步派生，active visit 一变更就首帧失效，不再靠 effect 事后清理
  - 同一模块同时导出 description state hook、纯语义 `viewState`、文本 presenter 和固定 `展开 / 收起` action presenter，不再通过父子 callback 桥同步按钮显隐
  - 只在缺少合法 measurement 时挂 hidden text measurement；一旦命中有效 cache 或本地 measurement 就卸载 hidden measurer
  - 非空 description 的空 measurement 视为无效输入，直接忽略，不得把长文案降级成不可展开
  - 进入稳定的 `measuring | static | collapsed | expanded` 渲染阶段后，不再让 hidden measurer 常驻参与重复测量
  - measurement key 只绑定 description measurement typography、宽度和 description 文本；title / action / lane 样式调整不再误伤 description measurement cache
  - description measurement typography 由 `model/fullscreen-video-overlay-theme.ts` 单独提供；measurement helper 不再吃整份 overlay theme
  - 空 description 直接视为 `static + hidden + zero height`，不保留空白占位或展开入口
  - `viewState` 只表达 description 自己的语义状态：`mode`、`actionPlacement` 与文本高度，不再输出父层几何或并行布尔真相
  - `展开 / 收起` action presenter 挂在父层 absolute sibling，避开内容列的 layout animation；折叠态与第二行同 baseline，展开态作为独立最后一行；标签只在固定槽位里做 opacity crossfade，不再通过 enter/exit 重新挂载
- `ui/basic-subtitle-overlay.tsx`
  - row-owned 内容层内的基础字幕 presenter
  - 通过 `useSyncExternalStore` 订阅 row-local `seekBarStore`
  - 只负责解析当前句、解析当前 token、渲染 token 文本、在 token 被点击时调用 `onTokenPress`
  - 在 `bilingual` 模式下额外渲染当前句 `TranscriptSentence.explanation`；句子 explanation 不可点击，也不参与 token 高亮
  - 当前 token 高亮跟随 row-local playback time；不新增播放器监听或独立 timer
  - 不在 UI 层做 sentence start/end offset；这类纯 transcript 后处理由 `entities/transcript` 完成
  - 不承担 word detail modal、句子导航、学习状态、收藏状态或 API 请求
- `ui/row-playback-media-layer.tsx`
  - row 内 player / progress / seek controller 的局部装配层
  - 持有 row-local `surfacePresentation`
  - 把真实 `progressSnapshot` 与 row-local `seekController` 写入 seek bar store
  - active row 的 progress snapshot 同时向 pager reporter 回调一份；non-active row 不传 telemetry callback
  - 把 progress 的高频更新限制在 media layer 内
- `ui/row-playback-interaction-layer.tsx`
  - row 内唯一正式 interaction owner
  - 内部拆成 `BackgroundGestureRegion` 和底部 `SeekBarControlLane`
  - 持有 seek bar draft state，并把背景手势与 seek bar 命中区几何分离
- `ui/playable-video-surface.tsx`
  - 播放器执行层
  - 同步 `shouldPlay` / `playbackRate`
  - 暴露 active controller、row-local `seekController` 与 row-local surface presentation
  - 通过 `timeUpdate + bounded resync` 向 active row 上报 progress snapshot
- `ui/row-playback-hud-overlay.tsx`
  - row-local pause / seek / rate HUD
- `ui/row-playback-seek-bar-overlay.tsx`
  - interaction layer 内的 seek bar presenter/control strip
  - 只负责渲染左当前时间、中间 rail + thumb、右总时长
  - 不再直接订阅 store，也不再向背景层注册手势 blocker
- `ui/row-hud-anchors.tsx`
  - row HUD 固定锚点布局
  - `center / leftCenter / rightCenter / top` 四个 slot
- `ui/row-surface-status-overlay.tsx`
  - row-local loading / error / retry presenter

## 核心职责

当前 widget 固定承担：

- 纵向分页滚动
- 首屏定位与空列表回填后的 post-load alignment
- 只为当前视频与前后 2 个视频挂载 player
- 维护当前 fullscreen 播放会话
- 只为当前 active row 挂 row-local interaction layer
- 把 HUD state 绑定到 `videoId`，但只在对应 row 内渲染
- 把 player surface 的 loading / error / retry 收口到 row-local presenter
- 在 row 内维护 center owner，避免 pause / loading / seek 之间的布局抖动
- 只为 active row 订阅 progress，并在 row 内局部渲染底部 seek bar
- 只为 active row 把 progress sample 转给 `features/video-watch-progress` reporter
- 只为 active row 接收 session 层传入的 `activeTranscript`，并用 row-local progress 显示基础字幕
- row 的 like/favorite base 值来自 session 层传入的 `videoMetaByVideoId`
- 让 description 展开态保持 row-local UI state，不并入 page 或 runtime

当前 widget 不承担：

- feed 数据请求本身
- 跨页面恢复定位状态
- 全局 toast
- pager 顶层播放器 HUD
- 多 row 的播放器实例管理策略以外的业务逻辑
- runtime store 本身的定义
- 跨视频记忆 description 展开态

## 播放会话模型

`useFullscreenPlaybackSession` 当前固定持有：

- `activeIndex`
- `activeItemId`
- `activeVisitToken`
- `basePausedByUser`
- `transientHoldState`
- `playbackHoldCount`
- `activeSurfaceState`
- `activePlayerControllerRef`
- `rowPlaybackHudStateByVideoId`

其中：

- `activeVisitToken` 是当前 active row 的访问轮次；只要真实 active video 发生切换就递增，用来让 row-local description 展开态首帧同步失效
- `basePausedByUser` 是正常播/停基态
- `transientHoldState` 是左右/中间长按期间的临时覆盖态
- `playbackHoldCount > 0` 是业务 overlay 的临时播放遮罩；它不修改 `basePausedByUser`
- `activeSurfaceState` 只反映当前 active row 的 `loading | ready | error`
- `rowPlaybackHudStateByVideoId` 允许旧 row 的 HUD 在 active row 切换后继续跟随该 row 自然消失

### HUD store

每个 row 的 HUD state 结构是：

```ts
type FullscreenRowPlaybackHudState = {
  pauseIndicatorVisible: boolean;
  transientFeedback:
    | null
    | { kind: 'seek'; direction: 'backward' | 'forward' }
    | { kind: 'rate'; label: '2x' };
};
```

行为固定为：

- `single tap`
  - toggle `basePausedByUser`
  - 当前 `activeItemId` 的 pause HUD 显示约 `3s`
- `double tap`
  - seek 成功后只给当前 `activeItemId` 写入 `seek` HUD
  - 约 `700ms` 后自动清掉
- `hold start`
  - 左右区写入 `rate` HUD
  - 不自动 dismiss
- `hold end`
  - 清当前 active row 的 `rate` HUD
- `row unmount`
  - 清该 row 的 HUD timers 与 HUD store entry

## 手势与播放器边界

`RowPlaybackInteractionLayer` 当前固定为 row 内唯一正式 interaction owner：

- `BackgroundGestureRegion`
  - 只覆盖视频背景，不覆盖底部 seek bar control lane
  - `single tap` 使用 `Pressable`
  - `double tap + long press` 使用 `GestureDetector`
- `SeekBarControlLane`
  - 只负责 rail + thumb 的 `tap-to-seek`
  - 只负责 drag preview 和 release commit
  - 左右时间文本属于底部 control lane，但保持 inert

当前实现不再依赖 `railGestureBlockers` / `externalGestureBlockers` 这类跨组件 bridge。背景区和底部 control lane 因几何上不重叠而天然隔离：

- 点视频空白背景：pause / resume
- 点 rail 或 thumb：seek
- 点左右时间文本：不 seek，也不 pause
- 点字幕 token：打开 word detail dialog；dialog 存在期间 active row 暂停，关闭后按打开前的用户 pause 状态恢复或保持暂停
- drag 期间背景手势不会命中 seek bar lane

`PlayableVideoSurface` 当前固定为执行层，不再直接渲染 loading / error UI。它只负责：

- 本地持有 `VideoPlayer`
- 同步 `shouldPlay`
- 同步 `playbackRate`，普通播放使用全局默认倍速，左右长按临时覆盖为 `2x`
- 暴露 active controller `{ seekBy, seekTo, getCurrentTimeSeconds, getDurationSeconds, surfaceState }`
- 向 row 上报 `surfacePresentation`
- 仅在 active row 存在 progress callback 时开启 `timeUpdate`，向 row 上报 progress snapshot
- 不 import watch-progress、telemetry 或 API repository

`RowSurfaceStatusOverlay` 负责：

- loading 时显示中心 glass spinner
- error 时显示 dark scrim + error message + `Retry`
- 在 active row error 时自然压住背景手势与 HUD

## Row Seek Bar

row-local seek bar 是独立于 `RowPlaybackHudOverlay` 的持续型 playback control layer：

- 只绑定 active row
- 不进入 `useFullscreenPlaybackSession`
- 不进入 pager-level render props compare contract
- 由 `PlayableVideoSurface` 通过 `timeUpdate` 向 `RowPlaybackMediaLayer` 上报真实 `progressSnapshot`
- 由 `RowPlaybackMediaLayer` 把真实 `progressSnapshot` 与 row-local `seekController` 写入 `row-playback-seek-bar-store`
- `seekBy()`、`seekTo()` 与 `readyToPlay` 边界都会触发受控 resync，避免暂停态 seek 卡在旧位置
- 由 `RowPlaybackInteractionLayer` 持有 draft state 和 seek 交互
- 由 `RowPlaybackSeekBarOverlay` 在底部 control lane 内渲染左当前时间、中间 rail + thumb、右总时长

这一层当前固定为：

- 常驻显示
- 左时间 + 中间 rail + thumb + 右总时长
- 非 glass
- rail + thumb 区域支持 tap-to-seek
- 左右时间文本继续只读，不参与 seek
- rail + thumb 区域可直接开始拖动
- 拖动过程中只更新本地 preview，不实时 seek
- tap-to-seek 与 drag release 共用同一条 rail-local 几何换算和 `commitSeek` 链
- tap 后立即做一次 row-local `seekTo(seconds)`，不显示额外 seek HUD
- 松手时只做一次 row-local `seekTo(seconds)`
- scrubbing 期间继续播放视频，但背景区因几何分离不会命中
- `error` 时隐藏

## 当前动作状态

fullscreen 右侧 action rail 当前固定为：

- `like`
  - 对应 `isLiked`
  - active 时 heart 变红
  - icon 下方显示 like 数字
- `favorite`
  - 对应 `isFavorited`
  - active 时 star 变黄
  - icon 下方显示 favorite 数字
- `subtitle`
  - 对应 `features/playback-settings` 的 `subtitleDisplayMode`
  - `off` 使用空心 `text.bubble`
  - `english` 使用实心 `text.bubble.fill`
  - `bilingual` 使用实心 `text.bubble.fill`，并把图标 tint 切到蓝色

`share` 已迁移到 playback settings sheet，fullscreen 右侧 action rail 不再渲染分享按钮，也不再保留分享 action 的外部冒泡入口。

当前 `like / favorite` 通过 `features/video-engagement` 发起写 API，并继续用本地 runtime override 驱动即时 UI。

count 显示规则：

- 基础 count 来自 `VideoListItem.likeCount / favoriteCount`
- 当前显示值由 row 根据 `VideoMeta` base state 与 `video-runtime` effective state 派生
- 用户本地点赞 / 收藏会让显示值 `+1`；取消会让显示值 `-1`
- 派生显示值不写回 `VideoListItem`，也不进入 `video-runtime-store`
- 写 API 成功后不更新 feed count 或 video meta cache；失败后回滚 runtime override
- 小于 `10000` 显示完整数字；大于等于 `10000` 显示为 `1万 / 1.1万`
- 如果 `VideoMeta` 尚未加载或加载失败，按钮禁用，但仍展示 feed count

但这层 runtime toggle 不是长期真值：

- 当前会话里，点击后会立即基于当前 row 的 `VideoMeta` base 值写入 runtime override
- 后续 feed refresh 不会重置同一 `videoId` 的本地 like/favorite override
- 如果当前 row 的 `VideoMeta` 尚未加载或加载失败，like/favorite 按钮禁用

当前颜色更新链固定为：

- `FullscreenVideoPager`
  - 继续消费 canonical `VideoListItem[]`
- `FullscreenVideoRow`
  - 以 `VideoMeta` 为 base，通过 `features/video-engagement` 按 `videoId` 订阅当前 `isLiked / isFavorited`
  - `like / favorite` 在 engagement feature 内发起 mutation，并乐观写入 runtime
  - `subtitle` 在 row 内循环全局字幕显示模式：`off -> english -> bilingual -> off`

也就是说，fullscreen 的 action active state 不再依赖整表 effective items、page relay 或 `FlatList.extraData` 才能刷新。

## Row HUD 布局

row 内 HUD 不再靠各组件各自定位，而是走固定 slot：

- `center`
  - `pause` 或 `loading`
- `leftCenter`
  - backward seek
- `rightCenter`
  - forward seek
- `top`
  - `2x`

中心位 owner 由 `row-hud-layout.ts` 决定：

- `pause` 优先于 `loading`
- pause 消失后，会继续保留一段与 fade-out 对齐的 center reservation
- reservation 结束后，如果 surface 仍处于 `loading`，中心位才切到 loading
- `seek` 和 `rate` 不参与中心位竞争

## 调用链

### Single tap

1. `RowPlaybackInteractionLayer` 的 `BackgroundGestureRegion` 识别单击
2. session hook toggle `basePausedByUser`
3. session hook 为当前 `videoId` 写入 pause HUD
4. `FullscreenVideoRow` 把该 state 交给 `RowPlaybackHudOverlay`

### Double tap

1. `RowPlaybackInteractionLayer` 的 `BackgroundGestureRegion` 识别左右区
2. session hook 读取 active transcript 与播放器当前时间
3. 有可用字幕时按句子级规则调用 active controller `seekTo(targetSeconds)`；字幕不可用、空字幕或时间不可用时 fallback 到 `seekBy(-5/+5)`
4. 成功后只给当前 `videoId` 写入方向型 seek HUD
5. HUD 跟随所属 row 渲染并自动消失

### Long press

1. `RowPlaybackInteractionLayer` 的 `BackgroundGestureRegion` 识别左右/中间区
2. `FullscreenVideoPager` 在中间区长按时调用 `onCenterHoldStart`
3. 页面装配层用该回调打开 playback settings sheet
4. session hook 写入 `transientHoldState`
5. 左右区写入 `rate` HUD，row 内持续显示 `2x` HUD，直到 `hold end`

### Active row 切换

切换时同步执行：

- reset `basePausedByUser`
- clear `transientHoldState`
- clear current active controller
- clear `activeSurfaceState`
- 清旧 active row 的 `rate` HUD

但不会全局清空 `pause / seek` HUD store；旧 row 仍按自己的生命周期或 unmount 清理。

## 维护约束

- 不要把 row-local HUD 再提回 pager 顶层
- 不要把 `RowPlaybackHudOverlay` 并回 `RowOwnedVideoOverlay`
- 不要把 loading / error presenter 再塞回 `PlayableVideoSurface`
- 不要让 `features/video-playback` 持有 React state 或 UI
- 只在 active row 上注册 active controller
- active row `surfaceState === 'error'` 时，背景手势必须关闭，让 `Retry` 直接接管点击
