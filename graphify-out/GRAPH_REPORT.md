# Graph Report - .  (2026-04-19)

## Corpus Check
- 50 files · ~13,664 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 143 nodes · 117 edges · 39 communities detected
- Extraction: 75% EXTRACTED · 25% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]

## God Nodes (most connected - your core abstractions)
1. `Target Source Layer Structure` - 9 edges
2. `Continuous Video Feed` - 8 edges
3. `fetchFeedPage()` - 5 edges
4. `useTheme()` - 4 edges
5. `useFeedScreenController()` - 4 edges
6. `MVP Closed Loop` - 4 edges
7. `Mock Business Data With Real Async Flow` - 4 edges
8. `useFeedInfiniteQuery()` - 3 edges
9. `useColorScheme()` - 3 edges
10. `getFeedOverlayModel()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `VideoFeed()` --implements--> `Continuous Video Feed`  [INFERRED]
  src/widgets/video-feed/ui/video-feed.tsx → docs/项目整体需求与应用概览.md
- `feedPlaybackReducer()` --implements--> `Continuous Video Feed`  [INFERRED]
  src/features/video-playback/model/feed-playback.ts → docs/项目整体需求与应用概览.md
- `shouldMountPlayer()` --implements--> `Continuous Video Feed`  [INFERRED]
  src/features/video-playback/model/player-window.ts → docs/项目整体需求与应用概览.md
- `shouldPrefetchNextPage()` --implements--> `Continuous Video Feed`  [INFERRED]
  src/features/feed-pagination/model/feed-pagination-policy.ts → docs/项目整体需求与应用概览.md
- `VideoFeedList()` --implements--> `Continuous Video Feed`  [INFERRED]
  src/widgets/video-feed/ui/video-feed-list.tsx → docs/项目整体需求与应用概览.md

## Hyperedges (group relationships)
- **Feed Slice Layering** — doc_norm_target_structure, src_pages_feed_ui_feed_screen_tsx, src_widgets_video_feed_ui_video_feed_tsx, src_features_feed_pagination_model_use_feed_infinite_query_ts, src_entities_feed_api_mock_feed_repository_ts [INFERRED 0.86]
- **Feed MVP Loop** — doc_product_mvp_closed_loop, doc_product_video_feed, doc_product_mock_async_data, use_feed_infinite_query_usefeedinfinitequery, mock_feed_repository_fetchfeedpage, video_feed_videofeed [INFERRED 0.88]
- **Playback Windowing Pattern** — doc_product_video_feed, feed_playback_feedplaybackreducer, player_window_shouldmountplayer, video_feed_list_videofeedlist, src_widgets_video_feed_ui_video_feed_item_tsx [INFERRED 0.78]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (0): 

### Community 1 - "Community 1"
Cohesion: 0.12
Nodes (11): Persistent Assets Need Authentication, Feed-First Entry Rationale, Learning Retention Space, MVP Closed Loop, Real Account System, Continuous Video Feed, expo-video Playback, shouldPrefetchNextPage() (+3 more)

### Community 2 - "Community 2"
Cohesion: 0.17
Nodes (0): 

### Community 3 - "Community 3"
Cohesion: 0.2
Nodes (9): One-Way Dependency Direction, Legacy Template Directories, Layer Boundaries Clarify Ownership, Target Source Layer Structure, Content-Driven Learning App, Follow Expo Defaults Rationale, Lightweight FSD, Mobile-First Expo Stack (+1 more)

### Community 4 - "Community 4"
Cohesion: 0.2
Nodes (5): ThemedText(), ThemedView(), useColorScheme(), useTheme(), WebBadge()

### Community 5 - "Community 5"
Cohesion: 0.24
Nodes (6): buildFeedScreenItems(), createFeedLoadingTailItem(), getFeedDebugLabel(), getFeedOverlayModel(), isFeedLoadingTailItem(), useFeedScreenController()

### Community 6 - "Community 6"
Cohesion: 0.27
Nodes (7): Mock Data Behaves Like Real Async Flow, Mock Business Data With Real Async Flow, React Query Feed Pagination, createMockFeedPage(), fetchFeedPage(), sleep(), useFeedInfiniteQuery()

### Community 7 - "Community 7"
Cohesion: 1.0
Nodes (2): Route-Only App Layer, Expo Router

### Community 8 - "Community 8"
Cohesion: 0.67
Nodes (0): 

### Community 9 - "Community 9"
Cohesion: 0.67
Nodes (0): 

### Community 10 - "Community 10"
Cohesion: 0.67
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "Community 12"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Community 13"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (2): Auth Coupling Stays Inside Auth Layer, Supabase Auth

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **7 isolated node(s):** `One-Way Dependency Direction`, `Legacy Template Directories`, `Layer Boundaries Clarify Ownership`, `Supabase Auth`, `Follow Expo Defaults Rationale` (+2 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 11`** (2 nodes): `readRelative()`, `structure.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (2 nodes): `moveDirectories()`, `reset-project.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (2 nodes): `IndexRoute()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (2 nodes): `createQueryClient()`, `query-client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (2 nodes): `HintRow()`, `hint-row.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (2 nodes): `Auth Coupling Stays Inside Auth Layer`, `Supabase Auth`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (1 nodes): `global.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (1 nodes): `theme.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (1 nodes): `feed-playback.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (1 nodes): `player-window.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `feed-pagination-policy.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `colors.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `collapsible.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `use-color-scheme.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `feed-screen-selectors.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (1 nodes): `video-feed-loading-card.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (1 nodes): `video-feed-overlay.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (1 nodes): `videos.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (1 nodes): `types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (1 nodes): `types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `mock-feed-repository.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Continuous Video Feed` connect `Community 1` to `Community 3`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `Target Source Layer Structure` connect `Community 3` to `Community 6`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `useFeedInfiniteQuery()` connect `Community 6` to `Community 5`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Target Source Layer Structure` (e.g. with `use-feed-infinite-query.ts` and `feed-screen.tsx`) actually correct?**
  _`Target Source Layer Structure` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `Continuous Video Feed` (e.g. with `feedPlaybackReducer()` and `shouldMountPlayer()`) actually correct?**
  _`Continuous Video Feed` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `fetchFeedPage()` (e.g. with `Mock Data Behaves Like Real Async Flow` and `Mock Business Data With Real Async Flow`) actually correct?**
  _`fetchFeedPage()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `useTheme()` (e.g. with `ThemedText()` and `ThemedView()`) actually correct?**
  _`useTheme()` has 3 INFERRED edges - model-reasoned connections that need verification._