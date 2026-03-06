import puppeteer from "puppeteer";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function clickByText(page, selector, text) {
  const elements = await page.$$(selector);
  for (const el of elements) {
    const t = await el.evaluate((e) => e.textContent?.trim());
    if (t && t.toLowerCase().includes(text.toLowerCase())) {
      await el.click();
      return true;
    }
  }
  return false;
}

async function screenshot(page, name) {
  await page.screenshot({
    path: `screenshots/test-pb-${name}.png`,
    fullPage: false,
  });
  console.log(`  ✓ screenshot: ${name}`);
}

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // ── Step 1: Login ──
  console.log("Step 1: Logging in...");
  await page.goto("http://localhost:3000", {
    waitUntil: "networkidle2",
    timeout: 15000,
  });
  await page.waitForSelector("input", { timeout: 10000 });
  const inputs = await page.$$("input");
  await inputs[0].type("peterput19@gmail.com");
  await inputs[1].type("20Peter12");
  await clickByText(page, "button", "log in");
  await sleep(5000);
  console.log("  ✓ logged in");

  // ── Step 2: Navigate to Product Management ──
  console.log("Step 2: Navigating to Product Management...");
  await page.goto("http://localhost:3000/authed/product/productlist-product", {
    waitUntil: "domcontentloaded",
    timeout: 20000,
  });
  await sleep(3000);
  await screenshot(page, "01-product-list");

  // ── Step 3: Click "Add New Item" ──
  console.log("Step 3: Opening Add Product modal...");
  await clickByText(page, "button", "Add New Item");
  await sleep(1500);
  await screenshot(page, "02-add-product-modal");

  // ── Step 4: Fill in product details ──
  console.log("Step 4: Filling product details...");

  // Find inputs by placeholder
  const nameInput = await page.$(
    'input[placeholder="Enter Product Name"]'
  );
  const priceInput = await page.$(
    'input[placeholder="Enter Base Price"]'
  );

  if (nameInput) {
    await nameInput.click({ clickCount: 3 });
    await nameInput.type("Test Burger");
    console.log("  ✓ entered product name");
  }
  if (priceInput) {
    await priceInput.click({ clickCount: 3 });
    await priceInput.type("9.99");
    console.log("  ✓ entered base price");
  }

  // Click the Category dropdown (the button with "Choose Category")
  const categoryDropdownClicked = await clickByText(
    page,
    "button",
    "Choose Category"
  );
  if (categoryDropdownClicked) {
    await sleep(500);
    // Click the first category option (Pizza)
    // The dropdown renders options in a modal portal
    const picked = await clickByText(page, "button", "Pizza");
    if (picked) console.log("  ✓ selected category: Pizza");
    await sleep(500);
  }

  // Fill description
  const descTextarea = await page.$(
    'textarea[placeholder="Enter Product Description"]'
  );
  if (descTextarea) {
    await descTextarea.type("A delicious test burger with customizable options");
    console.log("  ✓ entered description");
  }

  await screenshot(page, "03-product-details-filled");

  // ── Step 5: Create an Option ──
  console.log("Step 5: Creating option (Size)...");
  await clickByText(page, "button", "Create Option");
  await sleep(1000);
  await screenshot(page, "04-option-created");

  // Fill option name
  const optionNameInput = await page.$(
    'input[placeholder="Enter Name (Ex Size, Toppings, Cheese)"]'
  );
  if (optionNameInput) {
    await optionNameInput.type("Size");
    console.log("  ✓ entered option name: Size");
  }

  // Select option type: Dropdown
  await sleep(300);
  const typeDropdownClicked = await clickByText(page, "button", "Choose Type");
  if (typeDropdownClicked) {
    await sleep(500);
    const picked = await clickByText(page, "button", "Dropdown");
    if (picked) console.log("  ✓ selected option type: Dropdown");
    await sleep(500);
  }

  await screenshot(page, "05-option-name-and-type");

  // ── Step 6: Add option selections (Small, Medium, Large) ──
  console.log("Step 6: Adding selections...");

  // Click "Add Selection"
  await clickByText(page, "button", "Add Selection");
  await sleep(800);

  // Fill first selection: Small
  const selectionInputs = await page.$$('input[placeholder="Label"]');
  const priceInputs = await page.$$('input[placeholder="Price Increase"]');

  if (selectionInputs.length > 0) {
    await selectionInputs[0].type("Small");
    console.log("  ✓ added selection: Small");
  }
  if (priceInputs.length > 0) {
    await priceInputs[0].type("0");
    console.log("  ✓ set price increase: 0");
  }

  await screenshot(page, "06-first-selection");

  // Add another selection: Medium
  await clickByText(page, "button", "Add Another Selection");
  await sleep(800);

  const selectionInputs2 = await page.$$('input[placeholder="Label"]');
  const priceInputs2 = await page.$$('input[placeholder="Price Increase"]');

  if (selectionInputs2.length > 1) {
    await selectionInputs2[selectionInputs2.length - 1].type("Medium");
    console.log("  ✓ added selection: Medium");
  }
  if (priceInputs2.length > 1) {
    await priceInputs2[priceInputs2.length - 1].type("1.50");
    console.log("  ✓ set price increase: 1.50");
  }

  // Add another selection: Large
  await clickByText(page, "button", "Add Another Selection");
  await sleep(800);

  const selectionInputs3 = await page.$$('input[placeholder="Label"]');
  const priceInputs3 = await page.$$('input[placeholder="Price Increase"]');

  if (selectionInputs3.length > 2) {
    await selectionInputs3[selectionInputs3.length - 1].type("Large");
    console.log("  ✓ added selection: Large");
  }
  if (priceInputs3.length > 2) {
    await priceInputs3[priceInputs3.length - 1].type("3.00");
    console.log("  ✓ set price increase: 3.00");
  }

  await screenshot(page, "07-all-selections-added");

  // ── Step 7: Save the product ──
  console.log("Step 7: Saving product...");

  // Scroll down to see save button
  const scrollArea = await page.$('div[style*="overflow: auto"]');
  if (scrollArea) {
    await scrollArea.evaluate((el) => el.scrollTo(0, el.scrollHeight));
    await sleep(500);
  }

  await screenshot(page, "08-before-save");

  // Click Add/Save button
  const saveClicked = await clickByText(page, "button", "Add");
  if (!saveClicked) {
    await clickByText(page, "button", "Save");
  }
  await sleep(2000);
  console.log("  ✓ product saved");
  await screenshot(page, "09-after-save");

  // ── Step 8: Go to POS and test the product ──
  console.log("Step 8: Testing in POS...");
  await page.goto("http://localhost:3000/pos", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await sleep(5000);
  await screenshot(page, "10-pos-with-product");

  // Try clicking "Test Burger" product
  const productClicked = await clickByText(page, "button", "Test Burger");
  if (productClicked) {
    console.log("  ✓ clicked Test Burger");
    await sleep(1500);
    await screenshot(page, "11-product-builder-open");

    // Try selecting an option (Medium)
    const mediumClicked = await clickByText(page, "button", "Medium");
    if (mediumClicked) {
      console.log("  ✓ selected Medium size");
      await sleep(500);
    }
    // Try the dropdown instead
    const dropdownClicked = await clickByText(page, "button", "Size");
    if (dropdownClicked) {
      await sleep(500);
      await screenshot(page, "12-dropdown-open");
      const optClicked = await clickByText(page, "button", "Medium");
      if (optClicked) {
        console.log("  ✓ selected Medium from dropdown");
        await sleep(500);
      }
    }
    await screenshot(page, "13-option-selected");

    // Click Add to Cart
    const addClicked = await clickByText(page, "button", "Add to Cart");
    if (addClicked) {
      console.log("  ✓ added to cart");
      await sleep(1500);
      await screenshot(page, "14-added-to-cart");
    }
  } else {
    console.log("  ✗ could not find Test Burger product");
    // Take screenshot of current state for debugging
    await screenshot(page, "11-debug-pos-state");
  }

  console.log("\nDone! Check screenshots/test-pb-*.png");
  await browser.close();
})();
