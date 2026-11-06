import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { View } from "react-native";

import { colors } from "@/constants";
import { fontFamily, type StudyIcon } from "@/components/StudyUI";

function TabIcon({ name, focused }: { name: StudyIcon; focused: boolean }) {
  return (
    <View
      style={{
        width: 48,
        height: 30,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: focused ? colors.primaryLight : "transparent",
      }}
    >
      <Ionicons
        name={name}
        size={21}
        color={focused ? colors.primary : colors.textMuted}
      />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      // O layout raiz já mantém toda a navegação acima da barra do sistema.
      safeAreaInsets={{ bottom: 0 }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelPosition: "below-icon",
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 72,
          paddingTop: 6,
          paddingBottom: 8,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontFamily,
          fontSize: 14,
          lineHeight: 18,
          fontWeight: "600",
          marginTop: 2,
        },
        tabBarItemStyle: { borderRadius: 14 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarAccessibilityLabel: "Início",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? "home" : "home-outline"}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="estudar/index"
        options={{
          title: "Estudar",
          tabBarAccessibilityLabel: "Estudar",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? "book" : "book-outline"}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="progresso/index"
        options={{
          title: "Progresso",
          tabBarAccessibilityLabel: "Progresso",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? "stats-chart" : "stats-chart-outline"}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ia/index"
        options={{
          title: "Dúvidas",
          tabBarAccessibilityLabel: "Dúvidas",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={
                focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"
              }
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}
