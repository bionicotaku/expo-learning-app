export type LearningUnitProgressItemDto = {
  coarse_unit_id: number;
  kind: string;
  label: string;
  pos: string | null;
  chinese_label: string | null;
  chinese_def: string | null;
  progress_percent: number;
  last_reviewed_at: string | null;
};

export type LearningUnitProgressPageDto = {
  items: LearningUnitProgressItemDto[];
  page: {
    limit: number;
    has_more: boolean;
    next_cursor: string | null;
  };
};
