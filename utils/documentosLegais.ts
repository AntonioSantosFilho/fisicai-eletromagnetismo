import documents from "@/publicacao/legal.json";
import publication from "@/publicacao/release.json";

export type LegalDocumentKey = keyof typeof documents;
export function getLegalDocument(key: LegalDocumentKey) {
  const values: Record<string, string> = {
    developerName:
      publication.developerName ??
      "responsável a confirmar antes da distribuição",
    supportEmail:
      publication.supportEmail ?? "contato a confirmar antes da distribuição",
    legalDate: publication.legalDate,
  };
  const replace = (text: string) =>
    text.replace(/\{\{(\w+)\}\}/g, (_, token: string) => values[token] ?? "");
  const doc = documents[key];
  return {
    title: doc.title,
    summary: replace(doc.summary),
    draft: !publication.developerName || !publication.supportEmail,
    sections: doc.sections.map((section) => ({
      ...section,
      paragraphs: section.paragraphs.map(replace),
      links: "links" in section ? (section.links ?? []) : [],
    })),
  };
}
