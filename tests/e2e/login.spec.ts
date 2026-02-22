import { test, expect } from '../../src/fixtures/testBase';

test.describe('Login flow', () => {
    test('User should be able to navigate to login page', async ({ page, loginPage }) => {
        await loginPage.navigateTo('/');
        // await expect(page).toHaveURL(/.*login/);
    });
});
