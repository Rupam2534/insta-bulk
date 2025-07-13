const { chromium } = require('playwright');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

(async () => {
  // ইনপুট নিন environment variables থেকে
  const count = parseInt(process.env.ACCOUNT_COUNT) || 1;
  const suffix = process.env.PASSWORD_SUFFIX || '';

  const csvWriter = createCsvWriter({
    path: 'accounts.csv',
    header: [
      {id: 'username', title: 'Username'},
      {id: 'password', title: 'Password'},
      {id: 'email', title: 'Email'}
    ]
  });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let accounts = [];

  for (let i = 0; i < count; i++) {
    // এখানে ইউজারনেম, পাসওয়ার্ড, ইমেইল জেনারেটের সিম্পল লজিক
    const username = `girl${Math.floor(Math.random()*1000000)}`;
    const password = Math.random().toString(36).slice(-8) + suffix;
    const email = `${username}@mail.tm`;

    // এখানে আপনার ইনস্টাগ্রাম সাইন আপ লজিক লিখবেন (উদাহরণ স্বরূপ নিচে দিলাম)
    await page.goto('https://www.instagram.com/accounts/emailsignup/');
    await page.fill('input[name="emailOrPhone"]', email);
    await page.fill('input[name="fullName"]', 'Sophia Grace');
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000); // ভেরিফাই করুন, ইমেইল OTP ইত্যাদি কোড লাগলে যোগ করুন

    accounts.push({ username, password, email });
    console.log(`Created: ${username}`);
  }

  await csvWriter.writeRecords(accounts);
  await browser.close();
  console.log('All accounts created. Data saved in accounts.csv');
})();
