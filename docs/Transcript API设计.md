# Transcript API 设计

## 1. 文档目标

本文档用于定义当前项目 `transcript` 读取接口的设计基线。

这份文档当前只覆盖两部分：

- `transcript` 读取 API 契约
- 当前阶段的 mock transcript 设计

本轮明确 **不覆盖**：

- transcript 的 React Query 接入
- subtitle / transcript UI
- 可点击字幕 overlay 的交互与布局
- transcript 与播放器时间同步策略

这些内容后续由独立文档补充；本轮先把 API 与 mock 真值收稳。

相关文档：

- Fullscreen 场景下的 transcript source/read/cache 设计见 [Fullscreen Transcript Source设计规范](./Fullscreen%20Transcript%20Source设计规范.md)
- 视频真值与 runtime 分层见 [Video 真值与 Runtime 设计规范](./Video%20真值与%20Runtime%20设计规范.md)

## 2. 适用范围与优先级

本文档适用于：

- `src/entities/transcript`
- `src/shared/api`
- `features/transcript-source` 的 entity 边界依赖
- 当前 transcript mock 资源组织方式
- 未来真实后端与当前 mock repository 的 transcript 契约对齐

需要特别说明两点：

1. 当前 transcript 样例已经统一为 `snake_case`。
2. 如果后续 UI 或 overlay 文档继续混用 `subtitle` / `transcript` 两个词，在 **数据资源与 API 契约** 上以本文档为准：资源名统一使用 `transcript`。

## 3. 核心结论

当前 transcript API 的目标设计如下：

1. 它是视频的子资源读取接口。
2. 它以 `videoId` 作为唯一请求参数。
3. 它的请求参数放在 path 上，不放在 query string。
4. 传输层返回体保持样例的 `snake_case` 结构。
5. repository 在边界处把 `snake_case DTO` 映射为前端内部使用的 `camelCase domain model`。
6. 当前 mock transcript 与 mock feed 必须共用同一套 `clip 1..8` 映射逻辑，不允许各自复制一份规则。

也就是说，本轮的稳定契约是：

- 远程资源身份：`GET /videos/:videoId/transcript`
- 传输形态：`snake_case`
- 前端领域形态：`camelCase`
- mock 素材复用：按 `videoId` 尾部数字映射到 `clip 1..8`

## 4. 为什么资源名统一使用 `transcript`

当前样例数据并不是简单的展示型字幕。

它包含：

- 句子级文本
- 句子级 explanation
- token 级 explanation
- token 级时间范围
- `semantic_element`

因此它本质上更接近：

- `annotated transcript`

而不是：

- 只用于画面展示的一层 `subtitle text`

所以这一层 API 统一命名为：

- `transcript`

后续如果 UI 继续把底部文字区称为 `subtitle overlay`，那是交互层命名，不影响这里的数据资源命名。

## 5. 请求契约

### 5.1 请求方式

- `GET /videos/:videoId/transcript`

### 5.2 请求参数

当前只接受一个参数：

- `videoId`

并且它必须放在 path 上，例如：

```http
GET /videos/the-office-health-care-video-1/transcript
```

### 5.3 当前版本明确不接受

- query string 形式的 `videoId`
- `cursor`
- `page`
- `offset`
- `limit`
- `language`
- `include_tokens`
- `include_explanations`

原因是：

- 当前 transcript 是单视频单资源读取
- 当前样例即完整 transcript 形态
- 本轮先把主资源契约定稳，不做按需裁剪和分页

## 6. 响应契约

### 6.1 顶层结构

当前样例的顶层结构如下：

```ts
type TranscriptResponseDto = {
  sentences: TranscriptSentenceDto[];
};
```

当前顶层只有一个字段：

- `sentences`

本轮不额外增加：

- `video_id`
- `language`
- `version`
- `updated_at`

如果后续真实后端确实需要版本号或语言元信息，再单独扩展。

### 6.2 Sentence DTO 结构

```ts
type TranscriptSentenceDto = {
  index: number;
  text: string;
  explanation: string;
  tokens: TranscriptTokenDto[];
  start: number;
  end: number;
};
```

字段语义：

- `index`
  - 当前句子的稳定顺序编号
  - 当前约定为 `0-based`
