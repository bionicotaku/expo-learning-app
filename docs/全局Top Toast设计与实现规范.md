# 全局 Top Toast 设计与实现规范

## 1. 文档目标

本文档定义当前项目中的全局 `Top Toast` 系统。

这是一套**完全自研、固定用途、只服务这一种顶部反馈 toast 设计**的专用系统。它不解决“任意通知形态”，也不尝试抽象成通用消息平台。

本文档用于回答以下问题：

- 这套 toast 在当前项目中的定位是什么
- 它与 `Editorial Paper`、`Fullscreen Video` 局部 HUD 的边界是什么
- 它在视觉、交互、动画和生命周期上应该长什么样
- 它在当前 Expo + Expo Router + React Native 架构中应如何实现
- 它应该暴露哪些 API，哪些能力明确不做

默认前提如下：

- v1 只定义一种全局顶部堆叠 toast
- v1 不做 dark mode / light mode 双视觉切换
- v1 不做 progress toast、sticky toast、action toast、loading toast
- 不引入第三方 toast 宿主库
- 不把当前 `Fullscreen Video` 页面中的局部 playback layers 纳入这套系统

## 2. 设计定位与边界

### 2.1 角色定义

`Top Toast` 是应用级全局前景反馈层，用于显示：

- 操作成功
- 操作失败
- 警告提醒
- 一般信息提示

它的职责是：

- 在任何页面上方统一显示短暂反馈
- 提供一致、低摩擦、非阻塞的全局反馈体验
- 让业务层只通过极少参数触发 toast，而不接触视图实现

它不负责：

- 页面内局部播放反馈
- 逐帧变化的 HUD
- 长时间驻留的状态栏
- 阻塞式确认或交互式弹层
- 任务进度和过程条

### 2.2 与现有系统的边界

#### 不属于 `Editorial Paper`

`Top Toast` 是独立设计，不属于当前项目的 `Editorial Paper` 原语体系。

因此：

- 不进入 `shared/ui/editorial-paper`
- 不复用 `AdaptiveGlass` 作为默认实现
- 不把 toast 颜色、尺寸、阴影全部并入 `Editorial Paper` tokens
- 不要求页面组件显式消费 `Editorial Paper` 原语才能使用 toast

原因很简单：

- `Editorial Paper` 服务页面和组件系统
- `Top Toast` 服务应用级前景反馈
- 两者职责不同，生命周期不同，视觉稳定性要求也不同

#### 不等于 `Fullscreen Video` 局部 HUD

当前 `Fullscreen Video` 中已有的局部播放反馈层属于 row-attached playback layers，而不是全局 toast。

根据 [Fullscreen Video Overlay架构设计规范](./Fullscreen%20Video%20Overlay架构设计规范.md)，它更适合归入：

- `RowPlaybackInteractionLayer`
- `RowPlaybackHudOverlay`
- `RowPlaybackSeekBarOverlay`

因此必须明确区分两者：

- `Top Toast`
  - 全局
  - 跨页面
  - 固定在应用最前景
  - 不依赖某个 active video
- `RowPlaybackHudOverlay`
  - 页面内
  - 只对当前 active video 有意义
  - 与播放态、手势、字幕同层
- `RowPlaybackInteractionLayer`
  - 页面内
  - 只对当前 active video 有意义
  - 承载背景区与底部 control lane 的交互 ownership
- `RowPlaybackSeekBarOverlay`
  - 页面内
  - 只对当前 active video 有意义
  - 是 interaction layer 内部的底部播放控制条

后续实现中，播放页内的播/停 HUD、字幕提示、底部时间/拖动反馈或其它局部播放反馈**不得**调用全局 `toast.show(...)`。

### 2.3 为什么不复用 history 方案

`history` 项目中的 toast 视觉和行为可以作为参考，但其架构不适合当前项目直接照搬。

不采用的原因：

1. 它依赖第三方 toast 底盘作为宿主和 imperative API，核心控制权不完全在自己手里。
2. 它在第三方库之外又额外叠加了 `Provider + Manager + renderer 注入 + lazy require`，结构臃肿。
3. 它试图提供很多“名义上的通用能力”，但这些能力并没有形成真正稳定的约束。
4. 当前项目的需求非常明确，只需要一种固定的 top toast，没有必要为不存在的扩展性付出复杂度。

本项目的目标是：

- 保留 `history` 里的视觉和交互目标
- 放弃其第三方宿主和过度通用化的实现方式
- 用更小、更专用、更可控的本地底盘完成同样能力

