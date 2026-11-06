import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Pressable, Text, View } from "react-native";
import AppLoadingScreen from "@/components/AppLoadingScreen";
import {
  PERFIL_PRINCIPAL,
  perfisService,
  type PerfilLocal,
} from "@/services/perfisService";
import { colors } from "@/constants";

const PerfilContext = createContext({
  perfil: PERFIL_PRINCIPAL,
});

export function PerfilProvider({ children }: { children: ReactNode }) {
  const [perfil, setPerfil] = useState<PerfilLocal>(PERFIL_PRINCIPAL);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const atualizar = useCallback(async () => {
    setPerfil(await perfisService.ativo());
  }, []);
  useEffect(() => {
    void atualizar()
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [atualizar]);
  if (loading) return <AppLoadingScreen />;
  if (error)
    return (
      <View style={{ flex: 1, padding: 24, justifyContent: "center", gap: 20 }}>
        <Text style={{ color: colors.text, fontSize: 18 }}>
          Não conseguimos abrir os perfis. Os dados locais foram preservados.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setLoading(true);
            void atualizar()
              .then(() => setError(false))
              .catch(() => setError(true))
              .finally(() => setLoading(false));
          }}
        >
          <Text style={{ color: colors.primary, fontSize: 18 }}>
            Tentar novamente
          </Text>
        </Pressable>
      </View>
    );
  return (
    <PerfilContext.Provider
      value={{
        perfil,
      }}
    >
      {children}
    </PerfilContext.Provider>
  );
}

export function usePerfil() {
  return useContext(PerfilContext);
}
