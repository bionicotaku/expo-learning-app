# Feed API 设计

## 1. 文档目标

本文档用于定义当前项目 `feed` 读取接口的当前设计基线。

这份文档只覆盖一个接口：

- `feed` 列表读取

其他业务接口，例如：

- 视频详情
- like / favorite 写接口
- 历史
- 沉淀区

本轮都不纳入本文档，后续再分别补充。

## 2. 适用范围与优先级

本文档适用于：

- `src/entities/feed`
- `src/features/feed-*`
- `src/pages/feed`
- `src/pages/video-detail`
- 未来真实后端与当前 mock repository 的 feed 契约对齐

需要特别说明两点：

1. 当前仓库实现已经按本文档对齐到无状态 batch 读取语义。
2. 如果其他旧文档仍然把 feed 描述成“带分页参数、带 `nextOffset/hasMore` 的接口”，在 **feed API 契约** 这一点上以本文档为准。

## 3. 核心结论

当前 feed API 的目标设计如下：

1. 它不是分页接口。
2. 它不接受任何请求参数。
3. 返回体只有一层：`items`。
4. 每个 item 直接携带当前卡片和视频页所需的核心展示字段。
5. 服务端决定每次返回多少条；当前 mock 每次返回 `8` 条。

也就是说，接口语义从：

- “按 `offset/limit` 取下一页”

调整为：

- “读取当前一批无状态的 feed items”

## 4. 请求契约

### 4.1 请求方式

- `GET /feed`

### 4.2 请求参数

当前版本明确 **不接受** 以下参数：

- `offset`
- `limit`
- `cursor`
- `page`
- 任意筛选参数
- 任意排序参数

当前约束是：

- 返回条数由服务端决定
- 前端不传“下一页”参数
- 前端不控制单页大小
- 前端允许重复请求同一个接口，并在本地把多次返回结果续接成共享 source

### 4.3 为什么不暴露分页语义

这一版 feed API 的目标不是先把“连续无限流”协议做复杂，而是先把：

- 列表卡片字段
- 视频基础元数据
- 用户态布尔状态
- 封面图 fallback 规则

收成一个稳定、简单、可替换的读取契约。

因此这一版先明确不做：

- cursor 语义
- 返回 `hasMore`
- 返回“第几页”
- 返回“总页数”

连续下滑体验仍然可以保留，但那属于前端共享 source 的续接策略，不属于 API 契约本身。

## 5. 响应契约

### 5.1 顶层结构

```ts
type FeedResponse = {
  items: FeedItem[];
};
```

### 5.2 Item 结构

```ts
type FeedItem = {
  videoId: string;
  title: string;
  description: string;
  videoUrl: string;
  coverImageUrl?: string | null;
  durationSeconds: number;
  viewCount: number;
  tags: string[];
  isLiked: boolean;
  isFavorited: boolean;
};
```

### 5.3 字段语义

#### `videoId`

- 当前视频的稳定标识
- 用于列表 key、路由跳转、视频页进入定位、返回列表恢复定位
- 它是 feed item 的主标识，不再额外要求单独的 `feedItemId`

#### `title`

- 视频标题
- 当前直接作为卡片底部主标题

#### `description`

- 视频描述
- 语义上替代旧实现里的 `subtitle`
- 当前列表页不强制展示，但视频页 overlay 和后续详情区可直接复用

#### `videoUrl`

- 视频资源地址
- 当前视频页播放直接使用这个字段

#### `coverImageUrl`

- 卡片封面图地址
- 可选字段
- 允许为 `null`
- 允许缺省

#### `durationSeconds`

- 视频时长，单位秒
- 使用原始数值，而不是展示字符串
- 页面层负责格式化成当前卡片所需的 `1:12`、`2:40` 这类文案

#### `viewCount`

- 总观看数
- 使用原始数值，而不是展示字符串
- 页面层负责格式化成当前卡片所需的 `7.8k`、`12.4k` 这类文案

#### `tags`

- 当前视频的标签集合
- 当前卡片至少消费其中一个标签作为 tag pill 文案
- 推荐按“最重要的标签在前”返回

#### `isLiked`

- 当前用户是否已 like
- 属于用户态布尔字段
- 本轮先作为读取字段进入 feed item，后续再单独定义写接口

#### `isFavorited`

- 当前用户是否已收藏
- 命名对齐当前仓库里已有的 `favorite` 语义
- 本轮先作为读取字段进入 feed item，后续再单独定义写接口

## 6. 字段取舍说明

### 6.1 为什么 `durationSeconds` 和 `viewCount` 用原始数值

当前文档选择：

- `durationSeconds: number`
- `viewCount: number`

而不是：

- `durationText: string`
- `viewCountText: string`

原因是：

