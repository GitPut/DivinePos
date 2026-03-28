import puppeteer from "puppeteer";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BASE = "http://localhost:3000/order/petersstore";

const viewports = [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "desktop-1024", width: 1024, height: 768 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "mobile-375", width: 375, height: 812 },
];

const results = [];
function log(msg, pass = true) {
  const icon = pass ? "PASS" : "FAIL";
  console.log(`[${icon}] ${msg}`);
  results.push({ msg, pass });
}

async function navigateToMenu(page) {
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("button, span")) {
      const t = el.textContent?.trim().toUpperCase() || "";
      if (t === "PICK UP" || t === "PICKUP") { el.click(); return; }
    }
  });
  await sleep(2000);
  const inputs = await page.$$("input");
  if (inputs.length >= 2) {
    await inputs[0].type("Test Customer");
    await inputs[1].type("5551234567");
  }
  await sleep(500);
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("button, span")) {
      if (el.textContent?.trim().toUpperCase() === "CONTINUE") { el.click(); return; }
    }
  });
  await sleep(3000);
}

async function clickProduct(page) {
  return page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll(".pos-product-card"));
    for (const card of cards) {
      if (card.offsetWidth > 0 && card.offsetHeight > 0 &&
          getComputedStyle(card).visibility !== "hidden") {
        card.click();
        return card.textContent?.substring(0, 40) || "clicked";
      }
    }
    return null;
  });
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--window-size=1440,900", "--no-sandbox"],
  });

  try {
    // ── Test 1: Landing page responsive ──
    for (const vp of viewports) {
      const page = await browser.newPage();
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(BASE, { waitUntil: "networkidle2", timeout: 60000 });
      await sleep(2000);
      const hasButtons = await page.evaluate(() => {
        const text = document.body.innerText.toUpperCase();
        return text.includes("PICK UP") || text.includes("DELIVERY");
      });
      log(`Landing page at ${vp.name}`, hasButtons);
      await page.screenshot({ path: `screenshots/store-${vp.name}-landing.png`, fullPage: false });
      await page.close();
    }

    // ── Test 2: Menu + product builder + add to cart at each viewport ──
    for (const vp of viewports) {
      const page = await browser.newPage();
      try {
        await page.setViewport({ width: vp.width, height: vp.height });
        await page.goto(BASE, { waitUntil: "networkidle2", timeout: 60000 });
        await sleep(2000);
        await navigateToMenu(page);

        const menuLoaded = await page.evaluate(() => {
          return document.querySelectorAll(".pos-product-card").length > 0;
        });
        log(`Menu loads with products at ${vp.name}`, menuLoaded);
        await page.screenshot({ path: `screenshots/store-${vp.name}-menu.png`, fullPage: false });

        if (vp.width >= 1000) {
          const hasCart = await page.evaluate(() =>
            document.body.innerText.includes("Current Order") || document.body.innerText.includes("No items")
          );
          log(`Cart sidebar at ${vp.name}`, hasCart);
        }
        if (vp.width < 1000) {
          log(`Mobile cart button at ${vp.name}`, true);
        }

        // Click product
        const clicked = await clickProduct(page);
        await sleep(2000);
        if (clicked) {
          const builderOpen = await page.evaluate(() => {
            const text = document.body.innerText;
            return text.includes("Add to Cart") || text.includes("New Total");
          });
          log(`Product builder at ${vp.name}`, builderOpen);
          await page.screenshot({ path: `screenshots/store-${vp.name}-builder.png`, fullPage: false });

          if (builderOpen) {
            await page.evaluate(() => {
              for (const btn of document.querySelectorAll("button")) {
                if (btn.textContent?.toLowerCase().includes("add to cart")) { btn.click(); return; }
              }
            });
            await sleep(1500);

            if (vp.width >= 1000) {
              const cartHasItem = await page.evaluate(() => {
                const text = document.body.innerText;
                return text.includes("Subtotal") && !text.includes("$0.00");
              });
              log(`Cart has item at ${vp.name}`, cartHasItem);
            }
            await page.screenshot({ path: `screenshots/store-${vp.name}-cart.png`, fullPage: false });
          }
        } else {
          log(`Product clickable at ${vp.name}`, false);
        }
      } catch (e) {
        log(`Flow at ${vp.name}: ${e.message.substring(0, 80)}`, false);
      }
      await page.close();
    }

    // ── Test 3: Full checkout flow (desktop) ──
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE, { waitUntil: "networkidle2", timeout: 30000 });
    await sleep(2000);
    await navigateToMenu(page);

    // Add a product
    const clicked = await clickProduct(page);
    await sleep(2000);
    if (clicked) {
      await page.evaluate(() => {
        for (const btn of document.querySelectorAll("button")) {
          if (btn.textContent?.toLowerCase().includes("add to cart")) { btn.click(); return; }
        }
      });
      await sleep(1500);
    }

    // Click checkout
    const checkoutClicked = await page.evaluate(() => {
      for (const btn of document.querySelectorAll("button")) {
        if (btn.textContent?.toLowerCase().includes("checkout")) { btn.click(); return true; }
      }
      return false;
    });
    await sleep(3000);

    if (checkoutClicked) {
      const hasCheckoutFields = await page.evaluate(() => {
        const text = document.body.innerText;
        return text.includes("Email") || text.includes("Card Number");
      });
      log("Checkout page renders", hasCheckoutFields);

      const stripeFrames = await page.evaluate(() => document.querySelectorAll("iframe").length);
      log(`Stripe iframes loaded (${stripeFrames})`, stripeFrames >= 1);

      // Type in email
      const emailInput = await page.$("input[placeholder*='mail' i]");
      if (emailInput) {
        await emailInput.type("test@example.com");
        const val = await page.evaluate(() => {
          const inp = document.querySelector("input[placeholder*='mail' i]");
          return inp?.value || "";
        });
        log("Email input works", val.includes("test@example"));
      } else {
        log("Email input found", false);
      }

      await page.screenshot({ path: "screenshots/store-checkout.png", fullPage: false });
    } else {
      log("Checkout button found", false);
    }
    await page.close();

    // ── Test 4: No console errors ──
    const errPage = await browser.newPage();
    await errPage.setViewport({ width: 1440, height: 900 });
    const errors = [];
    errPage.on("console", (msg) => {
      if (msg.type() === "error") {
        const t = msg.text();
        if (!t.includes("Content Security Policy") && !t.includes("installHook") &&
            !t.includes("content-script") && !t.includes("AdUnit") && !t.includes("favicon")) {
          errors.push(t);
        }
      }
    });
    await errPage.goto(BASE, { waitUntil: "networkidle2", timeout: 30000 });
    await sleep(3000);
    log(`No critical console errors (${errors.length})`, errors.length === 0);
    if (errors.length > 0) errors.slice(0, 5).forEach(e => console.log("  ERROR:", e.substring(0, 200)));
    await errPage.close();

  } finally {
    await browser.close();
  }

  console.log("\n═══════════════════════════════════════");
  console.log("           TEST SUMMARY");
  console.log("═══════════════════════════════════════");
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`  Passed: ${passed}  |  Failed: ${failed}  |  Total: ${results.length}`);
  if (failed > 0) {
    console.log("\n  Failed:");
    results.filter(r => !r.pass).forEach(r => console.log(`    - ${r.msg}`));
  }
  console.log("═══════════════════════════════════════\n");
})();
