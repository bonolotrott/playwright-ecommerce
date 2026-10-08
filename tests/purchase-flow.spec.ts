import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { OverviewPage } from '../pages/OverviewPage';
import users from '../fixtures/users.json';

test.describe('E-commerce Purchase Flow', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;
  let overviewPage: OverviewPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
    overviewPage = new OverviewPage(page);

    await loginPage.goto();
    await loginPage.login(
      users.standardUser.username,
      users.standardUser.password
    );
    await loginPage.verifyLoginSuccess();
  });

  test('Full purchase flow: login → add to cart → checkout → payment', async ({ page }) => {
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.inventoryList).toBeVisible();

    await inventoryPage.addProductToCart(users.products.backpack);
    await inventoryPage.verifyCartCount(1);

    await inventoryPage.addProductToCart(users.products.bikeLight);
    await inventoryPage.verifyCartCount(2);

    await inventoryPage.goToCart();
    await cartPage.verifyCartItemCount(2);
    await cartPage.verifyItemInCart(users.products.backpack);
    await cartPage.verifyItemInCart(users.products.bikeLight);

    await cartPage.proceedToCheckout();
    await checkoutPage.completeCheckoutForm(users.checkoutInfo);

    await overviewPage.verifyOrderSummary();
    await overviewPage.verifyItemsInOverview(2);

    await overviewPage.finishOrder();
    await overviewPage.verifyOrderComplete();

    await overviewPage.backToHome();
    await inventoryPage.verifyCartCount(0);
  });

  test('Add multiple items and remove one before checkout', async () => {
    await inventoryPage.addProductToCart(users.products.backpack);
    await inventoryPage.addProductToCart(users.products.bikeLight);
    await inventoryPage.addProductToCart(users.products.boltTshirt);
    await inventoryPage.verifyCartCount(3);

    await inventoryPage.goToCart();
    await cartPage.verifyCartItemCount(3);

    await cartPage.removeItem(users.products.bikeLight);
    await cartPage.verifyCartItemCount(2);

    await cartPage.proceedToCheckout();
    await checkoutPage.completeCheckoutForm(users.checkoutInfo);
    await overviewPage.verifyItemsInOverview(2);
    await overviewPage.finishOrder();
    await overviewPage.verifyOrderComplete();
  });

  test('Show error when checkout form is incomplete', async () => {
    await inventoryPage.addProductToCart(users.products.backpack);
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();

    await checkoutPage.continueButton.click();
    await checkoutPage.verifyErrorMessage('Error: First Name is required');

    await checkoutPage.firstNameInput.fill('John');
    await checkoutPage.continueButton.click();
    await checkoutPage.verifyErrorMessage('Error: Last Name is required');
  });
});