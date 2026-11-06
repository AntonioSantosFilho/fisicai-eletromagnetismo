import { router, useLocalSearchParams, type Href } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import BotaoPrimario from "@/components/BotaoPrimario";
import BotaoSecundario from "@/components/BotaoSecundario";
import Header from "@/components/Header";
import { colors } from "@/constants";
import { useSimulacoes } from "@/hooks/useSimulacoes";

export default function PhetDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { getSimulacaoById, temaLabels } = useSimulacoes();
  const simulacao = id ? getSimulacaoById(id) : undefined;

  if (!simulacao) {
    return (
      <View className="flex-1 bg-background">
        <Header showBackButton title="Simulação" />
        <View className="flex-1 justify-center px-lg">
          <Text className="text-center font-arial text-xl font-bold text-primary">
            Simulação não encontrada
          </Text>
          <Text className="mt-sm text-center font-arial text-md leading-6 text-text-muted">
            Volte para a lista PhET e escolha outra simulação.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Header showBackButton title="Simulação" />

      <ScrollView contentContainerClassName="gap-lg px-lg pb-3xl pt-xl">
        <View className="overflow-hidden rounded-3xl border border-border bg-card">
          <View className="bg-primary px-lg py-lg">
            <Text className="font-arial text-xs font-bold uppercase tracking-widest text-secondary-ink">
              {temaLabels[simulacao.tema]}
            </Text>
            <Text
              className="mt-sm font-arial text-2xl font-bold"
              style={{ color: colors.textOnPrimary }}
            >
              {simulacao.nome}
            </Text>
          </View>
          <View className="p-lg">
            <Text className="font-arial text-md leading-6 text-text">
              {simulacao.descricao}
            </Text>
          </View>
        </View>

        <View className="rounded-3xl border border-border bg-card p-lg">
          <Text className="font-arial text-xl font-bold text-primary">
            Tópicos
          </Text>
          <View className="mt-md flex-row flex-wrap gap-sm">
            {simulacao.topicos.map((topico) => (
              <View
                key={topico}
                className="rounded-full bg-primary-light px-md py-xs"
              >
                <Text className="font-arial text-xs font-bold text-primary">
                  {topico}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="rounded-3xl border border-border bg-card p-lg">
          <Text className="font-arial text-xl font-bold text-primary">
            Objetivos de aprendizagem
          </Text>
          <View className="mt-md gap-sm">
            {simulacao.objetivos.map((objetivo) => (
              <View key={objetivo} className="flex-row gap-sm">
                <Text className="font-arial text-md font-bold text-secondary-ink">
                  •
                </Text>
                <Text className="flex-1 font-arial text-sm leading-5 text-text">
                  {objetivo}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <BotaoPrimario
          accessibilityHint="Abre o experimento PhET dentro do aplicativo"
          label="Iniciar simulação"
          onPress={() =>
            router.push(
              `/estudar/phet/simulacao?id=${encodeURIComponent(simulacao.id)}` as Href,
            )
          }
        />
        <BotaoSecundario
          label="Voltar para lista PhET"
          onPress={() => router.back()}
        />
      </ScrollView>
    </View>
  );
}
