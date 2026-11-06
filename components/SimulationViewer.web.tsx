import type { SimulationViewerProps } from "@/components/SimulationViewer";

export default function SimulationViewer({
  url,
  title,
  onLoad,
  onError,
}: SimulationViewerProps) {
  return (
    <iframe
      src={url}
      title={`Simulação PhET: ${title}`}
      onLoad={onLoad}
      onError={onError}
      allow="fullscreen"
      allowFullScreen
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        border: 0,
        background: "#FFF",
      }}
    />
  );
}
