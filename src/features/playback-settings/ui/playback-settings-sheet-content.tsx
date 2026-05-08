import { SymbolView } from 'expo-symbols';
import type { SFSymbol } from 'expo-symbols';
import { Pressable, Text, View, type ViewStyle } from 'react-native';

import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';
import type { EditorialPaperTokens } from '@/shared/theme/editorial-paper';
import {
  RaisedSurface,
  SegmentedFilterBar,
} from '@/shared/ui/editorial-paper';
import type { SegmentedFilterBarItem } from '@/shared/ui/editorial-paper';

import {
  PLAYBACK_RATE_OPTIONS,
  type PlaybackRate,
  usePlaybackRate,
  useSetPlaybackRate,
} from '../model/playback-settings-store';

type PlaybackSettingsActionItem = {
  label: string;
  iosSymbol: SFSymbol;
  fallbackGlyph: string;
};

const playbackRateLabel = '倍速';

const actionItems: PlaybackSettingsActionItem[] = [
  {
    label: '测试题',
    iosSymbol: 'checkmark.seal',
    fallbackGlyph: 'Q',
  },
  {
    label: '分享',
    iosSymbol: 'square.and.arrow.up',
    fallbackGlyph: 'S',
  },
  {
    label: '反馈',
    iosSymbol: 'bubble.left.and.bubble.right',
    fallbackGlyph: 'F',
  },
];

const playbackRateItems: SegmentedFilterBarItem<PlaybackRate>[] = [
  { label: '0.5', value: PLAYBACK_RATE_OPTIONS[0] },
  { label: '1.0', value: PLAYBACK_RATE_OPTIONS[1] },
  { label: '1.5', value: PLAYBACK_RATE_OPTIONS[2] },
  { label: '2.0', value: PLAYBACK_RATE_OPTIONS[3] },
];

function createPlaybackSettingsRowStyle(
  tokens: EditorialPaperTokens
): ViewStyle {
  return {
    alignItems: 'center',
    flexDirection: 'row',
    gap: tokens.spacing.md,
    minHeight: 48,
    paddingHorizontal: tokens.spacing.md,
  };
}

function PlaybackSettingsRowSeparator({
  tokens,
}: {
  tokens: EditorialPaperTokens;
}) {
  return (
    <View
      pointerEvents="none"
      style={{
        backgroundColor: tokens.glass.borderColor,
        height: 1,
        marginLeft: tokens.spacing.md + 34 + tokens.spacing.md,
        marginRight: tokens.spacing.md,
        opacity: 0.56,
      }}
    />
  );
}

function PlaybackSettingsActionSymbol({
  color,
  fallbackGlyph,
  name,
}: {
  color: string;
  fallbackGlyph: string;
  name: SFSymbol;
}) {
  return (
    <SymbolView
      fallback={
        <Text
          style={{
            color,
            fontSize: 13,
            fontWeight: '800',
            lineHeight: 16,
          }}
        >
          {fallbackGlyph}
        </Text>
      }
      name={{ ios: name }}
      size={17}
      tintColor={color}
      type="hierarchical"
      weight="semibold"
    />
  );
}

export function PlaybackSettingsSheetContent() {
  const { tokens } = useEditorialPaperTheme();
  const playbackRate = usePlaybackRate();
  const setPlaybackRate = useSetPlaybackRate();

  return (
    <View>
      <RaisedSurface
        radius="cardMd"
        style={{
          padding: tokens.spacing.sm,
        }}
      >
        <View
          style={createPlaybackSettingsRowStyle(tokens)}
        >
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 34,
            }}
          >
            <PlaybackSettingsActionSymbol
              color={tokens.color.inkSoft}
              fallbackGlyph="R"
              name="speedometer"
            />
          </View>
          <Text
            style={{
              color: tokens.color.ink,
              fontSize: 15,
              fontWeight: '700',
              lineHeight: 19,
            }}
          >
            {playbackRateLabel}
          </Text>
          <View style={{ flex: 1, minWidth: 0 }}>
            <SegmentedFilterBar
              items={playbackRateItems}
              onChange={setPlaybackRate}
              style={{ padding: 4 }}
              tone="softActionSky"
              value={playbackRate}
            />
          </View>
        </View>
        <PlaybackSettingsRowSeparator tokens={tokens} />

        {actionItems.map((item, index) => (
          <View key={item.label}>
            <Pressable
              accessibilityLabel={item.label}
              accessibilityRole="button"
              onPress={() => {}}
              style={({ pressed }) => ({
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <View
                style={createPlaybackSettingsRowStyle(tokens)}
              >
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 34,
                  }}
                >
                  <PlaybackSettingsActionSymbol
                    color={tokens.color.inkSoft}
                    fallbackGlyph={item.fallbackGlyph}
                    name={item.iosSymbol}
                  />
                </View>
                <Text
                  style={{
                    color: tokens.color.ink,
                    flex: 1,
                    fontSize: 15,
                    fontWeight: '700',
                    lineHeight: 19,
                  }}
                >
                  {item.label}
                </Text>
                <Text
                  style={{
                    color: tokens.color.inkMute,
                    fontSize: 18,
                    fontWeight: '600',
                    lineHeight: 18,
                  }}
                >
                  ›
                </Text>
              </View>
            </Pressable>
            {index < actionItems.length - 1 ? (
              <PlaybackSettingsRowSeparator tokens={tokens} />
            ) : null}
          </View>
        ))}
      </RaisedSurface>
    </View>
  );
}
