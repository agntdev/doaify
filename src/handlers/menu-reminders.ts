import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard, registerMainMenuItem } from "../toolkit/index.js";
import { profile, validTime, validTimezone } from "../doaify.js";
registerMainMenuItem({ label: "یادآوری", data: "menu:reminders", order: 50 });
const composer = new Composer<Ctx>();
function keyboard() { return inlineKeyboard([[inlineButton("تنظیم ساعت", "rem:set")], [inlineButton("خاموش کردن", "rem:off")], [inlineButton("بازگشت به منو", "menu:main")]]); }
composer.callbackQuery("menu:reminders", async (ctx) => { await ctx.answerCallbackQuery(); const p = profile(ctx); const state = p.reminderEnabled ? `روشن است: هر روز ساعت ${p.reminderTime} (${p.timezone})` : "خاموش است."; await ctx.editMessageText(`یادآوری روزانه ${state}\n\nبرای تنظیم، ساعت محلی‌ات را وارد کن.`, { reply_markup: keyboard() }); });
composer.callbackQuery("rem:set", async (ctx) => { await ctx.answerCallbackQuery(); ctx.session.step = "reminder_time"; await ctx.editMessageText("ساعت محلی را به شکل 07:30 بفرست.", { reply_markup: inlineKeyboard([[inlineButton("لغو", "menu:reminders")]]) }); });
composer.callbackQuery("rem:off", async (ctx) => { await ctx.answerCallbackQuery(); const p = profile(ctx); p.reminderEnabled = false; p.reminderTime = undefined; await ctx.editMessageText("یادآوری روزانه خاموش شد. هر وقت خواستی دوباره تنظیمش کن.", { reply_markup: keyboard() }); });
composer.on("message:text", async (ctx, next) => { if (ctx.session.step === "reminder_time") { const value = ctx.message.text.trim(); if (!validTime(value)) { await ctx.reply("این ساعت درست نیست. مثل 07:30 بفرست."); return; } ctx.session.draftTime = value; ctx.session.step = "reminder_timezone"; await ctx.reply("حالا منطقهٔ زمانی‌ات را بفرست؛ مثل Asia/Tehran یا +03:30."); return; } if (ctx.session.step === "reminder_timezone") { const zone = ctx.message.text.trim(); if (!validTimezone(zone)) { await ctx.reply("این منطقهٔ زمانی شناخته نشد. مثل Asia/Tehran یا +03:30 بفرست."); return; } const p = profile(ctx); p.timezone = zone; p.reminderTime = ctx.session.draftTime; p.reminderEnabled = true; ctx.session.step = undefined; ctx.session.draftTime = undefined; await ctx.reply(`یادآوری هر روز ساعت ${p.reminderTime} به وقت ${zone} روشن شد. از همین‌جا می‌توانی خاموشش کنی.`, { reply_markup: keyboard() }); return; } return next(); });
export default composer;
