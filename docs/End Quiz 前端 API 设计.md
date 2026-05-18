# End Quiz 前端 API 设计

## 1. 文档目标

本文档定义前端接入后端 `POST /api/videos/end-quiz` 的 API 设计、缓存规则、重试策略和 fullscreen 播放流转方式。

后端权威契约来自：

- `/Users/evan/Code/learning-app/learning-video-recommendation-system/docs/API/End-Quiz-批量取题API-MVP设计.md`

相关前端文档：

- [Feed API设计](./Feed%20API%E8%AE%BE%E8%AE%A1.md)
- [Feed与Fullscreen Video页面设计逻辑](./Feed%E4%B8%8EFullscreen%20Video%E9%A1%B5%E9%9D%A2%E8%AE%BE%E8%AE%A1%E9%80%BB%E8%BE%91.md)
- [网络层与事件上报规范](./%E7%BD%91%E7%BB%9C%E5%B1%82%E4%B8%8E%E4%BA%8B%E4%BB%B6%E4%B8%8A%E6%8A%A5%E8%A7%84%E8%8C%83.md)
- [Modal 基座设计与使用文档](./Modal%20%E5%9F%BA%E5%BA%A7%E8%AE%BE%E8%AE%A1%E4%B8%8E%E4%BD%BF%E7%94%A8%E6%96%87%E6%A1%A3.md)

本文只设计取题与展示编排，不设计 quiz attempt 上报。用户答题结果后续仍应通过后端学习事件 / quiz attempt API 单独上报。

## 2. 核心结论

End Quiz 在前端属于 fullscreen video 场景里的 `interactive-read`：

- 它读取用户即将看到的题目。
- 它无副作用。
- 它允许内存缓存。
- 它允许有限自动重试。
- 它失败时不阻断视频播放。

当前设计固定为：

- API 层新增 `entities/end-quiz`，保持后端请求 / 响应契约；当前 MVP 仍使用 mock repository，不接真实网络。
- End Quiz mock 数据源与当前 feed mock learning units 来源一致，来自 `/Users/evan/Code/learning-app/simple-audio-processing/resource/The Office BD/feed_learning_units/*.json`。
- 实现时应手动读取上述每个 JSON 文件，把其中所有带 `question` 字段的题目复制进源码静态表，构建为对应 clip / video 的 mock End Quiz 数据。
- 编排层新增 `features/video-end-quiz`，负责缓存、重试、toast、映射 choice-question 和视频结束流转。
- `features/choice-question` 继续只做选择题 dialog 展示，不发 API，不持有缓存，不决定何时切下一个视频。
- `FullscreenVideoSession` 在进入视频和 active video 切换时预取题目。
- `FullscreenVideoPager` 在视频结束时先等待 end quiz 处理完成，再切换到下一个视频。

## 3. 后端 API 契约

### 3.1 Endpoint

```http
POST /api/videos/end-quiz
Content-Type: application/json
Authorization: Bearer <token>
```

`user_id` 不由前端传。取题 API 本身不依赖用户身份做选择，但后端要求统一认证，避免匿名客户端批量读取题库。

### 3.2 Request

```ts
type EndQuizRequest = {
  video_id: string;
  coarse_unit_ids: number[];
  recommendation_run_id?: string;
  client_context?: {
    platform?: string;
    app_version?: string;
    os_version?: string;
    device_model?: string;
  };
};
```

字段说明：

- `video_id`：当前 fullscreen active 视频 ID，来自 `VideoListItem.videoId`。
- `coarse_unit_ids`：当前视频本轮 feed learning context 中的学习单元 ID 列表，来自 `VideoListItem.learningUnits[].coarseUnitId`。
- `recommendation_run_id`：当前视频来自 feed 时携带的推荐运行 ID，来自 `VideoListItem.recommendationRunId`。取题不依赖该字段，但后续 quiz attempt 上报应继续带上，用于推荐归因。
- `client_context`：客户端环境信息，使用现有 `getClientEnvironment()` 和 `toAnalyticsClientContext(...)` 生成。

前端发送前应做轻量规整：

