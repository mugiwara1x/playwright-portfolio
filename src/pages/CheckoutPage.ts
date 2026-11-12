import type { Locator, Page } from '@playwright/test';
import type { CustomerInfo } from '../data/checkout';
import { Header } from './components/Header';

/**
 * saucedemo's checkout is three short screens: information -> overview -> complete.
 * They're small and always used together, so one page object covers all three.
 */
export class CheckoutPage {
  readonly page: Page;
  readonly header: Header;

  // Step one: your information
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly errorMessage: Locator;
  private readonly continueButton: Locator;

  // Step two: overview
  readonly itemNames: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  private readonly finishButton: Locator;
  private readonly cancelButton: Locator;

  // Complete
  readonly completeHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new Header(page);

    this.firstNameInput = page.getByTestId('firstName');
    this.lastNameInput = page.getByTestId('lastName');
    this.postalCodeInput = page.getByTestId('postalCode');
    this.errorMessage = page.getByTestId('error');
    this.continueButton = page.getByTestId('continue');

    this.itemNames = page.getByTestId('inventory-item-name');
    this.subtotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
    this.cancelButton = page.getByTestId('cancel');

    this.completeHeader = page.getByTestId('complete-header');
  }

  async fillInformation(info: CustomerInfo): Promise<void> {
    await this.firstNameInput.fill(info.firstName);
    await this.lastNameInput.fill(info.lastName);
    await this.postalCodeInput.fill(info.postalCode);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
