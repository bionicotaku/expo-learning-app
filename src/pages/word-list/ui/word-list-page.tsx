import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import type { SFSymbol } from 'expo-symbols';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useEmptyWordListSource,
  useLearnedWordListSource,
  useUnlearnedWordListSource,
  type WordListSourceMode,
  type WordListSourceItem,
  type WordListSourceResult,
} from '@/features/word-list-source';
import {
  usePresentWordDetailDialog,
  type WordDetailDialogData,
} from '@/features/word-detail';
import { toast } from '@/shared/lib/toast';
import {
  editorialPaperCjkTitleFontFamily,
  useEditorialPaperTheme,
} from '@/shared/theme/editorial-paper';
import {
  EditorialTitle,
  MetaLabel,
  RaisedSurface,
  SegmentedFilterBar,
} from '@/shared/ui/editorial-paper';
import type { SegmentedFilterBarItem } from '@/shared/ui/editorial-paper';

type WordListSegment = WordListSourceMode;

type WordListPageProps = {
  showFavoriteAction?: boolean;
  showProgress?: boolean;
};

const noopAction = () => {};

const segmentItems: SegmentedFilterBarItem<WordListSegment>[] = [
  { label: '未学习', value: 'unlearned', tone: 'softActionPeach' },
  { label: '已学习', value: 'learned', tone: 'softActionButter' },
  { label: '收藏夹', value: 'favorites', tone: 'softActionRose' },
];

function WordSymbol({
  color,
  name,
  size = 15,
}: {
  color: string;
  name: SFSymbol;
  size?: number;
}) {
  return (
    <SymbolView
      fallback={
        <Text
          style={{
            color,
            fontSize: size,
            fontWeight: '800',
            lineHeight: size + 1,
          }}
        >
          *
        </Text>
      }
      name={{ ios: name }}
      size={size}
      tintColor={color}
      type="hierarchical"
      weight="semibold"
    />
  );
}

function resolveProgressColor(
  tokens: ReturnType<typeof useEditorialPaperTheme>['tokens'],
  progress: number
) {
  const normalizedProgress = Math.max(0, Math.min(100, progress));

  if (normalizedProgress <= 50) {
    return mixHexColor(
      tokens.color.softAction.peach,
      tokens.color.softAction.butter,
      normalizedProgress / 50
    );
  }

  return mixHexColor(
    tokens.color.softAction.butter,
    tokens.color.softAction.pistachio,
    (normalizedProgress - 50) / 50
  );
}

function mixHexColor(fromHex: string, toHex: string, amount: number) {
  const from = parseHexColor(fromHex);
  const to = parseHexColor(toHex);
  const mix = {
    red: mixChannel(from.red, to.red, amount),
    green: mixChannel(from.green, to.green, amount),
    blue: mixChannel(from.blue, to.blue, amount),
  };

  return rgbToHex(mix.red, mix.green, mix.blue);
}

function parseHexColor(hex: string) {
  const cleanHex = hex.replace('#', '');

  return {
    red: Number.parseInt(cleanHex.slice(0, 2), 16),
    green: Number.parseInt(cleanHex.slice(2, 4), 16),
    blue: Number.parseInt(cleanHex.slice(4, 6), 16),
  };
}

function mixChannel(from: number, to: number, amount: number) {
  return Math.round(from + (to - from) * amount);
}

function rgbToHex(red: number, green: number, blue: number) {
  return `#${[red, green, blue]
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`;
}

function resolvePartOfSpeechLabel(partOfSpeech: WordListSourceItem['partOfSpeech']) {
  switch (partOfSpeech) {
    case null:
      return '';
    case '':
      return '';
    case 'noun':
      return 'n.';
    case 'verb':
      return 'v.';
    case 'adjective':
      return 'adj.';
    case 'adverb':
      return 'adv.';
    default:
      return '';
  }
}

function createWordListDetailPayload(
  item: WordListSourceItem
): WordDetailDialogData {
  const partOfSpeechLabel = resolvePartOfSpeechLabel(item.partOfSpeech);
  const briefTranslation = item.chineseLabel
    ? [partOfSpeechLabel, item.chineseLabel].filter(Boolean).join(' ')
    : '';

  return {
    title: item.label,
    sections: [
      {
        id: 'brief-translation',
        title: '简要翻译',
        body: briefTranslation,
      },
      {
        id: 'dictionary',
        title: '字典释义',
        body: item.chineseDefinition,
      },
    ],
  };
}

