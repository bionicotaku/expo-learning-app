# Fullscreen Video Gesture 设计规范

## 1. 文档目标

本文档定义当前 `Fullscreen Video 页` 的手势设计、状态模型、组件落位与播放器控制边界。

这份文档重点回答：

- 手势识别层到底放在哪一层，而不是放在哪个 overlay 里
- 为什么 fullscreen 不使用 pager 顶层全局手势层
- 单击、双击、长按分别如何与当前播放会话交互
- 暂停状态下临时 `2x` 的恢复语义如何成立
- 在当前 Expo + 轻量 FSD 结构里，哪些逻辑归 `features/video-playback`，哪些状态归 `widgets/fullscreen-video-pager`

相关文档：

- overlay 分层见 [Fullscreen Video Overlay设计规范](./Fullscreen%20Video%20Overlay设计规范.md)
- 页面关系见 [Feed与Fullscreen Video页面设计逻辑](./Feed与Fullscreen%20Video页面设计逻辑.md)

## 2. 平台范围

当前手势契约的正式目标平台是：

- iOS
- Android

`web` 只允许降级，不在本规范中定义正式交互承诺。

## 3. 手势层不是 Overlay

当前 fullscreen 必须区分两件事：

1. `overlay` 是视觉与信息分层
2. `gesture surface` 是输入识别层

因此本页固定采用以下层级：

1. `PlayableVideoSurface`
2. `ActiveVideoGestureSurface`
3. `Row-owned content overlay`
4. `Top chrome overlay`
5. `Active ephemeral overlay`
6. `Pager shell loading pill`

其中：

- `ActiveVideoGestureSurface` 不属于三层 overlay 模型
- 它是 `FullscreenVideoItem` 内部的 `row-local interaction surface`
- 它位于视频画面之上、row-owned overlay 之下

这样做的理由是：

- 手势 ownership 仍然属于当前 row，而不是 pager 壳层
- row-owned 内容层继续跟视频一起移动
- 顶层 chrome 和瞬时 HUD 不需要反向知道手势识别细节

## 4. 手势挂载策略

### 4.1 运行时原则

当前实现固定遵循：

- 每个 `FullscreenVideoItem` 都有手势槽位
- 但只有 `active row` 真正渲染 `GestureDetector`
- 非 active row 不挂真实 detector，而不是“挂了再 disabled”

这意味着 fullscreen 不是“全局只有一个 pager-level gesture shell”，也不是“所有已挂载 row 都常驻一整套手势”。

### 4.2 为什么不做 pager-level global gesture shell

不采用 pager 顶层全局手势层，原因是：

- 会破坏 row-local ownership
- 会把本属于 `FullscreenVideoItem` 的交互上提到 pager
- 会让右侧 action rail 的命中协调更脆弱
- 后续字幕、词义解释等 active-only HUD 更容易被错误塞回顶层壳

### 4.3 与右侧 rail 的关系

手势 surface 必须保证：

- 右侧 action rail 始终有更高命中优先级
- metadata 文本区继续 `pointerEvents="none"`
- 文本区之下的触摸应自然落到 gesture surface

因此：

- rail 按钮不会进入视频手势
- 文本本身不接事件
- 视频背景区域负责单击 / 双击 / 长按

## 5. 手势语义

### 5.1 Single Tap

`single tap` 只在没有 active hold lock 时参与识别。

它保持当前产品语义不变：

- 点击任意视频背景
- 切换暂停 / 恢复

它只修改 `basePausedByUser`，真实播放态由派生状态决定，而不是直接在 UI 里命令式切换播放器。

### 5.2 Double Tap

`double tap` 只在没有 active hold lock 时参与识别。

分区规则：

- 左半区：`seek -5s`
- 右半区：`seek +5s`

双击只 seek，不改变基态：

- 如果原本在播放，seek 后继续播放
- 如果原本已暂停，seek 后仍保持暂停

### 5.3 Long Press

`long press` 的分区是三等分：

- 左区：临时 `2x`
- 中区：占位接口
- 右区：临时 `2x`

左右长按是唯一允许“临时打破暂停、进入 `2x` 播放”的手势。

当左右长按激活时：

- 写入 `transientHoldState`
- `effectiveShouldPlay = true`
- `effectivePlaybackRate = 2`
- `isGestureLocked = true`

语义固定如下：

- 如果开始长按时原本在播放：按住期间 `2x`，松手恢复 `1x` 并继续播放
- 如果开始长按时原本已暂停：按住期间临时开始 `2x` 播放，松手先回到 `1x`，再恢复暂停
- 左右长按激活后，`2x` HUD 必须在整个 hold 生命周期内持续显示，直到松手、active row 切换或页面销毁时才清掉

### 5.4 Center Hold

中间长按当前只保留接口。

它的行为是：

- 占用当前手势流
- 不改播放状态
- 不改播放速度
- 不显示 HUD
- 松手后直接退出

因此 `center hold` 不是“空白区回退成 tap”，而是一个已被占用但暂时无业务效果的手势模式。

### 5.5 Gesture Lock

只要存在 `transientHoldState`，当前会话就进入 `gesture lock`。

被锁期间：

- `single tap` 不触发
- `double tap` 不触发

