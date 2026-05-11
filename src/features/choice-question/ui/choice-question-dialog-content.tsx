import { useEffect, useState } from 'react';
import {
  type LayoutChangeEvent,
  Pressable,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';
import {
  EditorialTitle,
  MetaLabel,
} from '@/shared/ui/editorial-paper';

export type ChoiceQuestionKind =
  | 'context_meaning'
  | 'general_meaning'
  | 'context_cloze'
  | 'reverse_recognition';

export type ChoiceQuestionOption = {
  id: string;
  label: string;
  isCorrect: boolean;
};

export type ChoiceQuestionAnswerDetail = {
  label: string;
  pos: string;
  chineseLabel: string;
  explanation: string;
};

export type ChoiceQuestionDialogData = {
  kind: ChoiceQuestionKind;
  title?: string;
  prompt: string;
  contextText?: string;
  targetText?: string;
  answerDetail?: ChoiceQuestionAnswerDetail;
  options: ChoiceQuestionOption[];
};

type ChoiceQuestionDialogContentProps = {
  payload: ChoiceQuestionDialogData;
};

export const choiceQuestionKindLabels: Record<ChoiceQuestionKind, string> = {
  context_meaning: '语境释义选择题',
  general_meaning: '通用释义选择题',
  context_cloze: '语境填空选择题',
  reverse_recognition: '反向识别题',
};

const ANSWER_REVEAL_HEIGHT_DURATION_MS = 440;
const ANSWER_DETAIL_FADE_DELAY_MS = 320;
const ANSWER_DETAIL_FADE_DURATION_MS = 180;
const answerRevealEasing = Easing.out(Easing.cubic);

function resolveOptionTone({
  hasAnsweredCorrectly,
  wasSelectedWrong,
  isSelectedCorrect,
  isCorrect,
}: {
  hasAnsweredCorrectly: boolean;
  wasSelectedWrong: boolean;
  isSelectedCorrect: boolean;
  isCorrect: boolean;
}) {
  if (!hasAnsweredCorrectly && !wasSelectedWrong) {
    return 'neutral' as const;
  }

  if (isCorrect && isSelectedCorrect) {
    return 'correct' as const;
  }

  if (wasSelectedWrong) {
    return 'wrong' as const;
  }

  return 'neutral' as const;
}

function resolveOptionAccessibilitySuffix({
  hasAnsweredCorrectly,
  isSelected,
  wasSelectedWrong,
  isCorrect,
}: {
  hasAnsweredCorrectly: boolean;
  isSelected: boolean;
  wasSelectedWrong: boolean;
  isCorrect: boolean;
}) {
  if (hasAnsweredCorrectly && isSelected && isCorrect) {
    return '回答正确';
  }

  if (wasSelectedWrong) {
    return '回答错误';
  }

  return '未选择';
}

function ChoiceQuestionAnswerDetailBody({
  answerDetail,
}: {
  answerDetail: ChoiceQuestionAnswerDetail;
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
    </View>
  );
}

function ChoiceQuestionAnswerDetailReveal({
  answerDetail,
}: {
  answerDetail: ChoiceQuestionAnswerDetail;
}) {
  const [answerDetailHeight, setAnswerDetailHeight] = useState(0);
  const answerRevealProgress = useSharedValue(0);
  const answerDetailOpacity = useSharedValue(0);

  useEffect(() => {
    if (answerDetailHeight <= 0) {
      return;
    }

    answerRevealProgress.value = 0;
    answerDetailOpacity.value = 0;
    answerRevealProgress.value = withTiming(1, {
      duration: ANSWER_REVEAL_HEIGHT_DURATION_MS,
      easing: answerRevealEasing,
    });
    answerDetailOpacity.value = withDelay(
      ANSWER_DETAIL_FADE_DELAY_MS,
      withTiming(1, {
        duration: ANSWER_DETAIL_FADE_DURATION_MS,
        easing: answerRevealEasing,
      })
    );
  }, [answerDetailHeight, answerDetailOpacity, answerRevealProgress]);

  const answerRevealLayout = useAnimatedStyle(() => ({
    height: answerDetailHeight * answerRevealProgress.value,
  }));
  const answerDetailContentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: answerDetailOpacity.value,
  }));

  function handleAnswerDetailLayout(event: LayoutChangeEvent) {
    const nextHeight = event.nativeEvent.layout.height;

    if (nextHeight <= 0 || nextHeight === answerDetailHeight) {
      return;
    }

    setAnswerDetailHeight(nextHeight);
  }

  return (
    <View style={{ position: 'relative' }}>
      {answerDetailHeight === 0 ? (
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          onLayout={handleAnswerDetailLayout}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            opacity: 0,
          }}
        >
          <ChoiceQuestionAnswerDetailBody answerDetail={answerDetail} />
        </View>
      ) : null}

      <Animated.View
        style={[
          {
            overflow: 'hidden',
          },
          answerRevealLayout,
        ]}
      >
        {answerDetailHeight > 0 ? (
          <Animated.View style={answerDetailContentAnimatedStyle}>
            <ChoiceQuestionAnswerDetailBody answerDetail={answerDetail} />
          </Animated.View>
        ) : null}
      </Animated.View>
    </View>
  );
}