- 只取正整数 `coarseUnitId`。
- 按首次出现顺序去重。
- 如果去重后为空，不发送请求，直接视为没有题目。
- 不发送 `role / is_primary / evidence_* / text`，这些字段不参与取题。

### 3.3 Response

```ts
type EndQuizResponse = {
  video_id: string;
  items: EndQuizItem[];
  missing_coarse_unit_ids: number[];
};

type EndQuizItem = {
  coarse_unit_id: number;
  question_id: string;
  source: 'video_context' | 'unit_generic';
  question_type:
    | 'context_meaning_choice'
    | 'context_cloze_choice'
    | 'unit_meaning_choice'
    | 'reverse_identification_choice';
  target_text: string;
  question: string;
  context_text: string | null;
  options: EndQuizOption[];
  explanation: string | null;
  context_sentence_index: number | null;
  context_span_index: number | null;
  context_start_ms: number | null;
  context_end_ms: number | null;
};

type EndQuizOption = {
  option_id: string;
  text: string;
};
```

字段说明：

- `video_id`：请求中的视频 ID。
- `items`：可展示的题目列表。每个 coarse unit 最多返回一道题。
- `missing_coarse_unit_ids`：没有可用题目的学习单元 ID。前端不展示错误，也不为这些 unit 占位。
- `coarse_unit_id`：该题考察的学习单元 ID。后续 quiz attempt 上报必须带回。
- `question_id`：题目稳定 ID。后续 quiz attempt 上报必须带回。
- `source`：题目来源。`video_context` 表示视频上下文题，`unit_generic` 表示通用题 fallback。
- `question_type`：后端题型。
- `target_text`：被考察的词或表达。
- `question`：前端展示的问题文本。
- `context_text`：题目上下文。通用题可以为空。
- `options`：选项列表。前端可以自行打乱展示顺序，但本轮 MVP 可先保持后端顺序。
- `options[].option_id`：稳定选项 ID。正确项固定为 `correct`。
- `options[].text`：选项展示文本。
- `explanation`：答对后的解释。该字段可能为空，前端映射到 choice-question 时必须提供兜底解析内容。
- `context_sentence_index / context_span_index / context_start_ms / context_end_ms`：视频上下文题的定位信息。通用题可以为空。当前展示不消费，但应保留在 domain model 中，供后续点击回看、跳转字幕或上报使用。

## 4. 前端分层

### 4.1 `entities/end-quiz`

推荐新增：

```text
src/entities/end-quiz/
  api/end-quiz-repository.ts
  api/mock-end-quiz-repository.ts
  api/mock-end-quiz-question-data.ts
  model/types.ts
  model/mappers.ts
  README.md
  index.ts
```

职责：

- 定义后端 DTO 和前端 domain type。
- 暴露对齐 `POST /api/videos/end-quiz` 的 repository 入口。
- 当前通过 mock repository 返回本地静态题目数据，不接真实网络。
- 把 snake_case DTO 映射为 camelCase domain model。
- 只处理 End Quiz 领域读模型，不处理播放流转、modal、toast。

不负责：

- 不 import `features/choice-question`。
- 不 import `widgets/fullscreen-video-pager`。
- 不直接调用 toast。
- 不决定是否切换下一个视频。

Repository 入口建议：

```ts
type FetchEndQuizInput = {
  videoId: string;
  coarseUnitIds: number[];
  recommendationRunId?: string;
  signal?: AbortSignal;
};

async function fetchEndQuiz(input: FetchEndQuizInput): Promise<EndQuiz>;
```

实现规则：

- 真实 repository 后续使用 `requestJson`。
- 真实 repository 的 `path` 使用 `/api/videos/end-quiz`。
- 真实 repository 的 `method` 使用 `POST`。
- 真实 repository 的 `auth` 使用 `required`。
- 真实 repository 的 `client_context` 由 repository 内统一附加。
- 当前 MVP facade 指向 `mock-end-quiz-repository.ts`。
- 输入 `coarseUnitIds` 为空时，直接返回 `{ videoId, items: [], missingCoarseUnitIds: [] }`，不打后端。

### 4.2 `features/video-end-quiz`

推荐新增：

```text
src/features/video-end-quiz/
  model/video-end-quiz.ts
  model/use-video-end-quiz.ts
  README.md
  index.ts
```

