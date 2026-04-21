import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';
import { EditorialTitle, RaisedSurface } from '@/shared/ui/editorial-paper';

export type MediaFeatureCardFallbackTone =
  | 'peach'
  | 'butter'
  | 'sage'
  | 'lavender'
  | 'sky'
  | 'rose';

export type MediaFeatureCardProps = {
  title: string;
  statsLabel: string;
  tagLabel: string;
  coverImageUrl?: string | null;
  fallbackTone: MediaFeatureCardFallbackTone;
  onPress?: () => void;
  accessibilityLabel?: string;
};

const toneColors: Record<MediaFeatureCardFallbackTone, string> = {
  peach: '#EEDBCF',
  butter: '#E6D9BE',
  sage: '#D7E0C2',
  lavender: '#D7D0E7',
  sky: '#D3E5E8',
  rose: '#EACBCF',
};

function resolveToneColor(tone: MediaFeatureCardFallbackTone) {
  return toneColors[tone];
}

export function MediaFeatureCard({
  title,
  statsLabel,
  tagLabel,
  coverImageUrl,
  fallbackTone,
  onPress,
  accessibilityLabel,
}: MediaFeatureCardProps) {
  const { tokens } = useEditorialPaperTheme();
  const [didCoverFail, setDidCoverFail] = useState(false);
  const normalizedCoverImageUrl = useMemo(() => {
    const trimmed = coverImageUrl?.trim();
    return trimmed ? trimmed : null;
  }, [coverImageUrl]);
  const shouldShowFallback = !normalizedCoverImageUrl || didCoverFail;

  useEffect(() => {
    setDidCoverFail(false);
  }, [normalizedCoverImageUrl]);

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed && onPress ? 0.95 : 1,
      })}
    >
      <RaisedSurface
        style={{
          padding: 10,
          gap: 14,
        }}
      >
        <View
          style={{
            minHeight: 196,
            borderRadius: tokens.radius.cardMd,
            borderCurve: 'continuous',
            overflow: 'hidden',
            backgroundColor: resolveToneColor(fallbackTone),
            position: 'relative',
          }}
        >
          {shouldShowFallback ? null : (
            <>
              <Image
                contentFit="cover"
                onError={() => {
                  setDidCoverFail(true);
                }}
                source={{ uri: normalizedCoverImageUrl }}
                style={{
                  position: 'absolute',
                  inset: 0,
                }}
              />
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(17, 13, 10, 0.08)',
                }}
              />
            </>
          )}

          <View
            style={{
              position: 'absolute',
              left: 14,
              top: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 11,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: 'rgba(251,247,238,0.6)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 10px rgba(28,26,23,0.12)',
              alignSelf: 'flex-start',
            }}
          >
            <Text
              style={{
                color: tokens.color.ink,
                fontSize: 12,
                lineHeight: 12,
                fontWeight: '700',
                transform: [{ translateY: 0.8 }],
              }}
            >
              ▶
            </Text>
            <Text
              style={{
                color: tokens.color.ink,
                fontSize: 10,
                lineHeight: 12,
                fontWeight: '700',
                letterSpacing: 0.4,
              }}
            >
              {statsLabel}
            </Text>
          </View>

          <View
            style={{
              position: 'absolute',
              left: 14,
              bottom: 14,
              paddingHorizontal: 11,
              paddingVertical: 8,
              borderRadius: 18,
              backgroundColor: 'rgba(251,247,238,0.6)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.36), 0 5px 12px rgba(28,26,23,0.1)',
              alignSelf: 'flex-start',
              maxWidth: '74%',
            }}
          >
            <Text
              numberOfLines={2}
              style={{
                color: tokens.color.ink,
                fontSize: 10.5,
                lineHeight: 13,
                fontWeight: '700',
                letterSpacing: 0.2,
              }}
            >
              {tagLabel}
            </Text>
          </View>

          <View
            style={{
              position: 'absolute',
              right: 14,
              bottom: 14,
              width: 48,
              height: 48,
              borderRadius: 24,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(251,247,238,0.6)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.38), 0 6px 14px rgba(28,26,23,0.14)',
            }}
          >
            <Text
              style={{
                color: tokens.color.ink,
                fontSize: 16,
                lineHeight: 16,
                fontWeight: '700',
                marginLeft: 2,
                transform: [{ translateY: 0.7 }],
              }}
            >
              ▶
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 10, paddingBottom: 8 }}>
          <EditorialTitle
            variant="title"
            numberOfLines={2}
            style={{
              fontSize: 21,
              lineHeight: 25,
              letterSpacing: -0.45,
            }}
          >
            {title}
          </EditorialTitle>
        </View>
      </RaisedSurface>
    </Pressable>
  );
}
