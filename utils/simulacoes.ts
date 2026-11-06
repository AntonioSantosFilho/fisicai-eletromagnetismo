import simulationsData from "@/data/phet-simulacoes.json";

export function urlPhetPermitida(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "phet.colorado.edu" &&
      (!url.port || url.port === "443") &&
      url.pathname.startsWith("/sims/html/") &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

export function obterSimulacaoPermitida(id?: string, legacyUrl?: string) {
  const simulation = id
    ? simulationsData.simulacoes.find((item) => item.id === id)
    : simulationsData.simulacoes.find((item) => item.url === legacyUrl);
  return simulation && urlPhetPermitida(simulation.url)
    ? simulation
    : undefined;
}
