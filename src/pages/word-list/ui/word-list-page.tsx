import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import type { SFSymbol } from 'expo-symbols';
import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';
import {
  EditorialTitle,
  MetaLabel,
  RaisedSurface,
  SegmentedFilterBar,
} from '@/shared/ui/editorial-paper';
import type { SegmentedFilterBarItem } from '@/shared/ui/editorial-paper';

type WordListSegment = 'unlearned' | 'learned' | 'favorites';
type WordPartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb';

type WordListPageProps = {
  showFavoriteAction?: boolean;
  showProgress?: boolean;
};

type WordListItem = {
  word: string;
  partOfSpeech: WordPartOfSpeech | '';
  meaning: string;
  progress: number;
};

const noopAction = () => {};

const segmentItems: SegmentedFilterBarItem<WordListSegment>[] = [
  { label: '未学习', value: 'unlearned', tone: 'softActionPeach' },
  { label: '已学习', value: 'learned', tone: 'softActionButter' },
  { label: '收藏夹', value: 'favorites', tone: 'softActionRose' },
];

const wordItems: WordListItem[] = [
  {
    word: 'carry weight',
    partOfSpeech: 'verb',
    meaning:
      'to sound meaningful because the speaker or source gives the sentence authority.',
    progress: 74,
  },
  {
    word: 'land on',
    partOfSpeech: 'verb',
    meaning:
      'to arrive at an answer, phrase, or idea that finally feels right.',
    progress: 55,
  },
  {
    word: 'read the room',
    partOfSpeech: 'verb',
    meaning: 'to understand the atmosphere before you speak.',
    progress: 41,
  },
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

function resolvePartOfSpeechLabel(partOfSpeech: WordListItem['partOfSpeech']) {
  switch (partOfSpeech) {
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
  item: WordListItem;
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
            {item.word}
          </EditorialTitle>
        </View>

        {showFavoriteAction ? (
          <Pressable
            accessibilityLabel={`${item.word} favorite`}
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
        {item.meaning}
      </Text>

      {showProgress ? (
        <View
          accessibilityLabel={`${item.word} progress ${item.progress} percent`}
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

export function WordListPage({
  showFavoriteAction = true,
  showProgress = true,
}: WordListPageProps = {}) {
  const { tokens } = useEditorialPaperTheme();
  const [segment, setSegment] = useState<WordListSegment>('unlearned');

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
        data={wordItems}
        initialNumToRender={12}
        ItemSeparatorComponent={WordRowSeparator}
        keyExtractor={(item) => item.word}
        ListHeaderComponent={
          <WordListHeader
            segment={segment}
            onSegmentChange={setSegment}
          />
        }
        maxToRenderPerBatch={12}
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
