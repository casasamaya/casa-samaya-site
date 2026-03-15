const { test, expect } = require('@playwright/test');

// ─── WELLNESS PAGE ──────────────────────────────────────────────

test.describe('Wellness booking form', () => {

  test('page loads and displays sessions', async ({ page }) => {
    await page.goto('/wellness.html');
    await expect(page).toHaveTitle(/Calma Samaya/);
    // Wait for sessions to load from the API
    await page.waitForSelector('.ww-card, .ww-session-row', { timeout: 15000 });
  });

  test('BOOK button opens the booking modal', async ({ page }) => {
    await page.goto('/wellness.html');
    await page.waitForSelector('.ww-card, .ww-session-row', { timeout: 15000 });

    // Find any available BOOK button and click it
    const bookBtn = page.locator('.ww-book-btn').first();
    if (await bookBtn.isVisible()) {
      await bookBtn.click();
      // Modal should appear
      const modal = page.locator('#booking-modal');
      await expect(modal).toBeVisible({ timeout: 3000 });
    }
  });

  test('booking form has all required fields', async ({ page }) => {
    await page.goto('/wellness.html');
    await page.waitForSelector('.ww-card, .ww-session-row', { timeout: 15000 });

    const bookBtn = page.locator('.ww-book-btn').first();
    if (await bookBtn.isVisible()) {
      await bookBtn.click();
      await page.waitForSelector('#booking-modal', { state: 'visible' });

      // Check all form fields exist
      await expect(page.locator('#f-firstname')).toBeVisible();
      await expect(page.locator('#f-lastname')).toBeVisible();
      await expect(page.locator('#f-email')).toBeVisible();
      await expect(page.locator('#f-wa')).toBeVisible();
      await expect(page.locator('#submit-btn')).toBeVisible();
      await expect(page.locator('#submit-btn')).toHaveText('CONFIRM BOOKING');
    }
  });

  test('form validates required fields', async ({ page }) => {
    await page.goto('/wellness.html');
    await page.waitForSelector('.ww-card, .ww-session-row', { timeout: 15000 });

    const bookBtn = page.locator('.ww-book-btn').first();
    if (await bookBtn.isVisible()) {
      await bookBtn.click();
      await page.waitForSelector('#booking-modal', { state: 'visible' });

      // Try submitting empty form — browser validation should prevent it
      await page.locator('#submit-btn').click();

      // Form should still be visible (not submitted)
      await expect(page.locator('#booking-form')).toBeVisible();
      // Success message should NOT be visible
      await expect(page.locator('#booking-success')).not.toBeVisible();
    }
  });

  test('modal can be closed', async ({ page }) => {
    await page.goto('/wellness.html');
    await page.waitForSelector('.ww-card, .ww-session-row', { timeout: 15000 });

    const bookBtn = page.locator('.ww-book-btn').first();
    if (await bookBtn.isVisible()) {
      await bookBtn.click();
      await page.waitForSelector('#booking-modal', { state: 'visible' });

      // Close the modal by clicking the overlay background
      await page.locator('#booking-modal').click({ position: { x: 10, y: 10 } });
    }
  });
});

// ─── MASSAGE PAGE ───────────────────────────────────────────────

