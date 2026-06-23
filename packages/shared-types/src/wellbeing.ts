export const EMOJI_VALUES = {
  Agotado: 2.0,
  Triste: 3.5,
  Neutral: 5.5,
  Bien: 7.5,
  Genial: 9.0,
} as const;

export type WellbeingEmoji = keyof typeof EMOJI_VALUES;

export const WELLBEING_EMOJIS = Object.keys(EMOJI_VALUES) as WellbeingEmoji[];