## 3. 视觉与交互规范

### 3.1 视觉目标

这套 toast 的视觉目标是：

- 顶部居中
- 轻玻璃感
- 柔和但可识别的功能色
- 文案居中
- 信息密度低，不压迫页面主体
- 在浅色 Feed 和黑色 Fullscreen 上都保持稳定识别度

### 3.2 布局结构

单条 toast 固定为三段结构：

1. 左侧图标
2. 中部文本区
3. 右侧对称占位

其中：

- 图标仅承担状态识别
- 标题是主信息，始终必填
- 副标题是补充信息，可选
- 右侧占位必须保留，以保证中部文本视觉居中

### 3.3 固定视觉常量

以下常量在 v1 直接写死，不做主题映射：

- `maxToasts = 2`
- `defaultDurationMs = 4000`
- `topOffset = -20`
- `horizontalMargin = 35`
- `borderRadius = 24`
- `containerMinHeight = 48`
- `containerPaddingHorizontal = 16`
- `containerPaddingVertical = 12`
- `iconSize = 24`
- `iconPadding = 8`
- `titleMaxLines = 1`
- `messageMaxLines = 2`
- `blurIntensity = 60`
- `backgroundOpacity = 0.20`
- `titleTextOpacity = 0.75`
- `messageTextOpacity = 0.75`
- `iconOpacity = 0.70`
- `stackGap = 8`

### 3.4 类型与图标

支持的类型固定为：

- `success`
- `error`
- `warning`
- `info`

图标固定为：

- `success` -> `check-circle`
- `error` -> `error-outline`
- `warning` -> `warning`
- `info` -> `info`

如果后续图标来源统一到 `expo-symbols` 或其它图标系统，可以替换底层图标组件，但图标语义和布局结构不变。

### 3.5 固定功能色

v1 固定采用 `history` 浅色方案中的功能色，不做页面级切换：

- `success = #34C759`
- `error = #FF3B30`
- `warning = #FF9500`
- `info = #007AFF`

这些颜色只用于：

- 图标
- 半透明背景基色
- 标题和副标题着色

### 3.6 玻璃与背景规则

原生端固定使用：

- `BlurView`
- `tint = 'light'`
- `intensity = 60`

web 或不支持 blur 的场景退化为：

- 半透明背景 `View`

背景规则：

- 使用当前 toast 类型颜色的 `20%` 透明度作为底色
- 不使用额外的渐变
- 不混入 `Editorial Paper` 的暖纸面色或压印阴影

### 3.7 文本规则

文本使用平台原生 sans-serif，不使用 `Fraunces`。

要求：

- 标题居中
- 副标题居中
- 标题最多 1 行
- 副标题最多 2 行
- 副标题只在 `message` 存在时渲染

toast 文本不承担品牌感，它承担的是清晰、快速、稳定的反馈表达。

### 3.8 动画与交互

#### 进入动画

单个 toast 进入时使用：

- 透明度：`0 -> 1`
- 位移：`translateY -12 -> 0`
- 缩放：`0.98 -> 1`
- 时长：`220ms`

#### 退出动画

单个 toast 退出时使用：

- 透明度：`1 -> 0`
- 位移：`translateY 0 -> -18`
- 时长：`180ms`

#### 堆叠规则

- toast 从上到下堆叠
- 最多同时显示 `2` 个
- 两条之间间距固定为 `8`
- 新 toast 永远出现在顶部，较旧 toast 下移

#### dismiss 规则

支持三种关闭方式：

1. 自动关闭
2. `toast.dismiss(id)`
3. 向上滑动 dismiss

向上滑 dismiss 的判定固定为：

- `translationY <= -36`，或
- `velocityY <= -600`

手势只支持“向上退出”，不支持左右滑关闭。

#### 不支持的交互

- 点击 toast 本体触发动作
- 点击关闭按钮
- 长按固定
- 横向手势

## 4. 实现架构规范

### 4.1 总体结构

固定实现为四部分：

```text
src/shared/lib/toast/
  index.ts
  types.ts
  store.ts
  service.ts

src/shared/ui/toast/
  ToastHost.tsx
  ToastCard.tsx
  toast-design.ts
```

### 4.2 各部分职责

#### `service`

对业务层暴露：

- `toast.show`
- `toast.dismiss`
- `toast.clear`

业务层只允许 import `toast`，不允许直接读写 store。

#### `store`

模块级外部状态，只负责：

