import { wellbeingRequestSchema, wellbeingResponseSchema, onboardingSchema } from '../../shared-schemas/src';

export type WellbeingRequest = typeof wellbeingRequestSchema;
export type WellbeingResponse = typeof wellbeingResponseSchema;
export type OnboardingRequest = typeof onboardingSchema;

export interface OrientationRequest {
  userId: string;
  level: string;
  goal: string;
}