- `text`
  - 句子原文
- `explanation`
  - 句子级中文解释或说明
- `tokens`
  - 句子内部 token 数组
- `start`
  - 句子起始时间，单位毫秒
- `end`
  - 句子结束时间，单位毫秒

### 6.3 Token DTO 结构

```ts
type TranscriptTokenDto = {
  index: number;
  text: string;
  explanation: string;
  semantic_element: TranscriptSemanticElementDto;
  start: number;
  end: number;
};
```

字段语义：

- `index`
  - token 在当前句子内的顺序编号
  - 当前约定为 `0-based`
- `text`
  - token 原文
- `explanation`
  - token 级解释
- `semantic_element`
  - token 对应的语义单元
- `start`
  - token 起始时间，单位毫秒
- `end`
  - token 结束时间，单位毫秒

### 6.4 Semantic Element DTO 结构

```ts
type TranscriptSemanticElementDto = {
  base_form: string;
  dictionary: string;
  coarse_id: number | null;
  reason: string;
};
```

字段语义：

- `base_form`
  - token 或短语对应的基础形式
- `dictionary`
  - 字典释义或业务短义
- `coarse_id`
  - 当前语义单元映射到 coarse unit 的 id
  - 允许为 `null`
- `reason`
  - 当前映射或不映射的解释原因

### 6.5 关于 `snake_case`

当前样例已统一为 `snake_case`，因此传输层在当前版本明确采用：

- `semantic_element`
- `base_form`
- `coarse_id`

而不是：

- `semanticElement`
- `baseForm`
- `coarseId`

这是 API 契约真值，不建议在 transport 层做混用。

## 7. 前端领域模型与边界

### 7.1 为什么 transport 和 domain 不应共用同一套类型

当前仓库内部领域类型普遍使用 `camelCase`，例如 feed 的 `videoId`、`coverImageUrl`、`durationSeconds`。

如果 transcript 直接把 `snake_case` 泄漏到 UI / feature / widget 层，会出现：

- `semantic_element`
- `base_form`
- `coarse_id`

和现有代码风格明显不一致，也会让后续状态与渲染代码混入双命名体系。

因此本轮建议明确拆成两层：

- DTO：对齐后端和 mock fixture，使用 `snake_case`
- Domain：对齐前端内部代码风格，使用 `camelCase`

### 7.2 推荐的 Domain 结构

```ts
type Transcript = {
  sentences: TranscriptSentence[];
};

type TranscriptSentence = {
  index: number;
  text: string;
  explanation: string;
  tokens: TranscriptToken[];
  start: number;
  end: number;
};

type TranscriptToken = {
  index: number;
  text: string;
  explanation: string;
  semanticElement: TranscriptSemanticElement;
  start: number;
  end: number;
};

type TranscriptSemanticElement = {
  baseForm: string;
  dictionary: string;
  coarseId: number | null;
  reason: string;
};
```

### 7.3 repository 的职责

`entities/transcript/api/transcript-repository.ts` 对外只暴露：

```ts
fetchTranscript(videoId: string): Promise<Transcript>
```

也就是说：

- `shared/api` 只负责 `requestJson(...)`
- transcript repository 负责：
  - 发起请求
  - 处理 mock / 真实实现切换
  - 把 DTO 映射为 Domain

当前 page / feature / widget 不应直接消费 raw DTO。

## 8. 目录建议

当前推荐结构如下：

```text
src/entities/transcript/
  index.ts
  README.md
  model/
    dto.ts
    types.ts
    mappers.ts
  api/
    transcript-repository.ts
    mock-transcript-repository.ts

src/entities/video/model/
  mock-clip-catalog.ts
```

说明：

- `dto.ts`
  - 保存 `snake_case` transport 类型
- `types.ts`
  - 保存前端内部 `camelCase` domain 类型
- `mappers.ts`
  - 负责 DTO -> Domain
- `transcript-repository.ts`
  - 对外的 transcript 读取 facade
- `mock-transcript-repository.ts`
  - 当前 mock 实现
- `entities/video/model/mock-clip-catalog.ts`
  - feed mock 与 transcript mock 共用的 clip 槽位真值
  - 统一提供 `videoId -> clip 1..8` 映射

## 9. 当前 mock 的核心问题