职责：

- 从 `VideoListItem` 提取取题参数。
- 管理 React Query 内存缓存。
- 管理有限自动重试。
- 管理最终失败 toast。
- 把 `EndQuizItem[]` 映射为 `ChoiceQuestionData[]`。
- 提供 fullscreen session / pager 可调用的预取与视频结束处理函数。

不负责：

- 不实现选择题 UI。
- 不写 quiz attempt。
- 不持久化题目缓存。
- 不把失败状态塞进 row-local playback error overlay。

### 4.3 `features/choice-question`

`choice-question` 仍保持纯展示 feature：

- 接收 `ChoiceQuestionSetDialogData`。
- 展示题组。
- 用户点右上角 `×` 时关闭。
- 用户答完最后一题后关闭。

为满足“modal 消失后再切下一个视频”，需要在现有 presenter 外新增等待能力：

```ts
async function presentChoiceQuestionSetDialogAndWait(
  payload: ChoiceQuestionSetDialogData,
): Promise<boolean>;
```

`boolean` 语义：

- `true`：dialog 成功展示，并且已经完全 dismiss。
- `false`：当前已有其它 singleton modal，选择题未展示。

这要求 shared modal 基座提供最小生命周期回调，例如 `onDidDismiss`。不建议用固定 timeout 模拟关闭完成，因为视频切换必须绑定真实 modal 生命周期。

## 5. Query Key 与缓存语义

### 5.1 Query Key

End Quiz query key 固定为：

```ts
['end-quiz', videoId, ...dedupedCoarseUnitIds]
```

`recommendationRunId` 不进入 query key。

原因：

- 后端取题只依赖 `video_id + coarse_unit_ids`。
- `recommendation_run_id` 只做审计归因，不影响题目选择。
- 同一个视频和同一组 learning units 在不同 feed run 中可以复用同一份题目缓存。

### 5.2 可用缓存定义

End Quiz 的可用缓存不是“query 成功过”，而是：

```ts
cachedResult.items.length > 0
```

规则：

- 上一次成功拿到题目：重新进入视频页或切换 active 视频时直接复用缓存，不重新请求。
- 上一次请求失败：重新请求。
- 上一次请求成功但 `items.length === 0`：重新请求，并用新结果更新缓存。
- 新结果仍然是 `items.length === 0`：可以留在 React Query cache 中，但下一次不把它当作可用缓存，仍会重新请求。

原因：

- `items: []` 表示“当前没有题”，不是长期业务真相。
- 题库可能在后端补齐。
- 用户再次进入同一视频时应有机会拿到新题。

### 5.3 Loader 语义

不要直接使用 `ensureQueryData` 作为唯一入口，因为它会把 `items: []` 当成成功缓存返回。

应提供显式 loader：

```ts
async function loadEndQuizForVideo(item: VideoListItem): Promise<EndQuiz> {
  const key = getEndQuizQueryKey(item);
  const cached = queryClient.getQueryData<EndQuiz>(key);

  if (cached && cached.items.length > 0) {
    return cached;
  }

  return queryClient.fetchQuery({
    queryKey: key,
    queryFn: ({ signal }) => fetchEndQuizForVideo(item, signal),
    staleTime: 0,
    gcTime: 30 * 60 * 1000,
    retry: isRetryableEndQuizFailure,
  });
}
```

`staleTime: 0` 的作用是：当已有空结果缓存时，`fetchQuery` 仍会重新调用 API。

## 6. Mock 数据源

### 6.1 来源文件

当前 End Quiz mock 数据必须来自：

```text
/Users/evan/Code/learning-app/simple-audio-processing/resource/The Office BD/feed_learning_units/
```

该目录当前包含 8 个 Office clip JSON：

```text
clip1.json
clip2.json
clip3.json
clip4.json
clip5.json
clip6.json
clip7.json
clip8.json
```

这些文件也是当前 feed API mock 中每个视频 `learning_units` 的来源。实现时仍然不在运行时读取外部路径，而是手动读取文件内容，把需要的数据复制进 repo 内源码静态表。

### 6.2 抽取规则

每个 JSON 文件是 learning unit 数组。数组项可能有 `question` 字段，也可能没有。

