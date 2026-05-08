import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import type { SFSymbol } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';
import {
  EditorialTitle,
  MetaLabel,
  RaisedSurface,
  SegmentedFilterBar,
} from '@/shared/ui/editorial-paper';
import type { SegmentedFilterBarItem } from '@/shared/ui/editorial-paper';

type WordListSegment = 'unlearned' | 'learned' | 'favorites';

type WordCardItem = {
  word: string;
  ipa: string;
  meaning: string;
  progress: number;
  accentKey: 'rose' | 'butter' | 'peach';
};

const noopAction = () => {};

const segmentItems: SegmentedFilterBarItem<WordListSegment>[] = [
  { label: '未学习', value: 'unlearned', tone: 'softActionPeach' },
  { label: '已学习', value: 'learned', tone: 'softActionButter' },
  { label: '收藏夹', value: 'favorites', tone: 'softActionRose' },
];

const wordCards: WordCardItem[] = [
  {
    word: 'carry weight',
    ipa: '/ˈkæri weɪt/',
    meaning:
      'to sound meaningful because the speaker or source gives the sentence authority.',
    progress: 74,
    accentKey: 'rose',
  },
  {
    word: 'land on',
    ipa: '/lænd ɒn/',
    meaning:
      'to arrive at an answer, phrase, or idea that finally feels right.',
    progress: 55,
    accentKey: 'butter',
  },
  {
    word: 'read the room',
    ipa: '/riːd ðə ruːm/',
    meaning: 'to understand the atmosphere before you speak.',
    progress: 41,
    accentKey: 'peach',
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

function resolveWordAccentColor(
  tokens: ReturnType<typeof useEditorialPaperTheme>['tokens'],
  accentKey: WordCardItem['accentKey']
) {
  switch (accentKey) {
    case 'rose':
      return tokens.color.softAction.rose;
    case 'butter':
      return tokens.color.softAction.butter;
    case 'peach':
    default:
      return tokens.color.softAction.peach;
  }
}

function WordCard({ item }: { item: WordCardItem }) {
  const { tokens } = useEditorialPaperTheme();
  const accentColor = resolveWordAccentColor(tokens, item.accentKey);

  return (
    <RaisedSurface
      radius="cardMd"
      style={{
        gap: tokens.spacing.md,
        paddingHorizontal: tokens.spacing.lg,
        paddingVertical: 14,
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
              fontSize: 28,
              lineHeight: 32,
              letterSpacing: -0.8,
            }}
            variant="title"
          >
            {item.word}
          </EditorialTitle>
          <Text
            numberOfLines={1}
            style={{
              color: tokens.color.inkMute,
              fontSize: 11,
              fontWeight: '600',
              lineHeight: 14,
              marginTop: tokens.spacing.xs,
            }}
          >
            {item.ipa}
          </Text>
        </View>

        <Pressable
          accessibilityLabel={`${item.word} favorite`}
          accessibilityRole="button"
          onPress={noopAction}
          style={({ pressed }) => ({
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <RaisedSurface
            radius="pill"
            style={{
              alignItems: 'center',
              height: 34,
              justifyContent: 'center',
              width: 34,
            }}
          >
            <WordSymbol color={accentColor} name="star.fill" />
          </RaisedSurface>
        </Pressable>
      </View>

      <Text
        style={{
          color: tokens.color.inkSoft,
          fontSize: 14,
          fontWeight: '500',
          lineHeight: 22,
        }}
      >
        {item.meaning}
      </Text>

      <View
        accessibilityLabel={`${item.word} progress ${item.progress} percent`}
        style={{
          backgroundColor: 'rgba(28, 26, 23, 0.08)',
          borderRadius: tokens.radius.pill,
          height: 8,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            backgroundColor: accentColor,
            height: '100%',
            width: `${item.progress}%`,
          }}
        />
      </View>
    </RaisedSurface>
  );
}

export function WordListPage() {
  const { tokens } = useEditorialPaperTheme();
  const [segment, setSegment] = useState<WordListSegment>('unlearned');

  return (
    <>
      <StatusBar style="dark" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          gap: tokens.spacing.md,
          paddingBottom: 116,
          paddingHorizontal: tokens.spacing.pageX,
          paddingTop: tokens.spacing.pageTop,
        }}
        style={{
          flex: 1,
          backgroundColor: tokens.color.background,
        }}
      >
        <View style={{ gap: tokens.spacing.xs, paddingBottom: tokens.spacing.xs }}>
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
          onChange={setSegment}
          value={segment}
        />

        <View style={{ gap: tokens.spacing.md }}>
          {wordCards.map((item) => (
            <WordCard item={item} key={item.word} />
          ))}
        </View>
      </ScrollView>
    </>
  );
}
