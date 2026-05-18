import {
  existsSync,
  readFileSync,
} from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('choice question source', () => {
  it('defines the set-based single-choice contract and keeps modal orchestration in the feature', () => {
    const indexSource = readFileSync(
      resolve(process.cwd(), 'src/features/choice-question/index.ts'),
      'utf8'
    );
    const typesSource = readFileSync(
      resolve(process.cwd(), 'src/features/choice-question/model/types.ts'),
      'utf8'
    );
    const setSource = readFileSync(
      resolve(
        process.cwd(),
        'src/features/choice-question/ui/choice-question-set-dialog-content.tsx'
      ),
      'utf8'
    );
    const contentSource = readFileSync(
      resolve(
        process.cwd(),
        'src/features/choice-question/ui/choice-question-dialog-content.tsx'
      ),
      'utf8'
    );
    const answerRevealPath = resolve(
      process.cwd(),
      'src/features/choice-question/ui/choice-question-answer-detail-reveal.tsx'
    );
    const answerDetailPanelPath = resolve(
      process.cwd(),
      'src/features/choice-question/ui/choice-question-answer-detail-panel.tsx'
    );
    const answerDetailPanelSource = existsSync(answerDetailPanelPath)
      ? readFileSync(answerDetailPanelPath, 'utf8')
      : '';
    const viewportSource = readFileSync(
      resolve(
        process.cwd(),
        'src/features/choice-question/ui/animated-question-viewport.tsx'
      ),
      'utf8'
    );
    const transitionSource = readFileSync(
      resolve(
        process.cwd(),
        'src/features/choice-question/ui/question-content-transition.tsx'
      ),
      'utf8'
    );

    expect(indexSource).toContain('usePresentChoiceQuestionSetDialog');
    expect(indexSource).toContain('ChoiceQuestionSetDialogContent');
    expect(indexSource).toContain('ChoiceQuestionSetDialogData');
    expect(indexSource).toContain('ChoiceQuestionData');
    expect(indexSource).not.toContain('usePresentChoiceQuestionDialog');

    expect(typesSource).toContain('ChoiceQuestionKind');
    expect(typesSource).toContain("'context_meaning'");
    expect(typesSource).toContain("'general_meaning'");
    expect(typesSource).toContain("'context_cloze'");
    expect(typesSource).toContain("'reverse_recognition'");
    expect(typesSource).toContain('ChoiceQuestionOption');
    expect(typesSource).toContain('ChoiceQuestionData');
    expect(typesSource).toContain('ChoiceQuestionSetDialogData');
    expect(typesSource).toContain('id: string');
    expect(typesSource).toContain('isCorrect: boolean');
    expect(typesSource).toContain('title?: string');
    expect(typesSource).toContain('questions: ChoiceQuestionData[]');
    expect(typesSource).toContain('showProgress?: boolean');
    expect(typesSource).not.toContain('questionProgress');

    expect(setSource).toContain('AUTO_ADVANCE_DELAY_MS = 1000');
    expect(setSource).toContain('setTimeout');
    expect(setSource).toContain('clearTimeout');
    expect(setSource).toContain('currentQuestionIndex');
    expect(setSource).toContain('wrongOptionIds');
    expect(setSource).toContain('hasAnsweredCorrectly');
    expect(setSource).toContain('hadWrongAttempt');
    expect(setSource).toContain('outgoingQuestionSnapshot');
    expect(setSource).toContain('setOutgoingQuestionSnapshot');
    expect(setSource).toContain('AnimatedQuestionViewport');
    expect(setSource).toContain('heightAnimationProfile=');
    expect(setSource).toContain("'questionSwitch'");
    expect(setSource).toContain("'answerReveal'");
    expect(setSource).not.toContain('heightAnimationDurationMs=');
    expect(setSource).toContain('QuestionContentTransition');
    expect(setSource).toContain('ChoiceQuestionDialogChrome');
    expect(setSource).toContain('ChoiceQuestionBody');
    expect(setSource).toContain('showProgress');
    expect(setSource).not.toContain('MeasuredHeightSwitcher');
    expect(setSource).not.toContain('ScrollView');
    expect(setSource).not.toContain('fetch(');
    expect(setSource).not.toContain('toast.');

    expect(contentSource).toContain('ChoiceQuestionDialogChrome');
    expect(contentSource).toContain('ChoiceQuestionBody');
    expect(contentSource).toContain('ChoiceQuestionAnswerDetailPanel');
    expect(contentSource).toContain('onSelectOption');
    expect(contentSource).toContain('onAnswerDetailActionPress');
    expect(contentSource).toContain('progressLabel?: string');
    expect(contentSource).toContain('optionNumber');
    expect(contentSource).toContain("tokens.color.softAction.pistachio");
    expect(contentSource).toContain("tokens.color.softAction.rose");
    expect(contentSource).toContain('choice-question-close');
    expect(contentSource).toContain('×');
    expect(contentSource).not.toContain('useState');
    expect(contentSource).not.toContain('setSelectedOptionId');
    expect(contentSource).not.toContain('questionProgress');
    expect(contentSource).not.toContain('payload.targetText ?');
    expect(contentSource).not.toContain('onSubmit');
    expect(contentSource).not.toContain('onCorrect');
    expect(contentSource).not.toContain('onIncorrect');

    expect(existsSync(answerDetailPanelPath)).toBe(true);
    expect(existsSync(answerRevealPath)).toBe(false);
    expect(answerDetailPanelSource).toContain('ChoiceQuestionAnswerDetailPanel');
    expect(answerDetailPanelSource).toContain('ANSWER_DETAIL_FADE_DURATION_MS = 120');
    expect(answerDetailPanelSource).toContain('useSharedValue');
    expect(answerDetailPanelSource).toContain('useAnimatedStyle');
    expect(answerDetailPanelSource).toContain('withTiming');
    expect(answerDetailPanelSource).not.toContain('ANSWER_REVEAL_HEIGHT_DURATION_MS');
    expect(answerDetailPanelSource).not.toContain('LayoutChangeEvent');
    expect(answerDetailPanelSource).not.toContain('useState');
    expect(answerDetailPanelSource).not.toContain('onLayout');
    expect(answerDetailPanelSource).not.toContain('answerRevealProgress');
    expect(answerDetailPanelSource).not.toContain('setAnswerDetailHeight');
    expect(answerDetailPanelSource).not.toContain('ScrollView');

    expect(viewportSource).toContain('AnimatedQuestionViewport');
    expect(viewportSource).toContain('AnimatedQuestionViewportHeightProfile');
    expect(viewportSource).toContain('QUESTION_VIEWPORT_HEIGHT_DURATIONS_MS');
    expect(viewportSource).toContain('questionSwitch: 200');
    expect(viewportSource).toContain('answerReveal: 200');
    expect(viewportSource).toContain("heightAnimationProfile = 'answerReveal'");
    expect(viewportSource).toContain('height: viewportHeight.value');
    expect(viewportSource).toContain('onLayout={handleViewportLayout}');
    expect(viewportSource).toContain('hasMeasuredHeight');
    expect(viewportSource).toContain('withTiming');
    expect(viewportSource).not.toContain('setTimeout');
    expect(viewportSource).not.toContain('releaseHeightTimerRef');
    expect(viewportSource).not.toContain('isHeightAnimationActive');
    expect(viewportSource).not.toContain('contentOpacity');
    expect(viewportSource).not.toContain('opacity:');
    expect(viewportSource).not.toContain('ScrollView');
    expect(viewportSource).not.toContain('LinearTransition');
    expect(viewportSource).not.toContain('FadeIn');

    expect(transitionSource).toContain('QuestionContentTransition');
    expect(transitionSource).toContain('CONTENT_CROSSFADE_DURATION_MS = 260');
    expect(transitionSource).toContain('outgoingContent');
    expect(transitionSource).toContain('incomingContent');
    expect(transitionSource).toContain('incomingOpacity');
    expect(transitionSource).toContain('previousOpacity');
    expect(transitionSource).toContain('pointerEvents="none"');
    expect(transitionSource).toContain('accessibilityElementsHidden');
    expect(transitionSource).toContain('importantForAccessibility="no-hide-descendants"');
    expect(transitionSource).not.toContain('setPreviousContent');
    expect(transitionSource).not.toContain('latestContentRef');
    expect(transitionSource).not.toContain('currentContent');
    expect(transitionSource).not.toContain('contentKey');
    expect(transitionSource).not.toContain('ScrollView');
    expect(transitionSource).not.toContain('LinearTransition');
    expect(transitionSource).not.toContain('FadeIn');
  });
});
