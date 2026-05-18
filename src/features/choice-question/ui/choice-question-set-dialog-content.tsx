import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  type LayoutChangeEvent,
  View,
} from 'react-native';

import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';
import { useModalContentLayout } from '@/shared/ui/modal/modal-content-layout';

import type {
  ChoiceQuestionData,
  ChoiceQuestionOption,
  ChoiceQuestionSetDialogData,
} from '../model/types';
import { createChoiceQuestionDisplayQuestions } from '../model/choice-question-option-randomization';
import { ChoiceQuestionBodyViewport } from './choice-question-body-viewport';
import {
  ChoiceQuestionBody,
  ChoiceQuestionBodyFooter,
  ChoiceQuestionDialogChrome,
} from './choice-question-dialog-content';
import { QuestionContentTransition } from './question-content-transition';

const AUTO_ADVANCE_DELAY_MS = 1000;

type ChoiceQuestionSetDialogContentProps = {
  onDismiss?: () => void;
  payload: ChoiceQuestionSetDialogData;
};

type ChoiceQuestionSnapshot = {
  activeWrongOptionId: string | null;
  answerDetailActionLabel: string;
  question: ChoiceQuestionData;
  selectedCorrectOptionId: string | null;
  wrongOptionIds: string[];
};

function resolveAnswerDetailActionLabel({
  currentQuestionIndex,
  questionCount,
}: {
  currentQuestionIndex: number;
  questionCount: number;
}) {
  if (currentQuestionIndex >= questionCount - 1) {
    return '完成';
  }

  return '下一个';
}

