# Modal 基座设计与使用文档

## 1. 文档定位

本文档定义当前仓库的全局 Modal 基座设计，目标是为后续业务 Modal 提供统一的：

- 视觉壳
- 展示与关闭能力
- 栈管理能力
- 动画与手势能力
- FSD 边界与接入方式

本文档分为两个阶段说明：

- **V1**：当前阶段要落地的最小可用实现
- **V2**：当前不实现，但必须在设计上提前保留扩展位的能力

本文档只定义基座，不直接实现业务层的 `播放设置 modal`、`字幕解释 modal`、`表单 modal` 或其它具体业务弹层。

---

## 2. 设计目标

### 2.1 当前目标

本仓库需要一套不依赖第三方 Modal 管理框架的全局 Modal 基座，用来复刻旧项目里 `Modalfy + BlurModal` 组合所提供的核心体验，但不沿用其架构设计。

当前要保留的核心能力包括：

- 全局任意页面可触发
- 统一的 app 级前景宿主
- 统一 backdrop
- 居中对话框与底部抽屉两种呈现方式
- enter / exit 动画
- 底部抽屉下滑关闭
- 多个 modal 的栈式管理
- 后续承载按钮、回调、异步事件和复杂业务交互

### 2.2 明确非目标

当前阶段不做以下内容：

- 不引入 `react-native-modalfy`
- 不引入 `react-native-modal`
- 不使用 Expo Router 的 route modal 作为本基座主实现
- 不实现 `custom` 任意布局模式
- 不直接实现业务级播放设置或字幕解释内容
- 不实现 Promise 式结果返回协议
- 不实现复杂拖拽 detent、多段停靠和 iOS form sheet 模拟

---

## 3. 设计原则

### 3.1 只复刻能力，不复刻旧架构

旧项目里需要保留的是：

- 视觉层的 glass / blur modal 表现
- modal stack 的基本行为
- 进出场和交互关闭动画

旧项目里不应继续沿用的是：

- app 层集中字符串注册所有业务 modal
- `openModal('Name', params)` 式字符串分发
- `getParam()` 式弱约束参数读取
- 业务 modal 被全局中心文件反向聚合的组织方式

### 3.2 shared 只做基座，不做业务命名中心

`shared` 层只负责 modal 的：

- runtime
- host
- surface
- animation
- gesture
- 公共类型

`shared` 不负责：

- 定义播放设置 modal 的业务参数
- 定义字幕解释 modal 的业务数据结构
- 聚合所有 feature modal 名称
- 承担业务回调协议中心

### 3.3 业务侧通过 typed presenter 接入

未来业务层不直接散落调用底层 `present()`，而是各 feature 自己暴露自己的 presenter。

例如未来可能存在：

- `usePresentPlaybackSettingsModal()`
- `usePresentElementExplanationModal()`

这样可以保证：

- feature 自己拥有公开 API
- 参数类型停留在 feature 内部边界
- `shared` 不需要认识每个业务 modal 的名字和参数形状

### 3.4 运行时和视觉壳分离

Modal 基座必须拆成两层：

- `shared/lib/modal`
  - headless runtime
  - store
  - imperative service
  - 生命周期状态
- `shared/ui/modal`
  - React 渲染
  - backdrop
  - frame
  - animation
  - gesture

这与当前仓库的 `shared/lib/toast` / `shared/ui/toast` 拆法一致。

---

## 4. 为什么不使用第三方 Modal 管理库

### 4.1 不使用第三方管理框架的原因

当前仓库已经具备实现 Modal 基座所需的主要底层能力：

- `expo-blur`
- `expo-glass-effect`
- `react-native-gesture-handler`
- `Animated`
- 已有 app 根布局宿主模式

因此没有必要再引入第三方 modal runtime。

不引入第三方框架的主要收益：

- 避免把外部库 API 形状带入当前仓库
- 避免字符串注册表式设计污染 FSD 边界
- 避免未来业务层被 `modal name + params` 绑定
- 更容易让基座精确贴合当前主题系统和 overlay 约束

