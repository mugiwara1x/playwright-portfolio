import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { InventoryPage } from '../../src/pages/InventoryPage';
import { CartPage } from '../../src/pages/CartPage';
import { CheckoutPage } from '../../src/pages/CheckoutPage';
import { users } from '../../src/data/users';
import { products, type Product } from '../../src/data/products';
import { customer, missingFieldCases, TAX_RATE } from '../../src/data/checkout';
import { formatPrice, roundToCents } from '../../src/utils/price';

test.describe('Checkout', () => {
  let inventory: InventoryPage;
  let cart: CartPage;
  let checkout: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.standard);
    inventory = new InventoryPage(page);
    cart = new CartPage(page);
    checkout = new CheckoutPage(page);
  });

  /** Adds products, opens the cart and starts checkout. Used by every test in this file. */
  async function startCheckoutWith(items: Product[]): Promise<void> {
    for (const item of items) {
      await inventory.addToCart(item.name);
    }
    await inventory.header.openCart();
    await cart.checkout();
  }

  test('completes an order and shows correct totals', async ({ page }) => {
    const items = [products.backpack, products.bikeLight];
    const subtotal = roundToCents(items.reduce((sum, item) => sum + item.price, 0));
    const tax = roundToCents(subtotal * TAX_RATE);
    const total = roundToCents(subtotal + tax);

    await startCheckoutWith(items);
    await checkout.fillInformation(customer);
    await checkout.continue();

    // test.step groups assertions under a readable name in the HTML report and trace.
    await test.step('overview shows the items and the right maths', async () => {
      await expect(checkout.itemNames).toHaveText(items.map((i) => i.name));
      await expect(checkout.subtotalLabel).toHaveText(`Item total: ${formatPrice(subtotal)}`);
      await expect(checkout.taxLabel).toHaveText(`Tax: ${formatPrice(tax)}`);
      await expect(checkout.totalLabel).toHaveText(`Total: ${formatPrice(total)}`);
    });

    await checkout.finish();

    await expect(page).toHaveURL(/checkout-complete\.html$/);
    await expect(checkout.completeHeader).toHaveText('Thank you for your order!');
    await expect(checkout.header.cartBadge).toBeHidden();
  });

  for (const { field, error } of missingFieldCases) {
    test(`requires ${field}`, async ({ page }) => {
      await startCheckoutWith([products.onesie]);

      // Valid customer, with just this one field blanked out.
      await checkout.fillInformation({ ...customer, [field]: '' });
      await checkout.continue();

      await expect(checkout.errorMessage).toHaveText(error);
      await expect(page).toHaveURL(/checkout-step-one\.html$/);
    });
  }

  test('cancelling at the overview keeps the cart', async ({ page }) => {
    await startCheckoutWith([products.fleeceJacket]);
    await checkout.fillInformation(customer);
    await checkout.continue();

    await checkout.cancel();

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventory.header.cartBadge).toHaveText('1');
  });
});
