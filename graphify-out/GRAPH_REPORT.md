# Graph Report - .  (2026-04-18)

## Corpus Check
- Corpus is ~7,510 words - fits in a single context window. You may not need a graph.

## Summary
- 102 nodes · 79 edges · 36 communities detected
- Extraction: 63% EXTRACTED · 37% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Product Learning Loop|Product Learning Loop]]
- [[_COMMUNITY_Architecture Boundaries|Architecture Boundaries]]
- [[_COMMUNITY_Theming Utilities|Theming Utilities]]
- [[_COMMUNITY_Feed Screen State|Feed Screen State]]
- [[_COMMUNITY_Mock Feed Data|Mock Feed Data]]
- [[_COMMUNITY_App Routing Shell|App Routing Shell]]
- [[_COMMUNITY_Native Animated Icon|Native Animated Icon]]
- [[_COMMUNITY_External Link Helper|External Link Helper]]
- [[_COMMUNITY_Web Animated Icon|Web Animated Icon]]
- [[_COMMUNITY_Template Reset Script|Template Reset Script]]
- [[_COMMUNITY_Feed Entry Route|Feed Entry Route]]
- [[_COMMUNITY_React Query Client|React Query Client]]
- [[_COMMUNITY_Hint Row UI|Hint Row UI]]
- [[_COMMUNITY_Auth Strategy|Auth Strategy]]
- [[_COMMUNITY_Global Type Decls|Global Type Decls]]
- [[_COMMUNITY_Legacy Theme Constants|Legacy Theme Constants]]
- [[_COMMUNITY_Playback Feature Exports|Playback Feature Exports]]
- [[_COMMUNITY_Playback Reducer Tests|Playback Reducer Tests]]
- [[_COMMUNITY_Player Window Tests|Player Window Tests]]
- [[_COMMUNITY_Pagination Feature Exports|Pagination Feature Exports]]
- [[_COMMUNITY_Pagination Policy Tests|Pagination Policy Tests]]
- [[_COMMUNITY_Shared Color Tokens|Shared Color Tokens]]
- [[_COMMUNITY_Collapsible UI|Collapsible UI]]
- [[_COMMUNITY_Native Color Scheme|Native Color Scheme]]
- [[_COMMUNITY_Feed Page Exports|Feed Page Exports]]
- [[_COMMUNITY_Feed Selector Tests|Feed Selector Tests]]
- [[_COMMUNITY_Video Feed Exports|Video Feed Exports]]
- [[_COMMUNITY_Feed Loading Card|Feed Loading Card]]
- [[_COMMUNITY_Feed Overlay UI|Feed Overlay UI]]
- [[_COMMUNITY_Video Feed Model Exports|Video Feed Model Exports]]
- [[_COMMUNITY_Video Entity Exports|Video Entity Exports]]
- [[_COMMUNITY_Video Mock Catalog|Video Mock Catalog]]
- [[_COMMUNITY_Video Entity Types|Video Entity Types]]
- [[_COMMUNITY_Feed Entity Exports|Feed Entity Exports]]
- [[_COMMUNITY_Feed Entity Types|Feed Entity Types]]
- [[_COMMUNITY_Feed Repository Tests|Feed Repository Tests]]

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

### Community 0 - "Product Learning Loop"
Cohesion: 0.12
Nodes (11): Persistent Assets Need Authentication, Feed-First Entry Rationale, Learning Retention Space, MVP Closed Loop, Real Account System, Continuous Video Feed, expo-video Playback, shouldPrefetchNextPage() (+3 more)

### Community 1 - "Architecture Boundaries"
Cohesion: 0.2
Nodes (9): One-Way Dependency Direction, Legacy Template Directories, Layer Boundaries Clarify Ownership, Target Source Layer Structure, Content-Driven Learning App, Follow Expo Defaults Rationale, Lightweight FSD, Mobile-First Expo Stack (+1 more)

### Community 2 - "Theming Utilities"
Cohesion: 0.2
Nodes (5): ThemedText(), ThemedView(), useColorScheme(), useTheme(), WebBadge()

### Community 3 - "Feed Screen State"
Cohesion: 0.24
Nodes (6): buildFeedScreenItems(), createFeedLoadingTailItem(), getFeedDebugLabel(), getFeedOverlayModel(), isFeedLoadingTailItem(), useFeedScreenController()