### 4.2 仍然继续使用的底层原语

不使用第三方 modal framework，不等于一切从零开始。

当前基座仍然直接依赖：

- `expo-blur`
- `expo-glass-effect`
- `react-native-safe-area-context`
- `react-native-gesture-handler`
- React Native `Animated`

也就是说：

- **架构和运行时自己实现**
- **平台视觉和交互原语继续复用现有依赖**

---

## 5. 在当前仓库中的最优 FSD 落点

### 5.1 目录设计

建议新增以下结构：

```text
src/
  shared/
    lib/
      modal/
        README.md
        index.ts
        types.ts
        store.ts
        service.ts
    ui/
      modal/
        README.md
        index.ts
        ModalHost.tsx
        ModalBackdrop.tsx
        ModalFrame.tsx
        modal-animation.ts
        modal-gesture.ts
        modal-layout.ts
        types.ts
```

### 5.2 各层职责

#### `shared/lib/modal`

负责：

- 维护模块级 modal stack
- 暴露 `present / dismiss / dismissTop / clear`
- 定义 stack item、presentation、phase 等通用类型
- 暴露供 `ModalHost` 订阅的 store

不负责：

- React 渲染
- blur / glass 视觉
- safe area
- gesture
- 业务参数类型

#### `shared/ui/modal`

负责：

- 根部渲染 modal stack
- 渲染 backdrop
- 渲染 `dialog` / `sheet` 两种 frame
- 执行 enter / exit 动画
- 执行 V1 下滑关闭
- 屏蔽非顶层 modal 的交互

不负责：

- 持有全局 stack 状态
- 暴露业务 API
- 决定具体业务内容

#### `src/app/_layout.tsx`

负责：

- 挂载唯一 `ModalHost`

不负责：

- 注册具体业务 modal
- 解析业务参数
- 做 modal 行为编排

---

## 6. 与当前仓库现有能力的对齐方式

### 6.1 与 Toast 架构对齐

当前仓库已有一个很好的 app 级 overlay 参考实现：

- `shared/lib/toast`
- `shared/ui/toast`
- `src/app/_layout.tsx` 中挂 `ToastHost`

Modal 基座应复用这条成熟路线：

- `shared/lib/modal` 对齐 `shared/lib/toast`
- `shared/ui/modal` 对齐 `shared/ui/toast`
- `ModalHost` 对齐 `ToastHost`

差异在于：

- toast 是短生命周期、纯展示型 overlay
- modal 是可承载业务交互、按钮、回调和复杂内容的 overlay

因此 modal 不能退化为“toast 的放大版”，但其宿主和 runtime 拆法可以与 toast 保持一致。

### 6.2 与 Editorial Paper 主题对齐

当前仓库正式主题入口是：

- `src/shared/theme/editorial-paper`

当前已有 glass 原语是：

- `src/shared/ui/editorial-paper/AdaptiveGlass`

因此 modal 视觉实现应建立在当前主题原语之上，而不是重新引入第二套 blur / glass 体系。

这意味着：

- `ModalFrame` 内部优先消费 `AdaptiveGlass`
- modal 的边框、背景、半透明度、圆角和 padding 应来自当前主题 token
- 不允许为 modal 单独引入一套独立 theme 入口

### 6.3 与现有页面 overlay 约束对齐

当前仓库已明确区分：

- app 级全局 overlay：toast
- 页面内部局部 overlay：fullscreen video HUD 等

modal 基座属于 app 级全局 overlay，与 toast 同级，但用途不同。

需要明确：

- modal 不进入 `editorial-paper/` 作为普通页面原语
- modal 也不进入页面级 widget
- modal host 只挂在 app 根部

---

## 7. V1 实现范围

### 7.1 V1 要做的能力

V1 要提供以下能力：

#### 展示能力

