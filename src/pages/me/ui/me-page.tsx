import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import type { SFSymbol } from 'expo-symbols';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';
import {
  EditorialTitle,
  MetaLabel,
  RaisedSurface,
} from '@/shared/ui/editorial-paper';

type DeskActionItem = {
  title: string;
  iosSymbol: SFSymbol;
  fallbackGlyph: string;
  accentTone: 'accent' | 'gold' | 'cocoa' | 'inkSoft';
  danger?: boolean;
};

const noopAction = () => {};
const actionIconTone = 'surface';

const learningActionItems: DeskActionItem[] = [
  {
    title: 'Archive',
    iosSymbol: 'archivebox',
    fallbackGlyph: 'A',
    accentTone: 'accent',
  },
  {
    title: 'Favorites',
    iosSymbol: 'heart',
    fallbackGlyph: 'F',
    accentTone: 'gold',
  },
  {
    title: 'Review queue',
    iosSymbol: 'clock',
    fallbackGlyph: 'R',
    accentTone: 'cocoa',
  },
];

const systemActionItems: DeskActionItem[] = [
  {
    title: 'Preferences',
    iosSymbol: 'gearshape',
    fallbackGlyph: 'P',
    accentTone: 'inkSoft',
  },
  {
    title: 'Reading goals',
    iosSymbol: 'chart.line.uptrend.xyaxis',
    fallbackGlyph: 'G',
    accentTone: 'accent',
  },
  {
    title: 'Help & feedback',
    iosSymbol: 'questionmark.circle',
    fallbackGlyph: '?',
    accentTone: 'gold',
  },
  {
    title: 'Sign out',
    iosSymbol: 'rectangle.portrait.and.arrow.right',
    fallbackGlyph: 'S',
    accentTone: 'accent',
    danger: true,
  },
];

function resolveAccentColor(
  tokens: ReturnType<typeof useEditorialPaperTheme>['tokens'],
  tone: DeskActionItem['accentTone']
) {
  switch (tone) {
    case 'accent':
      return tokens.color.accent;
    case 'gold':
      return tokens.color.gold;
    case 'cocoa':
      return tokens.color.cocoa;
    case 'inkSoft':
    default:
      return tokens.color.inkSoft;
  }
}

