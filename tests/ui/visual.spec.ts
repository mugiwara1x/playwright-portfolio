import { test, expect } from '../../src/fixtures/auth';
import { allProducts } from '../../src/data/products';

test.describe('Visual', () => {
  test('inventory page matches the approved screenshot', async ({ page, inventoryPage }) => {
    await inventoryPage.goto();

    // Make sure the page is fully rendered before comparing pixels.
    await expect(inventoryPage.items).toHaveCount(allProducts.length);

    // First run (or --update-snapshots) saves the baseline; later runs compare against it.
    await expect(page).toHaveScreenshot('inventory.png', {
      fullPage: true,
      // The footer shows the current year ("© 2026"); masking it stops the test breaking every January.
      mask: [page.getByTestId('footer-copy')],
    });
  });
});
