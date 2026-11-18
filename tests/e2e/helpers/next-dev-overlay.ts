import type { BrowserContext } from "@playwright/test";

/**
 * Hides the Next.js dev tools overlay (`<nextjs-portal>`). It exists only
 * under `next dev`, sits over bottom-left controls (the missionary sidebar's
 * account menu, the phone composer's tabs) and takes their pointer events;
 * production renders no such element. The real-app specs still collect
 * console and hydration errors on their own, so hiding it hides no failure.
 */
export async function hideNextDevOverlay(context: BrowserContext) {
  await context.addInitScript(() => {
    const style = document.createElement("style");
    style.textContent = "nextjs-portal { display: none !important; }";
    const add = () => document.head.append(style);
    if (document.head) add();
    else document.addEventListener("DOMContentLoaded", add, { once: true });
  });
}
