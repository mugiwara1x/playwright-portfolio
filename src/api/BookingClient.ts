import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { Booking } from '../schemas/booking.schema';
import { env } from '../utils/env';

/**
 * A thin wrapper around restful-booker's endpoints: the API equivalent of a page object.
 *
 * It knows URLs, verbs and how to send the auth token. It does NOT assert: every method
 * returns the raw APIResponse, so tests decide which status code and body are correct
 * (including negative tests that expect 403 or 404).
 */
export class BookingClient {
  private readonly baseUrl = env.bookingApiUrl;

  // Ids this client created, so the fixture can delete them after the test.
  readonly createdIds: number[] = [];

  constructor(
    private readonly request: APIRequestContext,
    private readonly token?: string,
  ) {}

  /** restful-booker expects the token as a cookie named "token". */
  private authHeaders(): Record<string, string> {
    return this.token ? { Cookie: `token=${this.token}` } : {};
  }

  async createBooking(booking: Booking): Promise<APIResponse> {
    const response = await this.request.post(`${this.baseUrl}/booking`, { data: booking });
    if (response.ok()) {
      const body = (await response.json()) as { bookingid: number };
      this.createdIds.push(body.bookingid);
    }
    return response;
  }

  async getBooking(id: number): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/booking/${id}`);
  }

  async findBookingIds(filter: { firstname?: string; lastname?: string }): Promise<APIResponse> {
    // `params` builds the query string for us: ?firstname=...&lastname=...
    return this.request.get(`${this.baseUrl}/booking`, { params: filter });
  }

  async updateBooking(id: number, booking: Booking): Promise<APIResponse> {
    return this.request.put(`${this.baseUrl}/booking/${id}`, {
      data: booking,
      headers: this.authHeaders(),
    });
  }

  async patchBooking(id: number, changes: Partial<Booking>): Promise<APIResponse> {
    return this.request.patch(`${this.baseUrl}/booking/${id}`, {
      data: changes,
      headers: this.authHeaders(),
    });
  }

  async deleteBooking(id: number): Promise<APIResponse> {
    return this.request.delete(`${this.baseUrl}/booking/${id}`, { headers: this.authHeaders() });
  }
}
