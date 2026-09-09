import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { registerMainMenuItem } from "../toolkit/index.js";
import { sendDua, today } from "../doaify.js";

// SCAFFOLD — generated from the bot blueprint BEFORE the agent runs.
// Keep a LIVE registration (.command / .callbackQuery / …) so this feature is
// never an empty stub. Replace the reply body with real logic + copy; if you
// change the user-facing text, update tests/specs to match EXACTLY.
// Do NOT rewrite src/bot.ts — buildBot() already auto-loads this module.
// Menu: wire this into /start via registerMainMenuItem({ label: "دُعای امروز", data: "menu:today" }) if the toolkit exposes it.

registerMainMenuItem({ label: "دعای امروز", data: "menu:today", order: 10 });
const composer = new Composer<Ctx>();

composer.callbackQuery("menu:today", async (ctx) => {
  await ctx.answerCallbackQuery();
  await sendDua(ctx, today(ctx));
});

export default composer;
