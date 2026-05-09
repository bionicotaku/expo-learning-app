# Word List Source Feature

`features/word-list-source` owns the word-list mode data sources for page consumption.

Current responsibilities:

- expose `useUnlearnedWordListSource()`, `useLearnedWordListSource()`, and `useEmptyWordListSource()`
- use a shared `usePagedWordListSource` infinite-query core for paged Learning Unit Progress lists
- flatten paged `LearningUnitProgressPage` data into `WordListSourceItem[]`
- keep `coarseUnitId` and `chineseDefinition` on each source item so page-level interactions can open detail dialogs without going back to the API
- expose feed-like state: initial loading, pull refresh, tail extension, and request callbacks

Boundary constraints:

- `unlearned` is currently mock-backed through `fetchMockUnlearnedUnitProgressPage`.
- `learned` is currently mock-backed through `fetchMockLearnedUnitProgressPage`; the real learned API remains in the entity layer for a later source swap.
- `favorites` is an empty source because the favorites API is not part of this stage.
- This feature does not render rows or own favorite/progress controls.
- Source hooks accept `enabled` so pages can defer the first request for inactive modes.
- Pull refresh from an empty list refetches the first page through the active React Query state so failures remain visible as the empty error state.
- Pull refresh with existing items fetches the first page without a cursor and replaces pages only after success; failures keep the old list.
- Tail loading uses the active source cursor via `fetchNextPage`, keeps old items on failure, and shows the shared `加载更多单词失败` toast.
- Tail loading failure is fully handled inside this feature. `requestMore()` resolves after the failure is handled instead of asking the page to catch append errors.
- Page components own first-screen failure toast (`加载失败`) and pull-refresh failure toast (`刷新失败`). Source hooks only own append failure toast.
- Tail retry logic must not rely on `requestMore()` rejection. The contract is "tail request finished or was handled"; repeated tail triggers can call `requestMore()` again after the source leaves its extending state.
