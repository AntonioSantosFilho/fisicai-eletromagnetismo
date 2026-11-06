export function normalizarResposta(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/^[“”"'«»]+|[“”"'«».,;:!?]+$/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function compararResposta(
  respostaUsuario: string,
  respostasAceitas: string[],
) {
  const respostaNormalizada = normalizarResposta(respostaUsuario);

  return respostasAceitas.some(
    (respostaAceita) =>
      normalizarResposta(respostaAceita) === respostaNormalizada,
  );
}
