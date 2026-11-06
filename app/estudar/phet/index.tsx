import { router, type Href } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import Header from "@/components/Header";
import SimulacaoCard from "@/components/SimulacaoCard";
import { SectionHeading } from "@/components/StudyUI";
import { useSimulacoes } from "@/hooks/useSimulacoes";

export default function PhetListScreen() {
  const { agrupadasPorTema } = useSimulacoes();

  return (
    <View className="flex-1 bg-background">
      <Header showBackButton title="Simulações" />

      <ScrollView contentContainerClassName="px-lg pb-3xl pt-xl">
        <View className="gap-xl">
          {agrupadasPorTema.map((grupo) => (
            <View key={grupo.tema} className="gap-md">
              <SectionHeading
                title={grupo.titulo}
                detail={`${grupo.simulacoes.length} simulações`}
              />

              {grupo.simulacoes.map((simulacao) => (
                <SimulacaoCard
                  key={simulacao.id}
                  descricao={simulacao.descricao}
                  nome={simulacao.nome}
                  onPress={() =>
                    router.push(
                      `/estudar/phet/${encodeURIComponent(simulacao.id)}` as Href,
                    )
                  }
                  tema={simulacao.tema}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
