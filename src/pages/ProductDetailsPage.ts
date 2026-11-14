import type { Locator, Page } from '@playwright/test';
import { Header } from './components/Header';

/** One product's own page: /inventory-item.html?id=<id> */
export class ProductDetailsPage {
  readonly page: Page;
  readonly header: Header;
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly image: Locator;
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;
  private readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new Header(page);
    this.name = page.getByTestId('inventory-item-name');
    this.description = page.getByTestId('inventory-item-desc');
    this.price = page.getByTestId('inventory-item-price');
    // The image's data-test includes the product slug (item-sauce-labs-backpack-img), so match the pattern.
    this.image = page.getByTestId(/^item-.+-img$/);
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.removeButton = page.getByTestId('remove');
    this.backButton = page.getByTestId('back-to-products');
  }

  /** `id` is a string so tests can also try invalid values like "abc". */
  async goto(id: number | string): Promise<void> {
    await this.page.goto(`/inventory-item.html?id=${id}`);
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async removeFromCart(): Promise<void> {
    await this.removeButton.click();
  }

  async backToProducts(): Promise<void> {
    await this.backButton.click();
  }
}
