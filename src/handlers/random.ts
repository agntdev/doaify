import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { random as pick, sendDua } from "../doaify.js";

// SCAFFOLD — generated from the bot blueprint BEFORE the agent runs.
// Keep a LIVE registration (.command / .callbackQuery / …) so this feature is
// never an empty stub. Replace the reply body with real logic + copy; if you
// change the user-facing text, update tests/specs to match EXACTLY.
// Do NOT rewrite src/bot.ts — buildBot() already auto-loads this module.

const composer = new Composer<Ctx>();

composer.command("random", async (ctx) => {
  await sendDua(ctx, pick(ctx));
});

export default composer;
