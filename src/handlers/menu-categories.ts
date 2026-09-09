import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard, registerMainMenuItem } from "../toolkit/index.js";
import { catalog, categories, sendDua } from "../doaify.js";

registerMainMenuItem({ label: "دسته‌ها", data: "menu:categories", order: 30 });
const composer = new Composer<Ctx>();
function categoryMenu() { return inlineKeyboard([...categories.map(([id, label]) => [inlineButton(label, `cat:${id}:0`)]), [inlineButton("بازگشت به منو", "menu:main")]]); }
async function showCategory(ctx: Ctx, id: string, page: number) {
  const entries = catalog(ctx).filter((d) => d.category === id);
  const start = Math.max(0, page) * 4;
  const portion = entries.slice(start, start + 4);
  const label = categories.find(([key]) => key === id)?.[1] ?? "دعاها";
  const rows = portion.map((d) => [inlineButton(`خواندن: ${d.title}`, `view:${d.id}`)]);
  const nav = [];
  if (start > 0) nav.push(inlineButton("قبلی", `cat:${id}:${page - 1}`));
  if (start + 4 < entries.length) nav.push(inlineButton("بعدی", `cat:${id}:${page + 1}`));
  if (nav.length) rows.push(nav);
  rows.push([inlineButton("همهٔ دسته‌ها", "menu:categories")]);
  await ctx.editMessageText(`دعاهای ${label} را انتخاب کن.`, { reply_markup: inlineKeyboard(rows) });
}
composer.callbackQuery("menu:categories", async (ctx) => { await ctx.answerCallbackQuery(); await ctx.editMessageText("دسته‌ای را برای خواندن دعا انتخاب کن.", { reply_markup: categoryMenu() }); });
composer.callbackQuery(/^cat:([^:]+):(\d+)$/, async (ctx) => { await ctx.answerCallbackQuery(); const m = ctx.match; await showCategory(ctx, m[1], Number(m[2])); });
composer.callbackQuery(/^view:(.+)$/, async (ctx) => { await ctx.answerCallbackQuery(); const dua = catalog(ctx).find((d) => d.id === ctx.match[1]); if (dua) await sendDua(ctx, dua, true); else await ctx.reply("این دعا دیگر در دسترس نیست؛ یک دستهٔ دیگر را انتخاب کن."); });
export default composer;
