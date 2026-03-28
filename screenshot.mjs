import puppeteer from "puppeteer";
import fs from "fs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ["--window-size=1440,1200"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1200 });

  // Login
  await page.goto("http://localhost:3001", { waitUntil: "networkidle2", timeout: 30000 });
  await sleep(2000);
  await page.type('input[placeholder="Enter email"]', "peterput19@gmail.com");
  await page.type('input[placeholder="Enter password"]', "20Peter12");
  const buttons = await page.$$("button");
  for (const btn of buttons) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text && text.includes("Log In")) { await btn.click(); break; }
  }
  await sleep(8000);

  // Navigate to products
  await page.goto("http://localhost:3001/authed/product/productlist-product", { waitUntil: "networkidle2", timeout: 30000 });
  await sleep(3000);

  // Click Edit on Build Your Own Pizza
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("*")) {
      if (el.children.length === 0 && el.textContent?.trim() === "Build Your Own Pizza") {
        let t = el;
        for (let i = 0; i < 10; i++) { t = t.parentElement; if (!t) break; if (t.tagName === "BUTTON") { t.click(); return; } }
      }
    }
  });
  await sleep(3000);

  // Read __productData from window
  const data = await page.evaluate(() => JSON.stringify(window.__productData, null, 2));
  fs.writeFileSync("screenshots/product-data.json", data || "null");
  console.log("Saved! Length:", data?.length);

  await browser.close();
})();
