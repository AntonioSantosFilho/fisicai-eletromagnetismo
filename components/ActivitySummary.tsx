import { Text, View } from "react-native";
import { fontFamily, ui } from "@/components/StudyUI";
import { colors } from "@/constants";
import SessionProgress from "@/components/SessionProgress";

export default function ActivitySummary({
  moduleName,
  position,
  total,
  unit,
  seconds,
  detail,
  completed,
}: {
  moduleName: string;
  position: number;
  total: number;
  unit: string;
  seconds: number;
  detail?: string;
  completed: number;
}) {
  const time = `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
  return (
    <View
      style={{
        gap: 8,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={[ui.row, { justifyContent: "space-between" }]}>
        <Text
          style={{
            fontFamily,
            flex: 1,
            fontSize: 16,
            fontWeight: "700",
            color: colors.text,
          }}
        >
          {moduleName}
        </Text>
        <Text
          accessibilityLabel={`Tempo ${time}`}
          style={{ fontFamily, fontSize: 14, color: colors.textMuted }}
        >
          {time}
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          columnGap: 16,
          rowGap: 6,
        }}
      >
        <Text style={{ fontFamily, fontSize: 14, color: colors.primary }}>
          {unit} {Math.min(position, total)} de {total}
        </Text>
        {!!detail && (
          <Text style={{ fontFamily, fontSize: 14, color: colors.textMuted }}>
            {detail}
          </Text>
        )}
      </View>
      <SessionProgress completed={completed} total={total} />
    </View>
  );
}
