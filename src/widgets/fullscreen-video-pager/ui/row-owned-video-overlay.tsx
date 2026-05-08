import { memo } from 'react';
import { Text, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

import type { Transcript, TranscriptToken } from '@/entities/transcript';
import type { SubtitleDisplayMode } from '@/features/playback-settings';
import type { FullscreenVideoOverlayActionItem } from '../model/overlay-data';
import type { ExpandableOverlayDescriptionMeasurementCache } from '../model/expandable-overlay-description';
import { fullscreenVideoOverlayTheme } from '../model/fullscreen-video-overlay-theme';
import type { RowPlaybackSeekBarStore } from '../model/row-playback-seek-bar-store';
import { BasicSubtitleOverlay } from './basic-subtitle-overlay';
import {
  ExpandableOverlayDescription,
  ExpandableOverlayDescriptionAction,
  useExpandableOverlayDescriptionState,
} from './expandable-overlay-description';
import { VideoOverlayActionRail } from './video-overlay-action-rail';

const contentBottomOffset = 42;
const contentTextGap = 4;
const contentLeftInset = 16;
const contentRightInset = 64;
const subtitleTitleGap = 10;
const sharedTextWidth = 279;
const descriptionTextWidth = sharedTextWidth;
const titleDescriptionColumnStyle = {
  gap: contentTextGap,
} as const;
const contentLayoutTransition = LinearTransition.springify()
  .mass(0.85)
  .damping(32)
  .stiffness(340)
  .overshootClamping(1);

type RowOwnedVideoOverlayProps = {
  activeTranscript: Transcript | null;
  activeVisitToken: number | null;
  areEngagementActionsDisabled: boolean;
  bottomInset: number;
  description: string;
  favoriteCount: number;
  isFavorited: boolean;
  isLiked: boolean;
  likeCount: number;
  measurementCache: ExpandableOverlayDescriptionMeasurementCache;
  onActionPress?: (item: FullscreenVideoOverlayActionItem) => void;
  onSubtitleTokenPress?: (token: TranscriptToken) => void;
  seekBarStore: RowPlaybackSeekBarStore;
  subtitleDisplayMode: SubtitleDisplayMode;
  title: string;
};

function RowOwnedVideoOverlayComponent({
  activeTranscript,
  activeVisitToken,
  areEngagementActionsDisabled,
  bottomInset,
  description,
  favoriteCount,
  isFavorited,
  isLiked,
  likeCount,
  measurementCache,
  onActionPress,
  onSubtitleTokenPress,
  seekBarStore,
  subtitleDisplayMode,
  title,
}: RowOwnedVideoOverlayProps) {
  const descriptionState = useExpandableOverlayDescriptionState({
    activeVisitToken,
    description,
    maxTextWidth: descriptionTextWidth,
    measurementCache,
  });
  const contentBottomLift =
    descriptionState.viewState.actionPlacement === 'footer'
      ? fullscreenVideoOverlayTheme.descriptionActionLaneHeight +
        fullscreenVideoOverlayTheme.descriptionActionGap
      : 0;
  const contentColumnBottomOffset = contentBottomOffset + contentBottomLift;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        inset: 0,
      }}
    >
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          inset: 0,
          justifyContent: 'flex-end',
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: bottomInset + 204,
            experimental_backgroundImage:
              'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 42%, rgba(0,0,0,0.22) 74%, rgba(0,0,0,0.34) 100%)',
          }}
        />
        <Animated.View
          layout={contentLayoutTransition}
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            left: contentLeftInset,
            right: contentRightInset,
            bottom: bottomInset + contentColumnBottomOffset,
          }}
        >
          <View
            style={{
              position: 'relative',
              width: sharedTextWidth,
            }}
          >
            <View
              pointerEvents="box-none"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: '100%',
                paddingBottom: subtitleTitleGap,
              }}
            >
              <BasicSubtitleOverlay
                displayMode={subtitleDisplayMode}
                maxTextWidth={sharedTextWidth}
                onTokenPress={onSubtitleTokenPress}
                seekBarStore={seekBarStore}
                transcript={activeTranscript}
              />
            </View>
            <View style={titleDescriptionColumnStyle}>
              <Text
                allowFontScaling={false}
                selectable={false}
                style={{
                  fontSize: fullscreenVideoOverlayTheme.titleText.fontSize,
                  lineHeight: fullscreenVideoOverlayTheme.titleText.lineHeight,
                  letterSpacing: -0.08,
                  fontWeight: '700',
                  color: 'rgba(251,247,238,0.97)',
                  textShadowColor: 'rgba(17,13,10,0.26)',
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 3,
                  maxWidth: sharedTextWidth,
                }}
                numberOfLines={2}
              >
                {title}
              </Text>
              <ExpandableOverlayDescription
                description={description}
                maxTextWidth={descriptionTextWidth}
                state={descriptionState}
              />
            </View>
          </View>
        </Animated.View>

        <ExpandableOverlayDescriptionAction
          bottom={bottomInset + contentBottomOffset}
          left={contentLeftInset + descriptionTextWidth}
          state={descriptionState}
        />
      </View>

      <VideoOverlayActionRail
        bottomInset={bottomInset}
        areEngagementActionsDisabled={areEngagementActionsDisabled}
        favoriteCount={favoriteCount}
        isFavorited={isFavorited}
        isLiked={isLiked}
        likeCount={likeCount}
        onActionPress={onActionPress}
        subtitleDisplayMode={subtitleDisplayMode}
      />
    </View>
  );
}

export const RowOwnedVideoOverlay = memo(RowOwnedVideoOverlayComponent);
