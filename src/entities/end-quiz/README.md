# entities/end-quiz

`entities/end-quiz` owns the frontend read model for the backend-aligned
`POST /api/videos/end-quiz` contract.

Current MVP behavior:

- The public facade is `fetchEndQuiz(...)`.
- The facade is backed by a mock repository, not real network.
- Mock questions are statically copied from the Office
  `feed_learning_units/*.json` files.
- Feed `learning_units` do not include question payloads; this entity owns the
  separate video-end quiz lookup data.

Boundaries:

- This entity does not import `features/choice-question`.
- This entity does not show toast.
- This entity does not decide fullscreen video advancement.
- Future real network wiring should replace only the repository facade, while
  keeping the DTO and domain contracts stable.