- 支持从业务代码触发全局 modal
- 支持栈式展示多个 modal
- 只允许顶层 modal 响应 backdrop 和 gesture
- 关闭顶层后展示下一层

#### 呈现类型

- `dialog`
  - 居中显示
  - 固定最大宽度
  - 适合解释、确认、信息型内容
- `sheet`
  - 底部贴边显示
  - 全宽或近全宽
  - 顶部圆角
  - 适合设置、选择和操作列表

#### 动画能力

- backdrop fade in / fade out
- dialog:
  - opacity
  - scale
  - 轻微上浮或下落位移
- sheet:
  - 从底部滑入
  - 向底部滑出

#### 交互能力

- 点击 backdrop 关闭
- sheet 支持下滑关闭
- 低于阈值时回弹
- 支持显式禁用 backdrop dismiss

#### 内容能力

- 内容区可承载任意 React 节点
- 可包含按钮、表单、事件回调
- 可通过 `dismiss()` 主动关闭自己

### 7.2 V1 明确不做的能力

- 不做 `custom` 任意布局模式
- 不做多 detent sheet
- 不做半屏 / 全屏 detent 切换
- 不做 Promise 返回值协议
- 不做全局字符串业务注册表
- 不做复杂 stacked card 联动动画
- 不做 sheet 拖拽时的内容 stretch / rubber band 特效

---

## 8. V2 预留设计

虽然当前阶段只做 V1，但基座设计必须能自然扩到 V2。

### 8.1 V2 目标能力

V2 预期支持以下增强：

#### 更强的动画体系

- sheet 拖拽过程中的 backdrop 联动透明度
- dialog / sheet 的 scale 联动
- 顶层和次顶层的 stack 过渡联动
- 更平滑的 velocity-based dismiss
- 顶层关闭时次顶层的微回弹或复位动画

#### 更强的布局体系

- sheet detents
- 内容高度自适应
- 顶层 modal 的 max-height 策略
- 可选支持“接近系统 form sheet”的中号布局

#### 更强的交互体系

- sheet 拖拽与内部滚动的协调
- 关闭前拦截
- 交互锁定
- dismiss reason 传递

#### 更强的结果协议

- 可选 Promise 风格 presenter
- 例如选择器类 modal 返回最终选择结果
- 支持取消、确认、超时等结束态

#### 更强的调试能力

- `debugLabel`
- stack inspection
- 开发态日志
- 测试态简化动画

### 8.2 V2 为什么现在不做

V2 里的能力大部分都与：

- 更复杂的 gesture 协调
- 更复杂的 stacked transition
- 更复杂的结果协议

强相关。

如果在基座第一版就把这些能力全部实现，会导致：

- runtime 过重
- API 过早抽象
- feature 侧还没接业务前就锁死接口

因此当前最优策略是：

- **文档上完整设计 V2**
- **实现上只落 V1 的可验证闭环**

---

## 9. 推荐 API 设计

### 9.1 底层 runtime API

`shared/lib/modal` 建议提供如下最小 API：

```ts
type ModalPresentation = 'dialog' | 'sheet';

type ModalDescriptor = {
  id?: string;
  debugLabel?: string;
  presentation: ModalPresentation;
  dismissOnBackdropPress?: boolean;
  render: (context: {
    dismiss: () => void;
    dismissAll: () => void;
    isTopMost: boolean;
  }) => React.ReactNode;
};

type ModalService = {
  present: (descriptor: ModalDescriptor) => string;
  dismiss: (id: string) => void;
  dismissTop: () => void;
  clear: () => void;
};
```

### 9.2 为什么 descriptor 比字符串注册更好

不采用：

```ts
openModal('PlaybackSettingsModal', params);
```

而采用：

```ts
modal.present({
  debugLabel: 'playback-settings',
  presentation: 'sheet',
  render: ({ dismiss }) => (
    <PlaybackSettingsModalContent onClose={dismiss} />
  ),
});
```

原因是：

