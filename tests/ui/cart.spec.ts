import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { InventoryPage } from '../../src/pages/InventoryPage';
import { CartPage } from '../../src/pages/CartPage';
import { users } from '../../src/data/users';
import { products } from '../../src/data/products';

test.describe('Cart', () => {
  let inventory: InventoryPage;
  let cart: CartPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.standard);
    inventory = new InventoryPage(page);
    cart = new CartPage(page);
  });

  test('adding a product updates the badge and the cart', async () => {
    await inventory.addToCart(products.backpack.name);

    await expect(inventory.header.cartBadge).toHaveText('1');
    // Edge case: the card's "Add to cart" button flips to "Remove" once the item is in the cart.
    const card = inventory.productCard(products.backpack.name);
    await expect(card.getByRole('button', { name: 'Remove' })).toBeVisible();
    await expect(card.getByRole('button', { name: 'Add to cart' })).toBeHidden();

    await inventory.header.openCart();
    await expect(cart.itemNames).toHaveText([products.backpack.name]);
  });

  test('cart keeps several products in the order they were added', async () => {
    const chosen = [products.onesie, products.backpack, products.fleeceJacket];
    for (const product of chosen) {
      await inventory.addToCart(product.name);
    }

    await expect(inventory.header.cartBadge).toHaveText(String(chosen.length));
    await inventory.header.openCart();
    await expect(cart.itemNames).toHaveText(chosen.map((p) => p.name));
  });

  test('removing the last product empties the cart and hides the badge', async () => {
    await inventory.addToCart(products.bikeLight.name);
    await inventory.header.openCart();

    await cart.removeItem(products.bikeLight.name);

    await expect(cart.items).toHaveCount(0);
    // An empty cart has no badge at all (not a "0"), so we assert it's hidden.
    await expect(cart.header.cartBadge).toBeHidden();
  });

  test('removing from the inventory page updates the badge', async () => {
    await inventory.addToCart(products.backpack.name);
    await inventory.addToCart(products.onesie.name);

    await inventory.removeFromCart(products.backpack.name);

    await expect(inventory.header.cartBadge).toHaveText('1');
  });

  test('cart survives a page reload', async ({ page }) => {
    await inventory.addToCart(products.boltTShirt.name);

    await page.reload();

    await expect(inventory.header.cartBadge).toHaveText('1');
  });

  test('"Continue Shopping" returns to the inventory', async ({ page }) => {
    await cart.goto();
    await cart.continueShopping();

    await expect(page).toHaveURL(/\/inventory\.html$/);
  });
});
