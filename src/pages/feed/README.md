# Feed Page

`pages/feed` 是 feed 页面的装配层。

当前结构：

- `model/use-feed-screen-controller.ts`
  - 组合 feed query、分页预取、播放 reducer
  - 派生页面所需的 debug label 和 overlay model
- `model/feed-screen-selectors.ts`
  - 页面级 render item 和 overlay 派生逻辑
- `ui/feed-screen.tsx`
  - 把 controller 输出传给 `widgets/video-feed`

边界约束：

- page 负责页面控制，不直接实现底层 mock repository
- page 不直接实现播放器细节
- page 不在 route 文件里展开业务逻辑