### 9.1 当前 feed mock 的真实结构

当前 mock feed 并不是“无限个真实视频资源”，而是：

- 8 个真实 clip 素材槽位

但对外暴露的是不断递增的 `videoId`：

- `the-office-health-care-video-1`
- `the-office-health-care-video-2`
- ...
- `the-office-health-care-video-9`

也就是说：

- `videoId` 是前端业务 id
- 底层 clip 资源只有 `1..8`

这意味着 transcript mock **不能** 直接把 `videoId` 当成 transcript 文件名。

### 9.2 当前 transcript mock 需要解决的问题

当前 transcript URL 资源的实际形式是：

```txt
https://storage.googleapis.com/videos2077/test-video/transcript/The%20Office%20(US)%20(2005)%20-%20S01E03%20-%20Health%20Care%20(1080p%20BluRay%20x265%20Silence)-clip1.json
```

也就是说 transcript 真正对应的是：

- `clip1.json`
- `clip2.json`
- ...
- `clip8.json`

因此 transcript mock 的关键不是“直接按 `videoId` 找文件”，而是：

- 先把 `videoId` 映射到 `clipNumber 1..8`
- 再命中 transcript 资源

## 10. mock 的推荐结构

### 10.1 不要让两个 mock 各自维护一份映射规则

当前最容易出错的做法是：

- feed mock 自己维护 `sequence -> clipNumber`
- transcript mock 自己再写一份 `videoId -> clipNumber`

这种结构短期能跑，但后续非常容易漂移。

因此本轮建议明确：

- mock feed
- mock transcript

都必须依赖 **同一个共享 mock clip catalog**

### 10.2 推荐的共享 mock clip catalog

建议抽一个中立模块，负责描述当前 8 个 clip 槽位。

它不应只属于 `feed`，也不应只属于 `transcript`。

推荐它至少包含：

```ts
type MockClipAsset = {
  clipNumber: number;
  coverImageUrl: string;
  videoUrl: string;
  transcriptUrl: string;
};
```

当前 transcriptUrl 形态应与真实 mock URL 保持一致：

```txt
https://storage.googleapis.com/videos2077/test-video/transcript/...-clip1.json
```

### 10.3 共享 helper 的职责

共享 helper 至少应提供两种能力：

```ts
resolveMockClipAssetBySequenceNumber(sequenceNumber: number): MockClipAsset
resolveMockClipAssetByVideoId(videoId: string): MockClipAsset | null
```

说明：

- feed mock 当前按批次序号工作，因此更适合调用 `sequenceNumber -> clip asset`
- transcript mock 当前按 `videoId` 工作，因此更适合调用 `videoId -> clip asset`

这两条路径最终都必须落到同一份 `clip 1..8` catalog。

## 11. `videoId -> clipNumber` 的映射规则

### 11.1 推荐规则

不要取“最后一个字符”，而是解析 `videoId` 尾部完整数字。

推荐规则为：

```ts
sequenceNumber = parseTrailingInteger(videoId)
clipNumber = ((sequenceNumber - 1) % 8) + 1
```

例如：

- `the-office-health-care-video-1 -> clip1`
- `the-office-health-care-video-8 -> clip8`
- `the-office-health-care-video-9 -> clip1`
- `the-office-health-care-video-16 -> clip8`

### 11.2 为什么不能只看最后一位

如果只看最后一个字符：

- `video-10` 会被错误映射到 `clip0`
- `video-18` 会被错误映射到 `clip8`，但语义是偶然对了
- 规则不具备可解释性

因此当前版本必须以“尾部完整数字”作为唯一合法映射输入。

### 11.3 非法 `videoId` 的处理

如果 `videoId`：

- 为空
- 没有尾部数字
- 数字解析失败

当前 mock transcript 应直接返回 `not found` 或明确错误，而不是静默 fallback 到 `clip1`。

原因是：

- 这类 fallback 会掩盖数据问题
- UI 会错误地展示别的视频 transcript

## 12. mock transcript 的读取流程

当前推荐流程如下：

```text
videoId
-> resolveMockClipAssetByVideoId(videoId)
-> transcriptUrl
-> fetch(transcriptUrl)
-> TranscriptResponseDto
-> mapTranscriptDtoToDomain(...)
-> Transcript
```

