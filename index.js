const { chromium } = require('playwright');
const prompt = require('prompt-sync')();
const { createMailAccount, getOTP } = require('./getMail');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

(async () => {
  const count = +prompt('How many accounts to create? ');
  const suffix = prompt('Enter password suffix: ');
  const csv = createCsvWriter({
    path: 'accounts.csv',
    header: [
      { id: 'username', title: 'Username' },
      { id: 'password', title: 'Password' },
      { id: 'email', title: 'Email' },
      { id: 'twofa', title: '2FA_Secret' }
    ]
  });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const accs = [];

  for (let i = 0; i < count; i++) {
    const { address, token } = await createMailAccount();
    const username = 'girl_' + Math.random().toString(36).substring(2, 10);
    const password = Math.random().toString(36).slice(-8) + suffix;

    await page.goto('https://www.instagram.com/accounts/emailsignup/', { waitUntil: 'load' });
    await page.fill('input[name=\"emailOrPhone\"]', address);
    await page.fill('input[name=\"fullName\"]', 'Sophia Grace');
    await page.fill('input[name=\"username\"]', username);
    await page.fill('input[name=\"password\"]', password);
    await page.click('button[type=\"submit\"]');
    await page.waitForTimeout(5000);

    const otp = await getOTP(token);
    await page.fill('input[name=\"email_confirmation_code\"]', otp);
    await page.click('button[type=\"submit\"]');
    await page.waitForTimeout(8000);

    accs.push({ username, password, email: address, twofa: 'MANUAL_SETUP' });
    console.log(`✅ ${username} created`);
  }

  await csv.writeRecords(accs);
  await browser.close();
  console.log('✅ All accounts created. See accounts.csv');
})()
