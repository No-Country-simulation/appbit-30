import { z } from 'zod';

export const orientationSchema = z.object({
  userId: z.string(),
  level: z.string(),
  goal: z.string(),
});

// --- SCHEMAS PARA BIENESTAR (HU 9.3) ---
export const wellbeingRequestSchema = z.object({
  userId: z.string(),
  emojiScore: z.number().min(2).max(10), // 2: Muy mal, 10: Muy bien
  text: z.string().optional(),
  weeklyNote: z.number().min(0).max(10),
});

export const wellbeingResponseSchema = z.object({
  derivar_cvv: z.boolean(),
  suggestion: z.string(),
  risk_level: z.enum(['low', 'high']),
});