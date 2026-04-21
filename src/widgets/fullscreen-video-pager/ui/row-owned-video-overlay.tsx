import { memo } from 'react';
import { Text, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

import type { FullscreenVideoOverlayActionItem } from '../model/overlay-data';
import {
  fullscreenVideoOverlayTypography,
  type ExpandableOverlayDescriptionMeasurementCache,
} from '../model/expandable-overlay-description';
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
const sharedTextWidth = 279;
const descriptionTextWidth = sharedTextWidth;
const contentLayoutTransition = LinearTransition.springify()
  .mass(0.85)
  .damping(32)
  .stiffness(340)
  .overshootClamping(1);

type RowOwnedVideoOverlayProps = {
  bottomInset: number;
  description: string;
  isActive: boolean;
  isFavorited: boolean;
  isLiked: boolean;
  measurementCache: ExpandableOverlayDescriptionMeasurementCache;
  onActionPress?: (item: FullscreenVideoOverlayActionItem) => void;
  title: string;
  videoId: string;
};

function RowOwnedVideoOverlayComponent({
  bottomInset,
  description,
  isActive,
  isFavorited,
  isLiked,
  measurementCache,
  onActionPress,
  title,
  videoId,
}: RowOwnedVideoOverlayProps) {
  const descriptionState = useExpandableOverlayDescriptionState({
    description,
    isActive,
    maxTextWidth: descriptionTextWidth,
    measurementCache,
    stateOwnerKey: videoId,
  });
  const contentColumnBottomOffset =
    contentBottomOffset + descriptionState.layoutContract.contentBottomLift;

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
            gap: contentTextGap,
          }}
        >
          <Text
            allowFontScaling={false}
            selectable={false}
            style={{
              fontSize: fullscreenVideoOverlayTypography.titleFontSize,
              lineHeight: fullscreenVideoOverlayTypography.titleLineHeight,
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
        </Animated.View>

        <ExpandableOverlayDescriptionAction
          bottom={bottomInset + contentBottomOffset}
          left={contentLeftInset + descriptionTextWidth}
          state={descriptionState}
        />
      </View>

      <VideoOverlayActionRail
        bottomInset={bottomInset}
        isFavorited={isFavorited}
        isLiked={isLiked}
        onActionPress={onActionPress}
      />
    </View>
  );
}

export const RowOwnedVideoOverlay = memo(RowOwnedVideoOverlayComponent);