End Quiz mock 只抽取带 `question` 字段的 learning unit：

```ts
type SourceLearningUnitWithQuestion = {
  coarse_unit_id: number;
  text: string;
  question: {
    scope_type: 'video_unit' | 'unit';
    question_type: string;
    coarse_unit_id: number;
    target_text: string;
    context_sentence_index: number | null;
    context_span_index: number | null;
    context_start_ms: number | null;
    context_end_ms: number | null;
    content_payload: {
      question: string;
      context_text: string | null;
      options: { id: string; text: string }[];
      explanation: string | null;
    };
    status: string;
  };
};
```

不应把完整 `question` 对象塞回 Feed API 的 `learning_units`。Feed API 仍只返回 learning unit 展示和 evidence 字段；题目只属于 End Quiz mock repository。

### 6.3 当前可用题目数量

按当前外部 JSON，mock End Quiz 可用题目如下：

| Clip | 题目数 | `coarse_unit_id:text:question_type` |
| --- | ---: | --- |
| `clip1` | 3 | `138446:sacred:context_meaning_choice`, `37192:acupuncture:context_meaning_choice`, `109520:massage:context_cloze_choice` |
| `clip2` | 2 | `101652:job:context_meaning_choice`, `75647:ever:context_meaning_choice` |
| `clip3` | 1 | `102119:Just:context_meaning_choice` |
| `clip4` | 1 | `115842:news:context_cloze_choice` |
| `clip5` | 3 | `102680:kind of:context_meaning_choice`, `35923:a little bit:context_meaning_choice`, `160022:troops:context_meaning_choice` |
| `clip6` | 1 | `136560:ridiculous:context_meaning_choice` |
| `clip7` | 3 | `129008:pretty:context_meaning_choice`, `164284:uterus:context_meaning_choice`, `88656:got:context_meaning_choice` |
| `clip8` | 1 | `157409:time:context_meaning_choice` |

### 6.4 Mock response 构建规则

`mock-end-quiz-question-data.ts` 推荐保存为按 clip number 分组的静态表：

```ts
const mockEndQuizQuestionsByClipNumber: Record<number, readonly MockEndQuizQuestion[]> = {
  1: [...],
  2: [...],
};
```

mock repository 收到 `videoId + coarseUnitIds` 后：

1. 用现有 `resolveMockClipAssetByVideoId(videoId)` 解析 `clipNumber`。
2. 读取该 clip 的题目列表。
3. 对请求的 `coarseUnitIds` 按首次出现顺序去重。
4. 只返回请求中命中的题目。
5. 请求中没有题目的 unit 放入 `missingCoarseUnitIds`。
6. 如果一个 unit 没有 `question`，也进入 `missingCoarseUnitIds`。
7. 如果 `videoId` 无法解析到 mock clip，返回空 `items`，所有请求 unit 进入 `missingCoarseUnitIds`；不弹 repository 内部错误。

因为当前 feed 第二批 `video-9..16` 会循环复用 `clip1..8` 资产，所以 End Quiz mock 也应按同样规则循环复用对应 clip 的题目。

### 6.5 Mock 字段转换

外部 JSON 的 `question.content_payload.options[].id` 应转换成后端 API response 的 `options[].option_id`：

```ts
{
  option_id: sourceOption.id,
  text: sourceOption.text,
}
```

`scope_type` 转换为 response `source`：

```ts
video_unit -> video_context
unit -> unit_generic
```

`question_id` 外部 JSON 当前没有提供。mock 需要生成稳定 UUID 形态 ID，推荐按 clip number 和 coarse unit id 生成：

```text
00000000-0000-4000-8000-<clipNumber><coarseUnitId padded>
```

只要同一 clip 的同一 coarse unit 稳定即可；不要每次请求随机生成。

外部 JSON 中 `status` 当前为 `draft`。mock 阶段不按 status 过滤，因为这些文件就是本轮前端 mock 题库来源；真实后端会只返回可用题。

## 7. 重试与 Toast

### 7.1 为什么需要局部重试

当前项目全局 React Query 配置是：

- `queries.retry = false`
- `mutations.retry = false`

