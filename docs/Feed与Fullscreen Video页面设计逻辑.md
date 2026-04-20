# Feed 与 Fullscreen Video 页面设计逻辑

## 1. 文档目标

本文档定义 `Feed 列表页` 与 `Fullscreen Video 页` 的目标页面关系、交互职责与共享数据模型。

重点回答：

- Feed 与 Fullscreen 为什么是同一内容系统的两种页面投影
- Fullscreen 页面的 row 内结构应该如何组织
- 视频背景区与底部 seek bar control lane 的职责如何分离

相关文档：

- [Fullscreen Video Overlay架构设计规范](./Fullscreen%20Video%20Overlay架构设计规范.md)
- [Fullscreen Video Gesture设计规范](./Fullscreen%20Video%20Gesture设计规范.md)
- [Fullscreen Video Seek Bar Overlay设计规范](./Fullscreen%20Video%20Seek%20Bar%20Overlay设计规范.md)

## 2. 页面关系总览

`Feed 列表页` 与 `Fullscreen Video 页` 不是两套独立产品，而是同一份 feed source 的两种页面投影：

- `Feed 列表页`
  - 负责内容发现、比较与进入
- `Fullscreen Video 页`
  - 负责沉浸式播放、连续浏览与播放中交互

## 3. Feed 列表页职责

列表页继续承担：

- 浏览卡片流
- 下拉刷新
- 尾部续接
- 点击卡片进入 fullscreen
- 返回后恢复 anchor

列表页不承担：

- 背景手势播放控制
- seek bar
- fullscreen row HUD

## 4. Fullscreen Video 页面结构

fullscreen 的目标结构固定为：

1. `RowPlaybackMediaLayer`
2. `RowPlaybackInteractionLayer`
3. `RowOwnedVideoOverlay`
4. `RowPlaybackHudOverlay`
5. `RowSurfaceStatusOverlay`
6. `Page shell overlays`

其中：

- `RowPlaybackMediaLayer`
  - 承载播放器与真实进度快照
- `RowPlaybackInteractionLayer`
  - 是 row 内唯一交互 owner
  - 内部分成：
    - `BackgroundGestureRegion`
    - `SeekBarControlLane`
- `RowOwnedVideoOverlay`
  - 承载标题、说明、右侧动作列与底部 scrim
- `RowPlaybackHudOverlay`
  - 承载 pause / seek / `2x` HUD
- `RowSurfaceStatusOverlay`
  - 承载 loading / error / retry

## 5. Fullscreen 页面交互职责

fullscreen 页固定承担：

- 当前视频有声自动播放
- 上下滑动切换视频
- 系统右滑返回
- 视频背景区 `single tap` 切 pause/resume
- 视频背景区 `double tap` 做 `-5s / +5s`
- 视频背景区 `long press` 做临时 `2x`
- 底部 seek bar lane 做：
  - rail + thumb 的 `tap-to-seek`
  - drag preview
  - release commit

### 5.1 背景区职责

视频背景区只负责：

- pause / resume
- `±5s`
- 临时 `2x`

### 5.2 底部 control lane 职责

底部 seek bar control lane 只负责：

- 当前时间预览
- rail + thumb 定位
- 绝对 seek

它不属于背景点击区，因此：

- 不触发 pause
- 不触发背景双击 `±5s`
- 不触发背景长按 `2x`

## 6. Shared Feed Source

`Feed 列表页` 与 `Fullscreen Video 页` 必须继续共享同一份 feed source：

- `feed items`
- source state
- query cache
- `id -> index`
- 当前已加载尾 item 与续接状态

这意味着：

- fullscreen 不是独立播放器数据源
- feed 返回定位仍以同一份 source 为准

## 7. 目标结构中的关键设计结论

fullscreen 的目标页面逻辑固定采用：

- row-local media layer
- row-local single interaction owner
- row-local content / HUD / surface status overlays
- page shell 只保留 pager 级 UI

不再采用：

- 独立的 `ActiveVideoGestureSurface`
- seek bar 通过 bridge 与背景层协调
- 底部 lane 被视为背景区的一部分

## 8. 成功标准

页面逻辑只有同时满足以下条件，才算正确：

1. Feed 与 Fullscreen 继续共享同一份 source
2. Fullscreen row 内只存在一个正式 interaction owner
3. 视频背景区与 seek bar control lane 的职责完全分离
4. 底部 control lane 不再属于背景点击区
5. 页面级与 row 级 UI 边界清晰，不再靠 bridge 协调手势
