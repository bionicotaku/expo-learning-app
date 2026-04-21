import { memo } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { AdaptiveGlass } from '@/shared/ui/editorial-paper';

import type { RowHudCenterOwner } from '../model/row-hud-layout';
import type { FullscreenRowSurfacePresentation } from '../model/row-surface-presentation';
import { RowHudAnchors } from './row-hud-anchors';

type RowSurfaceStatusOverlayProps = {
  centerOwner: RowHudCenterOwner;
  presentation: FullscreenRowSurfacePresentation | null;
};

const loadingSpinnerTint = 'rgba(251,247,238,0.96)';
const loadingGlassShadow =
  '6px 9px 18px rgba(17,13,10,0.16), inset 0 1px 1px rgba(255,255,255,0.22), inset 0 -2px 5px rgba(17,13,10,0.08)';

function RowSurfaceStatusOverlayComponent({
  centerOwner,
  presentation,
}: RowSurfaceStatusOverlayProps) {
  if (!presentation || presentation.surfaceState === 'ready') {
    return null;
  }

  if (presentation.surfaceState === 'loading') {
    if (centerOwner !== 'loading') {
      return null;
    }

    return (
      <RowHudAnchors
        center={
          <AdaptiveGlass
            appearance="clear"
            radius={28}
            style={{
              width: 56,
              height: 56,
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: loadingGlassShadow,
            }}
            variant="pill"
          >
            <ActivityIndicator
              color={loadingSpinnerTint}
              size="small"
              style={{ transform: [{ scale: 1.45 }] }}
            />
          </AdaptiveGlass>
        }
      />
    );
  }

  return (
    <View
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.78)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        gap: 12,
      }}
    >
      <Text
        selectable
        style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700', textAlign: 'center' }}
      >
        Video unavailable
      </Text>
      <Text
        selectable
        style={{
          color: 'rgba(255,255,255,0.74)',
          fontSize: 14,
          textAlign: 'center',
        }}
      >
        {presentation.errorMessage ?? 'The player could not load this video.'}
      </Text>
      <Pressable
        onPress={() => {
          presentation.retry?.();
        }}
        style={({ pressed }) => ({
          paddingHorizontal: 18,
          paddingVertical: 12,
          borderRadius: 999,
          backgroundColor: pressed ? 'rgba(255,255,255,0.24)' : 'rgba(255,255,255,0.18)',
        })}
      >
        <Text selectable style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
          Retry
        </Text>
      </Pressable>
    </View>
  );
}

export const RowSurfaceStatusOverlay = memo(RowSurfaceStatusOverlayComponent);
