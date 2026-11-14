import { test, expect } from '../../src/fixtures/auth';
import { allProducts, products } from '../../src/data/products';
import { formatPrice } from '../../src/utils/price';
import { seedCart } from '../../src/utils/cartStorage';

/**
 * These tests come from an AI-assisted workflow: Claude Code generated 33 test cases from
 * docs/ai/acceptance-criteria.md, and they were reviewed and trimmed to the tests below.
 * Each test lists the generated case IDs (TC-xx) it covers. The full review, including what
 * was cut and why, is in docs/ai-assisted-testing.md.
 *
 * Run only these with:  npx playwright test --grep @ai-reviewed
 */
test.describe('Product details', { tag: '@ai-reviewed' }, () => {
  // TC-01, TC-02 (AC1)
  for (const via of ['name', 'image'] as const) {
    test(`opens the product's page by clicking its ${via}`, async ({
      page,
      inventoryPage,
      productDetailsPage,
    }) => {
      await inventoryPage.goto();

      await inventoryPage.openDetails(products.backpack.name, via);

      await expect(page).toHaveURL(new RegExp(`inventory-item\\.html\\?id=${products.backpack.id}$`));
      await expect(productDetailsPage.name).toHaveText(products.backpack.name);
    });
  }

  // TC-06, TC-10 (AC2): compares the two pages directly, including the exact image file.
  test('details match what the list shows, including the image', async ({
    inventoryPage,
    productDetailsPage,
  }) => {
    const product = products.fleeceJacket;
    await inventoryPage.goto();
    const card = inventoryPage.productCard(product.name);
    const listDescription = await card.getByTestId('inventory-item-desc').textContent();
    const listImageSrc = await inventoryPage.productImage(product.name).getAttribute('src');

    await inventoryPage.openDetails(product.name, 'name');

    await expect(productDetailsPage.name).toHaveText(product.name);
    await expect(productDetailsPage.description).toHaveText(listDescription ?? '');
    await expect(productDetailsPage.price).toHaveText(formatPrice(product.price));
    await expect(productDetailsPage.image).toHaveAttribute('src', listImageSrc ?? '');
  });

  // TC-03, TC-07, TC-08, TC-09 (AC1, AC2): every product, by URL, cheaply.
  for (const product of allProducts) {
    test(`id ${product.id} shows "${product.name}"`, async ({ productDetailsPage }) => {
      await productDetailsPage.goto(product.id);

      await expect(productDetailsPage.name).toHaveText(product.name);
      await expect(productDetailsPage.price).toHaveText(formatPrice(product.price));
      await expect(productDetailsPage.image).toHaveAttribute('alt', product.name);
    });
  }

  // TC-11, TC-17, TC-20 (AC3, AC4)
  test('add then remove on the details page updates the button and the badge', async ({
    productDetailsPage,
  }) => {
    await productDetailsPage.goto(products.onesie.id);

    await productDetailsPage.addToCart();
    await expect(productDetailsPage.removeButton).toBeVisible();
    await expect(productDetailsPage.header.cartBadge).toHaveText('1');

    await productDetailsPage.removeFromCart();
    await expect(productDetailsPage.addToCartButton).toBeVisible();
    await expect(productDetailsPage.header.cartBadge).toBeHidden();
  });

  // TC-14, TC-19 (AC3, AC4): cart seeded below the UI (see src/utils/cartStorage.ts).
  test('a product already in the cart opens with "Remove", and removing it updates the badge', async ({
    page,
    productDetailsPage,
  }) => {
    await seedCart(page, [products.backpack, products.bikeLight]);

    await productDetailsPage.goto(products.backpack.id);
    await expect(productDetailsPage.removeButton).toBeVisible();
    await expect(productDetailsPage.header.cartBadge).toHaveText('2');

    await productDetailsPage.removeFromCart();
    await expect(productDetailsPage.header.cartBadge).toHaveText('1');
  });

  // TC-12, TC-13, TC-21 (AC3, AC5)
  test('"Back to products" keeps the cart', async ({ page, productDetailsPage, inventoryPage, cartPage }) => {
    await seedCart(page, [products.bikeLight]);
    await productDetailsPage.goto(products.backpack.id);

    await productDetailsPage.addToCart();
    await productDetailsPage.backToProducts();

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.header.cartBadge).toHaveText('2');
    await inventoryPage.header.openCart();
    await expect(cartPage.itemNames).toHaveText([products.bikeLight.name, products.backpack.name]);
  });

  // TC-26, TC-27, TC-28 (AC6): just above the highest id, below the lowest, not a number, far out.
  for (const id of ['6', '-1', 'abc', '9999']) {
    test(`unknown id "${id}" shows "item not found"`, async ({ productDetailsPage }) => {
      await productDetailsPage.goto(id);

      await expect(productDetailsPage.name).toHaveText('ITEM NOT FOUND');
    });
  }

  // TC-28 (AC6): a FINDING. The AI suggested this edge case and it exposed a real defect.
  test('a decimal id is treated as unknown', async ({ productDetailsPage }) => {
    test.fail(true, 'Known defect: ?id=1.5 silently opens product 1 instead of "item not found"');

    await productDetailsPage.goto('1.5');

    await expect(productDetailsPage.name).toHaveText('ITEM NOT FOUND', { timeout: 2_000 });
  });

  // TC-29 (AC6): a FINDING. "Add to cart" still works on the not-found page.
  test('"Add to cart" on a not-found page does not change the cart', async ({ productDetailsPage }) => {
    test.fail(true, 'Known defect: the badge shows 1 but the cart page is empty (inconsistent state)');

    await productDetailsPage.goto('9999');
    await productDetailsPage.addToCart();

    await expect(productDetailsPage.header.cartBadge).toBeHidden({ timeout: 2_000 });
  });
});

test.describe('Product details: logged out', { tag: '@ai-reviewed' }, () => {
  // An empty storage state overrides the logged-in session from the auth fixtures, for this block only.
  test.use({ storageState: { cookies: [], origins: [] } });

  // TC-30, TC-32 (AC6, AC7): the login check must win, even for an id that doesn't exist.
  for (const id of [products.backpack.id, 9999]) {
    test(`id ${id} redirects to the login page with an error`, async ({
      page,
      productDetailsPage,
      loginPage,
    }) => {
      await productDetailsPage.goto(id);

      await expect(page).toHaveURL(/saucedemo\.com\/$/);
      await expect(loginPage.errorMessage).toHaveText(
        "Epic sadface: You can only access '/inventory-item.html' when you are logged in.",
      );
    });
  }
});
