import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';

// The fixtures this file adds, by name and type. Tests get them typed and autocompleted.
type PageObjects = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  productDetailsPage: ProductDetailsPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
};

/**
 * Playwright's `test`, extended with one fixture per page object.
 *
 * A fixture is a function: everything before `use()` is setup, `use(value)` hands the value
 * to the test and waits for the test to finish, everything after `use()` is teardown.
 * Fixtures are lazy: a test that doesn't ask for `checkoutPage` never creates one.
 *
 * Tests start logged OUT. For logged-in tests, import from './auth' instead.
 */
export const test = base.extend<PageObjects>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  productDetailsPage: async ({ page }, use) => {
    await use(new ProductDetailsPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
});

export { expect } from '@playwright/test';
