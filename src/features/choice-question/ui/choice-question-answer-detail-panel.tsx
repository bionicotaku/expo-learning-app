import { useEffect } from 'react';
import {
  Pressable,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';
import { MetaLabel } from '@/shared/ui/editorial-paper';

import type { ChoiceQuestionAnswerDetail } from '../model/types';

const ANSWER_DETAIL_FADE_DURATION_MS = 120;
const answerRevealEasing = Easing.out(Easing.cubic);

function ChoiceQuestionAnswerDetailBody({
  answerDetail,
  answerDetailActionLabel,
  onAnswerDetailActionPress,
}: {
  answerDetail: ChoiceQuestionAnswerDetail;
  answerDetailActionLabel: string;
  onAnswerDetailActionPress?: () => void;
}) {
  const { tokens } = useEditorialPaperTheme();

  return (
    <View
      style={{
        gap: tokens.spacing.md,
        paddingTop: tokens.spacing.xs,
      }}
    >
      <View
        style={{
          gap: tokens.spacing.xs,
          paddingVertical: tokens.spacing.xs,
        }}
      >
        <MetaLabel>答案解析</MetaLabel>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'baseline',
            gap: tokens.spacing.xs,
          }}
        >
          <Text
            selectable
            style={{
              color: tokens.color.ink,
              fontSize: 18,
              fontWeight: '800',
              lineHeight: 24,
            }}
          >
            {answerDetail.label}
          </Text>
          <Text
            selectable
            style={{
              color: tokens.color.inkMute,
              fontSize: 13,
              fontWeight: '800',
              lineHeight: 18,
            }}
          >
            {answerDetail.pos}
          </Text>
          <Text
            selectable
            style={{
              color: tokens.color.inkSoft,
              fontSize: 14,
              fontWeight: '700',
              lineHeight: 20,
            }}
          >
            {answerDetail.chineseLabel}
          </Text>
        </View>
      </View>

      <View
        style={{
          gap: tokens.spacing.xs,
          paddingVertical: tokens.spacing.xs,
        }}
      >
        <MetaLabel>解释</MetaLabel>
        <Text
          selectable
          style={{
            color: tokens.color.inkSoft,
            fontSize: 14,
            fontWeight: '600',
            lineHeight: 23,
          }}
        >
          {answerDetail.explanation}
        </Text>
      </View>

      <Pressable
        accessibilityLabel={answerDetailActionLabel}
        accessibilityRole="button"
        onPress={onAnswerDetailActionPress}
        style={{
          alignItems: 'center',
          alignSelf: 'stretch',
          borderRadius: tokens.radius.control,
          borderCurve: 'continuous',
          backgroundColor: tokens.color.ink,
          minHeight: 46,
          justifyContent: 'center',
          paddingHorizontal: tokens.spacing.md,
          paddingVertical: tokens.spacing.sm,
        }}
      >
        <Text
          selectable={false}
          style={{
            color: tokens.color.surface,
            fontSize: 14,
            fontWeight: '800',
            lineHeight: 18,
          }}
        >
          {answerDetailActionLabel}
        </Text>
      </Pressable>
    </View>
  );
}

export function ChoiceQuestionAnswerDetailPanel({
  answerDetail,
  answerDetailActionLabel,
  onAnswerDetailActionPress,
}: {
  answerDetail: ChoiceQuestionAnswerDetail;
  answerDetailActionLabel: string;
  onAnswerDetailActionPress?: () => void;
}) {
  const answerDetailOpacity = useSharedValue(0);

  useEffect(() => {
    answerDetailOpacity.value = 0;
    answerDetailOpacity.value = withTiming(1, {
      duration: ANSWER_DETAIL_FADE_DURATION_MS,
      easing: answerRevealEasing,
    });
  }, [answerDetail, answerDetailOpacity]);

  const answerDetailContentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: answerDetailOpacity.value,
  }));

  return (
    <Animated.View style={answerDetailContentAnimatedStyle}>
      <ChoiceQuestionAnswerDetailBody
        answerDetail={answerDetail}
        answerDetailActionLabel={answerDetailActionLabel}
        onAnswerDetailActionPress={onAnswerDetailActionPress}
      />
    </Animated.View>
  );
}