`requestJson` 只负责把错误标记为 `retryable`，不执行 retry。

因此 End Quiz 必须在自己的 query 配置里主动设置 retry。

### 7.2 Retry 规则

推荐：

```ts
function isRetryableEndQuizFailure(failureCount: number, error: unknown) {
  if (failureCount >= 2) {
    return false;
  }

  return error instanceof ApiError && error.retryable;
}
```

语义：

- 最多 3 次请求：首次请求 + 2 次重试。
- 只重试 `ApiError.retryable === true` 的错误。
- 网络错误、超时、`408`、`429`、`5xx` 可重试。
- `400`、`401`、`404`、认证 token 缺失、主动 abort 不重试。

不修改全局 QueryClient retry 配置。

### 7.3 Toast 规则

最终失败时显示全局 top toast：

```text
题目加载失败
```

触发条件：

- API 请求完成所有重试后仍失败。
- 失败不是主动 abort。
- 当前请求对应的视频仍是当前 fullscreen session 的 active video，或是视频结束时用户正在等待的 current video。

不弹 toast 的情况：

- `items.length === 0`。
- 只有部分 unit 缺题。
- 请求被 active video 切换取消。
- 当前视频已经不是 active video 的陈旧失败。

同一次 query attempt 的稳定重渲染不得重复 toast。可以用本地 `toastAttemptKeyRef` 或 query promise catch 边界保证每次真实失败最多弹一次。

## 8. 调用时机

### 8.1 进入视频页面

当用户从 feed 点击进入 `/video/[videoId]` 后，应立即为 entry video 触发 `loadEndQuizForVideo(item)`。

实现落点：

- `VideoDetailPage` 只负责 route 和 session 装配，不直接发 End Quiz。
- `FullscreenVideoSession` 解析出 `entryTarget` 后触发 entry video 预取。

如果随后 pager commit active 又触发一次同视频加载，React Query 会通过 query key 复用 in-flight 或缓存，不应产生重复并发请求。

### 8.2 切换 active 视频

`FullscreenVideoSession.handleActiveVideoChange(itemId, index)` 在收到 pager active video 变化后：

1. 先执行当前已有 watch-progress flush。
2. 更新 restore target / pager reported active。
3. 触发当前 active item 的 End Quiz 预取。
4. 保留现有 near-tail requestMore 逻辑。

active video 切换时：

- 如果已有 `items.length > 0` 的可用缓存，不请求。
- 如果上一次失败，重新请求。
- 如果上一次成功但 `items.length === 0`，重新请求。

### 8.3 视频播放结束

当前 fullscreen pager 的播放结束行为是：如果列表中已有下一条视频，直接滚动到下一条。

接入 End Quiz 后固定改为：

```text
active video playback end
-> loadEndQuizForVideo(currentItem)
-> 如果失败或 items 为空：直接 advance next
-> 如果有题：present choice-question set dialog
-> 等 dialog 完全 dismiss
-> advance next
```

失败和空题都不阻断连续播放。

## 9. Fullscreen 流转设计

### 9.1 `FullscreenVideoSession`

新增消费 `useVideoEndQuiz()`：

```ts
const {
  prefetchEndQuizForVideo,
  presentEndQuizBeforeAdvance,
} = useVideoEndQuiz();
```

职责：

- 在 entry video 解析完成后预取。
- 在 active video change 后预取。
- 把 `presentEndQuizBeforeAdvance` 传给 `FullscreenVideoPager`。

`FullscreenVideoSession` 不直接展示 `choice-question` UI，也不直接滚动 pager。

### 9.2 `FullscreenVideoPager`

新增 prop：

```ts
type FullscreenVideoPagerProps = {
  onBeforeAdvanceFromVideoEnd?: (item: VideoListItem) => Promise<void>;
};
```

视频结束处理从同步切换改为异步 gate：

```ts
async function handlePlaybackEnd(videoId: string) {
  const currentItem = resolveCurrentActiveItem(videoId);
  const nextIndex = resolveNextIndex(currentItem);

  if (!currentItem || nextIndex === null) {
    return;
  }

  await onBeforeAdvanceFromVideoEnd?.(currentItem);

  if (!isStillCurrentActiveVideo(videoId)) {
    return;
  }

  scrollToIndex(nextIndex);
}
```

