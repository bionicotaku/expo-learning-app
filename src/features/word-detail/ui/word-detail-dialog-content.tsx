import { Pressable, ScrollView, Text, View } from 'react-native';

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
  showLearningFeedbackActions?: boolean;
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

const learningFeedbackActions = [
  {
    backgroundColor: 'pistachio',
    borderColor: 'rgba(108,128,77,0.34)',
    id: 'known',
    label: '认识',
    textColor: 'rgba(74,100,43,0.96)',
  },
  {
    backgroundColor: 'butter',
    borderColor: 'rgba(184,148,84,0.34)',
    id: 'fuzzy',
    label: '模糊',
    textColor: 'rgba(142,107,69,0.98)',
  },
  {
    backgroundColor: 'rose',
    borderColor: 'rgba(200,90,44,0.28)',
    id: 'unknown',
    label: '不认识',
    textColor: 'rgba(176,68,48,0.96)',
  },
] as const;

function WordDetailLearningFeedbackActions() {
  const { tokens } = useEditorialPaperTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        gap: tokens.spacing.sm,
      }}
    >
      {learningFeedbackActions.map((item) => (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: true }}
          disabled
          key={item.id}
          style={{
            flex: 1,
            minHeight: 42,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: tokens.radius.pill,
            borderWidth: 1,
            borderColor: item.borderColor,
            backgroundColor: tokens.color.softAction[item.backgroundColor],
            paddingHorizontal: tokens.spacing.sm,
          }}
        >
          <Text
            selectable={false}
            style={{
              color: item.textColor,
              fontSize: 14,
              fontWeight: '700',
              lineHeight: 18,
            }}
          >
            {item.label}
          </Text>
        </Pressable>
      ))}
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

      {payload.showLearningFeedbackActions ? (
        <WordDetailLearningFeedbackActions />
      ) : null}
    </View>
  );
}