- 不需要 app 层中心注册
- feature 可以直接拥有自己的 props 类型
- `shared` 不需要知道任何业务参数
- 更适合未来承载按钮、回调和异步行为

### 9.3 业务层推荐调用方式

未来业务层不建议直接到处写 `present({ ... })`，而是各 feature 提供自己的 presenter：

```ts
function usePresentPlaybackSettingsModal() {
  const modal = useModalController();

  return useCallback(() => {
    modal.present({
      debugLabel: 'playback-settings',
      presentation: 'sheet',
      render: ({ dismiss }) => (
        <PlaybackSettingsModalContent onClose={dismiss} />
      ),
    });
  }, [modal]);
}
```

这样未来业务接入更稳定：

- 页面和 widget 只调用 feature presenter
- feature 自己决定内容组件、props 和行为
- `shared` 只提供显示机制

---

## 10. 视觉设计要求

### 10.1 视觉目标

需要复刻旧项目 `BlurModal` 的核心感受：

- 轻玻璃质感
- 浅色半透明表面
- 柔和边框
- 与背景分离但不过度厚重
- dialog 和 sheet 两种清晰形态差异

### 10.2 V1 视觉实现原则

#### dialog

- 视觉居中
- 使用 `AdaptiveGlass`
- 宽度受屏幕约束，不贴边
- 较大的连续圆角
- 内边距稳定

#### sheet

- 自底部升起
- 顶部大圆角，底部不额外塑形
- 可选顶部 handle
- 内容自然流布局
- 宽度贴满视觉安全范围

#### backdrop

- 使用统一深色半透明 backdrop
- 透明度由动画驱动
- 不做彩色或主题化渐变 backdrop

### 10.3 视觉 token 来源

所有以下信息都应优先来自当前主题系统，而不是 modal 私有硬编码：

- 半透明背景色
- 边框色
- 圆角
- 内容留白
- 文字色
- 句柄颜色

允许 modal 自己有少量专用常量，但必须解释清楚这是“overlay 专属常量”，不是第二套主题系统。

---

## 11. 动画设计

### 11.1 V1 动画规范

#### backdrop

- entering: `0 -> targetOpacity`
- exiting: `current -> 0`

#### dialog

- opacity: `0 -> 1`
- scale: `0.96 -> 1`
- translateY: `12 -> 0`

退出时执行反向动画。

#### sheet

- translateY: `screenHeight -> 0`
- exiting: `0 -> screenHeight`

### 11.2 V1 手势关闭规范

仅 `sheet` 支持拖拽关闭。

规则：

- 向下拖拽才生效
- 未超过阈值时回弹
- 超过阈值时关闭
- velocity 很大时可直接判定为关闭
- 非顶层 sheet 不响应手势

### 11.3 V2 动画扩展规范

V2 中，sheet 拖拽时建议加入：

- backdrop opacity 连续联动
- 顶层 sheet 的 scale / translate 跟手
- 次顶层 modal 轻微 scale 恢复
- release velocity 对 dismiss 决策加权

但这些都属于增强，不影响 V1 基座成立。

---

## 12. 生命周期与状态机

### 12.1 modal item 建议状态

每个 modal item 建议至少经历以下 phase：

- `entering`
- `visible`
- `exiting`

这样可以保证：

- host 能正确执行 enter / exit 动画
- dismiss 不会立即删除节点，避免动画被截断
- 栈更新和动画收尾可以解耦

### 12.2 顶层原则

任意时刻：

- 只有顶层 modal 接受手势和 backdrop 交互
- 非顶层 modal 只保留视觉存在，不响应触摸

### 12.3 关闭语义

V1 至少需要区分以下关闭来源：

- imperative dismiss
- backdrop dismiss
- gesture dismiss
- clear all

V1 不一定要把 reason 全量暴露给业务，但内部状态设计应预留 reason 扩展位。

---

## 13. 使用方式说明

### 13.1 基座层使用方式

业务代码不直接 import `ModalHost` 或 `ModalFrame`。

业务代码只应使用：

