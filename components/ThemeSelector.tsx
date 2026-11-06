import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "@/constants";
import { ui } from "@/components/StudyUI";
import BotaoSecundario from "@/components/BotaoSecundario";

export default function ThemeSelector({
  themes,
  value,
  onChange,
}: {
  themes: string[];
  value: string;
  onChange: (theme: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Escolher tema: ${value}`}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        style={[
          ui.button,
          {
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 12,
            borderWidth: 1,
            borderColor: colors.primary,
            backgroundColor: colors.primaryLight,
          },
        ]}
      >
        <Text
          style={[
            ui.buttonText,
            { flex: 1, textAlign: "left", color: colors.primary },
          ]}
        >
          {value === "Todos" ? "Todos os temas" : value}
        </Text>
        <Ionicons
          accessible={false}
          name="chevron-down"
          size={20}
          color={colors.primary}
        />
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaView
          style={{
            flex: 1,
            padding: 24,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#15293FCC",
          }}
        >
          <View
            accessibilityViewIsModal
            style={[
              ui.card,
              { width: "100%", maxWidth: 520, maxHeight: "90%", gap: 16 },
            ]}
          >
            <Text accessibilityRole="header" style={ui.title}>
              Escolha um tema
            </Text>
            <ScrollView style={{ flexGrow: 0, flexShrink: 1 }}>
              <View
                accessibilityRole="radiogroup"
                accessibilityLabel="Temas dos conteúdos"
                style={{ gap: 8 }}
              >
                {themes.map((theme) => (
                  <Pressable
                    key={theme}
                    accessibilityRole="radio"
                    accessibilityLabel={
                      theme === "Todos" ? "Todos os temas" : theme
                    }
                    accessibilityState={{ checked: value === theme }}
                    onPress={() => {
                      onChange(theme);
                      setOpen(false);
                    }}
                    style={{
                      minHeight: 48,
                      padding: 12,
                      borderWidth: 1,
                      borderRadius: 8,
                      borderColor:
                        value === theme ? colors.primary : colors.border,
                      backgroundColor:
                        value === theme ? colors.primaryLight : colors.surface,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <Ionicons
                      accessible={false}
                      name={
                        value === theme ? "radio-button-on" : "radio-button-off"
                      }
                      size={22}
                      color={colors.primary}
                    />
                    <Text style={[ui.body, { flex: 1 }]}>
                      {theme === "Todos" ? "Todos os temas" : theme}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            <BotaoSecundario
              label="Fechar seleção de tema"
              onPress={() => setOpen(false)}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}
