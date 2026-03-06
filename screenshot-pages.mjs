import puppeteer from "puppeteer";

const BASE = "http://localhost:3000";

const PAGES = [
  { name: "pos", path: "/pos", wait: 4000 },
  { name: "dashboard", path: "/authed/dashboard", wait: 3000 },
  { name: "invoices", path: "/authed/report/invoicereport", wait: 3000 },
  { name: "employees", path: "/authed/report/employeesreport", wait: 2000 },
  { name: "products", path: "/authed/productsettings", wait: 2000 },
  { name: "store-settings", path: "/authed/storesettings", wait: 2000 },
  { name: "device-settings", path: "/authed/devicesettings", wait: 2000 },
  { name: "help", path: "/authed/help", wait: 1500 },
];

async function main() {
  console.log("Launching headless browser...");

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();

  // Navigate to the app
  console.log("Navigating to app...");
  await page.goto(BASE, { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  // Take a screenshot to see what we're looking at
  await page.screenshot({ path: "screenshots/00-initial.png" });
  console.log("  ✓ initial page screenshot saved");

  // Try to find and fill login form
  console.log("Attempting login...");
  try {
    // Wait for any input fields to appear
    await page.waitForSelector("input", { timeout: 10000 });

    const inputs = await page.$$("input");
    console.log(`  Found ${inputs.length} input fields`);

    if (inputs.length >= 2) {
      await inputs[0].click({ clickCount: 3 });
      await inputs[0].type("peterput19@gmail.com", { delay: 30 });
      await inputs[1].click({ clickCount: 3 });
      await inputs[1].type("20Peter12", { delay: 30 });

      await page.screenshot({ path: "screenshots/01-filled-login.png" });
      console.log("  ✓ filled login fields");

      // Find and click the login/sign in button
      const buttons = await page.$$("button");
      console.log(`  Found ${buttons.length} buttons`);
      for (const btn of buttons) {
        const text = await page.evaluate((el) => el.textContent?.toLowerCase(), btn);
        if (text && (text.includes("sign in") || text.includes("login") || text.includes("log in"))) {
          await btn.click();
          console.log(`  ✓ clicked "${text}" button`);
          break;
        }
      }

      // Wait for navigation after login
      console.log("  Waiting for login to complete...");
      await new Promise((r) => setTimeout(r, 8000));
      await page.screenshot({ path: "screenshots/02-after-login.png" });
      console.log("  ✓ post-login screenshot saved");
    }
  } catch (err) {
    console.log(`  Login attempt: ${err.message}`);
  }

  // Screenshot each page
  console.log("\nScreenshotting pages...\n");
  for (const pg of PAGES) {
    try {
      await page.goto(`${BASE}${pg.path}`, { waitUntil: "networkidle2", timeout: 20000 });
      await new Promise((r) => setTimeout(r, pg.wait));
      await page.screenshot({ path: `screenshots/${pg.name}.png`, fullPage: false });
      console.log(`  ✓ ${pg.name}`);
    } catch (err) {
      console.log(`  ✗ ${pg.name} — ${err.message}`);
    }
  }

  console.log("\nDone!");
  await browser.close();
}

main().catch(console.error);
