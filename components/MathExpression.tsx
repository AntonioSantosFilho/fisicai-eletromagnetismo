import { ScrollView, Text, View } from "react-native";
import { SvgXml } from "react-native-svg";

import { fontFamily } from "@/components/StudyUI";
import { colors } from "@/constants";
import renderedMath from "@/data/math-rendered.json";

interface RenderedEquation {
  svg: string;
  width: number;
  height: number;
}
interface MathExpressionProps {
  latex?: string;
  readable: string;
}

export default function MathExpression({
  latex,
  readable,
}: MathExpressionProps) {
  const equation = latex
    ? (renderedMath as Record<string, RenderedEquation>)[latex]
    : undefined;
  if (!equation)
    return (
      <Text
        style={{
          fontFamily,
          fontSize: 21,
          lineHeight: 32,
          color: colors.text,
          textAlign: "center",
        }}
      >
        {readable}
      </Text>
    );
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Expressão matemática: ${readable}`}
      style={{ paddingVertical: 12, minHeight: 60 }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 5,
        }}
      >
        <View
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
          aria-hidden
        >
          <SvgXml
            xml={equation.svg}
            width={equation.width}
            height={equation.height}
          />
        </View>
      </ScrollView>
    </View>
  );
}
