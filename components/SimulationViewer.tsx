import { WebView } from "react-native-webview";
import { urlPhetPermitida } from "@/utils/simulacoes";

export interface SimulationViewerProps {
  url: string;
  title: string;
  onLoad: () => void;
  onError: () => void;
}
export default function SimulationViewer({
  url,
  onLoad,
  onError,
}: SimulationViewerProps) {
  return (
    <WebView
      source={{ uri: url }}
      style={{ flex: 1 }}
      originWhitelist={["https://phet.colorado.edu"]}
      onLoadEnd={onLoad}
      onError={onError}
      onHttpError={onError}
      onShouldStartLoadWithRequest={(request) =>
        request.url === "about:blank" || urlPhetPermitida(request.url)
      }
      allowsFullscreenVideo
    />
  );
}
