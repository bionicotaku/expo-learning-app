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

export type ChoiceQuestionData = {
  id: string;
  kind: ChoiceQuestionKind;
  title?: string;
  prompt: string;
  contextText?: string;
  targetText?: string;
  answerDetail?: ChoiceQuestionAnswerDetail;
  options: ChoiceQuestionOption[];
};

export type ChoiceQuestionSetDialogData = {
  questions: ChoiceQuestionData[];
  showProgress?: boolean;
};
