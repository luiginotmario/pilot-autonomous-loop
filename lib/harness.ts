import { chromium, type Browser, type Page } from "playwright";

export type BrowserState = { url: string; title: string; text: string; screenshot: string };
export type BrowserAction = { type: "click" | "type" | "scroll" | "navigate"; selector?: string; text?: string; url?: string; rationale: string };

export class ProductHarness {
  private browser: Browser | undefined;
  private page: Page | undefined;

  async open(url: string) {
    this.browser = await chromium.launch({ headless: true });
    this.page = await this.browser.newPage({ viewport: { width: 1280, height: 800 } });
    await this.page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
    return this.state();
  }

  async act(action: BrowserAction) {
    if (!this.page) throw new Error("Browser session is not open.");
    try {
      if (action.type === "navigate" && action.url) await this.page.goto(action.url, { waitUntil: "domcontentloaded", timeout: 30_000 });
      if (action.type === "click" && action.selector) await this.page.locator(action.selector).first().click({ timeout: 10_000 });
      if (action.type === "type" && action.selector) await this.page.locator(action.selector).first().fill(action.text ?? "", { timeout: 10_000 });
      if (action.type === "scroll") await this.page.mouse.wheel(0, 600);
      await this.page.waitForTimeout(500);
      const state = await this.state();
      return { ok: true, action, state };
    } catch (cause) {
      return { ok: false, action, error: cause instanceof Error ? cause.message : "Browser action failed", state: await this.state() };
    }
  }

  async close() { await this.browser?.close(); }

  private async state(): Promise<BrowserState> {
    if (!this.page) throw new Error("Browser session is not open.");
    return {
      url: this.page.url(),
      title: await this.page.title(),
      text: (await this.page.locator("body").innerText()).replace(/\s+/g, " ").slice(0, 8_000),
      screenshot: `data:image/png;base64,${(await this.page.screenshot({ type: "png" })).toString("base64")}`,
    };
  }
}

export async function planAction(personaTurn: string, state: BrowserState): Promise<BrowserAction> {
  const endpoint = process.env.ACTION_PLANNER_URL;
  if (!endpoint) throw new Error("ACTION_PLANNER_URL is required to translate a persona’s free-text intent into a browser action.");
  const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ task: "Choose one safe browser action that best follows the simulated user's intent. Return JSON only.", personaTurn, page: { url: state.url, title: state.title, text: state.text }, allowedActions: ["click", "type", "scroll", "navigate"] }) });
  if (!response.ok) throw new Error(`Action planner returned ${response.status}`);
  const action = await response.json() as BrowserAction;
  if (!action || !["click", "type", "scroll", "navigate"].includes(action.type)) throw new Error("Action planner returned an invalid action.");
  return action;
}
