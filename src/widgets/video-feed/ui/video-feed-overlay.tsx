import { Text, View } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';

import { colors } from '@/shared/theme/colors';

import type { VideoFeedOverlayModel } from '../model/types';

type VideoFeedOverlayProps = {
  audioToastLabel: string | null;
  debugLabel: string;
  insets: EdgeInsets;
  overlayModel: VideoFeedOverlayModel | null;
};

export function VideoFeedOverlay({
  audioToastLabel,
  debugLabel,
  insets,
  overlayModel,
}: VideoFeedOverlayProps) {
  return (
    <>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: insets.top + 20,
          left: 18,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 999,
          backgroundColor: colors.overlay,
        }}>
        <Text
          selectable
          style={{
            color: colors.textPrimary,
            fontSize: 14,
            fontWeight: '700',
            fontVariant: ['tabular-nums'],
          }}>
          {debugLabel}
        </Text>
      </View>

      {overlayModel ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 18,
            right: 18,
            bottom: insets.bottom + 28,
            gap: 8,
          }}>
          <Text
            selectable
            style={{ color: colors.textPrimary, fontSize: 24, fontWeight: '800' }}>
            {overlayModel.title}
          </Text>
          <Text
            selectable
            style={{ color: colors.textSecondary, fontSize: 15, lineHeight: 20 }}>
            {overlayModel.subtitle}
          </Text>

          {overlayModel.hint ? (
            <Text
              selectable
              style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '600' }}>
              {overlayModel.hint}
            </Text>
          ) : null}
        </View>
      ) : null}

      {audioToastLabel ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            inset: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              paddingHorizontal: 18,
              paddingVertical: 12,
              borderRadius: 999,
              backgroundColor: colors.overlayStrong,
            }}>
            <Text
              selectable
              style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '800' }}>
              {audioToastLabel}
            </Text>
          </View>
        </View>
      ) : null}
    </>
  );
}
