import { z } from 'zod';

/**
 * Response contracts for restful-booker, written with zod.
 * One definition gives us two things:
 *   1. a runtime check: `BookingSchema.parse(body)` throws a readable error if the shape is wrong
 *   2. a TypeScript type: `z.infer<typeof BookingSchema>`, so payloads and responses are typed
 */

// "2026-12-01" style dates
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected a YYYY-MM-DD date');

export const BookingSchema = z.strictObject({
  firstname: z.string(),
  lastname: z.string(),
  totalprice: z.number().int().nonnegative(),
  depositpaid: z.boolean(),
  bookingdates: z.strictObject({
    checkin: isoDate,
    checkout: isoDate,
  }),
  additionalneeds: z.string().optional(),
});

export const CreateBookingResponseSchema = z.strictObject({
  bookingid: z.number().int().positive(),
  booking: BookingSchema,
});

export const BookingIdListSchema = z.array(z.strictObject({ bookingid: z.number().int().positive() }));

export const AuthResponseSchema = z.strictObject({ token: z.string().min(1) });

export type Booking = z.infer<typeof BookingSchema>;