`FullscreenVideoPager` 只知道“切下一个之前要等一个 promise”，不认识 End Quiz API，也不认识 choice-question 数据结构。

### 9.3 重复 end 事件保护

播放器可能重复触发 end 事件。pager 必须增加 pending guard：

```ts
pendingEndVideoIdRef.current
```

规则：

- 同一个 `videoId` 正在处理 end quiz / modal 时，后续同视频 end event 直接忽略。
- promise 结束后清空 pending。
- 如果等待期间用户手动滑到其它视频，promise 结束后不再滚动。

## 10. End Quiz 到 Choice Question 的映射

### 10.1 题型映射

```ts
const QUESTION_TYPE_TO_CHOICE_KIND = {
  context_meaning_choice: 'context_meaning',
  context_cloze_choice: 'context_cloze',
  unit_meaning_choice: 'general_meaning',
  reverse_identification_choice: 'reverse_recognition',
} as const;
```

### 10.2 字段映射

```ts
type ChoiceQuestionData = {
  id: item.questionId;
  kind: mappedKind;
  title: titleForQuestionType;
  prompt: item.question;
  contextText: item.contextText ?? undefined;
  targetText: item.targetText;
  options: item.options.map(option => ({
    id: option.optionId;
    label: option.text;
    isCorrect: option.optionId === 'correct';
  }));
  answerDetail: answerDetail;
};
```

`title` 规则：

- `context_meaning_choice`：使用 `targetText`。
- `unit_meaning_choice`：使用 `targetText`。
- `context_cloze_choice`：默认不传 title。
- `reverse_identification_choice`：默认不传 title。

### 10.3 `answerDetail` 兜底

当前 choice-question 在“用户先错选，再选对”时会展示 `answerDetail` 并依赖底部按钮推进到下一题。

因此从 End Quiz 映射来的题目必须始终提供 `answerDetail`：

```ts
const correctOption = item.options.find(option => option.optionId === 'correct');

answerDetail = {
  label: item.targetText,
  pos: '',
  chineseLabel: correctOption?.text ?? '',
  explanation: item.explanation ?? '已选择正确答案。',
};
```

后续如果 choice-question 支持 `pos/chineseLabel` 可选，再收窄这个兜底结构。

### 10.4 无有效正确选项

后端约定 active 题必须至少有一个 `option_id = "correct"`。前端仍应防御坏数据：

- 如果没有正确选项，该题不映射。
- 如果映射后题目列表为空，不展示 modal，直接切下一个视频。

## 11. 错误与边界行为

### 11.1 HTTP 错误

| 状态 | 前端行为 |
| --- | --- |
| `400` | 不重试。最终失败 toast。视频结束时跳过 quiz，直接切下一个。 |
| `401` | 不重试。最终失败 toast。后续可由 auth 层统一处理登录态。 |
| `404` | 不重试。最终失败 toast。视频结束时跳过 quiz。 |
| `408` | 可重试。最终失败 toast。 |
| `429` | 可重试。最终失败 toast。 |
| `5xx` | 可重试。最终失败 toast。 |
| timeout | 可重试。最终失败 toast。 |
| network error | 可重试。最终失败 toast。 |
| abort | 不重试，不 toast。 |

### 11.2 部分缺题

`missing_coarse_unit_ids` 不是错误。

只要 `items.length > 0`，就展示已有题目。

### 11.3 全部缺题

后端返回：

```ts
{ items: [] }
```

前端行为：

- 不 toast。
- 不展示 choice-question。
- 视频结束时直接切下一个。
- 下次重新进入同视频或切回该 active video 时重新请求。

### 11.4 当前无 learning units

如果 `VideoListItem.learningUnits` 为空：

- 不请求 API。
- 不 toast。
- 视频结束时直接切下一个。

## 12. 与 Quiz Attempt 上报的边界

本设计不实现 quiz attempt 上报。

但 End Quiz domain model 必须保留后续上报需要的字段：

- `questionId`
- `coarseUnitId`
- `videoId`
- `recommendationRunId`
- `source`
- `questionType`
- `selectedOptionIds`
- `selectionIntervalMs`
- `triggerType = 'video_end'`
- `clientContext`