- 维护 `items`
- 接收 service 命令
- 管理 record 的增删改
- 提供订阅接口给 host

store 不负责：

- React 渲染
- 动画
- 计时器
- 手势

#### `ToastHost`

`ToastHost` 是根部唯一宿主，负责：

- 订阅 store
- 读取 safe area
- 在应用最前景渲染 stack
- 将每个 record 交给 `ToastCard`

`ToastHost` 不负责业务调用，不对外暴露 imperative API。

`ToastHost` 固定使用：

- `useSyncExternalStore`

来订阅 toast store，不使用 React context 传播 toast 状态。

#### `ToastCard`

`ToastCard` 负责：

- 单个 toast 的视觉呈现
- enter / exit 动画
- auto-dismiss 定时器
- 手势 dismiss
- 动画结束后通知 store 物理删除

### 4.3 根部接入方式

`ToastHost` 固定挂在：

- `src/app/_layout.tsx`

挂载位置固定为：

- 与 `<Stack />` 同层
- 位于 `<Stack />` 之后
- 使用前景绝对定位覆盖

推荐结构：

```tsx
<GestureHandlerRootView style={{ flex: 1 }}>
  <EditorialPaperThemeProvider>
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
      <ToastHost />
    </QueryClientProvider>
  </EditorialPaperThemeProvider>
</GestureHandlerRootView>
```

原因：

- 所有页面都能显示 toast
- 不需要额外 Provider
- 不依赖路由层或页面层主动接入

### 4.4 明确不采用的结构

后续实现中明确不做：

- `ToastProvider`
- `initToast()`
- `updateToastConfig()`
- `setToastRenderer()`
- renderer 注入
- lazy require 的视图装配
- 第三方 imperative toast host

这些能力都不符合当前项目“固定用途、强耦合、最小底盘”的目标。

## 5. Public API 与类型契约

### 5.1 基础类型

```ts
export type ToastKind = 'success' | 'error' | 'warning' | 'info';

export type ToastId = string;

export type ToastPhase = 'entering' | 'visible' | 'exiting';

export type ToastConfig = {
  readonly kind: ToastKind;
  readonly title: string;
  readonly message?: string;
  readonly durationMs?: number;
};

export type ToastRecord = {
  readonly id: ToastId;
  readonly kind: ToastKind;
  readonly title: string;
  readonly message?: string;
  readonly durationMs: number;
  readonly createdAt: number;
  readonly phase: ToastPhase;
};
```

### 5.2 Service API

```ts
export const toast = {
  show(config: ToastConfig): ToastId,
  dismiss(id: ToastId): void,
  clear(): void,
};
```

规则：

- `show()` 始终返回 `ToastId`
- 不返回 `null`
- 不暴露 `updateConfig()` 之类的运行时全局配置接口
- v1 不提供 `toast.success / error / warning / info` 这类快捷方法

### 5.3 Store contract

store 对 UI 层至少提供：

- `getSnapshot(): readonly ToastRecord[]`
- `subscribe(listener): unsubscribe`
- `enqueue(config): ToastId`
- `markExiting(id): void`
- `remove(id): void`
- `clearAll(): void`

这些接口只给 service 和 host/card 使用，不给业务直接使用。

## 6. 生命周期与行为规则

### 6.1 show

调用 `toast.show(config)` 时：

1. 生成新的 `ToastId`
2. 规范化配置，补足默认 `durationMs`
3. 生成 `phase = 'entering'` 的 `ToastRecord`
4. 写入 store

### 6.2 容量上限

系统同时最多允许 `2` 个 toast 处于显示栈内。

当 `show()` 发生时如果已达上限：

- 立即淘汰最旧的 active toast
- 旧项直接从 store 移除
- 新项进入 stack

v1 不为“被容量淘汰的最旧 toast”保留完整退出动画。  
这样可以保证屏幕上永远最多显示 `2` 个 toast。

### 6.3 entering -> visible

新 toast 进入后：

- `ToastCard` 负责 enter 动画
- enter 动画结束后，将该项 phase 更新为 `visible`

### 6.4 自动关闭

当 toast 进入 `visible` 后：

- 启动 auto-dismiss timer
- 到达 `durationMs` 后进入 `exiting`

如果用户手动 dismiss，则直接中断剩余计时并进入 `exiting`。

### 6.5 exiting -> remove

toast 进入 `exiting` 后：

- 执行退出动画
- 动画结束后由 `ToastCard` 通知 store `remove(id)`

真正的物理删除时机固定为：

