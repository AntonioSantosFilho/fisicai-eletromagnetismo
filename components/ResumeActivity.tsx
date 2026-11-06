import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { Text, View } from "react-native";
import { usePerfil } from "@/context/PerfilContext";
import { sessoesService } from "@/services/sessoesService";
import { encontrarRetomada } from "@/utils/retomada";
import { ui } from "@/components/StudyUI";
import BotaoPrimario from "@/components/BotaoPrimario";
import SessionProgress from "@/components/SessionProgress";

export default function ResumeActivity() {
  const { perfil } = usePerfil();
  const [saved, setSaved] = useState<{
    owner: string;
    item: ReturnType<typeof encontrarRetomada>;
    error?: string;
  } | null>(null);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      void sessoesService
        .listar(perfil.id)
        .then((drafts) => {
          if (active)
            setSaved({
              owner: perfil.id,
              item: encontrarRetomada(drafts, perfil.id),
            });
        })
        .catch(() => {
          if (active)
            setSaved({
              owner: perfil.id,
              item: null,
              error:
                "Não foi possível consultar o andamento salvo. Os dados foram preservados.",
            });
        });
      return () => {
        active = false;
      };
    }, [perfil.id]),
  );
  if (!saved || saved.owner !== perfil.id) return null;
  if (saved.error) return <Text style={ui.body}>{saved.error}</Text>;
  const item = saved.item;
  if (!item) return null;
  return (
    <View style={[ui.card, { padding: 16, gap: 10 }]}>
      <Text
        accessibilityRole="header"
        style={[ui.title, { fontSize: 18, lineHeight: 24 }]}
      >
        Continuar de onde parou
      </Text>
      <Text style={ui.body}>
        {item.atividade} · {item.tema}
      </Text>
      <Text style={ui.body}>
        {item.nivel} · {item.completed} de {item.total}{" "}
        {item.tipo === "memoria"
          ? "pares encontrados"
          : item.tipo === "flashcards"
            ? "cartões autoavaliados"
            : "itens respondidos"}
      </Text>
      <SessionProgress completed={item.completed} total={item.total} />
      <BotaoPrimario
        label={`Retomar ${item.atividade}`}
        onPress={() =>
          router.push({
            pathname: `/jogos/${item.tipo}/[modulo]`,
            params: { modulo: item.modulo, dificuldade: item.dificuldade },
          })
        }
      />
    </View>
  );
}
