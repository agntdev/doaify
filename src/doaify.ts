import type { Ctx } from "./bot.js";
import { inlineButton, inlineKeyboard } from "./toolkit/index.js";

export type Dua = { id: string; title: string; arabic: string; persian: string; transliteration?: string; explanation?: string; category: string };
export const categories = [
  ["morning", "صبح"], ["evening", "شب"], ["travel", "سفر"], ["healing", "شفا"],
  ["forgiveness", "آمرزش"], ["gratitude", "شکرگزاری"], ["protection", "حفاظت"], ["other", "دیگر"],
] as const;
const seeded: Dua[] = [
  { id: "m1", title: "دعای آغاز روز", arabic: "اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ", persian: "خدایا، امروز تو را گواه می‌گیرم و دلم را به تو می‌سپارم.", transliteration: "Allahumma inni asbahtu ushhiduka", explanation: "یادآوری آرامی برای شروع روز با حضور دل.", category: "morning" },
  { id: "m2", title: "ذکر نور", arabic: "اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُورًا", persian: "خدایا، در دلم نور قرار بده.", transliteration: "Allahummaj'al fi qalbi nura", explanation: "دعایی کوتاه برای روشن‌شدن دل.", category: "morning" },
  { id: "e1", title: "آرامش شب", arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", persian: "به نام تو، خدایا، می‌خوابم و بیدار می‌شوم.", transliteration: "Bismikallahumma amutu wa ahya", explanation: "ذکری برای سپردن شب به خدا.", category: "evening" },
  { id: "t1", title: "دعای سفر", arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا", persian: "پاک است آن‌که این راه را برای ما رام کرد.", transliteration: "Subhanalladhi sakhkhara lana hadha", explanation: "برای آغاز سفری امن و آرام.", category: "travel" },
  { id: "h1", title: "دعای شفا", arabic: "اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ", persian: "خدایا، رنج را دور کن و شفا عطا کن.", transliteration: "Allahumma rabban-nas adhhibil-ba's", explanation: "دعایی برای امید و بهبود.", category: "healing" },
  { id: "f1", title: "آمرزش", arabic: "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ", persian: "پروردگارا، مرا ببخش و توبه‌ام را بپذیر.", transliteration: "Rabbighfir li wa tub alayya", explanation: "جمله‌ای ساده برای بازگشت به مهربانی خدا.", category: "forgiveness" },
  { id: "g1", title: "سپاس", arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", persian: "ستایش برای خدا، پروردگار جهانیان است.", transliteration: "Alhamdu lillahi rabbil alamin", explanation: "تمرینی کوتاه برای دیدن نعمت‌ها.", category: "gratitude" },
  { id: "p1", title: "پناه", arabic: "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ", persian: "خدا برایم کافی است؛ جز او معبودی نیست.", transliteration: "Hasbiyallahu la ilaha illa huwa", explanation: "برای وقت‌هایی که به پناه و قوت نیاز داری.", category: "protection" },
  { id: "o1", title: "خیر دنیا و آخرت", arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً", persian: "پروردگارا، در دنیا و آخرت به ما نیکی عطا کن.", transliteration: "Rabbana atina fid-dunya hasanah", explanation: "دعایی جامع و کوتاه.", category: "other" },
];

export const now = (): Date => new Date();
export function catalog(ctx: Ctx): Dua[] { return ctx.session.catalogue ?? seeded; }
export function profile(ctx: Ctx) { return (ctx.session.profile ??= { reminderEnabled: false }); }
export function favorites(ctx: Ctx) { return (ctx.session.favorites ??= []); }
export function find(ctx: Ctx, id: string) { return catalog(ctx).find((d) => d.id === id); }
export function today(ctx: Ctx) { const day = Math.floor(now().getTime() / 86_400_000); return catalog(ctx)[day % catalog(ctx).length]; }
export function random(ctx: Ctx) { const list = catalog(ctx); const bytes = new Uint32Array(1); crypto.getRandomValues(bytes); return list[bytes[0] % list.length]; }
export function duaText(d: Dua) { return `«${d.title}»\n\n${d.arabic}\n\n${d.persian}${d.transliteration ? `\n\nخوانش: ${d.transliteration}` : ""}${d.explanation ? `\n\n${d.explanation}` : ""}`; }
export function duaKeyboard(ctx: Ctx, d: Dua) {
  const saved = favorites(ctx).includes(d.id);
  return inlineKeyboard([
    [inlineButton(saved ? "حذف از علاقه‌ها" : "ذخیره در علاقه‌ها", `dua:${saved ? "remove" : "save"}:${d.id}`)],
    [inlineButton("بیشتر از این دسته", `cat:${d.category}:0`), inlineButton("اشتراک‌گذاری", `dua:share:${d.id}`)],
    [inlineButton("بازگشت به منو", "menu:main")],
  ]);
}
export async function sendDua(ctx: Ctx, d: Dua, edit = false) { const extra = { reply_markup: duaKeyboard(ctx, d) }; if (edit && ctx.callbackQuery?.message) await ctx.editMessageText(duaText(d), extra); else await ctx.reply(duaText(d), extra); }
export function validTimezone(value: string) { try { Intl.DateTimeFormat("en", { timeZone: value }); return true; } catch { return /^[-+](0\d|1[0-4]):[0-5]\d$/.test(value); } }
export function validTime(value: string) { return /^([01]\d|2[0-3]):[0-5]\d$/.test(value); }
export function back() { return inlineKeyboard([[inlineButton("بازگشت به منو", "menu:main")]]); }
