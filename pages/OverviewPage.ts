import { Page, Locator, expect } from '@playwright/test';

export class OverviewPage {
  readonly page: Page;
  readonly summaryInfo: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;
  readonly cartItems: Locator;
  readonly completeHeader: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.summaryInfo = page.locator('.summary_info');
    this.subtotalLabel = page.locator('.summary_subtotal_label');
    this.taxLabel = page.locator('.summary_tax_label');
    this.totalLabel = page.locator('.summary_total_label');
    this.finishButton = page.locator('[data-test="finish"]');
    this.cartItems = page.locator('.cart_item');
    this.completeHeader = page.locator('.complete-header');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
  }

  async verifyOrderSummary() {
    await expect(this.summaryInfo).toBeVisible();
    await expect(this.subtotalLabel).toContainText('Item total');
    await expect(this.taxLabel).toContainText('Tax');
    await expect(this.totalLabel).toContainText('Total');
  }

  async verifyItemsInOverview(count: number) {
    await expect(this.cartItems).toHaveCount(count);
  }

  async finishOrder() {
    await this.finishButton.click();
    await expect(this.page).toHaveURL(/checkout-complete\.html/);
  }

  async verifyOrderComplete() {
    await expect(this.completeHeader).toHaveText('Thank you for your order!');
  }

  async backToHome() {
    await this.backHomeButton.click();
    await expect(this.page).toHaveURL(/inventory\.html/);
  }
}