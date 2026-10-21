import { expect, test } from '@playwright/test';

test('browse the catalog and view a session', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Make room for a lovely afternoon.',
    }),
  ).toBeVisible();

  await expect(page.getByRole('article')).toHaveCount(3);

  await page
    .getByRole('link', {
      name: 'A turn at the pottery wheel',
      exact: true,
    })
    .click();

  await expect(page).toHaveURL(
    /\/sessions\/11111111-1111-4111-8111-111111111111$/,
  );

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'A turn at the pottery wheel',
    }),
  ).toBeVisible();

  await expect(
    page.getByText('America/Guayaquil', { exact: false }),
  ).toBeVisible();

  await expect(
    page.getByText('$48.00 per person', { exact: true }),
  ).toBeVisible();

  await expect(
    page.getByRole('heading', { name: 'Booking opens soon' }),
  ).toBeVisible();

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);

  await page.getByRole('link', { name: '← All classes' }).click();

  await expect(page.getByRole('article')).toHaveCount(3);
});

test('recover from a missing session', async ({ page }) => {
  await page.goto('/sessions/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');

  await expect(
    page.getByRole('heading', {
      name: 'That page could not be found.',
    }),
  ).toBeVisible();

  await page
    .getByRole('main')
    .getByRole('link', { name: 'Explore classes', exact: true })
    .click();

  await expect(page.getByRole('article')).toHaveCount(3);
});
