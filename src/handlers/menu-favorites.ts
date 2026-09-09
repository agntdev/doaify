import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard, registerMainMenuItem } from "../toolkit/index.js";
import { catalog, favorites, find } from "../doaify.js";
registerMainMenuItem({ label: "مورد علاقه‌ها", data: "menu:favorites", order: 40 });
const composer = new Composer<Ctx>();
composer.callbackQuery("menu:favorites", async (ctx) => { await ctx.answerCallbackQuery(); const ids = favorites(ctx); const items = catalog(ctx).filter((d) => ids.includes(d.id)); if (!items.length) { await ctx.editMessageText("هنوز دعایی ذخیره نکرده‌ای — هنگام خواندن، «ذخیره در علاقه‌ها» را بزن.", { reply_markup: inlineKeyboard([[inlineButton("دعای امروز", "menu:today")], [inlineButton("بازگشت به منو", "menu:main")]]) }); return; } await ctx.editMessageText("دعاهای مورد علاقه‌ات:", { reply_markup: inlineKeyboard([...items.map((d) => [inlineButton(d.title, `view:${d.id}`)]), [inlineButton("بازگشت به منو", "menu:main")]]) }); });
composer.callbackQuery(/^dua:(save|remove|share):(.+)$/, async (ctx) => { const [, action, id] = ctx.match; const item = find(ctx, id); if (!item) { await ctx.answerCallbackQuery({ text: "این دعا دیگر در دسترس نیست." }); return; } if (action === "share") { await ctx.answerCallbackQuery({ text: "برای فرستادن دعا، پیام را نگه دار و Forward را بزن." }); return; } const list = favorites(ctx); const at = list.indexOf(id); if (action === "save") { if (at < 0) list.push(id); await ctx.answerCallbackQuery({ text: at < 0 ? "به علاقه‌ها اضافه شد." : "این دعا از قبل ذخیره شده است." }); } else { if (at >= 0) list.splice(at, 1); await ctx.answerCallbackQuery({ text: at >= 0 ? "از علاقه‌ها برداشته شد." : "این دعا در علاقه‌ها نبود." }); } });
export default composer;