- 退出动画结束之后

### 6.6 dismiss

`toast.dismiss(id)` 的语义固定为：

- 如果该项存在且尚未退出，则将其标记为 `exiting`
- 如果已不存在，则静默忽略

### 6.7 clear

`toast.clear()` 的语义固定为：

- 当前所有 toast 统一进入 `exiting`
- 不直接同步清空 store
- 等各自退出动画结束后再逐个删除

### 6.8 重复显示策略

v1 默认允许重复显示同内容 toast：

- 不做去重
- 不做合并
- 不做节流

如果业务层连续调用相同 `title/message`，就按多条 toast 处理。

## 7. 视觉实现约束

### 7.1 不复用 `AdaptiveGlass`

虽然项目中已有 [AdaptiveGlass](../src/shared/ui/editorial-paper/adaptive-glass.tsx) 的思路，但 `Top Toast` 不直接使用它。

原因：

- `AdaptiveGlass` 服务 `Editorial Paper`
- `Top Toast` 需要固定且可控的视觉
- `AdaptiveGlass` 的 liquid glass / blur / translucent 自动切换会让 toast 视觉在不同平台漂移

因此 `Top Toast` 固定使用自己的视觉常量和自己的 blur 策略。

### 7.2 不依赖页面主题状态

v1 toast 固定采用单一视觉：

- 不跟随页面背景变化
- 不跟随 `Feed` / `Fullscreen Video` 切换变色
- 不跟随未来 dark mode 自动切换

这套 toast 的稳定性优先于“页面融合”。

### 7.3 宽度与定位

toast 的横向尺寸固定为：

- `screenWidth - 2 * horizontalMargin`

toast host 的容器规则：

- `position: absolute`
- `left: 0`
- `right: 0`
- `top: safeAreaTop + topOffset`
- `zIndex` 高于页面内容
- `pointerEvents: box-none`

toast 卡片本体允许交互，宿主容器不拦截其它页面事件。

## 8. 测试与验收标准

### 8.1 文档验收

读完本文档后，后续实现者必须能够明确：

- toast 与 `Editorial Paper` 的边界
- toast 与 Fullscreen 局部 HUD 的边界
- 为什么不使用第三方 toast 库
- 服务层、store、host、card 的职责分工
- 根部如何接入，业务如何调用

### 8.2 后续实现验收

后续代码实现必须满足：

1. 任意业务模块可直接调用 `toast.show(...)`
2. 根部只存在一个 `ToastHost`
3. 屏幕上同时最多显示 `2` 个 toast
4. 视觉与 `history` 的 light 版 toast 一致
5. 支持自动关闭、手动 dismiss、向上滑 dismiss
6. `clear()` 触发统一退出流程
7. 不引入任何第三方 toast 宿主库
8. Fullscreen 局部 `RowPlaybackHudOverlay` 与 `RowPlaybackSeekBarOverlay` 都不走全局 toast 系统

### 8.3 推荐测试场景

后续实现时至少覆盖以下场景：

- `show(success)` 正常显示并自动消失
- `show(error)` 带 message 正常显示
- 连续触发 3 次 toast 时只保留最近 2 条
- `dismiss(id)` 能让指定 toast 退出
- `clear()` 能让当前全部 toast 退出
- 向上滑动可关闭单条 toast
- 在 Feed 和 Fullscreen Video 两个页面中都能稳定显示
- 在 web fallback 下仍能正确布局

## 9. 默认约束与非目标

### 9.1 默认约束

- 文本语言不做特殊限制，由业务层传入
- 默认持续时间固定为 `4000ms`
- 默认位置固定为顶部
- 默认最多显示 `2` 个
- 默认允许重复 toast

### 9.2 非目标

本规范当前明确不覆盖：

- progress toast
- action toast
- sticky toast
- bottom toast
- 页面内 HUD
- Fullscreen 播放中的局部反馈
- 与 `Editorial Paper` token 深度整合
- 第三方 toast 兼容层

## 10. 参考来源

本规范的视觉和行为主要参考：

- `history` 项目中的自定义 toast 视觉方案

但只参考其：

- 布局
- 颜色
- 模糊感
- 文案结构
- 最大数量
- 自动消失与 dismiss 行为

不参考其：

- 第三方 toast 宿主依赖
- Provider + manager + renderer 注入结构
- 伪通用配置层

本项目的目标不是移植 `history` 的架构，而是**在当前项目内用更小、更强耦合、更可控的方式复刻相同体验**。
