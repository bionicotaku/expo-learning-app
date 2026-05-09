export type WordListSourceMode = 'unlearned' | 'learned' | 'favorites';

export type WordListSourceItem = {
  id: string;
  coarseUnitId: number;
  label: string;
  partOfSpeech: string | null;
  chineseLabel: string;
  chineseDefinition: string;
  progress: number;
};

export type WordListSourceOptions = {
  enabled?: boolean;
};

export type WordListSourceResult = {
  items: WordListSourceItem[];
  error: Error | null;
  isInitialLoading: boolean;
  isRefreshing: boolean;
  isExtending: boolean;
  refresh: () => Promise<void>;
  requestMore: () => Promise<void>;
};
