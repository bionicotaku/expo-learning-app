# Transcript Entity

`entities/transcript` 定义视频 transcript 的读取契约，而不是字幕 UI 状态。

当前职责：

- `model/dto.ts`
  - transcript transport DTO
  - 保持远程与 mock 返回原样 `snake_case`
- `model/types.ts`
  - transcript domain types
  - 统一映射为前端内部 `camelCase`
- `model/mappers.ts`
  - DTO -> domain 映射
- `api/transcript-repository.ts`
  - transcript 领域的公开读取入口
- `api/mock-transcript-repository.ts`
  - 当前 MVP 的 mock transcript 实现
  - 使用共享 `mock clip catalog` 将 `videoId` 映射到 `clip 1..8`
  - 从公共 GCS transcript URL 读取远程 mock JSON

边界约束：

- 这里只描述 transcript 数据和 transcript 读取
- 不放 subtitle overlay 布局
- 不放播放器时间同步状态
- 不放 token 点击、解释弹层或字幕交互状态

当前这里仍然是 mock repository，但接口语义已经对齐单视频 transcript 子资源读取。
