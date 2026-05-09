export type LearningUnitProgressItem = {
  coarseUnitId: number;
  kind: string;
  label: string;
  partOfSpeech: string | null;
  chineseLabel: string | null;
  chineseDefinition: string | null;
  progressPercent: number;
  lastReviewedAt: string | null;
};

export type LearningUnitProgressPage = {
  items: LearningUnitProgressItem[];
  page: {
    limit: number;
    hasMore: boolean;
    nextCursor: string | null;
  };
};

export type LearningUnitProgressPageParams = {
  limit?: number;
  cursor?: string;
  signal?: AbortSignal;
};