这保证了：

- `2x` 期间不会误触发暂停
- 同一段长按不会再叠出 seek

## 6. 手势识别参数

当前参数固定为：

- `single tap`
  - 使用 `react-native-gesture-handler` 的 `Pressable` 语义
  - 通过 `requireExternalGestureToFail(doubleTap, longPress)` 等待更高优先级手势先判定
- `double tap`
  - `numberOfTaps = 2`
  - `maxDuration = 220ms`
  - `maxDelay = 250ms`
- `long press`
  - `minDuration = 320ms`
  - `maxDistance = 20`

组合优先级固定为：

1. `long press`
2. `double tap`
3. `single tap`

实现上当前采用两层配合：

- `double tap + long press` 由 active-row `GestureDetector` 处理，并以 `Gesture.Exclusive(...)` 建立优先级
- `single tap` 由同一块 surface 内的 `Pressable` 处理，但必须等待 `double tap / long press` 失败后才触发

这样做的原因是：

- 旧版 fullscreen 的单击本来就是全屏 `Pressable`，这条 press 语义在滚动容器里更稳定
- `single tap` 继续交给 `Pressable`，可以避免把“普通点击”的可靠性绑死在 `Tap gesture` 的识别细节上
- `requireExternalGestureToFail(...)` 又能保证单击不会抢跑到双击和长按前面

## 7. 状态模型

### 7.1 Widget 持有的会话状态

`widgets/fullscreen-video-pager` 持有以下播放会话状态：

- `activeIndex`
- `basePausedByUser`
- `transientHoldState`
- `playbackFeedback`

其中：

- `basePausedByUser` 是正常基态
- `transientHoldState` 是长按期间的临时覆盖态
- `playbackFeedback` 是 HUD 用的短期会话反馈；其中播/停与 seek 会自动消失，`2x` 会跟随 hold 生命周期持续显示

### 7.2 Feature 层纯规则

`features/video-playback` 负责：

- 双击左右区解析
- 长按左右中三区解析
- `basePausedByUser` 的 toggle
- active row 变化后的基态 reset
- active row 变化后的 hold clear
- `effectiveShouldPlay`
- `effectivePlaybackRate`
- `isGestureLocked`

这里不持有 React state，不渲染 UI，也不直接操作 `expo-video` player。

### 7.3 派生关系

当前派生关系固定为：

- `effectiveShouldPlay`
  - 无 hold：`!basePausedByUser`
  - 左右 hold：强制 `true`
  - 中间 hold：跟随基态
- `effectivePlaybackRate`
  - 左右 hold：`2`
  - 其它情况：`1`
- `isGestureLocked`
  - `transientHoldState !== null`

## 8. 播放器执行边界

### 8.1 播放器实例位置

`VideoPlayer` 继续由 `PlayableVideoSurface` 本地持有。

不做以下重构：

- 不把 player 上提到 pager
- 不改成单播放器壳
- 不让 page 层直接持有播放器实例

### 8.2 持久 intent 与一次性命令

播放器执行面分两类：

1. 持久 intent
   - `shouldPlay`
   - `playbackRate`
2. 一次性命令
   - `seekBy(seconds): boolean`

持久 intent 通过 props 进入 `PlayableVideoSurface`，由该组件自行同步到 `expo-video`。

一次性命令只保留最小接口：

- `seekBy(seconds): boolean`

其中：

- 返回 `true` 表示本次 seek 已提交
- 返回 `false` 表示当前 player 还未 ready 或不可 seek

当 seek 返回 `false` 时：

- 不显示 seek HUD
- 不改变播放/暂停基态

## 9. HUD 模型

当前 HUD 数据不再用单字符串，而固定采用判别联合：

- `{ kind: 'playback'; label: 'Playing' | 'Paused' }`
- `{ kind: 'seek'; deltaSeconds: -5 | 5 }`
- `{ kind: 'rate'; label: '2x' }`

显示策略固定为：

- `playback`：短暂显示后自动消失
- `seek`：短暂显示后自动消失
- `rate`：左右 hold 期间持续显示；只有 `hold end`、active row 切换或页面卸载才清掉

`PlaybackFeedbackOverlay` 只负责渲染。

它不负责：

- 解析手势
- 推导业务规则
- 管理计时器

这些都由 pager 会话层与 model helper 决定。

## 10. Active Row 切换规则

当 active row 改变时，必须同步执行：

1. `basePausedByUser` 重置为 `false`
2. `transientHoldState` 清空
3. `effectivePlaybackRate` 回到 `1x`
4. 当前 HUD 清空

这样可以保证：

- 新 row 始终按 autoplay 基线进入
- 不会把上一条视频的 hold / pause / HUD 残留带到下一条

## 11. 当前实现验收点

只要 fullscreen 手势实现满足以下事实，就视为符合本规范：

- 只有 active row 挂真实 detector
- 单击保持当前的暂停 / 恢复语义
- 双击左右只 seek，不改变基态
- 暂停状态下左右长按会临时 `2x` 播放，松手恢复暂停
- 长按期间 single tap / double tap 都不会触发
- 手势反馈只出现在 active ephemeral overlay
- page 层不持有手势或播放会话状态
