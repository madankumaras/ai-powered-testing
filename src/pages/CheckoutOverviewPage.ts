import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutOverviewPage extends BasePage {
    readonly finishButton: Locator;
    readonly subtotalLabel: Locator;

    constructor(page: Page) {
        super(page);
        this.finishButton = page.locator('[data-test="finish"]');
        this.subtotalLabel = page.locator('.summary_subtotal_label');
    }

    async finishCheckout() {
        await this.clickElement(this.finishButton);
    }
}
