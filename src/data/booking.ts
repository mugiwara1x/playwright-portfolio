import { randomUUID } from 'node:crypto';
import type { Booking } from '../schemas/booking.schema';

/**
 * Builds a valid booking payload. Pass only the fields a test cares about:
 *   buildBooking({ totalprice: 0 })
 *
 * The last name is unique per call, so parallel tests (and other people using the
 * shared public API) can never collide on the same data.
 */
export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    firstname: 'Portfolio',
    lastname: `Test-${randomUUID().slice(0, 8)}`,
    totalprice: 150,
    depositpaid: true,
    bookingdates: { checkin: '2027-03-01', checkout: '2027-03-05' },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}
