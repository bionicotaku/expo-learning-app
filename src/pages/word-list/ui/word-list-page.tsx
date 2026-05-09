import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import type { SFSymbol } from 'expo-symbols';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';

import {
  useUnlearnedWordListSource,
  type WordListSourceItem,
} from '@/features/word-list-source';
import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';
import {
  EditorialTitle,
  MetaLabel,
  RaisedSurface,
  SegmentedFilterBar,
} from '@/shared/ui/editorial-paper';
import type { SegmentedFilterBarItem } from '@/shared/ui/editorial-paper';

type WordListSegment = 'unlearned' | 'learned' | 'favorites';

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
  showFavoriteAction,
  showProgress,
}: {
  item: WordListSourceItem;
  showFavoriteAction: boolean;
  showProgress: boolean;
}) {
  const { tokens } = useEditorialPaperTheme();
  const favoriteColor = tokens.color.softAction.rose;
  const progressColor = resolveProgressColor(tokens, item.progress);
  const partOfSpeechLabel = resolvePartOfSpeechLabel(item.partOfSpeech);

  return (
    <View
      style={{
        gap: tokens.spacing.xs,
        paddingHorizontal: tokens.spacing.lg,
        paddingVertical: tokens.spacing.md,
      }}
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
              fontSize: 20,
              lineHeight: 24,
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
    </View>
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

export function WordListPage({
  showFavoriteAction = true,
  showProgress = true,
}: WordListPageProps = {}) {
  const { tokens } = useEditorialPaperTheme();
  const [segment, setSegment] = useState<WordListSegment>('unlearned');
  const {
    error,
    isExtending,
    isInitialLoading,
    isRefreshing,
    items,
    refresh,
    requestMore,
  } = useUnlearnedWordListSource();

  const renderEmptyState = () => {
    if (isInitialLoading) {
      return <WordListInlineState isLoading title="Loading words..." />;
    }

    if (error) {
      return (
        <WordListInlineState
          actionLabel="Retry"
          onActionPress={() => {
            void refresh();
          }}
          title="Words unavailable"
        />
      );
    }

    return <WordListInlineState title="No words yet" />;
  };

  return (
    <>
      <StatusBar style="dark" />
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingBottom: 116,
          paddingHorizontal: tokens.spacing.pageX,
          paddingTop: tokens.spacing.pageTop,
        }}
        data={items}
        initialNumToRender={12}
        ItemSeparatorComponent={WordRowSeparator}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <WordListHeader
            segment={segment}
            onSegmentChange={setSegment}
          />
        }
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={
          isExtending && items.length > 0 ? <WordListFooter isExtending={isExtending} /> : null
        }
        maxToRenderPerBatch={12}
        onEndReached={() => {
          void requestMore();
        }}
        onEndReachedThreshold={0.2}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              void refresh();
            }}
            tintColor={tokens.color.accent}
          />
        }
        removeClippedSubviews
        renderItem={({ item }) => (
          <WordRow
            item={item}
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
    </>
  );
}