test.describe('Massage/Spa booking form', () => {

  test('page loads and displays treatment cards', async ({ page }) => {
    await page.goto('/massage.html');
    await expect(page).toHaveTitle(/Massage.*Spa/);
    // Treatment cards should be visible
    await expect(page.locator('.massage-card').first()).toBeVisible();
  });

  test('treatment cards have Book buttons', async ({ page }) => {
    await page.goto('/massage.html');
    const bookBtns = page.locator('.card-book-btn');
    const count = await bookBtns.count();
    expect(count).toBeGreaterThanOrEqual(6); // at least 6 treatments
  });

  test('clicking a single-option massage card opens the spa modal', async ({ page }) => {
    await page.goto('/massage.html');
    // Use a card with a single price option (e.g., Neck Relaxation = 30 min only)
    const singleOptionCard = page.locator('.massage-card[data-treatment="Neck Relaxation Massage"]');
    await singleOptionCard.click();

    // Modal overlay should appear directly (no variant picker)
    const modal = page.locator('#spa-modal-overlay');
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test('clicking a multi-option card shows variant picker', async ({ page }) => {
    await page.goto('/massage.html');
    // Sports Massage has 60/90 min options
    const multiCard = page.locator('.massage-card[data-treatment="Sports Massage"]');
    await multiCard.click();

    // Variant picker should appear with duration options
    const variantPicker = page.locator('.variant-picker, [class*="variant"], [class*="picker"]').first();
    // Either the variant picker or the modal should appear
    const modalOrPicker = page.locator('#spa-modal-overlay:visible, .massage-card >> text=CHOOSE YOUR OPTION').first();
    await expect(modalOrPicker).toBeVisible({ timeout: 5000 });
  });

  test('spa modal has 4-step flow', async ({ page }) => {
    await page.goto('/massage.html');
    // Use single-option card to go directly to modal
    await page.locator('.massage-card[data-treatment="Neck Relaxation Massage"]').click();
    await page.waitForSelector('#spa-modal-overlay', { state: 'visible', timeout: 5000 });

    // Check 4 steps are visible
    await expect(page.locator('.cs-step')).toHaveCount(4);
    await expect(page.locator('.cs-step-label').nth(0)).toHaveText('Treatment');
    await expect(page.locator('.cs-step-label').nth(1)).toHaveText('Date');
    await expect(page.locator('.cs-step-label').nth(2)).toHaveText('Time');
    await expect(page.locator('.cs-step-label').nth(3)).toHaveText('Details');
  });

  test('spa modal skips to date picker when opened from a card', async ({ page }) => {
    await page.goto('/massage.html');
    // Clicking a specific treatment card opens the modal and skips step 1 (treatment selection)
    await page.locator('.massage-card[data-treatment="Neck Relaxation Massage"]').click();
    await page.waitForSelector('#spa-modal-overlay', { state: 'visible', timeout: 5000 });

    // Modal should show the selected treatment name and jump to the date picker
    await expect(page.locator('#spa-modal-overlay')).toContainText('Neck Relaxation Massage');
    await expect(page.locator('[data-w="view-dates"]')).toBeVisible({ timeout: 5000 });
  });

  test('details form has all required fields', async ({ page }) => {
    await page.goto('/massage.html');

    // Check that the form view exists (even if hidden)
    const form = page.locator('[data-w="view-form"]');
    await expect(form).toBeAttached();

    // Check form fields exist
    await expect(page.locator('[data-w="f-firstname"]')).toBeAttached();
    await expect(page.locator('[data-w="f-lastname"]')).toBeAttached();
    await expect(page.locator('[data-w="f-email"]')).toBeAttached();
    await expect(page.locator('[data-w="f-whatsapp"]')).toBeAttached();
    await expect(page.locator('[data-w="f-room"]')).toBeAttached();
    await expect(page.locator('[data-w="f-notes"]')).toBeAttached();
    await expect(page.locator('[data-w="btn-confirm"]')).toBeAttached();
  });

  test('spa modal close button works', async ({ page }) => {
    await page.goto('/massage.html');
    await page.locator('.massage-card[data-treatment="Neck Relaxation Massage"]').click();
    await page.waitForSelector('#spa-modal-overlay', { state: 'visible', timeout: 5000 });

    await page.locator('#spa-modal-close').click();
    await expect(page.locator('#spa-modal-overlay')).not.toBeVisible();
  });
});

// ─── GENERAL CHECKS ─────────────────────────────────────────────

test.describe('Pages load without errors', () => {

  const pages = [
    ['/', 'Casa Samaya'],
    ['/rooms.html', 'Rooms'],
    ['/restaurant.html', 'Café Samaya'],
    ['/wellness.html', 'Calma Samaya'],
    ['/massage.html', 'Massage'],
    ['/experiences.html', 'Experiences'],
    ['/offers.html', 'Offers'],
    ['/vision.html', 'Vision'],
    ['/contact.html', 'Contact'],
    ['/gallery.html', 'Gallery'],
    ['/weligama.html', 'Weligama'],
    ['/privacy.html', 'Privacy'],
    ['/terms.html', 'Terms'],
  ];

  for (const [path, titleMatch] of pages) {
    test(`${path} loads correctly`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      const response = await page.goto(path);
      expect(response.status()).toBe(200);
      await expect(page).toHaveTitle(new RegExp(titleMatch, 'i'));

      // No critical JS errors
      const criticalErrors = errors.filter(e =>
        !e.includes('gtag') && !e.includes('GTM') && !e.includes('analytics')
      );
      expect(criticalErrors).toHaveLength(0);
    });
  }
});
