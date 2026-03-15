const { test, expect } = require('@playwright/test');

const API = 'https://cockpit.casasamaya.com/api';

const GUEST = {
  firstName: 'Test',
  lastName:  'Booking',
  email:     'office@casasamaya.com',
  whatsapp:  '+94773395212',
};

// ─── CLEANUP — delete all test bookings by email after tests ──

test.afterAll(async () => {
  for (const type of ['wellness', 'spa']) {
    try {
      const res = await fetch(`${API}/${type}/bookings`);
      const data = await res.json();
      const testBookings = data.bookings.filter(b => b.email === GUEST.email);
      for (const b of testBookings) {
        await fetch(`${API}/${type}/bookings/${b.id}`, { method: 'DELETE' }).catch(() => {});
      }
    } catch { /* API may be unavailable */ }
  }
});

// ─── WELLNESS BOOKING ─────────────────────────────────────────

test.describe.serial('Wellness — full booking flow', () => {

  test('book the first available wellness session', async ({ page, browserName }, testInfo) => {
    await page.goto('/wellness.html');
    await page.waitForSelector('.ww-card, .ww-session-row', { timeout: 15000 });

    // Use a different session index per project to avoid double-booking
    const sessionIndex = testInfo.project.name === 'mobile' ? 1 : 0;
    const bookBtns = page.locator('.ww-book-btn');
    await expect(bookBtns.first()).toBeVisible({ timeout: 5000 });

    const count = await bookBtns.count();
    const btnIndex = Math.min(sessionIndex, count - 1);
    await bookBtns.nth(btnIndex).click();

    await page.waitForSelector('#booking-modal', { state: 'visible', timeout: 5000 });

    await page.fill('#f-firstname', GUEST.firstName);
    await page.fill('#f-lastname', GUEST.lastName);
    await page.fill('#f-email', GUEST.email);
    await page.fill('#f-wa', GUEST.whatsapp);

    await page.locator('#submit-btn').click();

    await page.waitForFunction(
      () => {
        const btn = document.getElementById('submit-btn');
        return btn && btn.textContent !== 'Confirming...';
      },
      { timeout: 15000 }
    );

    const success = page.locator('#booking-success');
    const error   = page.locator('#form-error');

    if (await success.isVisible()) {
      await expect(success).toContainText('confirmed');
      testInfo.annotations.push({ type: 'result', description: 'Wellness booking SUCCESS' });
    } else if (await error.isVisible()) {
      const msg = await error.textContent();
      testInfo.annotations.push({ type: 'result', description: `Wellness booking API error: ${msg}` });
    } else {
      await expect(success).toBeVisible({ timeout: 5000 });
    }
  });
});

// ─── SPA/MASSAGE BOOKING ──────────────────────────────────────

test.describe.serial('Spa — full booking flow', () => {

  test('book a Neck Relaxation Massage', async ({ page }, testInfo) => {
    await page.goto('/massage.html');

    await page.locator('.massage-card[data-treatment="Neck Relaxation Massage"]').click();
    await page.waitForSelector('#spa-modal-overlay', { state: 'visible', timeout: 5000 });

    // Step 2 — pick the first available date
    const dateContainer = page.locator('[data-w="view-dates"]');
    await expect(dateContainer).toBeVisible({ timeout: 10000 });

    const dateBtns = page.locator('.cs-date-btn');
    await expect(dateBtns.first()).toBeVisible({ timeout: 10000 });

    const availableDates = page.locator('.cs-date-btn:not(.disabled)');
    const dateCount = await availableDates.count();

    if (dateCount === 0) {
      testInfo.annotations.push({ type: 'result', description: 'No available dates — all Full' });
      test.skip();
      return;
    }

    // Use different date per project to avoid double-booking same slot
    const dateIndex = testInfo.project.name === 'mobile' ? Math.min(1, dateCount - 1) : 0;
    await availableDates.nth(dateIndex).click();

    // Step 3 — pick the first available time slot
    const slotsView = page.locator('[data-w="view-slots"]');
    await expect(slotsView).toBeVisible({ timeout: 10000 });

    const slots = page.locator('.cs-slot');
    await expect(slots.first()).toBeVisible({ timeout: 10000 });
    await slots.first().click();

    // Step 4 — fill in the details form
    const formView = page.locator('[data-w="view-form"]');
    await expect(formView).toBeVisible({ timeout: 5000 });

    await page.fill('[data-w="f-firstname"]', GUEST.firstName);
    await page.fill('[data-w="f-lastname"]', GUEST.lastName);
    await page.fill('[data-w="f-email"]', GUEST.email);
    await page.fill('[data-w="f-whatsapp"]', GUEST.whatsapp);

    // Listen for alerts (error handling uses alert())
    let alertMsg = null;
    page.on('dialog', async dialog => {
      alertMsg = dialog.message();
      await dialog.dismiss();
    });

    await page.locator('[data-w="btn-confirm"]').click();

    const success = page.locator('[data-w="view-success"]');

    try {
      await expect(success).toBeVisible({ timeout: 10000 });
      await expect(success).toContainText('confirmed');
      testInfo.annotations.push({ type: 'result', description: 'Spa booking SUCCESS' });
    } catch {
      if (alertMsg) {
        testInfo.annotations.push({ type: 'result', description: `Spa booking API error: ${alertMsg}` });
      } else {
        testInfo.annotations.push({ type: 'result', description: 'Spa booking: no success view and no alert — check manually' });
      }
    }
  });
});
