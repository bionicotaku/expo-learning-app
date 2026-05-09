# Word List Source Feature

`features/word-list-source` owns the current word-list data source for page consumption.

Current responsibilities:

- expose `useUnlearnedWordListSource()`
- use `useInfiniteQuery` for the unlearned word list
- flatten paged `LearningUnitProgressPage` data into `WordListSourceItem[]`
- expose feed-like state: initial loading, pull refresh, tail extension, and request callbacks

Boundary constraints:

- Current MVP only wires the `unlearned` source.
- `learned` and `favorites` tabs remain UI-only until their sources are added.
- This feature does not render rows or own favorite/progress controls.
- The current data source is mock-backed and can be swapped to the real repository without changing the page contract.
