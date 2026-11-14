import { test, expect } from '../../src/fixtures/api';
import { buildBooking } from '../../src/data/booking';
import {
  BookingSchema,
  BookingIdListSchema,
  CreateBookingResponseSchema,
  type Booking,
} from '../../src/schemas/booking.schema';
import type { BookingClient } from '../../src/api/BookingClient';
import { env } from '../../src/utils/env';

/** Arrange step shared by most tests: create a booking and return its id (validated by the schema). */
async function createAndGetId(api: BookingClient, payload: Booking): Promise<number> {
  const response = await api.createBooking(payload);
  expect(response.status()).toBe(200);
  return CreateBookingResponseSchema.parse(await response.json()).bookingid;
}

/**
 * Read-back step: fetch a booking and return it, validated by the schema.
 * The status is checked BEFORE parsing, so a missing booking fails as "expected 200, received 404"
 * instead of a confusing JSON SyntaxError on the "Not Found" text body.
 */
async function getStoredBooking(api: BookingClient, id: number): Promise<Booking> {
  const response = await api.getBooking(id);
  expect(response.status(), `GET /booking/${id} should find the booking`).toBe(200);
  return BookingSchema.parse(await response.json());
}

/**
 * Every test creates its own booking, so tests are independent and can run in parallel.
 * Status codes below are what restful-booker really returns (checked before writing these):
 * it has some well-known quirks, called out where they appear.
 *
 * restful-booker is a shared public sandbox: its data is reset periodically and anyone with the
 * demo credentials can delete bookings. A booking can therefore (rarely) vanish mid-test. CI
 * retries absorb that; a failure that repeats on retry is a real failure.
 */
test.describe('Booking API: CRUD', () => {
  test('POST /booking creates a booking and echoes it back', async ({ bookingApi }) => {
    const payload = buildBooking();

    const response = await bookingApi.createBooking(payload);

    // Quirk: a REST API would normally answer 201 Created; restful-booker answers 200.
    expect(response.status()).toBe(200);
    // .parse() throws a readable error listing every field that doesn't match the contract.
    const body = CreateBookingResponseSchema.parse(await response.json());
    expect(body.booking).toEqual(payload);
  });

  test('GET /booking/:id returns the stored booking', async ({ bookingApi }) => {
    const payload = buildBooking({ additionalneeds: 'Late checkout' });
    const bookingid = await createAndGetId(bookingApi, payload);

    expect(await getStoredBooking(bookingApi, bookingid)).toEqual(payload);
  });

  test('GET /booking?lastname= finds the booking by name', async ({ bookingApi }) => {
    const payload = buildBooking();
    const bookingid = await createAndGetId(bookingApi, payload);

    const response = await bookingApi.findBookingIds({ lastname: payload.lastname });

    expect(response.status()).toBe(200);
    const ids = BookingIdListSchema.parse(await response.json());
    expect(ids).toContainEqual({ bookingid });
  });

  test('PUT /booking/:id replaces the booking', async ({ bookingApi }) => {
    const bookingid = await createAndGetId(bookingApi, buildBooking());
    const replacement = buildBooking({ firstname: 'Updated', totalprice: 999, depositpaid: false });

    const response = await bookingApi.updateBooking(bookingid, replacement);

    expect(response.status()).toBe(200);
    expect(BookingSchema.parse(await response.json())).toEqual(replacement);
    // Don't trust the echo alone: read it back to prove it was stored.
    expect(await getStoredBooking(bookingApi, bookingid)).toEqual(replacement);
  });

  test('PATCH /booking/:id changes only the given fields', async ({ bookingApi }) => {
    const original = buildBooking();
    const bookingid = await createAndGetId(bookingApi, original);

    const response = await bookingApi.patchBooking(bookingid, { additionalneeds: 'Airport pickup' });

    expect(response.status()).toBe(200);
    expect(BookingSchema.parse(await response.json())).toEqual({
      ...original,
      additionalneeds: 'Airport pickup',
    });
  });

  test('DELETE /booking/:id removes the booking', async ({ bookingApi }) => {
    const bookingid = await createAndGetId(bookingApi, buildBooking());

    const response = await bookingApi.deleteBooking(bookingid);

    // Quirk: restful-booker answers a successful delete with 201 Created (most APIs use 200 or 204).
    expect(response.status()).toBe(201);
    expect((await bookingApi.getBooking(bookingid)).status()).toBe(404);
  });
});

test.describe('Booking API: negative cases', () => {
  test('updating without a token is forbidden and changes nothing', async ({
    bookingApi,
    guestBookingApi,
  }) => {
    const original = buildBooking();
    const bookingid = await createAndGetId(bookingApi, original);

    const response = await guestBookingApi.updateBooking(bookingid, buildBooking({ firstname: 'Hacker' }));

    expect(response.status()).toBe(403);
    expect(await getStoredBooking(bookingApi, bookingid)).toEqual(original);
  });

  test('deleting without a token is forbidden', async ({ bookingApi, guestBookingApi }) => {
    const bookingid = await createAndGetId(bookingApi, buildBooking());

    expect((await guestBookingApi.deleteBooking(bookingid)).status()).toBe(403);
    expect((await bookingApi.getBooking(bookingid)).status()).toBe(200);
  });

  test('a booking id that does not exist returns 404', async ({ bookingApi }) => {
    const response = await bookingApi.getBooking(999_999_999);

    expect(response.status()).toBe(404);
  });

  test('wrong credentials do not return a token', async ({ request }) => {
    const response = await request.post(`${env.bookingApiUrl}/auth`, {
      data: { username: 'admin', password: 'definitely-wrong' },
    });

    // Quirk: failure is reported as 200 with a "reason" field, not 401. Testing only the
    // status code here would wrongly pass, which is why the body matters.
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ reason: 'Bad credentials' });
  });

  test('a booking with missing required fields is rejected', async ({ request }) => {
    const response = await request.post(`${env.bookingApiUrl}/booking`, {
      data: { lastname: 'OnlyALastName' },
    });

    // Quirk: the API crashes (500) instead of validating (400). We assert today's behaviour
    // but the real finding is "missing input validation", which a bug report would flag.
    expect(response.status()).toBe(500);
  });
});