- `useModalController()`
- 或 feature presenter

### 13.2 feature presenter 的推荐写法

```ts
export function usePresentExampleDialog() {
  const modal = useModalController();

  return useCallback(() => {
    modal.present({
      debugLabel: 'example-dialog',
      presentation: 'dialog',
      dismissOnBackdropPress: true,
      render: ({ dismiss }) => (
        <ExampleDialogContent onConfirm={dismiss} onCancel={dismiss} />
      ),
    });
  }, [modal]);
}
```

### 13.3 不推荐的使用方式

不推荐：

- 业务代码直接 import `ModalBackdrop`
- 业务代码直接 import `ModalFrame`
- 页面自己维护一套 `visible` 状态拼装全局 modal
- app 层集中手写所有业务 modal 名称

---

## 14. 未来业务 modal 的接入方式

### 14.1 播放设置 modal

未来接入时建议结构：

```text
src/features/playback-settings/
  index.ts
  ui/
    playback-settings-modal-content.tsx
  lib/
    use-present-playback-settings-modal.ts
```

职责：

- `playback-settings-modal-content.tsx`
  - 只负责播放设置内容本体
- `use-present-playback-settings-modal.ts`
  - 负责通过 modal 基座展示为 `sheet`

### 14.2 字幕解释 modal

未来接入时建议结构：

```text
src/features/subtitle-explanation/
  index.ts
  ui/
    subtitle-explanation-modal-content.tsx
  lib/
    use-present-subtitle-explanation-modal.ts
```

关闭恢复播放、高亮清理等行为，应保留在 feature / widget 层，不进入 `shared/lib/modal`。

### 14.3 为什么这样最优

因为业务 modal 的复杂性主要体现在：

- 参数来源
- 关闭副作用
- 与页面内状态协作
- 业务按钮行为

这些都不属于 shared 基座职责。

---

## 15. 测试与验证建议

### 15.1 V1 需要覆盖的测试点

#### `shared/lib/modal`

- `present` 会新增顶部 item
- `dismiss` 只会标记目标 item 为 exiting
- `dismissTop` 只影响顶层
- `clear` 会把所有可见 item 标记为 exiting

#### `shared/ui/modal`

- host 只渲染当前 stack
- 非顶层 modal 不接收交互
- dialog / sheet 使用正确布局
- exit 动画结束后执行 remove

#### 手势

- 下滑不足阈值时回弹
- 下滑超过阈值时关闭
- 非顶层 sheet 不响应 gesture dismiss

### 15.2 当前阶段不要求的验证

当前阶段不要求：

- Promise 返回链路测试
- detent 切换测试
- 多层 stack 联动过渡视觉测试

---

## 16. 文档化维护要求

如果后续实现落地，至少需要同步以下文档：

- `src/shared/lib/modal/README.md`
- `src/shared/ui/modal/README.md`
- 如接口形态影响 app 根布局，也同步 `src/app/_layout.tsx` 附近说明

如果未来引入 V2 能力，也必须明确写清：

- 哪些能力已落地
- 哪些能力仍是预留设计
- V1 与 V2 的行为差异

---

## 17. 最终结论

当前仓库的最优方案不是：

- 继续使用 Modalfy
- 继续沿用字符串注册表
- 或直接用 Expo Router route modal 代替业务 overlay

当前最优方案是：

1. 在 `shared/lib/modal` 实现 headless runtime
2. 在 `shared/ui/modal` 实现 `dialog | sheet` 两种全局 overlay 壳
3. 在 `src/app/_layout.tsx` 挂唯一 `ModalHost`
4. 业务未来通过各自 feature presenter 接入
5. 当前阶段只落 V1
6. 文档提前完整覆盖 V2

这样可以同时满足：

- 复刻旧项目 BlurModal 的视觉和动画能力
- 保留未来业务交互扩展空间
- 不继承旧项目的架构问题
- 与当前仓库的 FSD、Toast 分层、Editorial Paper 主题保持一致

