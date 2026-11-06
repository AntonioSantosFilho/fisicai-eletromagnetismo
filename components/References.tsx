import { Text, View } from "react-native";
import { ExternalLink } from "@/components/ExternalLink";
import { fontFamily, ui } from "@/components/StudyUI";
import { colors } from "@/constants";
import {
  dataAcessoAbnt,
  obterReferencias,
  edicaoPontuada,
} from "@/utils/referencias";

export default function References({
  ids,
  exercise = false,
}: {
  ids: string[];
  exercise?: boolean;
}) {
  const references = obterReferencias(ids);
  return (
    <View style={{ gap: 16 }}>
      <Text
        style={{
          fontFamily,
          fontSize: 17,
          fontWeight: "700",
          color: colors.text,
        }}
      >
        {exercise
          ? "Referências de apoio ao exercício"
          : "Referências de apoio"}
      </Text>
      {exercise && (
        <Text style={[ui.body, { fontSize: 14 }]}>
          A fonte exata deste enunciado ainda está em conferência. Os materiais
          abaixo apoiam o conteúdo estudado.
        </Text>
      )}
      {references.map((reference) => (
        <View key={reference.id} style={{ gap: 7 }}>
          <Text
            selectable
            style={{
              fontFamily,
              color: colors.textMuted,
              fontSize: 14,
              lineHeight: 21,
            }}
          >
            {reference.autores}.{" "}
            <Text style={{ fontWeight: "700" }}>{reference.titulo}</Text>.{" "}
            {edicaoPontuada(reference.edicao)}
            {reference.local}: {reference.editora}, {reference.ano}. Disponível
            em:{" "}
            <ExternalLink
              href={reference.url as `https://${string}`}
              style={{ color: colors.primary, textDecorationLine: "underline" }}
            >
              {reference.url}
            </ExternalLink>
            . Acesso em: {dataAcessoAbnt(reference.data_acesso)}.
          </Text>
          <ExternalLink
            accessibilityLabel={`Consultar ${reference.titulo}`}
            href={reference.url as `https://${string}`}
            style={{
              fontFamily,
              color: colors.primary,
              fontSize: 14,
              fontWeight: "600",
              minHeight: 44,
              paddingVertical: 10,
            }}
          >
            Consultar material ↗
          </ExternalLink>
        </View>
      ))}
    </View>
  );
}
