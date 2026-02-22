import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly zipCodeInput: Locator;
    readonly continueButton: Locator;

    constructor(page: Page) {
        super(page);
        this.firstNameInput = page.locator('[data-test="firstName"]');
        this.lastNameInput = page.locator('[data-test="lastName"]');
        this.zipCodeInput = page.locator('[data-test="postalCode"]');
        this.continueButton = page.locator('[data-test="continue"]');
    }

    async fillShippingDetails(firstName: string, lastName: string, zipCode: string) {
        await this.fillText(this.firstNameInput, firstName);
        await this.fillText(this.lastNameInput, lastName);
        await this.fillText(this.zipCodeInput, zipCode);
        await this.clickElement(this.continueButton);
    }
}
