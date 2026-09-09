import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { adminChatId, inlineButton, inlineKeyboard, registerMainMenuItem } from "../toolkit/index.js";
import { now } from "../doaify.js";
registerMainMenuItem({ label: "بازخورد", data: "menu:feedback", order: 60 });
const composer = new Composer<Ctx>();
composer.callbackQuery("menu:feedback", async (ctx) => { await ctx.answerCallbackQuery(); ctx.session.step = "feedback"; await ctx.editMessageText("نظرت را در یک پیام کوتاه بنویس. خوانده می‌شود و به بهترشدن دعايفای کمک می‌کند.", { reply_markup: { force_reply: true, input_field_placeholder: "پیامت را بنویس…" } as never }); });
composer.on("message:text", async (ctx, next) => { if (ctx.session.step !== "feedback") return next(); const message = ctx.message.text.trim(); if (!message) { await ctx.reply("پیامت خالی است؛ چند کلمه دربارهٔ تجربه‌ات بنویس."); return; } ctx.session.step = undefined; (ctx.session.feedback ??= []).push({ text: message, at: now().toISOString() }); const owner = adminChatId(ctx as unknown as { env?: Record<string, unknown> }); if (!owner) { await ctx.reply("بازخوردت ذخیره شد، اما فرستادن آن برای صاحب ربات هنوز تنظیم نشده است.", { reply_markup: inlineKeyboard([[inlineButton("بازگشت به منو", "menu:main")]]) }); return; } try { await ctx.api.sendMessage(owner, `بازخورد تازه\nکاربر: ${ctx.from?.id ?? "نامشخص"}\nزمان: ${now().toISOString()}\nپیام: ${message}`); await ctx.reply("ممنون که وقت گذاشتی. بازخوردت برای صاحب ربات فرستاده شد.", { reply_markup: inlineKeyboard([[inlineButton("بازگشت به منو", "menu:main")]]) }); } catch { await ctx.reply("بازخوردت ذخیره شد، اما فعلاً فرستادنش ممکن نشد. صاحب ربات می‌تواند تنظیمات اعلان را بررسی کند."); } });
export default composer;
