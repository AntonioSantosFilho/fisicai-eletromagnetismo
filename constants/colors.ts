// Cores institucionais e tons de interface compartilham a mesma fonte com o Tailwind.
import palette from "./palette.json";
export const colors = palette;
export type ColorToken = keyof typeof colors;
