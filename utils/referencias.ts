import referencesData from "@/data/referencias.json";

export interface ReferenciaBibliografica {
  id: string;
  autores: string;
  titulo: string;
  edicao: string;
  local: string;
  editora: string;
  ano: string;
  url: string;
  data_acesso: string;
  verificacao: string;
}
export const referencias =
  referencesData.referencias as ReferenciaBibliografica[];
const months = [
  "jan.",
  "fev.",
  "mar.",
  "abr.",
  "maio",
  "jun.",
  "jul.",
  "ago.",
  "set.",
  "out.",
  "nov.",
  "dez.",
];
export function dataAcessoAbnt(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} ${months[month - 1]} ${year}`;
}
export function formatarReferenciaAbnt(reference: ReferenciaBibliografica) {
  return `${reference.autores}. ${reference.titulo}. ${edicaoPontuada(reference.edicao)}${reference.local}: ${reference.editora}, ${reference.ano}. Disponível em: ${reference.url}. Acesso em: ${dataAcessoAbnt(reference.data_acesso)}.`;
}
export function edicaoPontuada(edicao: string) {
  return edicao.trim() ? edicao.trim().replace(/\.+$/, "") + ". " : "";
}
export function obterReferencias(ids: string[]) {
  return [...new Set(ids)]
    .map((id) => referencias.find((reference) => reference.id === id))
    .filter((reference): reference is ReferenciaBibliografica => !!reference);
}