export function ChoiceQuestionSetDialogContent({
  onDismiss,
  payload,
}: ChoiceQuestionSetDialogContentProps) {
  const { tokens } = useEditorialPaperTheme();
  const { contentMaxHeight } = useModalContentLayout();
  const questions = useMemo(
    () => createChoiceQuestionDisplayQuestions(payload.questions),
    [payload.questions]
  );
  const questionCount = questions.length;
  const [chromeHeight, setChromeHeight] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedCorrectOptionId, setSelectedCorrectOptionId] = useState<
    string | null
  >(null);
  const [activeWrongOptionId, setActiveWrongOptionId] = useState<string | null>(
    null
  );
  const [wrongOptionIds, setWrongOptionIds] = useState<string[]>([]);
  const [outgoingQuestionSnapshot, setOutgoingQuestionSnapshot] =
    useState<ChoiceQuestionSnapshot | null>(null);
  const currentQuestion = questions[currentQuestionIndex];
  const hasAnsweredCorrectly = selectedCorrectOptionId !== null;
  const hadWrongAttempt = wrongOptionIds.length > 0;
  const shouldShowAnswerDetailAction =
    selectedCorrectOptionId !== null &&
    wrongOptionIds.length > 0 &&
    currentQuestion?.answerDetail;
  const shouldShowProgress = payload.showProgress ?? questionCount > 1;
  const progressLabel =
    shouldShowProgress && questionCount > 0
      ? `${currentQuestionIndex + 1}/${questionCount}`
      : undefined;
  const answerDetailActionLabel = resolveAnswerDetailActionLabel({
    currentQuestionIndex,
    questionCount,
  });

  const resetCurrentQuestionState = useCallback(() => {
    setSelectedCorrectOptionId(null);
    setActiveWrongOptionId(null);
    setWrongOptionIds([]);
  }, []);

  const advanceOrDismiss = useCallback(() => {
    if (currentQuestionIndex >= questionCount - 1) {
      onDismiss?.();
      return;
    }

    if (!currentQuestion) {
      return;
    }

    setOutgoingQuestionSnapshot({
      activeWrongOptionId,
      answerDetailActionLabel,
      question: currentQuestion,
      selectedCorrectOptionId,
      wrongOptionIds: [...wrongOptionIds],
    });
    resetCurrentQuestionState();
    setCurrentQuestionIndex((current) =>
      Math.min(current + 1, questionCount - 1)
    );
  }, [
    activeWrongOptionId,
    answerDetailActionLabel,
    currentQuestion,
    currentQuestionIndex,
    onDismiss,
    questionCount,
    resetCurrentQuestionState,
    selectedCorrectOptionId,
    wrongOptionIds,
  ]);

  useEffect(() => {
    setCurrentQuestionIndex(0);
    setOutgoingQuestionSnapshot(null);
    resetCurrentQuestionState();
  }, [questions, resetCurrentQuestionState]);

  useEffect(() => {
    if (!hasAnsweredCorrectly || hadWrongAttempt) {
      return;
    }

    const autoAdvanceTimer = setTimeout(() => {
      advanceOrDismiss();
    }, AUTO_ADVANCE_DELAY_MS);

    return () => {
      clearTimeout(autoAdvanceTimer);
    };
  }, [
    advanceOrDismiss,
    hadWrongAttempt,
    hasAnsweredCorrectly,
  ]);

  function handleSelectOption(option: ChoiceQuestionOption) {
    if (hasAnsweredCorrectly) {
      return;
    }

    if (option.isCorrect) {
      setActiveWrongOptionId(null);
      setSelectedCorrectOptionId(option.id);
      return;
    }

    setActiveWrongOptionId(option.id);
    setWrongOptionIds((current) =>
      current.includes(option.id) ? current : [...current, option.id]
    );
  }

  if (!currentQuestion) {
    return null;
  }

  function handleChromeLayout(event: LayoutChangeEvent) {
    const nextHeight = event.nativeEvent.layout.height;

    if (nextHeight <= 0 || nextHeight === chromeHeight) {
      return;
    }

    setChromeHeight(nextHeight);
  }

  function handleOutgoingOptionSelect(_option: ChoiceQuestionOption) {
    return undefined;
  }

  const bodyMaxHeight = Number.isFinite(contentMaxHeight)
    ? Math.max(0, contentMaxHeight - chromeHeight - tokens.spacing.md)
    : Number.POSITIVE_INFINITY;

  const outgoingContent = outgoingQuestionSnapshot ? (
    <ChoiceQuestionBody
      activeWrongOptionId={outgoingQuestionSnapshot.activeWrongOptionId}
      onSelectOption={handleOutgoingOptionSelect}
      question={outgoingQuestionSnapshot.question}
      selectedCorrectOptionId={
        outgoingQuestionSnapshot.selectedCorrectOptionId
      }
      wrongOptionIds={outgoingQuestionSnapshot.wrongOptionIds}
    />
  ) : null;
  const incomingContent = (
    <ChoiceQuestionBody
      activeWrongOptionId={activeWrongOptionId}
      onSelectOption={handleSelectOption}
      question={currentQuestion}
      selectedCorrectOptionId={selectedCorrectOptionId}
      wrongOptionIds={wrongOptionIds}
    />
  );

  return (
    <View style={{ gap: tokens.spacing.md }}>
      <View
        onLayout={handleChromeLayout}
        testID="choice-question-dialog-chrome-slot"
      >
        <ChoiceQuestionDialogChrome
          onDismiss={onDismiss}
          progressLabel={progressLabel}
        />
      </View>
      <ChoiceQuestionBodyViewport
        contentMaxHeight={bodyMaxHeight}
        footer={
          shouldShowAnswerDetailAction ? (
            <ChoiceQuestionBodyFooter
              answerDetailActionLabel={answerDetailActionLabel}
              onAnswerDetailActionPress={advanceOrDismiss}
              question={currentQuestion}
              selectedCorrectOptionId={selectedCorrectOptionId}
              wrongOptionIds={wrongOptionIds}
            />
          ) : null
        }
        footerGap={tokens.spacing.md}
        heightAnimationProfile={
          outgoingQuestionSnapshot ? 'questionSwitch' : 'answerReveal'
        }
        transitionKey={currentQuestion.id}
      >
        <QuestionContentTransition
          incomingContent={incomingContent}
          onTransitionEnd={() => {
            setOutgoingQuestionSnapshot(null);
          }}
          outgoingContent={outgoingContent}
          transitionKey={currentQuestion.id}
        />
      </ChoiceQuestionBodyViewport>
    </View>
  );
}
