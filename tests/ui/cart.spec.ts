import { test, expect } from '../../src/fixtures/auth';
import { products } from '../../src/data/products';

test.describe('Cart', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('adding a product updates the badge and the cart', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(products.backpack.name);

    await expect(inventoryPage.header.cartBadge).toHaveText('1');
    // Edge case: the card's "Add to cart" button flips to "Remove" once the item is in the cart.
    const card = inventoryPage.productCard(products.backpack.name);
    await expect(card.getByRole('button', { name: 'Remove' })).toBeVisible();
    await expect(card.getByRole('button', { name: 'Add to cart' })).toBeHidden();

    await inventoryPage.header.openCart();
    await expect(cartPage.itemNames).toHaveText([products.backpack.name]);
  });

  test('cart keeps several products in the order they were added', async ({ inventoryPage, cartPage }) => {
    const chosen = [products.onesie, products.backpack, products.fleeceJacket];
    for (const product of chosen) {
      await inventoryPage.addToCart(product.name);
    }

    await expect(inventoryPage.header.cartBadge).toHaveText(String(chosen.length));
    await inventoryPage.header.openCart();
    await expect(cartPage.itemNames).toHaveText(chosen.map((p) => p.name));
  });

  test('removing the last product empties the cart and hides the badge', async ({
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.addToCart(products.bikeLight.name);
    await inventoryPage.header.openCart();

    await cartPage.removeItem(products.bikeLight.name);

    await expect(cartPage.items).toHaveCount(0);
    // An empty cart has no badge at all (not a "0"), so we assert it's hidden.
    await expect(cartPage.header.cartBadge).toBeHidden();
  });

  test('removing from the inventory page updates the badge', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.addToCart(products.onesie.name);

    await inventoryPage.removeFromCart(products.backpack.name);

    await expect(inventoryPage.header.cartBadge).toHaveText('1');
  });

  test('cart survives a page reload', async ({ page, inventoryPage }) => {
    await inventoryPage.addToCart(products.boltTShirt.name);

    await page.reload();

    await expect(inventoryPage.header.cartBadge).toHaveText('1');
  });

  test('"Continue Shopping" returns to the inventory', async ({ page, cartPage }) => {
    await cartPage.goto();
    await cartPage.continueShopping();

    await expect(page).toHaveURL(/\/inventory\.html$/);
  });
});
