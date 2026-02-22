import { test, expect } from '../../src/fixtures/testBase';

test.describe('SauceDemo Test Suite', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('Standard User - Full E2E Checkout Flow', async ({ loginPage, inventoryPage, cartPage, checkoutPage, checkoutOverviewPage, checkoutCompletePage }) => {
        // Login
        await loginPage.login('standard_user');

        // Verify we reached inventory page
        await expect(inventoryPage.title).toHaveText('Products');

        // Add item to cart and verify badge update
        await inventoryPage.addItemToCart('Sauce Labs Backpack');
        await expect(inventoryPage.cartBadge).toHaveText('1');

        // Go to cart
        await inventoryPage.goToCart();
        await cartPage.verifyItemInCart('Sauce Labs Backpack');

        // Proceed to checkout
        await cartPage.proceedToCheckout();

        // Fill shipping details
        await checkoutPage.fillShippingDetails('John', 'Doe', '12345');

        // Finish overview
        await expect(checkoutOverviewPage.subtotalLabel).toBeVisible();
        await checkoutOverviewPage.finishCheckout();

        // Verify success
        await checkoutCompletePage.verifyOrderSuccess();
    });

    test('Locked Out User - Verify Error Message', async ({ loginPage }) => {
        await loginPage.login('locked_out_user');
        const error = await loginPage.getErrorMessage();
        expect(error).toContain('Epic sadface: Sorry, this user has been locked out.');
    });

    test('Problem User - Verify broken functionality on Add to Cart', async ({ loginPage, inventoryPage }) => {
        await loginPage.login('problem_user');

        // Problem user has broken state on Add To Cart where the button doesn't transition to "Remove"
        // Or broken image srcs. Let's verify image src is broken.
        const firstItemImage = inventoryPage.page.locator('.inventory_item_img img').first();
        const imageSrc = await firstItemImage.getAttribute('src');

        // Problem user's images all point to slinky dog
        expect(imageSrc).toContain('sl-404'); // Or 'sl-404' depending on the exact implementation, we'll verify this during run. 
        // We will do a generic check: button click does not add to cart appropriately or images are bad.

        // Let's test the Add to Cart bug specifically: for problem_user, some items cannot be added.
        await inventoryPage.addItemToCart('Sauce Labs Fleece Jacket');
        // Let's check if the badge increments. For problem_user, it might not.
        // If it fails, that means the problem_user bug is caught. We'll use soft assertions or try/catch.

        try {
            await expect(inventoryPage.cartBadge).toHaveText('1', { timeout: 2000 });
            throw new Error('Problem user was able to add problematic item to cart successfully. Bug not present?');
        } catch (e: any) {
            if (e.message.includes('Problem user was able to add')) throw e; // Relaunch if we passed unexpectedly.
            // Expected to timeout/fail because the problem_user has a broken add to cart for this jacket.
            expect(true).toBe(true);
        }
    });

    test('Performance Glitch User - Verify slow load time', async ({ page, loginPage }) => {
        const startTime = Date.now();
        await loginPage.login('performance_glitch_user');
        await expect(page.locator('.title')).toBeVisible();
        const endTime = Date.now();

        const loadTime = endTime - startTime;
        console.log(`Load time for performance_glitch_user: ${loadTime}ms`);
        // The glitch user usually takes > 3 seconds. Let's enforce it took a long time to prove we caught it.
        expect(loadTime).toBeGreaterThan(2000);
    });

    test('Error User - Verify specific error handling / breakage', async ({ loginPage, inventoryPage }) => {
        await loginPage.login('error_user');

        // Error user has broken interactions. For instance, attempt to add to cart throws JS errors
        // Or sorting is broken. Let's try changing the sort order, which might throw or not work.
        const sortDropdown = inventoryPage.page.locator('[data-test="product-sort-container"]');
        await sortDropdown.selectOption('za'); // Try sorting Z-A

        const firstItemName = await inventoryPage.page.locator('.inventory_item_name ').first().innerText();

        // Valid functionality would mean "Test.allTheThings() T-Shirt (Red)" is first.
        // Error user sorting is broken, so it should still be "Sauce Labs Backpack"
        expect(firstItemName).toBe('Sauce Labs Backpack');
    });

    test('Visual User - Verify visual bugs via positional or image checks', async ({ loginPage, inventoryPage }) => {
        await loginPage.login('visual_user');

        // Visual user has a misaligned layout. We can capture a screenshot or check specific CSS.
        // For simplicity, we'll check if the Add to Cart button for the backpack is unclickable or misaligned.
        // With Playwright, visual comparisons require `toHaveScreenshot()`. We will just run standard operations and notice they might fail.

        // Alternatively, the visual user has a broken cart icon.
        const cartBadge = inventoryPage.cartBadge;
        // In visual user, the backpack image is wrong or misaligned. Let's check the backpack image src.
        const backpackImage = inventoryPage.page.locator('[data-test="inventory-item-sauce-labs-backpack-img"]');
        const imgSrc = await backpackImage.getAttribute('src');

        // The visual user usually mixes up images. "sl-404" is the common one.
        expect(imgSrc).not.toContain('sauce-backpack'); // Should fail standard expectation because it's visually bugged
    });
});
