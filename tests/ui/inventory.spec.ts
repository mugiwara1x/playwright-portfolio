import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { InventoryPage, type SortOption } from '../../src/pages/InventoryPage';
import { users } from '../../src/data/users';
import { allProducts } from '../../src/data/products';
import { formatPrice } from '../../src/utils/price';

const names = allProducts.map((p) => p.name);
const prices = allProducts.map((p) => p.price);

// The expected order is calculated from our test data, not copied from the page.
const nameSortCases: { option: SortOption; expected: string[] }[] = [
  { option: 'az', expected: [...names].sort((a, b) => a.localeCompare(b)) },
  { option: 'za', expected: [...names].sort((a, b) => b.localeCompare(a)) },
];
const priceSortCases: { option: SortOption; expected: string[] }[] = [
  { option: 'lohi', expected: [...prices].sort((a, b) => a - b).map(formatPrice) },
  { option: 'hilo', expected: [...prices].sort((a, b) => b - a).map(formatPrice) },
];

test.describe('Inventory', () => {
  let inventory: InventoryPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.standard);
    inventory = new InventoryPage(page);
  });

  test('lists the whole catalogue', async () => {
    await expect(inventory.items).toHaveCount(allProducts.length);
  });

  for (const { option, expected } of nameSortCases) {
    test(`sorts by name (${option})`, async () => {
      await inventory.sortBy(option);
      // toHaveText with an array checks every element, in order, and retries until it matches.
      await expect(inventory.itemNames).toHaveText(expected);
    });
  }

  for (const { option, expected } of priceSortCases) {
    test(`sorts by price (${option})`, async () => {
      await inventory.sortBy(option);
      // Prices, not names: two products cost $15.99, so their relative order isn't defined.
      await expect(inventory.itemPrices).toHaveText(expected);
    });
  }
});
