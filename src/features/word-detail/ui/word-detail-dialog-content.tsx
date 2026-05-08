import { ScrollView, Text, View } from 'react-native';

import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';
import {
  EditorialTitle,
  MetaLabel,
} from '@/shared/ui/editorial-paper';

export type WordDetailDialogPayload = {
  text: string;
  explanation: string;
  semantic_element: {
    base_form: string;
    dictionary: string;
    coarse_id: number | null;
  };
};

type WordDetailDialogContentProps = {
  payload: WordDetailDialogPayload;
};

function WordDetailSection({
  body,
  title,
}: {
  body: string;
  title: string;
}) {
  const { tokens } = useEditorialPaperTheme();

  return (
    <View
      style={{
        gap: tokens.spacing.sm,
        paddingVertical: tokens.spacing.xs,
      }}
    >
      <MetaLabel>{title}</MetaLabel>
      <Text
        selectable
        style={{
          color: tokens.color.inkSoft,
          fontSize: 14,
          fontWeight: '500',
          lineHeight: 23,
        }}
      >
        {body}
      </Text>
    </View>
  );
}

export function WordDetailDialogContent({
  payload,
}: WordDetailDialogContentProps) {
  const { tokens } = useEditorialPaperTheme();

  return (
    <View style={{ gap: tokens.spacing.lg }}>
      <View style={{ gap: tokens.spacing.xs }}>
        <EditorialTitle
          selectable
          style={{
            fontSize: 34,
            lineHeight: 38,
            letterSpacing: -0.6,
          }}
          variant="title"
        >
          {payload.text}
        </EditorialTitle>
        <Text
          selectable
          style={{
            color: tokens.color.inkMute,
            fontSize: 14,
            fontWeight: '700',
            lineHeight: 18,
          }}
        >
          {payload.semantic_element.base_form}
        </Text>
      </View>

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        style={{ maxHeight: 380 }}
        contentContainerStyle={{
          gap: tokens.spacing.md,
        }}
      >
        <WordDetailSection title="上下文释义" body={payload.explanation} />
        <WordDetailSection
          title="字典释义"
          body={payload.semantic_element.dictionary}
        />
      </ScrollView>
    </View>
  );
}
