import { ScrollView, Text, View } from 'react-native';

import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';
import {
  EditorialTitle,
  MetaLabel,
} from '@/shared/ui/editorial-paper';

export type WordDetailDialogSection = {
  id: string;
  title: string;
  body: string;
};

export type WordDetailDialogData = {
  title: string;
  subtitle?: string;
  sections: WordDetailDialogSection[];
};

type WordDetailDialogContentProps = {
  payload: WordDetailDialogData;
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
          {payload.title}
        </EditorialTitle>
        {payload.subtitle ? (
          <Text
            selectable
            style={{
              color: tokens.color.inkMute,
              fontSize: 14,
              fontWeight: '700',
              lineHeight: 18,
            }}
          >
            {payload.subtitle}
          </Text>
        ) : null}
      </View>

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        style={{ maxHeight: 380 }}
        contentContainerStyle={{
          gap: tokens.spacing.md,
        }}
      >
        {payload.sections.map((section) => (
          <WordDetailSection
            key={section.id}
            title={section.title}
            body={section.body}
          />
        ))}
      </ScrollView>
    </View>
  );
}
