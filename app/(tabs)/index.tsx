import ResumeActivity from "@/components/ResumeActivity";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, type Href } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import Header from "@/components/Header";
import { fontFamily, ui, type StudyIcon } from "@/components/StudyUI";
import { colors } from "@/constants";

const destinations: {
  title: string;
  description: string;
  icon: StudyIcon;
  route: Href;
}[] = [
  {
    title: "Estudar",
    description: "Conceitos, leis e exemplos.",
    icon: "book-outline",
    route: "/estudar",
  },
  {
    title: "Praticar",
    description: "Quiz, flashcards e outros jogos.",
    icon: "checkbox-outline",
    route: "/praticar" as Href,
  },
  {
    title: "Simulações",
    description: "Experimentos de física do PhET.",
    icon: "flask-outline",
    route: "/estudar/phet",
  },
];

export default function HomeScreen() {
  return (
    <View style={ui.screen}>
      <Header title="FisicAI" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 22,
          paddingTop: 30,
          paddingBottom: 30,
          gap: 26,
        }}
      >
        <View style={{ gap: 10 }}>
          <Text style={{ fontFamily, fontSize: 14, color: colors.textMuted }}>
            Física · Ensino médio
          </Text>
          <Text
            accessibilityRole="header"
            style={{
              fontFamily,
              fontSize: 27,
              lineHeight: 34,
              fontWeight: "700",
              color: colors.text,
            }}
          >
            O que você quer fazer?
          </Text>
        </View>
        <ResumeActivity />
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: "hidden",
          }}
        >
          {destinations.map((destination, index) => (
            <Pressable cssInterop={false}
              key={destination.title}
              accessibilityRole="button"
              accessibilityLabel={destination.title}
              accessibilityHint={destination.description}
              onPress={() => router.push(destination.route)}
              style={({ pressed }) => ({
                minHeight: 102,
                paddingHorizontal: 18,
                paddingVertical: 21,
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
                borderTopWidth: index ? 1 : 0,
                borderTopColor: colors.border,
                backgroundColor: pressed ? colors.primaryLight : colors.surface,
              })}
            >
              <Ionicons
                name={destination.icon}
                size={26}
                color={colors.primary}
                accessible={false}
              />
              <View style={{ flex: 1, gap: 6 }}>
                <Text
                  style={{
                    fontFamily,
                    fontSize: 19,
                    fontWeight: "700",
                    color: colors.text,
                  }}
                >
                  {destination.title}
                </Text>
                <Text
                  style={{
                    fontFamily,
                    fontSize: 14,
                    lineHeight: 21,
                    color: colors.textMuted,
                  }}
                >
                  {destination.description}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={19}
                color={colors.primary}
                accessible={false}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
