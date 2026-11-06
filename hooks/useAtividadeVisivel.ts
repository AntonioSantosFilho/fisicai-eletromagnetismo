import { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { AppState } from "react-native";

export function useAtividadeVisivel() {
  const focused = useIsFocused();
  const [active, setActive] = useState(
    AppState.currentState !== "background" &&
      AppState.currentState !== "inactive",
  );
  useEffect(() => {
    const listener = AppState.addEventListener("change", (value) =>
      setActive(value === "active"),
    );
    return () => listener.remove();
  }, []);
  return focused && active;
}
