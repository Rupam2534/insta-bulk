const { chromium } = require('playwright');
const prompt = require('prompt-sync')();
const { createMailAccount, getOTP } = require('./getMail');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

async function setupProfile(page, username) {
  await page.goto(`https://www.instagram.com/accounts/login/`);
  await page.fill('input[name="username"]', username);
  // এখানে পাসওয়ার্ডও দিতে হবে লগইনের জন্য
  // আপনি চাইলে পাসওয়ার্ড পাস করতে পারেন বা ইনপুট নিতে পারেন
  // উদাহরণস্বরূপ:
  // await page.fill('input[name="password"]', password);
  // await page.click('button[type="submit"]');
  // await page.waitForTimeout(5000);

  // Login না দিলে profile এ যাওয়া সম্ভব হবে না
  // এখানে শুধু উদাহরণ দিলাম, আপনি চাইলে লগইন ফাংশন আলাদাভাবে বানাতে পারেন

  await page.goto(`https://www.instagram.com/${username}/`);
  await page.click('text=Edit Profile');
  await page.waitForSelector('textarea[name="biography"]');

  await page.fill('input[name="first_name"]', 'Sophie');
  await page.fill('textarea[name="biography"]', '🌸 Lover of life | Insta Bot Test');
  await page.selectOption('select[name="gender"]', '2'); // Female
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
}

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

    // Account Create
    await page.goto('https://www.instagram.com/accounts/emailsignup/', { waitUntil: 'load' });
    await page.fill('input[name="emailOrPhone"]', address);
    await page.fill('input[name="fullName"]', 'Sophia Grace');
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);

    // Email OTP
    const otp = await getOTP(token);
    await page.fill('input[name="email_confirmation_code"]', otp);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(8000);

    // Profile Setup
    await setupProfile(page, username);

    accs.push({ username, password, email: address, twofa: 'MANUAL_SETUP' });
    console.log(`✅ ${username} created and profile set`);
  }

  await csv.writeRecords(accs);
  await browser.close();
  console.log('✅ All accounts created and profiles set. See accounts.csv');
})();
