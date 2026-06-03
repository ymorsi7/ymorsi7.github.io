/**
 * Playwright smoke tests for Solar Alarm Clock button interactions.
 * Run: node tests/alarm-buttons.test.mjs
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const alarmUrl = 'file://' + path.join(__dirname, '..', 'alarm.html');

const errors = [];
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log('  ✓', message);
  } else {
    failed++;
    errors.push(message);
    console.log('  ✗', message);
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const consoleErrors = [];
  page.on('pageerror', (err) => consoleErrors.push(String(err)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.goto(alarmUrl, { waitUntil: 'domcontentloaded' });

  console.log('\nInitial load');
  assert(
    consoleErrors.length === 0,
    `No JS errors on load (got: ${consoleErrors.join('; ') || 'none'})`
  );

  const hourBefore = await page.locator('#alarmHourDisplay').textContent();
  await page.locator('#hourUp').click({ force: true });
  const hourAfter = await page.locator('#alarmHourDisplay').textContent();
  assert(hourBefore !== hourAfter, `Hour up: ${hourBefore} → ${hourAfter}`);

  const minBefore = await page.locator('#alarmMinuteDisplay').textContent();
  await page.locator('#minuteUp').click({ force: true });
  const minAfter = await page.locator('#alarmMinuteDisplay').textContent();
  assert(minBefore !== minAfter, `Minute up: ${minBefore} → ${minAfter}`);

  await page.locator('#nightModeBtn').click({ force: true });
  assert(
    (await page.locator('#nightModeBtn').textContent()) === 'Day Mode',
    'Night mode toggles button label'
  );

  await page.locator('.sound-btn[data-sound="ocean"]').click({ force: true });
  assert(
    await page.locator('.sound-btn[data-sound="ocean"]').evaluate((el) =>
      el.classList.contains('active')
    ),
    'Sound selection activates ocean button'
  );

  await page.locator('#setAlarmBtn').click({ force: true });
  const status = await page.locator('#status').textContent();
  assert(status.includes('Alarm is set'), `Set alarm updates status: "${status}"`);
  assert(
    await page.locator('#cancelAlarmBtn').isVisible(),
    'Cancel alarm button visible after set'
  );

  await page.locator('#cancelAlarmBtn').click({ force: true });
  assert(
    (await page.locator('#status').textContent()) === '',
    'Cancel alarm clears status'
  );

  // Pointer hit test: center of hourUp should hit the button
  const hit = await page.evaluate(() => {
    const btn = document.getElementById('hourUp');
    const r = btn.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const top = document.elementFromPoint(x, y);
    return top === btn || btn.contains(top);
  });
  assert(hit, 'elementFromPoint on hourUp hits the button (not blocked by overlay)');

  await browser.close();

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.error('\nFailures:', errors);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