这里有两个关键要求：

1. mock transcript 的资源身份应优先以 `transcriptUrl` 表达，而不是直接写死 `if videoId === ...`
2. 当前 mock transcript 直接读取公共 GCS transcript URL，不在 repo 内复制 `clip1..8` transcript 文件

### 12.1 为什么当前 mock 不 vendoring transcript JSON

当前实现选择：

- 共享 `mock clip catalog` 负责产出稳定的 `transcriptUrl`
- mock transcript 直接使用该远程 URL 读取数据
- 自动测试通过 stub `fetch` 保持无网络依赖

这样做的原因是：

- mock 素材身份继续由公共资源 URL 表达
- repo 不需要额外保存 8 份大型 transcript fixture
- 自动测试仍然可以稳定验证：
  - `videoId -> clipNumber` 映射
  - URL 选择
  - DTO -> domain 映射

需要明确一点：

- 运行时代码里的 mock transcript 允许实际出网
- 自动测试不允许真实出网

### 12.2 为什么 mock transcript 不走 `shared/api/requestJson`

当前 transcript mock 读取的是：

- 绝对公共 GCS URL

它不是项目正式业务 API 的 path 型请求，因此当前实现不经由：

- `shared/api/requestJson(...)`

而是直接：

- `fetch(transcriptUrl)`

如果未来 transcript 切换到真实业务后端，再由 repository 在边界处切换到：

- `GET /videos/:videoId/transcript`
- `requestJson(...)`

## 13. 为什么不把 `transcriptUrl` 塞进 `FeedItem`

当前不建议因为 mock 方便，就把 `transcriptUrl` 加进 feed item。

原因是：

- feed item 当前只承载卡片和 fullscreen 基础元数据
- transcript 是视频的独立子资源
- `videoId -> transcript` 才是后续更稳定的真实 API 语义
- 如果为了 mock 方便先把 `transcriptUrl` 混进 feed，后续很容易把临时字段变成长期协议负担

因此当前 mock 内部允许有 `transcriptUrl`，但它应存在于共享 mock clip catalog，而不是公开 feed 契约里。

## 14. 当前阶段的非目标

本轮明确不做以下事情：

- 不新增 transcript query hook
- 不新增 subtitle overlay UI
- 不新增 transcript 分页
- 不新增按 language 切换 transcript
- 不新增 sentence / token 的拆分接口
- 不新增 transcript version 管理
- 不新增 transcript 与播放器时间同步的数据层

## 15. 测试清单

当前文档建议最少覆盖以下测试：

### 15.1 API / repository 测试

- `fetchTranscript(videoId)` 会命中 transcript repository facade
- 当前 facade 对外语义固定为 `videoId -> transcript`
- DTO 会被正确映射为 camelCase domain

### 15.2 mock transcript 测试

- `video-1` 命中 `clip1`
- `video-8` 命中 `clip8`
- `video-9` 复用 `clip1`
- `video-16` 复用 `clip8`
- 没有尾部数字的 `videoId` 返回 not found

### 15.3 mock 网络测试

- 自动测试统一 stub `fetch`
- 验证命中的 URL 是 `.../transcript/...-clip{n}.json`
- 验证测试不真实出网

### 15.4 共享 mock catalog 测试

- feed mock 与 transcript mock 使用同一份 clip catalog
- `resolveMockClipAssetBySequenceNumber` 与 `resolveMockClipAssetByVideoId` 对同一逻辑槽位返回一致结果
- transcriptUrl 与当前 mock URL 命名规范对齐

## 16. 最终建议

如果当前只做 API 与 mock，那么最佳落地方案就是：

1. 新增 `entities/transcript`
2. API 契约固定为 `GET /videos/:videoId/transcript`
3. transport 层保留 `snake_case`
4. repository 边界统一转换为 `camelCase`
5. feed mock 与 transcript mock 共用一份 `mock clip catalog`
6. `videoId -> clipNumber` 的规则只允许存在于一个共享 helper 中

一句话收口：

- `videoId` 是业务主键
- `clip 1..8` 是 mock 素材槽位
- `transcript` 是视频子资源
- DTO 和 Domain 必须分层

这就是当前阶段最稳的 transcript API 与 mock 设计基线。
