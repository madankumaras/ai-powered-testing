import { test, expect } from '../../src/fixtures/testBase';

test.describe('Intentional Failures Test Suite', () => {

    test('This test will fail on purpose - incorrect title', async ({ page, loginPage }) => {
        await loginPage.navigateTo('/');
        // The actual title is "Swag Labs", so this will fail
        await expect(page).toHaveTitle('Sauce Labs E-Commerce Store');
    });

    test('This test will fail on purpose - missing element', async ({ page, loginPage }) => {
        await loginPage.navigateTo('/');
        // Looking for a completely non-existent button
        const nonExistentButton = page.locator('button#this-does-not-exist');
        await expect(nonExistentButton).toBeVisible({ timeout: 2000 }); // Short timeout to fail quickly
    });

});
