// Logged-in tests: the auth fixtures start every test from the saved standard_user session.
import { test, expect } from '../../src/fixtures/auth';
import type { SortOption } from '../../src/pages/InventoryPage';
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
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('lists the whole catalogue', async ({ inventoryPage }) => {
    await expect(inventoryPage.items).toHaveCount(allProducts.length);
  });

  for (const { option, expected } of nameSortCases) {
    test(`sorts by name (${option})`, async ({ inventoryPage }) => {
      await inventoryPage.sortBy(option);
      // toHaveText with an array checks every element, in order, and retries until it matches.
      await expect(inventoryPage.itemNames).toHaveText(expected);
    });
  }

  for (const { option, expected } of priceSortCases) {
    test(`sorts by price (${option})`, async ({ inventoryPage }) => {
      await inventoryPage.sortBy(option);
      // Prices, not names: two products cost $15.99, so their relative order isn't defined.
      await expect(inventoryPage.itemPrices).toHaveText(expected);
    });
  }
});
