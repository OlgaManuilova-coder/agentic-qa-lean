// © 2026 Olga Manuilova — Agentic QA Framework (lean edition). MIT License: keep this notice in all copies. https://github.com/OlgaManuilova-coder/agentic-qa-lean
// Promoted cases: each test names the CSV case it automates. Keep the IDs in the title so a failing
// spec maps straight back to its case and Business_Rule.

import { test, expect } from '@playwright/test';

const { STANDARD_USER, USER_PASSWORD, CHECKOUT_FIRST_NAME, CHECKOUT_LAST_NAME, CHECKOUT_POSTAL_CODE } = process.env;

async function signIn(page, user = STANDARD_USER) {
  await page.goto('/');
  await page.getByTestId('username').fill(user);
  await page.getByTestId('password').fill(USER_PASSWORD);
  await page.getByTestId('login-button').click();
}

test('AUTH-001 standard user signs in [BL-AUTH-001]', async ({ page }) => {
  await signIn(page);
  await expect(page).toHaveURL(/\/inventory\.html$/);
  await expect(page.getByTestId('title')).toHaveText('Products');
});

test('INV-004 sort by price low to high [BL-INV-002]', async ({ page }) => {
  await signIn(page);
  await page.getByTestId('product-sort-container').selectOption('lohi');
  const prices = (await page.getByTestId('inventory-item-price').allTextContents()).map((p) => Number(p.replace('$', '')));
  expect(prices).toEqual([...prices].sort((a, b) => a - b));
  expect(prices[0]).toBe(7.99);
});

test('CHK-005 finish completes the order and empties the cart [BL-CHK-002, BL-CHK-003]', async ({ page }) => {
  await signIn(page);
  await page.getByTestId('add-to-cart-sauce-labs-bike-light').click();
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
  await page.getByTestId('shopping-cart-link').click();
  await page.getByTestId('checkout').click();
  await page.getByTestId('firstName').fill(CHECKOUT_FIRST_NAME);
  await page.getByTestId('lastName').fill(CHECKOUT_LAST_NAME);
  await page.getByTestId('postalCode').fill(CHECKOUT_POSTAL_CODE);
  await page.getByTestId('continue').click();

  const money = async (id) => Number((await page.getByTestId(id).textContent()).replace(/[^0-9.]/g, ''));
  const itemTotal = await money('subtotal-label');
  const tax = await money('tax-label');
  const total = await money('total-label');
  expect(itemTotal).toBe(9.99);
  expect(tax).toBe(Math.round(itemTotal * 0.08 * 100) / 100);
  expect(total).toBeCloseTo(itemTotal + tax, 2);

  await page.getByTestId('finish').click();
  await expect(page.getByTestId('complete-header')).toHaveText('Thank you for your order!');
  await expect(page.getByTestId('shopping-cart-badge')).toHaveCount(0);
});
