import type { Page } from '@playwright/test';
import type { Product } from '../data/products';

/**
 * saucedemo has no backend API: the cart lives in the browser's localStorage, under this key,
 * as a JSON array of product ids, e.g. "[4,0]".
 *
 * These helpers read and write that state directly, skipping the UI. In an app with a real
 * backend, the same idea would be an API call (e.g. `request.post('/api/cart', ...)`).
 *
 * Trade-off: this couples tests to an implementation detail (the key and its format).
 * That's acceptable for a few setup shortcuts, and the hybrid spec checks both directions,
 * so if the format ever changes, those tests fail loudly instead of silently seeding nothing.
 */
const CART_KEY = 'cart-contents';

/** Puts products in the cart without clicking anything. The next page load shows them. */
export async function seedCart(page: Page, items: Product[]): Promise<void> {
  // localStorage belongs to an origin, so we must be on saucedemo before we can write to it.
  await page.goto('/inventory.html');
  // This callback runs INSIDE the browser, so it can only use the arguments we pass in.
  await page.evaluate(({ key, ids }) => localStorage.setItem(key, JSON.stringify(ids)), {
    key: CART_KEY,
    ids: items.map((item) => item.id),
  });
}

/** The product ids currently stored in the cart. */
export async function readCartIds(page: Page): Promise<number[]> {
  const raw = await page.evaluate((key) => localStorage.getItem(key), CART_KEY);
  return raw ? (JSON.parse(raw) as number[]) : [];
}