export function ChoiceQuestionDialogContent({
  payload,
}: ChoiceQuestionDialogContentProps) {
  const { tokens } = useEditorialPaperTheme();
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [activeWrongOptionId, setActiveWrongOptionId] = useState<string | null>(
    null
  );
  const [wrongOptionIds, setWrongOptionIds] = useState<string[]>([]);
  const hasAnsweredCorrectly = selectedOptionId !== null;
  const answerDetail = payload.answerDetail;
  const answerDetailToShow =
    hasAnsweredCorrectly && wrongOptionIds.length > 0 && answerDetail;

  return (
    <View style={{ gap: tokens.spacing.lg }}>
      <View style={{ gap: tokens.spacing.xs }}>
        <MetaLabel>{choiceQuestionKindLabels[payload.kind]}</MetaLabel>
        {payload.title ? (
          <EditorialTitle
            selectable
            style={{
              fontSize: 34,
              lineHeight: 38,
              letterSpacing: -0.6,
            }}
            variant="title"
          >
            {payload.title}
          </EditorialTitle>
        ) : null}
      </View>

      <View style={{ gap: tokens.spacing.md }}>
        {payload.contextText ? (
          <View
            style={{
              gap: tokens.spacing.xs,
              paddingVertical: tokens.spacing.xs,
            }}
          >
            <MetaLabel>语境</MetaLabel>
            <Text
              selectable
              style={{
                color: tokens.color.inkSoft,
                fontSize: 14,
                fontWeight: '600',
                lineHeight: 23,
              }}
            >
              {payload.contextText}
            </Text>
          </View>
        ) : null}

        <View
          style={{
            gap: tokens.spacing.xs,
            paddingVertical: tokens.spacing.xs,
          }}
        >
          <MetaLabel>题目</MetaLabel>
          <Text
            selectable
            style={{
              color: tokens.color.inkSoft,
              fontSize: 15,
              fontWeight: '700',
              lineHeight: 24,
            }}
          >
            {payload.prompt}
          </Text>
        </View>

        <View style={{ gap: tokens.spacing.sm }}>
          {payload.options.map((option, index) => {
            const optionNumber = String(index + 1);
            const isSelectedCorrect = selectedOptionId === option.id;
            const wasSelectedWrong = wrongOptionIds.includes(option.id);
            const isSelected =
              isSelectedCorrect ||
              (!hasAnsweredCorrectly && activeWrongOptionId === option.id);
            const optionTone = resolveOptionTone({
              hasAnsweredCorrectly,
              wasSelectedWrong,
              isSelectedCorrect,
              isCorrect: option.isCorrect,
            });
            const accessibilitySuffix = resolveOptionAccessibilitySuffix({
              hasAnsweredCorrectly,
              isSelected,
              wasSelectedWrong,
              isCorrect: option.isCorrect,
            });
            const backgroundColor =
              optionTone === 'correct'
                ? tokens.color.softAction.pistachio
                : optionTone === 'wrong'
                  ? tokens.color.softAction.rose
                  : tokens.color.surface;
            const borderColor =
              optionTone === 'correct'
                ? 'rgba(108,128,77,0.42)'
                : optionTone === 'wrong'
                  ? 'rgba(200,90,44,0.38)'
                  : 'rgba(28,26,23,0.12)';
            const textColor =
              optionTone === 'correct'
                ? 'rgba(74,100,43,0.96)'
                : optionTone === 'wrong'
                  ? 'rgba(176,68,48,0.96)'
                  : tokens.color.inkSoft;

            return (
              <Pressable
                accessibilityLabel={`${option.label}，${accessibilitySuffix}`}
                accessibilityRole="button"
                accessibilityState={{
                  disabled: hasAnsweredCorrectly,
                  selected: isSelected,
                }}
                disabled={hasAnsweredCorrectly}
                key={option.id}
                onPress={() => {
                  if (hasAnsweredCorrectly) {
                    return;
                  }

                  if (option.isCorrect) {
                    setActiveWrongOptionId(null);
                    setSelectedOptionId(option.id);
                    return;
                  }

                  setActiveWrongOptionId(option.id);
                  setWrongOptionIds((current) =>
                    current.includes(option.id)
                      ? current
                      : [...current, option.id]
                  );
                }}
                style={({ pressed }) => ({
                  minHeight: 48,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: tokens.spacing.sm,
                  justifyContent: 'center',
                  borderRadius: tokens.radius.control,
                  borderCurve: 'continuous',
                  borderWidth: 1,
                  borderColor,
                  backgroundColor,
                  opacity: pressed ? 0.88 : 1,
                  paddingHorizontal: tokens.spacing.md,
                  paddingVertical: tokens.spacing.sm,
                })}
                testID={`choice-option-${option.id}`}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: tokens.radius.pill,
                    backgroundColor: 'rgba(28,26,23,0.08)',
                  }}
                >
                  <Text
                    selectable={false}
                    style={{
                      color: textColor,
                      fontSize: 12,
                      fontWeight: '900',
                      lineHeight: 16,
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    {optionNumber}
                  </Text>
                </View>
                <Text
                  selectable={false}
                  style={{
                    color: textColor,
                    flex: 1,
                    fontSize: 14,
                    fontWeight: '800',
                    lineHeight: 20,
                  }}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {answerDetailToShow ? (
          <ChoiceQuestionAnswerDetailReveal answerDetail={answerDetailToShow} />
        ) : null}
      </View>
    </View>
  );
}
