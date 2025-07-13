const { chromium } = require('playwright');
const fs = require('fs');

async function setupProfile({ username, password }) {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://www.instagram.com/accounts/login/');
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);

  await page.goto(`https://www.instagram.com/${username}/`);
  await page.click('text=Edit Profile');
  await page.waitForSelector('input[name="biography"]');

  await page.fill('input[name="first_name"]', 'Sophie');
  await page.fill('textarea[name="biography"]', '🌸 Lover of life | Insta Bot Test');
  await page.selectOption('select[name="gender"]', '2'); // 2 = Female
  await page.fill('input[name="email"]', `${username}@mail.tm`);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  await browser.close();
}

module.exports = { setupProfile }