function DeskSymbol({
  color,
  fallbackGlyph,
  name,
  size = 16,
}: {
  color: string;
  fallbackGlyph: string;
  name: SFSymbol;
  size?: number;
}) {
  return (
    <SymbolView
      fallback={
        <Text
          style={{
            color,
            fontSize: size - 1,
            fontWeight: '800',
            lineHeight: size,
          }}
        >
          {fallbackGlyph}
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

function ProfileSummaryCard() {
  const { tokens } = useEditorialPaperTheme();

  return (
    <RaisedSurface
      radius="cardLg"
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        gap: tokens.spacing.lg,
        padding: tokens.spacing.lg,
      }}
    >
      <View
        style={{
          width: 70,
          height: 70,
          borderRadius: 26,
          borderCurve: 'continuous',
          backgroundColor: tokens.color.softAction.peach,
          boxShadow:
            'inset 2px 2px 4px rgba(255,255,255,0.24), inset -3px -3px 6px rgba(28,26,23,0.16)',
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            position: 'absolute',
            right: -12,
            bottom: -10,
            width: 54,
            height: 54,
            borderRadius: 27,
            backgroundColor: tokens.color.softAction.rose,
            opacity: 0.78,
          }}
        />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <EditorialTitle
          numberOfLines={1}
          style={{
            fontSize: 30,
            lineHeight: 34,
            letterSpacing: -0.8,
          }}
          variant="title"
        >
          Mika
        </EditorialTitle>
        <Text
          numberOfLines={1}
          style={{
            color: tokens.color.inkMute,
            fontSize: 12,
            fontWeight: '600',
            lineHeight: 16,
            marginTop: tokens.spacing.xs,
          }}
        >
          Issue desk · editorial mode
        </Text>
      </View>

      <Pressable
        accessibilityLabel="22 day streak"
        accessibilityRole="button"
        onPress={noopAction}
        style={({ pressed }) => ({
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <RaisedSurface
          radius="pill"
          style={{
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.sm,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              color: tokens.color.cocoa,
              fontSize: 11,
              fontWeight: '700',
              lineHeight: 14,
            }}
          >
            22 day streak
          </Text>
        </RaisedSurface>
      </Pressable>
    </RaisedSurface>
  );
}

function StatsStrip() {
  const { tokens } = useEditorialPaperTheme();
  const stats = [
    { label: 'Saved', value: '196', color: tokens.color.softAction.rose },
    { label: 'Reviewed', value: '81', color: tokens.color.softAction.butter },
    { label: 'Hours', value: '16', color: tokens.color.softAction.peach },
  ];

  return (
    <View style={{ flexDirection: 'row', gap: tokens.spacing.sm }}>
      {stats.map((item) => (
        <RaisedSurface
          key={item.label}
          radius="cardMd"
          style={{
            flex: 1,
            minWidth: 0,
            paddingHorizontal: 10,
            paddingVertical: tokens.spacing.md,
          }}
        >
          <MetaLabel
            numberOfLines={1}
            style={{
              fontSize: 10,
              letterSpacing: 1,
            }}
          >
            {item.label}
          </MetaLabel>
          <EditorialTitle
            numberOfLines={1}
            style={{
              color: item.color,
              fontSize: 28,
              lineHeight: 30,
              marginTop: tokens.spacing.sm,
            }}
            variant="title"
          >
            {item.value}
          </EditorialTitle>
        </RaisedSurface>
      ))}
    </View>
  );
}

function WeekIssueTextCard() {
  const { tokens } = useEditorialPaperTheme();

  return (
    <RaisedSurface
      radius="cardMd"
      style={{
        gap: tokens.spacing.md,
        padding: tokens.spacing.lg,
      }}
    >
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: tokens.spacing.md,
        }}
      >
        <EditorialTitle
          numberOfLines={1}
          style={{
            fontSize: 20,
            lineHeight: 24,
          }}
          variant="title"
        >
          Week issue
        </EditorialTitle>
        <RaisedSurface
          radius="pill"
          tone="softActionLavender"
          style={{
            paddingHorizontal: 14,
            paddingVertical: 7,
          }}
        >
          <Text
            style={{
              color: tokens.color.cocoa,
              fontSize: 11,
              fontWeight: '700',
              lineHeight: 14,
            }}
          >
            steady
          </Text>
        </RaisedSurface>
      </View>
      <Text
        style={{
          color: tokens.color.inkSoft,
          fontSize: 14,
          fontWeight: '500',
          lineHeight: 22,
        }}
      >
        Your desk stayed balanced this week: saved expressions are ready for a
        short review pass, and the next queue can stay light.
      </Text>
    </RaisedSurface>
  );
}

function GroupedActionList({
  items,
}: {
  items: readonly DeskActionItem[];
}) {
  const { tokens } = useEditorialPaperTheme();

  return (
    <RaisedSurface
      radius="cardMd"
      style={{
        padding: tokens.spacing.sm,
      }}
    >
      {items.map((item, index) => {
        const accentColor = resolveAccentColor(tokens, item.accentTone);
        const isLast = index === items.length - 1;

        return (
          <Pressable
            accessibilityLabel={item.title}
            accessibilityRole="button"
            key={item.title}
            onPress={noopAction}
            style={({ pressed }) => ({
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <View
              style={{
                alignItems: 'center',
                borderBottomColor: tokens.color.background,
                borderBottomWidth: isLast ? 0 : 1,
                flexDirection: 'row',
                gap: tokens.spacing.md,
                minHeight: 56,
                paddingHorizontal: 10,
                paddingVertical: 10,
              }}
            >
              <RaisedSurface
                radius={14}
                tone={actionIconTone}
                style={{
                  alignItems: 'center',
                  height: 36,
                  justifyContent: 'center',
                  width: 36,
                }}
              >
                <DeskSymbol
                  color={accentColor}
                  fallbackGlyph={item.fallbackGlyph}
                  name={item.iosSymbol}
                />
              </RaisedSurface>
              <Text
                numberOfLines={1}
                style={{
                  color: item.danger ? tokens.color.cocoa : tokens.color.ink,
                  flex: 1,
                  fontSize: 14,
                  fontWeight: '600',
                  lineHeight: 18,
                }}
              >
                {item.title}
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
        );
      })}
    </RaisedSurface>
  );
}

function FooterLabel() {
  const { tokens } = useEditorialPaperTheme();

  return (
    <Text
      style={{
        color: tokens.color.inkMute,
        fontSize: 10.5,
        fontWeight: '600',
        letterSpacing: 0.8,
        lineHeight: 14,
        paddingBottom: tokens.spacing.sm,
        paddingTop: tokens.spacing.sm,
        textAlign: 'center',
      }}
    >
      Folio Press · v0.5
    </Text>
  );
}

export function MePage() {
  const { tokens } = useEditorialPaperTheme();

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
        <ProfileSummaryCard />
        <StatsStrip />
        <WeekIssueTextCard />
        <GroupedActionList items={learningActionItems} />
        <GroupedActionList items={systemActionItems} />
        <FooterLabel />
      </ScrollView>
    </>
  );
}