### Community 4 - "Mock Feed Data"
Cohesion: 0.27
Nodes (7): Mock Data Behaves Like Real Async Flow, Mock Business Data With Real Async Flow, React Query Feed Pagination, createMockFeedPage(), fetchFeedPage(), sleep(), useFeedInfiniteQuery()

### Community 5 - "App Routing Shell"
Cohesion: 1.0
Nodes (2): Route-Only App Layer, Expo Router

### Community 6 - "Native Animated Icon"
Cohesion: 0.67
Nodes (0): 

### Community 7 - "External Link Helper"
Cohesion: 0.67
Nodes (0): 

### Community 8 - "Web Animated Icon"
Cohesion: 0.67
Nodes (0): 

### Community 9 - "Template Reset Script"
Cohesion: 1.0
Nodes (0): 

### Community 10 - "Feed Entry Route"
Cohesion: 1.0
Nodes (0): 

### Community 11 - "React Query Client"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "Hint Row UI"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Auth Strategy"
Cohesion: 1.0
Nodes (2): Auth Coupling Stays Inside Auth Layer, Supabase Auth

### Community 14 - "Global Type Decls"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Legacy Theme Constants"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Playback Feature Exports"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Playback Reducer Tests"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Player Window Tests"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Pagination Feature Exports"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Pagination Policy Tests"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Shared Color Tokens"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Collapsible UI"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Native Color Scheme"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Feed Page Exports"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Feed Selector Tests"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Video Feed Exports"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Feed Loading Card"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Feed Overlay UI"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Video Feed Model Exports"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Video Entity Exports"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Video Mock Catalog"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Video Entity Types"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Feed Entity Exports"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Feed Entity Types"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Feed Repository Tests"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **7 isolated node(s):** `One-Way Dependency Direction`, `Legacy Template Directories`, `Layer Boundaries Clarify Ownership`, `Supabase Auth`, `Follow Expo Defaults Rationale` (+2 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Template Reset Script`** (2 nodes): `moveDirectories()`, `reset-project.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Feed Entry Route`** (2 nodes): `IndexRoute()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `React Query Client`** (2 nodes): `createQueryClient()`, `query-client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Hint Row UI`** (2 nodes): `HintRow()`, `hint-row.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Auth Strategy`** (2 nodes): `Auth Coupling Stays Inside Auth Layer`, `Supabase Auth`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Global Type Decls`** (1 nodes): `global.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Legacy Theme Constants`** (1 nodes): `theme.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Playback Feature Exports`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Playback Reducer Tests`** (1 nodes): `feed-playback.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Player Window Tests`** (1 nodes): `player-window.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Pagination Feature Exports`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Pagination Policy Tests`** (1 nodes): `feed-pagination-policy.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Shared Color Tokens`** (1 nodes): `colors.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Collapsible UI`** (1 nodes): `collapsible.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Native Color Scheme`** (1 nodes): `use-color-scheme.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Feed Page Exports`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Feed Selector Tests`** (1 nodes): `feed-screen-selectors.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Video Feed Exports`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Feed Loading Card`** (1 nodes): `video-feed-loading-card.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Feed Overlay UI`** (1 nodes): `video-feed-overlay.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Video Feed Model Exports`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Video Entity Exports`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Video Mock Catalog`** (1 nodes): `videos.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Video Entity Types`** (1 nodes): `types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Feed Entity Exports`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Feed Entity Types`** (1 nodes): `types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Feed Repository Tests`** (1 nodes): `mock-feed-repository.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Continuous Video Feed` connect `Product Learning Loop` to `Architecture Boundaries`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Why does `Target Source Layer Structure` connect `Architecture Boundaries` to `Mock Feed Data`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `useFeedInfiniteQuery()` connect `Mock Feed Data` to `Feed Screen State`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Target Source Layer Structure` (e.g. with `feed-screen.tsx` and `video-feed.tsx`) actually correct?**
  _`Target Source Layer Structure` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `Continuous Video Feed` (e.g. with `expo-video Playback` and `VideoFeed()`) actually correct?**
  _`Continuous Video Feed` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `fetchFeedPage()` (e.g. with `Mock Data Behaves Like Real Async Flow` and `Mock Business Data With Real Async Flow`) actually correct?**
  _`fetchFeedPage()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `useTheme()` (e.g. with `ThemedText()` and `ThemedView()`) actually correct?**
  _`useTheme()` has 3 INFERRED edges - model-reasoned connections that need verification._