function WordListHeader({
  segment,
  onSegmentChange,
}: {
  segment: WordListSegment;
  onSegmentChange: (value: WordListSegment) => void;
}) {
  const { tokens } = useEditorialPaperTheme();

  return (
    <View style={{ gap: tokens.spacing.md, paddingBottom: tokens.spacing.sm }}>
      <View style={{ gap: tokens.spacing.xs }}>
        <MetaLabel uppercase={false}>Learning shelf</MetaLabel>
        <EditorialTitle
          style={{
            fontFamily: editorialPaperCjkTitleFontFamily,
            fontSize: 34,
            lineHeight: 38,
          }}
          variant="title"
        >
          单词列表
        </EditorialTitle>
      </View>

      <SegmentedFilterBar
        items={segmentItems}
        labelStyle={{
          fontFamily: editorialPaperCjkTitleFontFamily,
        }}
        onChange={onSegmentChange}
        value={segment}
      />
    </View>
  );
}

function WordRowSeparator() {
  const { tokens } = useEditorialPaperTheme();

  return (
    <View
      style={{
        borderColor: 'rgba(28, 26, 23, 0.18)',
        borderStyle: 'dashed',
        borderTopWidth: 1,
        marginHorizontal: tokens.spacing.lg,
      }}
    />
  );
}

