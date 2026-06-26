import {
  wellbeingRequestSchema,
  wellbeingResponseSchema,
} from '../../shared-schemas/src';

export type WellbeingRequest = typeof wellbeingRequestSchema;
export type WellbeingResponse = typeof wellbeingResponseSchema;

export interface OrientationRequest {
  userId: string;
  level: string;
  goal: string;
}
