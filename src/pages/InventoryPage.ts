import type { Locator, Page } from '@playwright/test';
import { Header } from './components/Header';

// The <option value="..."> values of the sort dropdown. A union type means a typo won't compile.
export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage {
  readonly page: Page;
  readonly header: Header;
  readonly title: Locator;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  private readonly sortSelect: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new Header(page);
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.sortSelect = page.getByTestId('product-sort-container');
  }

  async goto(): Promise<void> {
    await this.page.goto('/inventory.html');
  }

  /** The card for one product, found by its exact visible name (not by a generated id). */
  productCard(productName: string): Locator {
    return this.items.filter({ has: this.page.getByText(productName, { exact: true }) });
  }

  /** The product's picture in the list (its alt text is the product name). */
  productImage(productName: string): Locator {
    return this.productCard(productName).getByRole('img', { name: productName });
  }

  /** Opens a product's details page by clicking either its name or its image. */
  async openDetails(productName: string, via: 'name' | 'image'): Promise<void> {
    const card = this.productCard(productName);
    const link = via === 'name' ? card.getByTestId(/-title-link$/) : card.getByTestId(/-img-link$/);
    await link.click();
    // The details page reuses the list's data-test ids (e.g. inventory-item-name), so the next locator
    // could still see the 6 list items and fail strict mode. Waiting for the URL is NOT enough: this is
    // a single-page app, and it changes the URL before it renders the new page. So we wait for an
    // element that only exists on the details page. The action is "done" once the user sees that page.
    await this.page.getByTestId('back-to-products').waitFor();
  }

  async addToCart(productName: string): Promise<void> {
    await this.productCard(productName).getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeFromCart(productName: string): Promise<void> {
    await this.productCard(productName).getByRole('button', { name: 'Remove' }).click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortSelect.selectOption(option);
  }
}
