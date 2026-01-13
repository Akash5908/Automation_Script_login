import { chromium, Page, Browser } from "playwright";

async function loginToGamma() {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    browser = await chromium.launch({
      headless: false,
      slowMo: 2500,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-blink-features=AutomationControlled",
        "--disable-extensions",
        "--disable-plugins",
        "--disable-images",
      ],
    });

    page = await browser.newPage();

    await page.addInitScript(() => {
      // Remove ALL automation traces
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
      Object.defineProperty(navigator, "userAgent", {
        get: () =>
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      });

      // Override automation flags
      const newProto = Object.getPrototypeOf(navigator);
      delete newProto.webdriver;
      Object.setPrototypeOf(navigator, newProto);

      // Permissions + WebGL spoofing
      (navigator as any).permissions.query = (parameters: any) =>
        parameters.name === "notifications"
          ? Promise.resolve({ state: Notification.permission })
          : Promise.resolve({ state: "denied" });

      // Continuous human mouse movement
      setInterval(() => {
        document.dispatchEvent(
          new MouseEvent("mousemove", {
            clientX: 200 + Math.random() * 800,
            clientY: 200 + Math.random() * 400,
            bubbles: true,
          })
        );
      }, 800);
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Ch-Ua":
        '"Not_A Brand";v="8", "Chromium";v="122", "Google Chrome";v="122"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"macOS"',
    });

    console.log("Loading gamma.app...");
    await page.goto("https://gamma.app/signin", {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });

    // CLOUDFLARE WAITER
    console.log("⏳ Waiting for Cloudflare clearance...");
    await page.waitForTimeout(10000);

    // Wait for Cloudflare to disappear
    await page.waitForFunction(
      () => {
        return !document.querySelector(
          "#cf-challenge-running, .cf-browser-verification, [data-ray]"
        );
      },
      {},
      { timeout: 60000 }
    );

    console.log("Cloudflare cleared!");
    await page.screenshot({ path: "cloudflare-cleared.png" });

    // Human behavior simulation
    for (let i = 0; i < 3; i++) {
      await page.mouse.move(
        300 + Math.random() * 400,
        200 + Math.random() * 300
      );
      await page.waitForTimeout(2000 + Math.random() * 3000);
    }

    // Email input - Multiple selectors + timeout
    const emailSelectors = [
      'input[placeholder*="email"]',
      'input[placeholder*="Email"]',
      'input[type="email"]',
      'input[name="email"]',
      "#email",
    ];

    let emailInput: any = null;
    for (const selector of emailSelectors) {
      try {
        emailInput = page.locator(selector);
        await emailInput.waitFor({ state: "visible", timeout: 5000 });
        console.log(`Email input found: ${selector}`);
        break;
      } catch (e) {
        continue;
      }
    }

    if (!emailInput) {
      await page.screenshot({ path: "no-email.png" });
      throw new Error("Email input not found");
    }

    await emailInput.fill("test@gmail.com");
    console.log("Email filled");

    await page.getByRole("button", { name: /continue|next/i }).click();
    await page.waitForTimeout(3000);

    await page.getByPlaceholder(/password/i).fill("12345678");
    await page.getByRole("button", { name: /sign in|log in/i }).click();

    await page.waitForTimeout(10000);
    await page.screenshot({ path: "final.png" });
  } catch (error) {
    console.error("Failed:", error);
    await page?.screenshot({ path: "error.png" });
  } finally {
    await new Promise((r) => setTimeout(r, 30000));
    browser?.close();
  }
}

loginToGamma().catch(console.error);
