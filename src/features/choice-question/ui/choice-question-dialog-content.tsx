import { Pressable, Text, View } from 'react-native';

import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';
import {
  EditorialTitle,
  MetaLabel,
} from '@/shared/ui/editorial-paper';

import type {
  ChoiceQuestionData,
  ChoiceQuestionKind,
  ChoiceQuestionOption,
} from '../model/types';
import {
  ChoiceQuestionAnswerDetailAction,
  ChoiceQuestionAnswerDetailPanel,
} from './choice-question-answer-detail-panel';

type ChoiceQuestionBodyProps = {
  activeWrongOptionId: string | null;
  onSelectOption: (option: ChoiceQuestionOption) => void;
  question: ChoiceQuestionData;
  selectedCorrectOptionId: string | null;
  wrongOptionIds: string[];
};

type ChoiceQuestionDialogChromeProps = {
  onDismiss?: () => void;
  progressLabel?: string;
};

export const choiceQuestionKindLabels: Record<ChoiceQuestionKind, string> = {
  context_meaning: '语境释义选择题',
  general_meaning: '通用释义选择题',
  context_cloze: '语境填空选择题',
  reverse_recognition: '反向识别题',
};

const CHOICE_QUESTION_HEADER_ACTION_SIZE = 24;

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

export function ChoiceQuestionDialogChrome({
  onDismiss,
  progressLabel,
}: ChoiceQuestionDialogChromeProps) {
  const { tokens } = useEditorialPaperTheme();

  return (
    <View
      style={{
        alignItems: 'flex-start',
        flexDirection: 'row',
        gap: tokens.spacing.sm,
        justifyContent: 'flex-end',
      }}
      testID="choice-question-dialog-chrome"
    >
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: tokens.spacing.xs,
        }}
      >
        {progressLabel ? (
          <View
            accessibilityLabel={`第 ${progressLabel} 题`}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: CHOICE_QUESTION_HEADER_ACTION_SIZE,
              borderRadius: tokens.radius.pill,
              borderCurve: 'continuous',
              backgroundColor: tokens.color.surface,
              paddingHorizontal: tokens.spacing.sm,
            }}
          >
            <Text
              selectable={false}
              style={{
                color: tokens.color.inkMute,
                fontSize: 11,
                fontWeight: '800',
                lineHeight: 14,
                fontVariant: ['tabular-nums'],
              }}
            >
              {progressLabel}
            </Text>
          </View>
        ) : null}
        <Pressable
          accessibilityLabel="关闭题目弹窗"
          accessibilityRole="button"
          onPress={onDismiss}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: CHOICE_QUESTION_HEADER_ACTION_SIZE,
            height: CHOICE_QUESTION_HEADER_ACTION_SIZE,
            borderRadius: tokens.radius.pill,
            borderCurve: 'continuous',
            backgroundColor: tokens.color.surface,
          }}
          testID="choice-question-close"
        >
          <Text
            selectable={false}
            style={{
              color: tokens.color.inkMute,
              fontSize: 15,
              fontWeight: '800',
              lineHeight: 18,
            }}
          >
            ×
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export function ChoiceQuestionBody({
  activeWrongOptionId,
  onSelectOption,
  question,
  selectedCorrectOptionId,
  wrongOptionIds,
}: ChoiceQuestionBodyProps) {
  const { tokens } = useEditorialPaperTheme();
  const hasAnsweredCorrectly = selectedCorrectOptionId !== null;
  const answerDetailToShow =
    hasAnsweredCorrectly && wrongOptionIds.length > 0 && question.answerDetail;

  return (
    <View style={{ gap: tokens.spacing.lg }}>
      <View style={{ gap: tokens.spacing.xs }}>
        <MetaLabel>{choiceQuestionKindLabels[question.kind]}</MetaLabel>
        {question.title ? (
          <EditorialTitle
            selectable
            style={{
              fontSize: 34,
              lineHeight: 38,
              letterSpacing: -0.6,
            }}
            variant="title"
          >
            {question.title}
          </EditorialTitle>
        ) : null}
      </View>

      <View style={{ gap: tokens.spacing.md }}>
        {question.contextText ? (
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
              {question.contextText}
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
            {question.prompt}
          </Text>
        </View>

        <View style={{ gap: tokens.spacing.sm }}>
          {question.options.map((option, index) => {
            const optionNumber = String(index + 1);
            const isSelectedCorrect = selectedCorrectOptionId === option.id;
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

                  onSelectOption(option);
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
          <ChoiceQuestionAnswerDetailPanel answerDetail={answerDetailToShow} />
        ) : null}
      </View>
    </View>
  );
}

export function ChoiceQuestionBodyFooter({
  answerDetailActionLabel,
  onAnswerDetailActionPress,
  question,
  selectedCorrectOptionId,
  wrongOptionIds,
}: {
  answerDetailActionLabel: string;
  onAnswerDetailActionPress?: () => void;
  question: ChoiceQuestionData;
  selectedCorrectOptionId: string | null;
  wrongOptionIds: string[];
}) {
  const shouldShowAnswerDetailAction =
    selectedCorrectOptionId !== null &&
    wrongOptionIds.length > 0 &&
    question.answerDetail;

  if (!shouldShowAnswerDetailAction) {
    return null;
  }

  return (
    <ChoiceQuestionAnswerDetailAction
      answerDetailActionLabel={answerDetailActionLabel}
      onAnswerDetailActionPress={onAnswerDetailActionPress}
    />
  );
}
