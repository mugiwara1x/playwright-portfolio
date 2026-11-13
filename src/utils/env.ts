/**
 * One typed place for settings that may differ per environment.
 * Each value can be overridden with an environment variable (e.g. in CI), with a safe default.
 */
export const env = {
  bookingApiUrl: process.env.BOOKING_API_URL ?? 'https://restful-booker.herokuapp.com',
  // restful-booker's publicly documented demo credentials, not a real account.
  bookingApiUser: process.env.BOOKING_API_USER ?? 'admin',
  bookingApiPassword: process.env.BOOKING_API_PASSWORD ?? 'password123',
};
