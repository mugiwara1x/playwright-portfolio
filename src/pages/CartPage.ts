import type { Locator, Page } from '@playwright/test';
import { Header } from './components/Header';

export class CartPage {
  readonly page: Page;
  readonly header: Header;
  readonly items: Locator;
  readonly itemNames: Locator;
  private readonly checkoutButton: Locator;
  private readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new Header(page);
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.checkoutButton = page.getByTestId('checkout');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
  }

  async goto(): Promise<void> {
    await this.page.goto('/cart.html');
  }

  async removeItem(productName: string): Promise<void> {
    await this.items
      .filter({ has: this.page.getByText(productName, { exact: true }) })
      .getByRole('button', { name: 'Remove' })
      .click();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }
}
