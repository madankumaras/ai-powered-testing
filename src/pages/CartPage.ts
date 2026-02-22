import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
    readonly checkoutButton: Locator;
    readonly continueShoppingButton: Locator;

    constructor(page: Page) {
        super(page);
        this.checkoutButton = page.locator('[data-test="checkout"]');
        this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    }

    async verifyItemInCart(productName: string) {
        const item = this.page.locator(`text=${productName}`);
        await expect(item).toBeVisible();
    }

    async proceedToCheckout() {
        await this.clickElement(this.checkoutButton);
    }
}
