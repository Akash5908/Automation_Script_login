"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_1 = require("playwright");
async function loginToGamma() {
    let browser = null;
    let page = null;
    try {
        browser = await playwright_1.chromium.launch({
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
        // CLOUDFLARE-PROOF STEALTH
        await page.addInitScript(() => {
            // Remove ALL automation traces
            Object.defineProperty(navigator, "webdriver", { get: () => undefined });
            Object.defineProperty(navigator, "userAgent", {
                get: () => "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            });
            // Override automation flags
            const newProto = Object.getPrototypeOf(navigator);
            delete newProto.webdriver;
            Object.setPrototypeOf(navigator, newProto);
            // Permissions + WebGL spoofing
            navigator.permissions.query = (parameters) => parameters.name === "notifications"
                ? Promise.resolve({ state: Notification.permission })
                : Promise.resolve({ state: "denied" });
            // Continuous human mouse movement
            setInterval(() => {
                document.dispatchEvent(new MouseEvent("mousemove", {
                    clientX: 200 + Math.random() * 800,
                    clientY: 200 + Math.random() * 400,
                    bubbles: true,
                }));
            }, 800);
        });
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.setExtraHTTPHeaders({
            "Accept-Language": "en-US,en;q=0.9",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="122", "Google Chrome";v="122"',
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": '"macOS"',
        });
        console.log("🌐 Loading gamma.app...");
        await page.goto("https://gamma.app/signin", {
            waitUntil: "domcontentloaded",
            timeout: 120000,
        });
        // 🔥 CLOUDFLARE WAITER - CRITICAL
        console.log("⏳ Waiting for Cloudflare clearance...");
        await page.waitForTimeout(10000);
        // Wait for Cloudflare to disappear
        await page.waitForFunction(() => {
            return !document.querySelector("#cf-challenge-running, .cf-browser-verification, [data-ray]");
        }, {}, { timeout: 60000 });
        console.log("✅ Cloudflare cleared!");
        await page.screenshot({ path: "cloudflare-cleared.png" });
        // Human behavior simulation
        for (let i = 0; i < 3; i++) {
            await page.mouse.move(300 + Math.random() * 400, 200 + Math.random() * 300);
            await page.waitForTimeout(2000 + Math.random() * 3000);
        }
        // // Sign In - More specific selectors
        // const signInSelectors = [
        //   'button:has-text("Sign in")',
        //   '[data-testid="sign-in-button"]',
        //   'a:has-text("Sign in")',
        //   ".login-button",
        // ];
        // let signInClicked = false;
        // for (const selector of signInSelectors) {
        //   try {
        //     const btn = page.locator(selector);
        //     if (await btn.isVisible({ timeout: 3000 })) {
        //       await btn.scrollIntoViewIfNeeded();
        //       await btn.click();
        //       console.log(`✅ Sign In clicked: ${selector}`);
        //       signInClicked = true;
        //       break;
        //     }
        //   } catch (e) {}
        // }
        // if (!signInClicked) {
        //   throw new Error("❌ Sign In button not found");
        // }
        // await page.waitForTimeout(5000);
        // await page.screenshot({ path: "after-signin.png" });
        // Email input - Multiple selectors + timeout
        const emailSelectors = [
            'input[placeholder*="email"]',
            'input[placeholder*="Email"]',
            'input[type="email"]',
            'input[name="email"]',
            "#email",
        ];
        let emailInput = null;
        for (const selector of emailSelectors) {
            try {
                emailInput = page.locator(selector);
                await emailInput.waitFor({ state: "visible", timeout: 5000 });
                console.log(`✅ Email input found: ${selector}`);
                break;
            }
            catch (e) {
                continue;
            }
        }
        if (!emailInput) {
            await page.screenshot({ path: "no-email.png" });
            throw new Error("❌ Email input not found");
        }
        await emailInput.fill("test@gmail.com");
        console.log("✅ Email filled");
        await page.getByRole("button", { name: /continue|next/i }).click();
        await page.waitForTimeout(3000);
        await page.getByPlaceholder(/password/i).fill("12345678");
        await page.getByRole("button", { name: /sign in|log in/i }).click();
        await page.waitForTimeout(10000);
        await page.screenshot({ path: "final.png" });
    }
    catch (error) {
        console.error("❌ Failed:", error);
        await page?.screenshot({ path: "error.png" });
    }
    finally {
        await new Promise((r) => setTimeout(r, 30000));
        browser?.close();
    }
}
loginToGamma().catch(console.error);
//# sourceMappingURL=automationLogin.js.map