import { Image, Text, View } from "react-native";
import { colors } from "@/constants";
import { fontFamily } from "@/components/StudyUI";

export default function UniversityCardBack({ number }: { number: number }) {
  return (
    <View
      style={{
        alignItems: "center",
        gap: 18,
        paddingVertical: 8,
      }}
    >
      <Text
        style={{
          fontFamily,
          fontSize: 14,
          fontWeight: "700",
          letterSpacing: 1.5,
          color: colors.textInverse,
        }}
      >
        FISICAI
      </Text>
      <View
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 6,
          backgroundColor: colors.surface,
        }}
      >
        <Image
          accessible={false}
          source={require("../assets/images/logo-univasf.png")}
          resizeMode="contain"
          style={{ width: "100%", height: 38 }}
        />
      </View>
      <Text style={{ fontFamily, fontSize: 14, color: colors.textInverse }}>
        Carta {String(number).padStart(2, "0")}
      </Text>
    </View>
  );
}
