import { test, expect } from '../../src/fixtures/auth';
import { products } from '../../src/data/products';
import { customer, TAX_RATE } from '../../src/data/checkout';
import { seedCart, readCartIds } from '../../src/utils/cartStorage';
import { formatPrice, roundToCents } from '../../src/utils/price';

/**
 * Hybrid tests: part of the work happens below the UI, part through it.
 *  - Arrange without the UI (seed state directly), then Assert through the UI.
 *  - Act through the UI, then Assert the stored state directly.
 * See src/utils/cartStorage.ts for why "below the UI" means localStorage on saucedemo.
 */
test.describe('Cart state (hybrid)', () => {
  test('a cart seeded in storage is shown by the UI', async ({ page, cartPage }) => {
    const items = [products.onesie, products.backpack, products.bikeLight];

    await seedCart(page, items);
    await cartPage.goto();

    await expect(cartPage.header.cartBadge).toHaveText(String(items.length));
    await expect(cartPage.itemNames).toHaveText(items.map((i) => i.name));
  });

  test('checkout totals are right for a seeded cart', async ({ page, checkoutPage }) => {
    // The point of this test is the checkout maths, so we skip 2 add-to-cart clicks
    // and the cart page, and go straight to the step we care about.
    const items = [products.fleeceJacket, products.redTShirt];
    const subtotal = roundToCents(items.reduce((sum, item) => sum + item.price, 0));
    const tax = roundToCents(subtotal * TAX_RATE);

    await seedCart(page, items);
    await page.goto('/checkout-step-one.html');
    await checkoutPage.fillInformation(customer);
    await checkoutPage.continue();

    await expect(checkoutPage.itemNames).toHaveText(items.map((i) => i.name));
    await expect(checkoutPage.totalLabel).toHaveText(`Total: ${formatPrice(roundToCents(subtotal + tax))}`);
  });

  test('UI cart actions are written to storage', async ({ page, inventoryPage }) => {
    await inventoryPage.goto();

    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.addToCart(products.bikeLight.name);
    // readCartIds() reads once and doesn't retry. expect.poll() calls it again and again
    // until the value matches or the timeout ends: a web-first assertion for any function.
    await expect.poll(() => readCartIds(page)).toEqual([products.backpack.id, products.bikeLight.id]);

    await inventoryPage.removeFromCart(products.backpack.name);
    await expect.poll(() => readCartIds(page)).toEqual([products.bikeLight.id]);
  });
});
