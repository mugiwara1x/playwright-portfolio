import { test, expect, PROBLEM_USER_STATE } from '../../src/fixtures/auth';
import { allProducts } from '../../src/data/products';
import { formatPrice } from '../../src/utils/price';

// Same logged-in fixtures as the other specs, but this file swaps in problem_user's saved session.
test.use({ storageState: PROBLEM_USER_STATE });

test.describe('problem_user (a demo account with deliberate bugs)', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('session is restored without the login screen', async ({ page, inventoryPage }) => {
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.items).toHaveCount(allProducts.length);
  });

  test('sorting by price works', async ({ inventoryPage }) => {
    // Known bug: sorting does nothing for problem_user. test.fail() documents it:
    // the test PASSES while the bug exists, and turns red if the bug is ever fixed.
    test.fail(true, 'saucedemo: sorting is broken for problem_user');

    await inventoryPage.sortBy('lohi');
    const expected = allProducts.map((p) => p.price).sort((a, b) => a - b);
    await expect(inventoryPage.itemPrices).toHaveText(expected.map(formatPrice), { timeout: 2_000 });
  });
});
