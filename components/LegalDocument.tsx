import { ScrollView, Text, View } from "react-native";
import Header from "@/components/Header";
import { ExternalLink } from "@/components/ExternalLink";
import { SectionHeading, ui } from "@/components/StudyUI";
import { colors } from "@/constants";
import {
  getLegalDocument,
  type LegalDocumentKey,
} from "@/utils/documentosLegais";

export default function LegalDocument({
  document,
}: {
  document: LegalDocumentKey;
}) {
  const content = getLegalDocument(document);
  return (
    <View style={ui.screen}>
      <Header
        showBackButton
        title={document === "privacy" ? "Privacidade" : "Termos de uso"}
      />
      <ScrollView contentContainerStyle={ui.content}>
        <Text accessibilityRole="header" style={ui.title}>
          {content.title}
        </Text>
        {content.draft && (
          <Text style={[ui.body, { color: colors.warning }]}>
            Minuta em preparação. Os dados do responsável precisam ser
            confirmados antes da distribuição.
          </Text>
        )}
        <Text style={ui.body}>{content.summary}</Text>
        {content.sections.map((section) => (
          <View key={section.title} style={{ gap: 12 }}>
            <SectionHeading title={section.title} />
            {section.paragraphs.map((paragraph, index) => (
              <Text key={index} style={ui.body}>
                {paragraph}
              </Text>
            ))}
            {section.links.map((link) => (
              <ExternalLink
                key={link.url}
                href={link.url as `https://${string}`}
                style={[
                  ui.body,
                  { color: colors.primary, paddingVertical: 12 },
                ]}
              >
                {link.label} ↗
              </ExternalLink>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
