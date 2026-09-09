import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { registerMainMenuItem } from "../toolkit/index.js";
import { random, sendDua } from "../doaify.js";

// SCAFFOLD — generated from the bot blueprint BEFORE the agent runs.
// Keep a LIVE registration (.command / .callbackQuery / …) so this feature is
// never an empty stub. Replace the reply body with real logic + copy; if you
// change the user-facing text, update tests/specs to match EXACTLY.
// Do NOT rewrite src/bot.ts — buildBot() already auto-loads this module.
// Menu: wire this into /start via registerMainMenuItem({ label: "دُعای تصادفی", data: "menu:random" }) if the toolkit exposes it.

registerMainMenuItem({ label: "دعای تصادفی", data: "menu:random", order: 20 });
const composer = new Composer<Ctx>();

composer.callbackQuery("menu:random", async (ctx) => {
  await ctx.answerCallbackQuery();
  await sendDua(ctx, random(ctx));
});

export default composer;
