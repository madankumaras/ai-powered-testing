import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
    readonly title: Locator;
    readonly cartIcon: Locator;
    readonly cartBadge: Locator;

    constructor(page: Page) {
        super(page);
        this.title = page.locator('.title');
        this.cartIcon = page.locator('.shopping_cart_link');
        this.cartBadge = page.locator('.shopping_cart_badge');
    }

    // Helper to get dynamic add-to-cart buttons
    getAddToCartButton(productName: string): Locator {
        // e.g "Sauce Labs Backpack" -> "sauce-labs-backpack"
        const idName = productName.toLowerCase().replace(/ /g, '-');
        return this.page.locator(`[data-test="add-to-cart-${idName}"]`);
    }

    async addItemToCart(productName: string) {
        await this.clickElement(this.getAddToCartButton(productName));
    }

    async goToCart() {
        await this.clickElement(this.cartIcon);
    }
}
