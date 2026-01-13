"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// gamma-login.ts - FULL stealth automation script
const playwright_1 = require("playwright");
// import "dotenv/config"; // npm i dotenv
async function loginToGamma() {
    let browser = null;
    let page = null;
    try {
        // 1. Launch stealth browser
        browser = await playwright_1.chromium.launch({
            headless: false, // Visible for debugging
            slowMo: 1500, // Human-like speed
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-accelerated-2d-canvas",
                "--no-first-run",
                "--no-zygote",
                "--disable-gpu",
            ],
        });
        page = await browser.newPage();
        // 2. Stealth mode - Anti-bot detection
        await page.addInitScript(() => {
            // Remove webdriver properties
            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;
            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
            Object.defineProperty(navigator, "webdriver", {
                get: () => undefined,
            });
            // Real Mac Chrome user agent
            Object.defineProperty(navigator, "userAgent", {
                get: () => "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            });
            // Plugins & languages
            Object.defineProperty(navigator, "plugins", {
                get: () => [1, 2, 3, 4, 5],
            });
            Object.defineProperty(navigator, "languages", {
                get: () => ["en-US", "en"],
            });
        });
        // 3. Set viewport & extra headers
        await page.setViewportSize({ width: 1366, height: 768 });
        await page.setExtraHTTPHeaders({
            "Accept-Language": "en-US,en;q=0.9",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        });
        // 4. Navigate with patience
        console.log("🌐 Going to gamma.app...");
        await page.goto("https://gamma.app/", {
            waitUntil: "domcontentloaded",
            timeout: 60000,
        });
        // 5. Wait for page to fully load
        await page.waitForTimeout(3000);
        console.log("✅ Page loaded");
        // 6. Find & click Sign In (multiple fallback selectors)
        const signInBtn = page.getByRole("button", { name: /sign in|log in/i });
        if (await signInBtn.isVisible()) {
            await signInBtn.click();
            console.log("✅ Clicked Sign In");
        }
        else {
            // Fallback: click any login link
            await page.getByRole("link", { name: /sign in|login/i }).click();
        }
        await page.waitForTimeout(2000);
        // 7. Email input
        console.log("📧 Entering email...");
        await page
            .getByPlaceholder(/email|email address/i)
            .fill("your-email@gmail.com");
        await page.getByRole("button", { name: /continue|next/i }).click();
        await page.waitForTimeout(2000);
        // 8. Password input
        console.log("🔑 Entering password...");
        await page.getByPlaceholder(/password/i).fill("your-password");
        await page.getByRole("button", { name: /sign in|log in|submit/i }).click();
        // 9. Wait for dashboard/success
        await page.waitForTimeout(5000);
        // Check if login successful
        const successSelectors = [
            '[data-testid="dashboard"]',
            ".dashboard",
            '[href*="/dashboard"]',
            ".user-profile",
        ];
        const loggedIn = (await page.locator(successSelectors.join(",")).count()) > 0;
        if (loggedIn) {
            console.log("🎉 SUCCESSFULLY LOGGED IN!");
            await page.screenshot({ path: "gamma-success.png" });
        }
        else {
            console.log("⚠️ Login might have failed - check screenshot");
        }
        await page.screenshot({ path: "gamma-final.png" });
    }
    catch (error) {
        console.error("❌ Automation failed:", error);
        await page?.screenshot({ path: "error.png" });
    }
    finally {
        // Keep browser open for 30s to inspect
        console.log("⏳ Browser stays open for 30 seconds...");
        await new Promise((r) => setTimeout(r, 30000));
        if (browser) {
            await browser.close();
        }
    }
}
// Run it
loginToGamma().catch(console.error);
//# sourceMappingURL=automationLogin.js.map