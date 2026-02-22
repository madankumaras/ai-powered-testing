import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
    readonly searchInput: Locator;
    readonly searchButton: Locator;
    readonly cartIcon: Locator;
    readonly loginLink: Locator;

    constructor(page: Page) {
        super(page);
        this.searchInput = page.locator('input[name="search"]'); // Example selector
        this.searchButton = page.locator('button[type="submit"]');
        this.cartIcon = page.locator('.cart-icon');
        this.loginLink = page.locator('text=Login');
    }

    async searchForProduct(productName: string) {
        await this.fillText(this.searchInput, productName);
        await this.clickElement(this.searchButton);
    }

    async goToLogin() {
        await this.clickElement(this.loginLink);
    }

    async goToCart() {
        await this.clickElement(this.cartIcon);
    }
}