- 原始值更稳定，便于排序、统计和后续复用
- 页面可以根据当前 UI 需要自行格式化
- 避免后端把当前一版卡片文案硬编码成长期协议

如果后续产品明确要求“展示文案完全由服务端决定”，再增加展示型字段即可；当前不建议直接把 raw value 换成 display string。

### 6.2 为什么不单独保留 `assetId`

当前这版 API 不再暴露 `assetId`。

原因是：

- 当前前端真正稳定依赖的是 `videoId`
- 当前业务读取目标是视频卡片和视频页消费，不是素材仓储管理
- 如果未来确实需要独立的底层素材标识，应在更明确的媒体模型中单独引入，而不是继续把 mock 阶段的 `assetId` 留在主 feed item 契约里

## 7. 与当前 UI 的映射关系

### 7.1 Feed 卡片

当前卡片四个核心展示字段按以下规则映射：

- `title`
  - 对应卡片底部标题
- `viewCount + durationSeconds`
  - 对应左上角 stats 胶囊
- `tags`
  - 对应左下角 tag pill
- `coverImageUrl`
  - 对应卡片封面图

### 7.2 `description` 的位置

`description` 当前不是卡片四个核心展示字段之一。

它属于：

- 视频补充说明
- 后续视频页文字区
- 未来详情区

也就是说，它进 feed item 是为了让列表和视频页共享同一份内容基础数据，而不是因为卡片本轮必须直接显示它。

### 7.3 `isLiked / isFavorited` 的位置

这两个字段当前不要求直接进入卡片主视觉四字段。

它们的作用是：

- 为后续 like / favorite 状态展示提供读模型
- 避免视频页或卡片还要额外再发一份状态读取请求

## 8. 封面图 fallback 规则

当前卡片封面区改为优先使用 `coverImageUrl`。

规则固定如下：

1. 如果 `coverImageUrl` 存在，优先尝试加载图片。
2. 如果字段缺省、为 `null`、为空字符串，直接使用当前色彩块方案。
3. 如果字段存在但图片加载失败，也回退到当前色彩块方案。

这意味着：

- 当前色彩块不是被删除
- 而是从“默认封面”降级为“封面图缺失或失败时的 fallback”

## 9. Mock 实现要求

虽然当前阶段仍然使用 mock，但 mock 必须对齐这份 API 契约。

当前 mock feed 的要求如下：

- 返回 `Promise<FeedResponse>`
- 不接受分页参数
- 当前 mock 每次返回 `8` 条 item
- item 字段完整对齐本文档
- `coverImageUrl` 使用 `https://storage.googleapis.com/videos2077/test-video/cover/...` 这组真实封面资源，并按素材槽位循环复用
- `videoUrl` 使用 `https://storage.googleapis.com/videos2077/test-video/hls/.../playlist.m3u8` 这组真实 HLS 资源，并按素材槽位循环复用
- `videoId` 在跨批次场景下保持全局唯一
- 其余字段使用稳定伪随机派生，保证同一 `videoId` 每次结果一致
- facade 默认保留 `2000ms` mock 网络延迟，用于验证 loading 态

mock 的目标是：

- 模拟真实异步读取行为
- 提前验证页面映射、共享 source 续接和状态边界

mock 的目标 **不是**：

- 继续模拟旧的分页协议
- 继续暴露 `nextOffset` / `hasMore`

## 10. 当前非目标

本轮明确不在 feed API 中定义：

- 分页请求协议
- 预取协议
- like 写接口
- favorite 写接口
- 单独的视频详情接口
- 历史、沉淀区、推荐等其它列表协议

## 11. 示例响应

```json
{
  "items": [
    {
      "videoId": "video-1",
      "title": "How native speakers actually soften a direct request",
      "description": "A short listening clip about sounding less abrupt in daily conversation.",
      "videoUrl": "https://example.com/videos/video-1.mp4",
      "coverImageUrl": "https://example.com/covers/video-1.jpg",
      "durationSeconds": 72,
      "viewCount": 7800,
      "tags": ["PHRASAL VERB", "LISTENING CUE"],
      "isLiked": false,
      "isFavorited": true
    }
  ]
}
```

## 12. 当前实现对齐结论

当前实现已经按以下原则收口：

1. `entities/feed` 的类型和 mock repository 先对齐本文档
2. `features/feed-source` 把重复读取结果续接成共享 source
3. `pages/feed` 在尾部触发下一批读取
4. `pages/video-detail` 在最后 3 条触发下一批读取
5. `widgets/media-feature-card` 继续消费真实字段和封面 fallback
6. `fetchFeed()` facade 默认通过 `2000ms` mock 延迟暴露首屏 loading 行为

目录级 `README.md` 继续负责解释实现边界和文件职责；feed API 契约以本文档为准。