后续实现上报时，`choice-question` 仍不应直接发上报 API。更合理的做法是在 `features/video-end-quiz` 或专门的 quiz attempt feature 中接收答题过程事件，再提交完成事实。

## 13. 实施顺序

建议按以下顺序落地：

1. 新增本文档。
2. 手动读取 `/Users/evan/Code/learning-app/simple-audio-processing/resource/The Office BD/feed_learning_units/*.json`，把所有带 `question` 的题目复制进 `entities/end-quiz` mock 静态表。
3. 新增 `entities/end-quiz` 的 types、mock repository、mapper 和 README。
4. 新增 `features/video-end-quiz` 的 query key、loader、映射器、hook 和 README。
5. 扩展 shared modal，支持 `onDidDismiss` 这类最小生命周期回调。
6. 给 `choice-question` 新增 `presentAndWait` 入口，不改变现有 presenter 的同步语义。
7. 在 `FullscreenVideoSession` 接入 entry / active change 预取。
8. 在 `FullscreenVideoPager` 接入 `onBeforeAdvanceFromVideoEnd` 和 pending end guard。
9. 补测试。

## 14. 测试计划

### 14.1 Entity 测试

- 当前 facade 使用 mock repository，不接真实网络。
- mock 静态表覆盖 8 个 Office clip JSON 中所有带 `question` 的题目。
- mock repository 能通过 `videoId` 解析 clip number。
- `video-9..16` 复用 `clip1..8` 对应题目。
- mock response 使用后端 response shape。
- mock response 的 `options[].option_id` 来自外部 JSON 的 `options[].id`。
- mock `question_id` 稳定，不随机。
- 空 `coarseUnitIds` 不发请求，直接返回空结果。
- mapper 正确把 snake_case DTO 转为 camelCase domain model。

### 14.2 Feature 测试

- query key 不包含 `recommendationRunId`。
- 有 `items.length > 0` 缓存时，重新进入 / active change 不重新请求。
- 上一次失败时，重新进入 / active change 会重新请求。
- 上一次成功但 `items.length === 0` 时，重新进入 / active change 会重新请求。
- `ApiError.retryable === true` 时最多重试 2 次。
- non-retryable error 不重试。
- 最终失败弹一次 `题目加载失败` toast。
- abort 不弹 toast。
- End Quiz item 正确映射为 `ChoiceQuestionData`。
- 无正确选项的坏题被跳过。

### 14.3 Fullscreen 流转测试

- 进入视频页面后触发 entry video 预取。
- active video change 后触发新 active video 预取。
- 视频结束且有题时，先展示 choice-question，再切下一个视频。
- 右上角 `×` 关闭 modal 后切下一个视频。
- 所有题答完 modal 关闭后切下一个视频。
- 视频结束但请求失败时，不展示 modal，直接切下一个视频。
- 视频结束但 `items.length === 0` 时，不展示 modal，直接切下一个视频。
- 同一视频重复 end event 不重复弹 modal，不重复切换。
- 等待 modal 期间用户手动滑到其它视频时，不再强制滚动到旧视频的 next index。

## 15. 非目标

当前不做：

- 不在 Feed API 中内联 quiz。
- 不新增本地持久化题目缓存。
- 不做离线取题队列。
- 不做 quiz attempt 上报。
- 不做服务端判题。
- 不做题目曝光审计。
- 不做题目轮换、A/B、难度策略。
- 不改变 choice-question 的答题交互语义。
- 不把 End Quiz 失败显示为播放器 row error。

## 16. 成功标准

本轮实现完成后应满足：

1. 前端 End Quiz 请求契约与后端文档对齐。
2. 进入视频和切换 active 视频都会预取题目。
3. 有题目的成功结果会被内存缓存并复用。
4. 失败和空结果不会被当作可用缓存，下次会重新请求。
5. 请求失败有有限自动重试，最终失败才 toast。
6. 视频结束时先尝试展示题目；失败或无题直接切下一个。
7. choice-question modal 完全消失后才切下一个视频。
8. 重复 end event、陈旧请求和手动滑走都不会造成重复弹窗或错误切换。
