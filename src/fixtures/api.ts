import { test as base, expect } from '@playwright/test';
import { BookingClient } from '../api/BookingClient';
import { AuthResponseSchema } from '../schemas/booking.schema';
import { env } from '../utils/env';

type TestFixtures = {
  /** Client WITH a valid token: can create, read, update and delete. */
  bookingApi: BookingClient;
  /** Client with NO token: for checking that protected endpoints refuse access. */
  guestBookingApi: BookingClient;
};

type WorkerFixtures = {
  /** One auth token per worker process, shared by all the tests that worker runs. */
  apiToken: string;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  // Worker-scoped: created once per worker, not once per test. Getting a token is a network
  // call, and every test in the worker can safely reuse the same one.
  apiToken: [
    async ({ playwright }, use) => {
      // The built-in `request` fixture is test-scoped, so a worker fixture makes its own context.
      const context = await playwright.request.newContext();
      const response = await context.post(`${env.bookingApiUrl}/auth`, {
        data: { username: env.bookingApiUser, password: env.bookingApiPassword },
      });
      expect(response.status()).toBe(200);
      // restful-booker answers bad credentials with 200 + {"reason":"Bad credentials"},
      // so the status alone isn't enough: the schema check makes sure we really got a token.
      const { token } = AuthResponseSchema.parse(await response.json());
      await context.dispose();

      await use(token);
    },
    { scope: 'worker' },
  ],

  bookingApi: async ({ request, apiToken }, use) => {
    const client = new BookingClient(request, apiToken);

    await use(client);

    // Teardown: delete whatever this test created, so we don't leave junk on a shared public API.
    // Status isn't checked: the test may already have deleted the booking itself.
    for (const id of client.createdIds) {
      await client.deleteBooking(id);
    }
  },

  guestBookingApi: async ({ request }, use) => {
    await use(new BookingClient(request));
  },
});

export { expect };