function WordRow({
  item,
  onOpenDetail,
  showFavoriteAction,
  showProgress,
}: {
  item: WordListSourceItem;
  onOpenDetail: (item: WordListSourceItem) => void;
  showFavoriteAction: boolean;
  showProgress: boolean;
}) {
  const { tokens } = useEditorialPaperTheme();
  const favoriteColor = tokens.color.softAction.rose;
  const progressColor = resolveProgressColor(tokens, item.progress);
  const partOfSpeechLabel = resolvePartOfSpeechLabel(item.partOfSpeech);

  return (
    <Pressable
      accessibilityLabel={`${item.label} details`}
      accessibilityRole="button"
      onPress={() => {
        onOpenDetail(item);
      }}
      style={({ pressed }) => ({
        gap: tokens.spacing.xs,
        opacity: pressed ? 0.72 : 1,
        paddingHorizontal: tokens.spacing.lg,
        paddingVertical: tokens.spacing.md,
      })}
    >
      <View
        style={{
          alignItems: 'flex-start',
          flexDirection: 'row',
          gap: tokens.spacing.md,
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <EditorialTitle
            numberOfLines={1}
            style={{
              fontSize: 18,
              lineHeight: 22,
              letterSpacing: 0,
            }}
            variant="title"
          >
            {item.label}
          </EditorialTitle>
        </View>

        {showFavoriteAction ? (
          <Pressable
            accessibilityLabel={`${item.label} favorite`}
            accessibilityRole="button"
            onPress={noopAction}
            style={({ pressed }) => ({
              opacity: pressed ? 0.9 : 1,
              alignItems: 'center',
              height: 44,
              justifyContent: 'center',
              marginVertical: -10,
              width: 44,
            })}
          >
            <RaisedSurface
              radius="pill"
              style={{
                alignItems: 'center',
                height: 30,
                justifyContent: 'center',
                width: 30,
              }}
            >
              <WordSymbol color={favoriteColor} name="star.fill" size={14} />
            </RaisedSurface>
          </Pressable>
        ) : null}
      </View>

      <Text
        ellipsizeMode="tail"
        numberOfLines={1}
        style={{
          color: tokens.color.inkSoft,
          fontSize: 14,
          fontWeight: '500',
          lineHeight: 22,
        }}
      >
        {partOfSpeechLabel ? (
          <Text
            style={{
              color: tokens.color.inkMute,
              fontWeight: '700',
            }}
          >
            {partOfSpeechLabel}{'  '}
          </Text>
        ) : null}
        {item.chineseLabel}
      </Text>

      {showProgress ? (
        <View
          accessibilityLabel={`${item.label} progress ${item.progress} percent`}
          style={{
            backgroundColor: 'rgba(28, 26, 23, 0.08)',
            borderRadius: tokens.radius.pill,
            height: 4,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              backgroundColor: progressColor,
              height: '100%',
              width: `${item.progress}%`,
            }}
          />
        </View>
      ) : null}
    </Pressable>
  );
}

function WordListInlineState({
  actionLabel,
  isLoading = false,
  onActionPress,
  title,
}: {
  actionLabel?: string;
  isLoading?: boolean;
  onActionPress?: () => void;
  title: string;
}) {
  const { tokens } = useEditorialPaperTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        gap: tokens.spacing.sm,
        justifyContent: 'center',
        paddingHorizontal: tokens.spacing.lg,
        paddingVertical: 52,
      }}
    >
      {isLoading ? <ActivityIndicator color={tokens.color.accent} /> : null}
      <MetaLabel uppercase={false}>{title}</MetaLabel>
      {actionLabel && onActionPress ? (
        <Pressable
          accessibilityRole="button"
          onPress={onActionPress}
          style={({ pressed }) => ({
            backgroundColor: pressed ? 'rgba(28, 26, 23, 0.86)' : 'rgba(28, 26, 23, 0.94)',
            borderRadius: tokens.radius.pill,
            paddingHorizontal: 18,
            paddingVertical: 10,
          })}
        >
          <Text
            style={{
              color: tokens.color.surface,
              fontSize: 13,
              fontWeight: '700',
              lineHeight: 18,
            }}
          >
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function WordListFooter({ isExtending }: { isExtending: boolean }) {
  const { tokens } = useEditorialPaperTheme();

  if (!isExtending) {
    return null;
  }

  return (
    <View
      style={{
        alignItems: 'center',
        paddingTop: tokens.spacing.md,
      }}
    >
      <ActivityIndicator color={tokens.color.accent} />
    </View>
  );
}

type WordListModeCopy = {
  loadingTitle: string;
  errorTitle: string;
  emptyTitle: string;
};

const wordListModeCopy: Record<WordListSegment, WordListModeCopy> = {
  favorites: {
    loadingTitle: 'Loading favorites...',
    errorTitle: 'Favorites unavailable',
    emptyTitle: 'No favorites yet',
  },
  learned: {
    loadingTitle: 'Loading learned words...',
    errorTitle: '加载失败',
    emptyTitle: 'No learned words yet',
  },
  unlearned: {
    loadingTitle: 'Loading words...',
    errorTitle: '加载失败',
    emptyTitle: 'No words yet',
  },
};

function WordListModePane({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  const opacity = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: active ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [active, opacity]);

  return (
    <Animated.View
      pointerEvents={active ? 'auto' : 'none'}
      style={[StyleSheet.absoluteFill, { opacity }]}
    >
      {children}
    </Animated.View>
  );
}

function WordListVirtualList({
  active,
  copy,
  mode,
  onOpenDetail,
  showFavoriteAction,
  showProgress,
  source,
}: {
  active: boolean;
  copy: WordListModeCopy;
  mode: WordListSegment;
  onOpenDetail: (item: WordListSourceItem) => void;
  showFavoriteAction: boolean;
  showProgress: boolean;
  source: WordListSourceResult;
}) {
  const { tokens } = useEditorialPaperTheme();
  const lastInitialErrorToastRef = useRef<unknown>(null);
  const suppressInitialErrorToastRef = useRef(false);

  useEffect(() => {
    if (!source.error || source.items.length > 0) {
      lastInitialErrorToastRef.current = null;
      suppressInitialErrorToastRef.current = false;
      return;
    }

    if (!active) {
      return;
    }

    if (suppressInitialErrorToastRef.current) {
      suppressInitialErrorToastRef.current = false;
      lastInitialErrorToastRef.current = source.error;
      return;
    }

    if (lastInitialErrorToastRef.current === source.error) {
      return;
    }

    lastInitialErrorToastRef.current = source.error;
    toast.show({
      kind: 'error',
      title: '加载失败',
    });
  }, [active, source.error, source.items.length]);

  const handleRefresh = async () => {
    if (!active) {
      return;
    }

    suppressInitialErrorToastRef.current = source.items.length === 0;

    try {
      await source.refresh();
      suppressInitialErrorToastRef.current = false;
    } catch {
      toast.show({
        kind: 'error',
        title: '刷新失败',
      });
    }
  };

  const renderEmptyState = () => {
    if (source.isInitialLoading) {
      return <WordListInlineState isLoading title={copy.loadingTitle} />;
    }

    if (source.error) {
      return <WordListInlineState title={copy.errorTitle} />;
    }

    return <WordListInlineState title={copy.emptyTitle} />;
  };

  return (
    <FlatList
      accessibilityLabel={`${mode} word list`}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingBottom: 116,
        paddingHorizontal: tokens.spacing.pageX,
      }}
      data={source.items}
      initialNumToRender={12}
      ItemSeparatorComponent={WordRowSeparator}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={renderEmptyState}
      ListFooterComponent={
        source.isExtending && source.items.length > 0 ? (
          <WordListFooter isExtending={source.isExtending} />
        ) : null
      }
      maxToRenderPerBatch={12}
      onEndReached={() => {
        if (active) {
          void Promise.resolve(source.requestMore()).catch(() => undefined);
        }
      }}
      onEndReachedThreshold={0.2}
      refreshControl={
        <RefreshControl
          refreshing={active ? source.isRefreshing : false}
          onRefresh={() => {
            void handleRefresh();
          }}
          tintColor={tokens.color.accent}
        />
      }
      removeClippedSubviews
      renderItem={({ item }) => (
        <WordRow
          item={item}
          onOpenDetail={onOpenDetail}
          showFavoriteAction={showFavoriteAction}
          showProgress={showProgress}
        />
      )}
      showsVerticalScrollIndicator={false}
      style={{
        flex: 1,
        backgroundColor: tokens.color.background,
      }}
      windowSize={9}
    />
  );
}

export function WordListPage({
  showFavoriteAction = true,
  showProgress = true,
}: WordListPageProps = {}) {
  const { tokens } = useEditorialPaperTheme();
  const [segment, setSegment] = useState<WordListSegment>('unlearned');
  const [hasVisitedLearned, setHasVisitedLearned] = useState(false);
  const unlearnedSource = useUnlearnedWordListSource({ enabled: true });
  const learnedSource = useLearnedWordListSource({ enabled: hasVisitedLearned });
  const favoritesSource = useEmptyWordListSource();
  const presentWordDetailDialog = usePresentWordDetailDialog();

  const handleSegmentChange = (nextSegment: WordListSegment) => {
    if (nextSegment === 'learned') {
      setHasVisitedLearned(true);
    }

    setSegment(nextSegment);
  };

  const handleOpenDetail = (wordListItem: WordListSourceItem) => {
    presentWordDetailDialog(createWordListDetailPayload(wordListItem));
  };

  return (
    <>
      <StatusBar style="dark" />
      <View
        style={{
          backgroundColor: tokens.color.background,
          flex: 1,
        }}
      >
        <View
          style={{
            paddingBottom: tokens.spacing.sm,
            paddingHorizontal: tokens.spacing.pageX,
            paddingTop: tokens.spacing.pageTop,
          }}
        >
          <WordListHeader
            segment={segment}
            onSegmentChange={handleSegmentChange}
          />
        </View>

        <View style={{ flex: 1 }}>
          <WordListModePane active={segment === 'unlearned'}>
            <WordListVirtualList
              active={segment === 'unlearned'}
              copy={wordListModeCopy.unlearned}
              mode="unlearned"
              onOpenDetail={handleOpenDetail}
              showFavoriteAction={showFavoriteAction}
              showProgress={showProgress}
              source={unlearnedSource}
            />
          </WordListModePane>

          <WordListModePane active={segment === 'learned'}>
            <WordListVirtualList
              active={segment === 'learned'}
              copy={wordListModeCopy.learned}
              mode="learned"
              onOpenDetail={handleOpenDetail}
              showFavoriteAction={showFavoriteAction}
              showProgress={false}
              source={learnedSource}
            />
          </WordListModePane>

          <WordListModePane active={segment === 'favorites'}>
            <WordListVirtualList
              active={segment === 'favorites'}
              copy={wordListModeCopy.favorites}
              mode="favorites"
              onOpenDetail={handleOpenDetail}
              showFavoriteAction={showFavoriteAction}
              showProgress={showProgress}
              source={favoritesSource}
            />
          </WordListModePane>
        </View>
      </View>
    </>
  );
}
