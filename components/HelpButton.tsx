import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { fontFamily, IconTile, ui } from "@/components/StudyUI";
import { colors } from "@/constants";

interface HelpButtonProps {
  compact?: boolean;
  label?: string;
  title?: string;
  instructions?: string;
  actionLabel?: string;
}

export default function HelpButton({
  compact = false,
  label = "Ajuda",
  title = "Como usar o FisicAI",
  instructions,
  actionLabel = "Entendi",
}: HelpButtonProps) {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Pressable cssInterop={false}
        accessibilityHint="Mostra instruções de uso do aplicativo"
        accessibilityLabel={label}
        accessibilityRole="button"
        onPress={() => setVisible(true)}
        style={({ pressed }) => ({
          minHeight: 44,
          minWidth: 44,
          paddingHorizontal: compact ? 0 : 16,
          flexDirection: "row",
          gap: 8,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 15,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: pressed ? colors.primaryLight : colors.surface,
        })}
      >
        <Ionicons name="help-circle-outline" size={21} color={colors.primary} />
        {!compact && (
          <Text
            style={{
              fontFamily,
              color: colors.primary,
              fontWeight: "600",
              fontSize: 14,
            }}
          >
            {label}
          </Text>
        )}
      </Pressable>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: "#12281FCC",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <View
            accessibilityViewIsModal
            style={[
              ui.card,
              {
                width: "100%",
                maxWidth: 420,
                maxHeight: "90%",
                gap: 20,
                padding: 24,
              },
            ]}
          >
            <View style={[ui.row, { justifyContent: "space-between" }]}>
              <IconTile icon="bulb-outline" background={colors.accent} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fechar ajuda"
                onPress={() => setVisible(false)}
                style={{ padding: 12 }}
              >
                <Ionicons name="close" size={23} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView>
              <Text
                accessibilityRole="header"
                style={[ui.title, { fontSize: 24, lineHeight: 30 }]}
              >
                {title}
              </Text>
              {instructions ? (
                <Text style={[ui.body, { marginTop: 16 }]}>{instructions}</Text>
              ) : (
                <View style={{ gap: 18, marginTop: 20 }}>
                  <View>
                    <Text
                      style={{
                        fontFamily,
                        color: colors.text,
                        fontWeight: "700",
                        marginBottom: 5,
                      }}
                    >
                      1. Estude um assunto
                    </Text>
                    <Text style={ui.body}>
                      Em Estudar, encontre conteúdos, leis e exemplos. Use a
                      busca e os filtros para localizar um assunto.
                    </Text>
                  </View>
                  <View>
                    <Text
                      style={{
                        fontFamily,
                        color: colors.text,
                        fontWeight: "700",
                        marginBottom: 5,
                      }}
                    >
                      2. Escolha uma atividade
                    </Text>
                    <Text style={ui.body}>
                      Na tela inicial, abra Praticar para escolher um jogo.
                      Simulações abre os experimentos do PhET.
                    </Text>
                  </View>
                  <View>
                    <Text
                      style={{
                        fontFamily,
                        color: colors.text,
                        fontWeight: "700",
                        marginBottom: 5,
                      }}
                    >
                      3. Consulte seu progresso
                    </Text>
                    <Text style={ui.body}>
                      Complete atividades para registrar seu desempenho em
                      Progresso. Para uma pergunta de física, abra a aba
                      Dúvidas.
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
            <Pressable
              accessibilityRole="button"
              onPress={() => setVisible(false)}
              style={[ui.button, { backgroundColor: colors.primary }]}
            >
              <Text style={[ui.buttonText, { color: colors.textInverse }]}>
                {actionLabel}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color={colors.textInverse}
              />
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}
