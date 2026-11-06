import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { colors } from "@/constants";

// Ambas as faces são medidas; somente a face revelada entra na leitura acessível.
export default function CardFlip({
  revealed,
  front,
  back,
  minHeight = 220,
  height,
  onMeasure,
  frontColor = colors.surface,
  backColor = colors.primaryPressed,
  borderColor = colors.primary,
}: {
  revealed: boolean;
  front: ReactNode;
  back: ReactNode;
  minHeight?: number;
  height?: number;
  onMeasure?: (height: number) => void;
  frontColor?: string;
  backColor?: string;
  borderColor?: string;
}) {
  const progress = useRef(new Animated.Value(revealed ? 1 : 0)).current;
  const [measured, setMeasured] = useState(minHeight),
    [reduced, setReduced] = useState(false);
  useEffect(() => {
    let alive = true;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (alive) setReduced(value);
      })
      .catch(() => undefined);
    const listener = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduced,
    );
    return () => {
      alive = false;
      listener.remove();
    };
  }, []);
  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: revealed ? 1 : 0,
      duration: reduced ? 0 : 420,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: Platform.OS !== "web",
    });
    animation.start();
    return () => animation.stop();
  }, [revealed, reduced, progress]);
  const measure = (value: number) => {
    const next = Math.ceil(value) + 2;
    setMeasured((current) => Math.max(current, next));
    onMeasure?.(next);
  };
  return (
    <View
      style={{
        height: Math.max(height ?? 0, measured, minHeight),
        width: "100%",
      }}
    >
      <Animated.View
        pointerEvents="none"
        accessibilityElementsHidden={revealed}
        importantForAccessibility={revealed ? "no-hide-descendants" : "auto"}
        aria-hidden={revealed}
        style={[
          styles.face,
          {
            backgroundColor: backColor,
            borderColor,
            transform: [
              { perspective: 1000 },
              {
                rotateY: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "180deg"],
                }),
              },
            ],
          },
        ]}
      >
        <View
          onLayout={(event) => measure(event.nativeEvent.layout.height)}
          style={styles.content}
        >
          {back}
        </View>
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        accessibilityElementsHidden={!revealed}
        importantForAccessibility={!revealed ? "no-hide-descendants" : "auto"}
        aria-hidden={!revealed}
        style={[
          styles.face,
          {
            backgroundColor: frontColor,
            borderColor,
            transform: [
              { perspective: 1000 },
              {
                rotateY: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["180deg", "360deg"],
                }),
              },
            ],
          },
        ]}
      >
        <View
          onLayout={(event) => measure(event.nativeEvent.layout.height)}
          style={styles.content}
        >
          {front}
        </View>
      </Animated.View>
    </View>
  );
}
const styles = StyleSheet.create({
  face: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1.5,
    borderRadius: 12,
    backfaceVisibility: "hidden",
    justifyContent: "center",
    overflow: "hidden",
  },
  content: { width: "100%", padding: 16, gap: 14 },
});
