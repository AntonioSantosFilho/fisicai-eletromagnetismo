import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "@/components/Header";
import { ExternalLink } from "@/components/ExternalLink";
import SimulationViewer from "@/components/SimulationViewer";
import { fontFamily, ui } from "@/components/StudyUI";
import { colors } from "@/constants";
import { obterSimulacaoPermitida } from "@/utils/simulacoes";

export default function PhetSimulationScreen() {
  const [expanded, setExpanded] = useState(false);
  const [fullscreenNotice, setFullscreenNotice] = useState("");
  const stage = useRef<View>(null);
  function closeExpanded() {
    setExpanded(false);
    setFullscreenNotice("");
    if (Platform.OS === "web" && document.fullscreenElement)
      void document.exitFullscreen().catch(() => undefined);
  }
  async function expand() {
    setExpanded(true);
    setFullscreenNotice("");
    if (Platform.OS !== "web") return;
    const element = stage.current as unknown as HTMLElement | null;
    try {
      if (!element?.requestFullscreen) throw new Error("unsupported");
      await element.requestFullscreen();
    } catch {
      setFullscreenNotice(
        "Área ampliada. Para mais espaço, gire o celular ou abra no navegador.",
      );
    }
  }
  useEffect(() => {
    if (!expanded) return;
    if (Platform.OS === "web") {
      const onChange = () => {
        if (!document.fullscreenElement) setExpanded(false);
      };
      const onKey = (event: KeyboardEvent) => {
        if (event.key === "Escape") closeExpanded();
      };
      document.addEventListener("fullscreenchange", onChange);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("fullscreenchange", onChange);
        document.removeEventListener("keydown", onKey);
        if (document.fullscreenElement)
          void document.exitFullscreen().catch(() => undefined);
      };
    }
    const listener = BackHandler.addEventListener("hardwareBackPress", () => {
      setExpanded(false);
      return true;
    });
    return () => listener.remove();
  }, [expanded]);
  const { id, url } = useLocalSearchParams<{ id?: string; url?: string }>();
  const simulation = obterSimulacaoPermitida(
    Array.isArray(id) ? id[0] : id,
    Array.isArray(url) ? url[0] : url,
  );
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const finishLoading = useCallback(() => setLoading(false), []);
  const failLoading = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);
  useEffect(() => {
    setLoading(true);
    setError(false);
  }, [simulation?.id, revision]);
  useEffect(() => {
    if (!loading) return;
    const timeout = setTimeout(() => {
      setLoading(false);
      setError(true);
    }, 30000);
    return () => clearTimeout(timeout);
  }, [loading, simulation?.id, revision]);
  function back() {
    if (router.canGoBack()) router.back();
    else router.replace("/estudar/phet");
  }
  return (
    <SafeAreaView
      ref={stage}
      edges={Platform.OS === "web" && expanded ? ["bottom"] : []}
      style={ui.screen}
    >
      <Stack.Screen
        options={{ orientation: expanded ? "landscape" : "portrait" }}
      />
      {expanded ? (
        <SafeAreaView
          edges={["top", "left", "right"]}
          style={{ backgroundColor: colors.surface }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sair da tela cheia"
            onPress={closeExpanded}
            style={[
              ui.button,
              { minHeight: 48, alignSelf: "flex-start", paddingHorizontal: 16 },
            ]}
          >
            <Text style={[ui.buttonText, { color: colors.primary }]}>
              ← Sair da tela cheia
            </Text>
          </Pressable>
        </SafeAreaView>
      ) : (
        <Header
          showBackButton
          onBackPress={back}
          title={simulation?.nome ?? "Simulação"}
        />
      )}
      {!simulation ? (
        <View style={ui.content}>
          <Text style={ui.title}>Simulação não encontrada</Text>
          <Text style={ui.body}>
            Escolha um experimento do catálogo para continuar.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir catálogo PhET"
            onPress={() => router.replace("/estudar/phet")}
            style={[ui.button, { backgroundColor: colors.primary }]}
          >
            <Text style={[ui.buttonText, { color: "#FFF" }]}>
              Abrir catálogo PhET
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          <SafeAreaView
            key="simulation-stage"
            edges={["left", "right"]}
            style={{ flex: 1, backgroundColor: "#FFF" }}
          >
            {error ? (
              <View
                style={{
                  padding: 24,
                  flex: 1,
                  justifyContent: "center",
                  gap: 15,
                }}
              >
                <Text style={ui.title}>O experimento não carregou</Text>
                <Text style={ui.body}>
                  O PhET precisa de internet. Verifique a conexão e tente
                  novamente, ou abra o experimento no navegador.
                </Text>
              </View>
            ) : (
              <SimulationViewer
                key={`${simulation.id}-${revision}`}
                url={simulation.url}
                title={simulation.nome}
                onLoad={finishLoading}
                onError={failLoading}
              />
            )}
            {loading && !error && (
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  inset: 0,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#FFFFFFDD",
                  gap: 12,
                }}
              >
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={ui.body}>Carregando experimento…</Text>
              </View>
            )}
          </SafeAreaView>
          {!!fullscreenNotice && (
            <Text style={[ui.body, { padding: 8 }]}>{fullscreenNotice}</Text>
          )}
          {!expanded && (
            <View
              style={{
                padding: 14,
                backgroundColor: colors.surface,
                borderTopWidth: 1,
                borderTopColor: colors.border,
                gap: 6,
              }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ampliar simulação"
                onPress={() => void expand()}
                style={[
                  ui.button,
                  { backgroundColor: colors.primary, minHeight: 48 },
                ]}
              >
                <Text style={[ui.buttonText, { color: colors.textOnPrimary }]}>
                  Ampliar simulação
                </Text>
              </Pressable>
              <View
                style={{
                  flexDirection: "row",
                  gap: 12,
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Recarregar simulação"
                  onPress={() => setRevision((value) => value + 1)}
                  style={[
                    ui.button,
                    {
                      borderWidth: 1,
                      borderColor: colors.border,
                      minHeight: 44,
                      paddingHorizontal: 12,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontFamily,
                      fontSize: 14,
                      color: colors.primary,
                      fontWeight: "600",
                    }}
                  >
                    Recarregar
                  </Text>
                </Pressable>
                <ExternalLink
                  href={simulation.url as `https://${string}`}
                  style={{
                    fontFamily,
                    fontSize: 14,
                    color: colors.primary,
                    fontWeight: "600",
                    paddingVertical: 12,
                  }}
                >
                  Abrir no navegador ↗
                </ExternalLink>
              </View>
              <Text
                style={{ fontFamily, color: colors.textMuted, fontSize: 14 }}
              >
                Amplie para usar na horizontal. PhET · conexão necessária
              </Text>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
}
