import { test, expect } from '../../src/fixtures/auth';
import type { InventoryPage } from '../../src/pages/InventoryPage';
import type { CartPage } from '../../src/pages/CartPage';
import { products, type Product } from '../../src/data/products';
import { customer, missingFieldCases, TAX_RATE } from '../../src/data/checkout';
import { formatPrice, roundToCents } from '../../src/utils/price';

/** Adds products, opens the cart and starts checkout. Page objects are passed in from the test's fixtures. */
async function startCheckoutWith(inventoryPage: InventoryPage, cartPage: CartPage, items: Product[]) {
  for (const item of items) {
    await inventoryPage.addToCart(item.name);
  }
  await inventoryPage.header.openCart();
  await cartPage.checkout();
}

test.describe('Checkout', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('completes an order and shows correct totals', async ({
    page,
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    const items = [products.backpack, products.bikeLight];
    const subtotal = roundToCents(items.reduce((sum, item) => sum + item.price, 0));
    const tax = roundToCents(subtotal * TAX_RATE);
    const total = roundToCents(subtotal + tax);

    await startCheckoutWith(inventoryPage, cartPage, items);
    await checkoutPage.fillInformation(customer);
    await checkoutPage.continue();

    // test.step groups assertions under a readable name in the HTML report and trace.
    await test.step('overview shows the items and the right maths', async () => {
      await expect(checkoutPage.itemNames).toHaveText(items.map((i) => i.name));
      await expect(checkoutPage.subtotalLabel).toHaveText(`Item total: ${formatPrice(subtotal)}`);
      await expect(checkoutPage.taxLabel).toHaveText(`Tax: ${formatPrice(tax)}`);
      await expect(checkoutPage.totalLabel).toHaveText(`Total: ${formatPrice(total)}`);
    });

    await checkoutPage.finish();

    await expect(page).toHaveURL(/checkout-complete\.html$/);
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    await expect(checkoutPage.header.cartBadge).toBeHidden();
  });

  for (const { field, error } of missingFieldCases) {
    test(`requires ${field}`, async ({ page, inventoryPage, cartPage, checkoutPage }) => {
      await startCheckoutWith(inventoryPage, cartPage, [products.onesie]);

      // Valid customer, with just this one field blanked out.
      await checkoutPage.fillInformation({ ...customer, [field]: '' });
      await checkoutPage.continue();

      await expect(checkoutPage.errorMessage).toHaveText(error);
      await expect(page).toHaveURL(/checkout-step-one\.html$/);
    });
  }

  test('cancelling at the overview keeps the cart', async ({
    page,
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    await startCheckoutWith(inventoryPage, cartPage, [products.fleeceJacket]);
    await checkoutPage.fillInformation(customer);
    await checkoutPage.continue();

    await checkoutPage.cancel();

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.header.cartBadge).toHaveText('1');
  });
});
