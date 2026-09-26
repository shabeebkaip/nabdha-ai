// Deterministic per-dataset scenario derivation — what actually makes
// "upload your data, AI analyzes it" true.
//
// Priority order:
// 1. Real parsed metrics (src/lib/dataset-parse.ts computed these from the
//    file's actual content, client-side — CSV/Excel). When present, KPIs
//    come directly from the real data; only the 3 factors a flat sales
//    export can't show (inventory/finance/operations) are estimated.
// 2. No real metrics (PDF, unsupported file, or parsing found no usable
//    columns) — filename keywords + a stable hash of the filename pick a
//    tone and jitter around it. Every non-demo file gets ITS OWN numbers
//    here, including the "no keyword match" bucket — that used to pin to
//    the exact demo profile, which is why every plain-named upload showed
//    the same 78/100 as the seeded demo (the bug this file exists to fix).
// 3. No fileName at all = the seeded "Nabda Retail Demo" dataset — pinned
//    exactly to the client §33 / AC2 numbers, never perturbed.
//
// No Math.random anywhere: hash-based jitter is deterministic, so the same
// file always reproduces the same scenario.

import { DEMO_HEALTH_FACTORS, DEMO_INSIGHTS, DEMO_KPIS } from "@/lib/demo-data";
import type { Locale } from "@/lib/i18n";
import type { DashboardKpis, Forecast, HealthFactorKey, Insight } from "./types";

const ltr = (n: number) => n.toLocaleString("en-US"); // Arabic prose still cites Latin/LTR digits

export type ScenarioTone = "weak" | "steady" | "strong";

export interface Scenario {
  tone: ScenarioTone;
  kpis: DashboardKpis;
  factors: Record<HealthFactorKey, number>;
  forecast: Forecast; // canned narrative in the requested locale — fallback.ts uses it as-is; live.ts only reuses kpis and lets Claude write expectedDemand/potentialRisk itself.
  insights: Omit<Insight, "id">[]; // fallback.ts's tone-shaped insight set
}

const WEAK_RE = /declin|loss|drop|risk|weak|churn|down|slow/i;
const STRONG_RE = /health|growth|strong|profit|scal|win|surge|up/i;

const HEALTH_FACTOR_KEYS: readonly HealthFactorKey[] = [
  "revenue",
  "customers",
  "inventory",
  "finance",
  "operations",
  "growth",
];

// Stable djb2 string hash -> uint32. Deterministic, no Math.random.
function hash(input: string): number {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = (h * 33) ^ input.charCodeAt(i);
  return h >>> 0;
}

// Deterministic -1..1 jitter for a given (seed, key) pair.
function jitter(seed: number, key: string): number {
  const h = hash(`${seed}:${key}`);
  return ((h % 1000) / 1000) * 2 - 1; // -1..1
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

const TONE_CENTER: Record<ScenarioTone, number> = { weak: 54, steady: 78, strong: 88 };
const TONE_SPREAD: Record<ScenarioTone, number> = { weak: 6, steady: 5, strong: 4 };

function factorsForTone(tone: ScenarioTone, seed: number): Record<HealthFactorKey, number> {
  const center = TONE_CENTER[tone];
  const spread = TONE_SPREAD[tone];
  const factors = {} as Record<HealthFactorKey, number>;
  for (const key of HEALTH_FACTOR_KEYS) {
    factors[key] = clamp(Math.round(center + jitter(seed, key) * spread), 0, 100);
  }
  return factors;
}

function toneFromGrowthPct(pct: number): ScenarioTone {
  if (pct <= -2) return "weak";
  if (pct >= 8) return "strong";
  return "steady";
}

// Bands a growth-like percentage into a 0-100 factor score. Used both for
// the revenue/growth factors when we have real growth data, and to keep
// the synthetic-scenario factor centers consistent with the same curve.
function bandFromGrowthPct(pct: number): number {
  return clamp(Math.round(70 + pct * 1.1), 20, 98);
}

function kpisForTone(tone: ScenarioTone, seed: number): DashboardKpis {
  const table: Record<ScenarioTone, DashboardKpis> = {
    weak: {
      revenue: Math.round(780_000 + jitter(seed, "revenue") * 90_000),
      revenueGrowthPct: Math.round((-4.5 + jitter(seed, "growth") * 3.5) * 10) / 10,
      customers: Math.round(820 + jitter(seed, "customers") * 120),
      avgOrderValue: Math.round(780 + jitter(seed, "aov") * 80),
      retentionPct: Math.round(47 + jitter(seed, "retention") * 7),
    },
    steady: {
      revenue: Math.round(1_240_000 + jitter(seed, "revenue") * 150_000),
      revenueGrowthPct: Math.round((10 + jitter(seed, "growth") * 5) * 10) / 10,
      customers: Math.round(1180 + jitter(seed, "customers") * 200),
      avgOrderValue: Math.round(1050 + jitter(seed, "aov") * 120),
      retentionPct: Math.round(62 + jitter(seed, "retention") * 8),
    },
    strong: {
      revenue: Math.round(1_850_000 + jitter(seed, "revenue") * 220_000),
      revenueGrowthPct: Math.round((25 + jitter(seed, "growth") * 7) * 10) / 10,
      customers: Math.round(1750 + jitter(seed, "customers") * 250),
      avgOrderValue: Math.round(1200 + jitter(seed, "aov") * 100),
      retentionPct: Math.round(81 + jitter(seed, "retention") * 7),
    },
  };
  return table[tone];
}

function forecastForTone(tone: ScenarioTone, kpis: DashboardKpis, locale: Locale): Forecast {
  const expectedRevenue = Math.round(kpis.revenue * (1 + kpis.revenueGrowthPct / 100));
  const copyEn: Record<ScenarioTone, { expectedDemand: string; potentialRisk: string }> = {
    weak: {
      expectedDemand: "Demand is trending down across most categories, with no signal of a near-term reversal.",
      potentialRisk: "If the revenue decline and customer attrition continue unchecked, cash flow pressure will intensify next quarter.",
    },
    steady: {
      expectedDemand: "Demand is expected to keep rising in the top product categories while low-performing SKUs continue to drag on inventory turnover.",
      potentialRisk: "If inventory concentration in low-performing products isn't corrected, working capital gets tied up and margin erodes next quarter.",
    },
    strong: {
      expectedDemand: "Demand is accelerating across top categories, outpacing current fulfillment capacity.",
      potentialRisk: "The main risk to this growth is scaling operations and inventory fast enough to avoid stockouts.",
    },
  };
  // ponytail: deterministic canned copy, not an LLM call — the fallback
  // engine has no model to ask, so this is static Arabic prose (safety net
  // per coordinator: fallback must never show English in an Arabic
  // dashboard), mirroring the English copy above 1:1.
  const copyAr: Record<ScenarioTone, { expectedDemand: string; potentialRisk: string }> = {
    weak: {
      expectedDemand: "من المتوقع استمرار تراجع الطلب في معظم الفئات، دون أي مؤشر على تعافٍ قريب.",
      potentialRisk: "إذا استمر تراجع الإيرادات وفقدان العملاء دون معالجة، ستزداد ضغوط السيولة النقدية خلال الربع القادم.",
    },
    steady: {
      expectedDemand: "من المتوقع استمرار ارتفاع الطلب في أفضل فئات المنتجات، بينما تستمر المنتجات ضعيفة الأداء في إبطاء دوران المخزون.",
      potentialRisk: "إذا لم تتم معالجة تركز المخزون في المنتجات ضعيفة الأداء، سيبقى رأس المال العامل مجمّداً ويتآكل الهامش الربحي في الربع القادم.",
    },
    strong: {
      expectedDemand: "الطلب يتسارع في أفضل الفئات بوتيرة تفوق الطاقة التشغيلية الحالية للتنفيذ.",
      potentialRisk: "الخطر الرئيسي على هذا النمو هو مدى القدرة على توسيع العمليات والمخزون بالسرعة الكافية لتفادي نفاد المنتجات.",
    },
  };
  return { expectedRevenue, ...(locale === "ar" ? copyAr[tone] : copyEn[tone]) };
}

// Static Arabic mirror of demo-data.ts's DEMO_INSIGHTS/DEMO_FORECAST, used
// only by the fallback engine's "steady" tone when locale is Arabic.
// demo-data.ts itself stays English-only (it's also the DB seed source of
// truth for the demo company — seeded once, not re-rendered per request).
const STEADY_INSIGHTS_AR: Omit<Insight, "id">[] = [
  {
    kind: "risk",
    severity: "high",
    title: "تركّز المخزون في منتجات ضعيفة الأداء",
    whatHappened: "تستحوذ مجموعة صغيرة من المنتجات على حصة غير متناسبة من قيمة المخزون المتوفر.",
    why: "لم يتم تعديل كميات إعادة الطلب بعد تحوّل الطلب نحو خطوط منتجات أحدث.",
    businessImpact: "رأس المال محتجز في مخزون بطيء الحركة، ما يقلل السيولة المتاحة للفئات ذات الطلب المرتفع.",
    recommendedAction: "إعادة توزيع ميزانية المخزون نحو الفئات الأعلى أداءً وتخفيض أسعار المخزون الراكد.",
    factorTag: "inventory",
  },
  {
    kind: "risk",
    severity: "medium",
    title: "تراجع المبيعات في فئة المنتجات A",
    whatHappened: "تراجعت إيرادات الفئة A خلال الأشهر الثلاثة الماضية مقارنة بالربع السابق.",
    why: "تزامن هذا التراجع مع زيادة التخفيضات السعرية من المنافسين في نفس الفئة.",
    businessImpact: "استمرار التراجع قد يؤدي إلى فقدان 4-6% من الإيرادات الشهرية إذا لم تتم معالجته.",
    recommendedAction: "إطلاق عرض ترويجي مستهدف للفئة A ومراجعة الأسعار مقارنة بالمنافسين.",
    factorTag: "revenue",
  },
  {
    kind: "risk",
    severity: "medium",
    title: "مخاطر التركز في عدد محدود من العملاء",
    whatHappened: "تأتي حصة كبيرة من الإيرادات من عدد محدود من العملاء المتكررين.",
    why: "اعتمد النمو على الاحتفاظ بالعملاء الحاليين ذوي القيمة العالية أكثر من اكتساب عملاء جدد.",
    businessImpact: "فقدان عدد قليل من كبار العملاء سيؤثر بشكل جوهري على الإيرادات الشهرية.",
    recommendedAction: "تنويع قنوات اكتساب العملاء وإطلاق برنامج ولاء لتوسيع قاعدة العملاء.",
    factorTag: "customers",
  },
  {
    kind: "opportunity",
    severity: "high",
    title: "ارتفاع تكرار الشراء لدى العملاء ذوي القيمة العالية",
    whatHappened: "زادت شريحة العملاء الأعلى قيمة من تكرار طلباتها خلال الشهرين الماضيين.",
    why: "لاقت باقة منتجات جديدة صدى قوياً لدى هذه الشريحة.",
    businessImpact: "يمكن للعروض المستهدفة لهذه الشريحة أن ترفع الإيرادات الشهرية بتكلفة اكتساب منخفضة.",
    recommendedAction: "إطلاق عروض مخصصة وأولوية وصول مبكر لشريحة العملاء ذوي القيمة العالية.",
    factorTag: "customers",
  },
  {
    kind: "opportunity",
    severity: "medium",
    title: "فئة منتجات قابلة للتوسع (الفئة B)",
    whatHappened: "تتفوق الفئة B على التوقعات مع وجود مجال للتوسع.",
    why: "التسويق الشفهي والمشتريات المتكررة يقودان طلباً عضوياً يفوق الإنفاق التسويقي الحالي.",
    businessImpact: "زيادة الاستثمار في الفئة B يمكن أن يضاعف أثر النمو العضوي القائم.",
    recommendedAction: "زيادة تخصيص المخزون والإنفاق التسويقي للفئة B.",
    factorTag: "growth",
  },
  {
    kind: "opportunity",
    severity: "medium",
    title: "طلب إقليمي غير مستغل",
    whatHappened: "تتفاوت كثافة الطلبات بين الفروع/المناطق، مع وجود مناطق أقل خدمة.",
    why: "تركّز التسويق وتخصيص المخزون تاريخياً على الفرع الأعلى حجم مبيعات.",
    businessImpact: "التوسع في المناطق الأقل خدمة يمثل مساراً منخفض المخاطر لإيرادات إضافية.",
    recommendedAction: "تجربة عرض ترويجي إقليمي في الفرع الأقل خدمة صاحب أقوى إشارة طلب.",
    factorTag: "operations",
  },
  {
    kind: "recommendation",
    severity: "high",
    title: "إعادة توزيع المخزون واستهداف العملاء ذوي القيمة العالية",
    whatHappened: "الجمع بين نتائج المخزون وتكرار الشراء يشير إلى إجراء واحد ذي أولوية.",
    why: "تحرير رأس المال من المخزون بطيء الحركة وإعادة استثماره في الشريحة التي تشتري أكثر بالفعل يضاعف الأثر.",
    businessImpact: "يُقدَّر أن يحسّن ذلك الهامش الربحي ونمو الإيرادات في آنٍ واحد خلال ربع واحد.",
    recommendedAction: "إعادة توزيع المخزون نحو الفئات الأعلى أداءً مع تقليل التعرض للمخزون الراكد، وإطلاق عروض مخصصة لشريحة العملاء ذوي القيمة العالية.",
    factorTag: "operations",
  },
  {
    kind: "trend",
    severity: "low",
    title: "اتجاه الإيرادات تصاعدي",
    whatHappened: "نمت الإيرادات الشهرية لأربعة أشهر متتالية.",
    why: "طلب مستدام في الفئات الأعلى أداءً مقترناً بحجم طلبات مستقر من العملاء المتكررين.",
    businessImpact: "يؤكد أن مسار النمو الحالي مستدام وليس ارتفاعاً لمرة واحدة.",
    recommendedAction: "الحفاظ على مستوى الإنفاق التسويقي الحالي ومتابعة مزيج الفئات شهرياً.",
    factorTag: "revenue",
  },
];

function insightsForTone(
  tone: ScenarioTone,
  kpis: DashboardKpis,
  factors: Record<HealthFactorKey, number>,
  locale: Locale
): Omit<Insight, "id">[] {
  if (tone === "steady") return locale === "ar" ? STEADY_INSIGHTS_AR : DEMO_INSIGHTS;
  const rev = ltr(kpis.revenue);

  if (locale === "ar") {
    if (tone === "weak") {
      return [
        {
          kind: "risk",
          severity: "high",
          title: "تراجع الإيرادات من فترة لأخرى",
          whatHappened: `تراجعت الإيرادات إلى ${rev} ريال سعودي، بتغيّر قدره ${kpis.revenueGrowthPct}% مقارنة بالفترة السابقة.`,
          why: "ضعف الطلب في معظم الفئات دون استجابة مقابلة في التسعير أو العروض الترويجية.",
          businessImpact: "استمرار التراجع يؤدي إلى تآكل الهامش الربحي وتقليص السيولة المتاحة لاستثمارات التعافي.",
          recommendedAction: "إجراء تشخيص لأكثر 3 فئات تراجعاً وإطلاق حملة ترويجية مستهدفة لاستعادة العملاء هذا الشهر.",
          factorTag: "revenue",
        },
        {
          kind: "risk",
          severity: "high",
          title: "معدل الاحتفاظ بالعملاء منخفض بشكل حرج",
          whatHappened: `معدل الاحتفاظ بالعملاء ${kpis.retentionPct}%، وهو أقل بكثير من المعدل الصحي للمنشآت الصغيرة والمتوسطة.`,
          why: "لم تواكب برامج الشراء المتكرر والولاء معدل فقدان العملاء.",
          businessImpact: "انخفاض معدل الاحتفاظ يفرض تكلفة اكتساب عملاء جدد مرتفعة لمجرد الحفاظ على مستوى الإيرادات.",
          recommendedAction: "إطلاق حملة لإعادة التفاعل مع العملاء غير النشطين خلال 30 يوماً.",
          factorTag: "customers",
        },
        {
          kind: "risk",
          severity: "medium",
          title: "ضعف مؤشر صحة المخزون",
          whatHappened: `سجّل مؤشر صحة المخزون ${factors.inventory}/100، وهو من أضعف المؤشرات إلى جانب الإيرادات.`,
          why: "مستويات المخزون غير متوافقة مع الطلب الحالي (المنخفض)، ما يجمّد رأس المال العامل.",
          businessImpact: "زيادة المخزون بطيء الحركة تقلل السيولة في وقت تكون فيه السيولة مضغوطة بالفعل.",
          recommendedAction: "تصفية المخزون بطيء الحركة وتقليص كميات إعادة الطلب لتتوافق مع الطلب الحالي.",
          factorTag: "inventory",
        },
        {
          kind: "opportunity",
          severity: "low",
          title: "الانضباط في التكاليف يمكن أن يعوّض التراجع",
          whatHappened: "لم تتم إعادة موازنة التكاليف التشغيلية بعد لتتناسب مع قاعدة الإيرادات المنخفضة الحالية.",
          why: "تم تحديد هيكل التكاليف خلال فترة أقوى ولم تتم مراجعته منذ ذلك الحين.",
          businessImpact: "تشديد التكاليف الآن سيعوّض جزئياً فقدان الهامش الربحي الناتج عن تراجع الإيرادات.",
          recommendedAction: "مراجعة الإنفاق غير الأساسي وإعادة التفاوض على شروط الموردين هذا الربع.",
          factorTag: "finance",
        },
        {
          kind: "trend",
          severity: "medium",
          title: "اتجاه تنازلي ممتد عبر عدة فترات",
          whatHappened: `تتراجع الإيرادات ومعدل الاحتفاظ بالعملاء معاً (تغيّر الإيرادات ${kpis.revenueGrowthPct}%، ومعدل الاحتفاظ ${kpis.retentionPct}%).`,
          why: "الأثران متراكمان: انخفاض العملاء المتكررين يقلل الإيرادات، ما يقلل بدوره الاستثمار في الاحتفاظ بالعملاء.",
          businessImpact: "دون تدخل، سيتسارع هذا التراجع المتراكم في الفترة القادمة.",
          recommendedAction: "التعامل مع الاحتفاظ بالعملاء واستعادة الإيرادات كمبادرة واحدة مترابطة، لا كإصلاحين منفصلين.",
          factorTag: "revenue",
        },
        {
          kind: "recommendation",
          severity: "high",
          title: "التثبيت قبل التوسع",
          whatHappened: "تشير عدة مؤشرات ضعيفة (الإيرادات، العملاء، المخزون) إلى سبب جذري واحد: عدم توافق الطلب.",
          why: "معالجة الاحتفاظ بالعملاء والمخزون معاً تستهدف مباشرة التراجع المتراكم.",
          businessImpact: "يُقدَّر أن تؤدي خطة تثبيت مركّزة إلى وقف التراجع خلال ربع إلى ربعين.",
          recommendedAction: "إعطاء الأولوية لحملة استعادة العملاء وترشيد المخزون قبل أي إنفاق جديد على النمو.",
          factorTag: "operations",
        },
      ];
    }
    return [
      {
        kind: "opportunity",
        severity: "high",
        title: "تسارع نمو الإيرادات",
        whatHappened: `بلغت الإيرادات ${rev} ريال سعودي، بارتفاع ${kpis.revenueGrowthPct}% مقارنة بالفترة السابقة.`,
        why: "طلب قوي في أفضل الفئات يتضاعف أثره مع معدل احتفاظ مرتفع بالعملاء.",
        businessImpact: "استمرار هذا المسار يمكن أن يوسّع الحصة السوقية بشكل ملموس خلال العام.",
        recommendedAction: "زيادة الاستثمار في المخزون والتسويق للفئات الأعلى أداءً الآن، بينما الطلب قوي.",
        factorTag: "revenue",
      },
      {
        kind: "opportunity",
        severity: "high",
        title: "معدل الاحتفاظ بالعملاء أصل قوي",
        whatHappened: `معدل الاحتفاظ بالعملاء ${kpis.retentionPct}%، وهو أعلى بكثير من المعدل الصحي للمنشآت الصغيرة والمتوسطة.`,
        why: "برامج الولاء والشراء المتكرر تلقى صدى واضحاً لدى قاعدة العملاء.",
        businessImpact: "ارتفاع معدل الاحتفاظ يخفض تكلفة الاكتساب ويضاعف قيمة كل عميل جديد.",
        recommendedAction: "إطلاق برنامج إحالة لتحويل هذه القاعدة الوفية إلى قناة اكتساب منخفضة التكلفة.",
        factorTag: "customers",
      },
      {
        kind: "opportunity",
        severity: "medium",
        title: "مجال لرفع متوسط قيمة الطلب",
        whatHappened: `متوسط قيمة الطلب ${ltr(kpis.avgOrderValue)} ريال سعودي عبر قاعدة عملاء متنامية.`,
        why: "الشراء المتكرر القوي يتيح مجالاً للتجميع والبيع الإضافي دون التأثير على معدل التحويل.",
        businessImpact: "حتى الارتفاع الطفيف في قيمة الطلب يتضاعف أثره مباشرة مع معدل النمو الحالي.",
        recommendedAction: "تجربة باقات منتجات وحوافز حد أدنى للإنفاق في الفئات الأعلى تفاعلاً.",
        factorTag: "growth",
      },
      {
        kind: "risk",
        severity: "medium",
        title: "قد لا تواكب العمليات وتيرة الطلب",
        whatHappened: `مؤشر صحة العمليات ${factors.operations}/100، متأخراً عن مؤشر النمو.`,
        why: "تم تصميم عمليات التنفيذ والمخزون لحجم طلبات أصغر.",
        businessImpact: "دون معالجة، تهدد هذه الفجوة بنفاد المنتجات وتأخير التسليم بما يقوّض قصة النمو.",
        recommendedAction: "الاستثمار في طاقة التنفيذ وإعادة الطلب المبني على الطلب الفعلي مع استمرار النمو.",
        factorTag: "operations",
      },
      {
        kind: "trend",
        severity: "low",
        title: "النمو واسع النطاق وليس ارتفاعاً في فئة واحدة",
        whatHappened: `نمو الإيرادات بنسبة ${kpis.revenueGrowthPct}% يترافق مع ارتفاع معدل الاحتفاظ (${kpis.retentionPct}%) وقيمة الطلب.`,
        why: "تحرك عدة مؤشرات صعوداً معاً يدل على طلب مستدام وليس أثر عرض ترويجي لمرة واحدة.",
        businessImpact: "يؤكد أن هذا اتجاه يستحق زيادة الاستثمار وراءه، لا مجرد ارتفاع مؤقت.",
        recommendedAction: "متابعة المؤشرات الثلاثة نفسها شهرياً للتأكد من استمرار الاتجاه قبل استثمار كبير في الطاقة التشغيلية.",
        factorTag: "growth",
      },
      {
        kind: "recommendation",
        severity: "high",
        title: "توسيع الاستثمار طالما النافذة مفتوحة",
        whatHappened: "الإيرادات ومعدل الاحتفاظ وقيمة الطلب جميعها قوية في الوقت نفسه.",
        why: "تراكم القوة عبر عدة مؤشرات هو أفضل وقت للاستثمار في الطاقة التشغيلية والاكتساب.",
        businessImpact: "يُقدَّر أن يمدّد ذلك مسار النمو الحالي لربع إلى ربعين إضافيين إذا تم التحرك الآن.",
        recommendedAction: "زيادة الاستثمار التسويقي والمخزون في الفئات الأعلى أداءً، مع زيادة الطاقة التشغيلية بالتوازي.",
        factorTag: "growth",
      },
    ];
  }

  if (tone === "weak") {
    return [
      {
        kind: "risk",
        severity: "high",
        title: "Revenue declining period over period",
        whatHappened: `Revenue fell to SAR ${rev}, a ${kpis.revenueGrowthPct}% change versus the prior period.`,
        why: "Demand has softened across most categories without a corresponding pricing or promotional response.",
        businessImpact: "Continued decline erodes margin and shrinks the cash buffer available for recovery investments.",
        recommendedAction: "Run a diagnostic on the top 3 declining categories and launch a targeted win-back promotion this month.",
        factorTag: "revenue",
      },
      {
        kind: "risk",
        severity: "high",
        title: "Customer retention is critically low",
        whatHappened: `Retention sits at ${kpis.retentionPct}%, well below a healthy SME benchmark.`,
        why: "Repeat-purchase and loyalty mechanics have not kept pace with customer churn.",
        businessImpact: "Low retention forces costly new-customer acquisition just to hold revenue flat.",
        recommendedAction: "Launch a re-engagement campaign targeting lapsed customers within 30 days.",
        factorTag: "customers",
      },
      {
        kind: "risk",
        severity: "medium",
        title: "Inventory health is weak",
        whatHappened: `The inventory health factor scored ${factors.inventory}/100, the lowest area alongside revenue.`,
        why: "Stock levels are misaligned with the current (lower) demand, tying up working capital.",
        businessImpact: "Excess slow-moving stock reduces liquidity right when cash is already under pressure.",
        recommendedAction: "Liquidate slow-moving inventory and tighten reorder quantities to match current demand.",
        factorTag: "inventory",
      },
      {
        kind: "opportunity",
        severity: "low",
        title: "Cost discipline can offset the downturn",
        whatHappened: "Operating costs have not yet been re-scaled to match the lower revenue base.",
        why: "Cost structure was set during a stronger period and hasn't been revisited.",
        businessImpact: "Tightening costs now would partially offset margin loss from declining revenue.",
        recommendedAction: "Review discretionary spend and renegotiate supplier terms this quarter.",
        factorTag: "finance",
      },
      {
        kind: "trend",
        severity: "medium",
        title: "Multi-period downward trend",
        whatHappened: `Revenue and retention are both trending down together (${kpis.revenueGrowthPct}% revenue change, ${kpis.retentionPct}% retention).`,
        why: "The two are compounding: fewer repeat customers reduces revenue, which reduces reinvestment in retention.",
        businessImpact: "Without intervention, this compounding effect accelerates the decline next period.",
        recommendedAction: "Treat retention and revenue recovery as a single combined initiative, not two separate fixes.",
        factorTag: "revenue",
      },
      {
        kind: "recommendation",
        severity: "high",
        title: "Stabilize before scaling",
        whatHappened: "Multiple weak factors (revenue, customers, inventory) point to the same root cause: demand mismatch.",
        why: "Addressing retention and inventory together directly targets the compounding decline.",
        businessImpact: "A focused stabilization plan is estimated to halt the decline within one to two quarters.",
        recommendedAction: "Prioritize a customer win-back campaign and inventory rationalization before any new growth spend.",
        factorTag: "operations",
      },
    ];
  }
  return [
    {
      kind: "opportunity",
      severity: "high",
      title: "Revenue growth is accelerating",
      whatHappened: `Revenue reached SAR ${rev}, up ${kpis.revenueGrowthPct}% versus the prior period.`,
      why: "Strong demand across top categories is compounding with high customer retention.",
      businessImpact: "Sustaining this trajectory could meaningfully expand market share within the year.",
      recommendedAction: "Increase inventory and marketing investment in the best-performing categories now, while demand is strong.",
      factorTag: "revenue",
    },
    {
      kind: "opportunity",
      severity: "high",
      title: "Customer retention is a strong asset",
      whatHappened: `Retention stands at ${kpis.retentionPct}%, well above a healthy SME benchmark.`,
      why: "Loyalty and repeat-purchase mechanics are clearly resonating with the customer base.",
      businessImpact: "High retention lowers acquisition cost and compounds the value of each new customer.",
      recommendedAction: "Introduce a referral program to convert this loyal base into a low-cost acquisition channel.",
      factorTag: "customers",
    },
    {
      kind: "opportunity",
      severity: "medium",
      title: "Room to expand average order value",
      whatHappened: `Average order value is SAR ${ltr(kpis.avgOrderValue)} across a growing customer base.`,
      why: "Strong repeat purchasing gives room for bundling and upsell without hurting conversion.",
      businessImpact: "Even a modest lift in order value compounds directly against the current growth rate.",
      recommendedAction: "Test product bundles and minimum-spend incentives on the highest-traffic categories.",
      factorTag: "growth",
    },
    {
      kind: "risk",
      severity: "medium",
      title: "Operations may not scale as fast as demand",
      whatHappened: `The operations health factor is ${factors.operations}/100, trailing the growth factor.`,
      why: "Fulfillment and inventory processes were sized for a smaller order volume.",
      businessImpact: "Unmanaged, this gap risks stockouts and delivery delays that undercut the growth story.",
      recommendedAction: "Invest in fulfillment capacity and demand-based reordering ahead of continued growth.",
      factorTag: "operations",
    },
    {
      kind: "trend",
      severity: "low",
      title: "Growth is broad-based, not a single-category spike",
      whatHappened: `Revenue growth of ${kpis.revenueGrowthPct}% is paired with rising retention (${kpis.retentionPct}%) and order value.`,
      why: "Multiple factors moving up together indicates durable demand rather than a one-off promotion effect.",
      businessImpact: "Confirms this is a trend worth increasing investment behind, not a temporary spike.",
      recommendedAction: "Track the same three metrics monthly to confirm the trend holds before major capacity investment.",
      factorTag: "growth",
    },
    {
      kind: "recommendation",
      severity: "high",
      title: "Scale investment while the window is open",
      whatHappened: "Revenue, retention, and order value are all strong at the same time.",
      why: "Compounding strength across factors is the best time to invest in capacity and acquisition.",
      businessImpact: "Estimated to extend the current growth trajectory by another 1-2 quarters if acted on now.",
      recommendedAction: "Increase marketing and inventory investment in top categories, and add fulfillment capacity in parallel.",
      factorTag: "growth",
    },
  ];
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

// Real parsed metrics (dataset-parse.ts) take priority over the filename
// heuristic. Only fields the flat sales export can't show (inventory,
// finance, operations) fall back to tone-banded synthetic jitter.
function scenarioFromRealMetrics(
  datasetSummary: Record<string, unknown>,
  fileName: string,
  seed: number,
  locale: Locale
): Scenario {
  const realRevenue = num(datasetSummary.revenue)!; // caller already checked this is > 0
  const orders = num(datasetSummary.orders);
  const realGrowth = num(datasetSummary.revenueGrowthPct);
  const realCustomers = num(datasetSummary.customers);
  const realRetention = num(datasetSummary.retentionPct);
  const realAov = num(datasetSummary.avgOrderValue);

  // Tone drives the 3 non-derivable factors + insight framing. Real growth
  // wins when we have it; otherwise fall back to filename keywords.
  const tone: ScenarioTone =
    realGrowth !== null
      ? toneFromGrowthPct(realGrowth)
      : WEAK_RE.test(fileName)
        ? "weak"
        : STRONG_RE.test(fileName)
          ? "strong"
          : "steady";

  const syntheticKpis = kpisForTone(tone, seed);
  const growthPct = realGrowth ?? syntheticKpis.revenueGrowthPct;
  const kpis: DashboardKpis = {
    revenue: Math.round(realRevenue),
    revenueGrowthPct: growthPct,
    customers: realCustomers ?? syntheticKpis.customers,
    avgOrderValue: realAov ?? (orders ? Math.round(realRevenue / orders) : syntheticKpis.avgOrderValue),
    retentionPct: realRetention ?? syntheticKpis.retentionPct,
  };

  const synthetic = factorsForTone(tone, seed);
  const growthBand = bandFromGrowthPct(growthPct);
  const factors: Record<HealthFactorKey, number> = {
    ...synthetic, // inventory/finance/operations stay tone-banded (no real signal for these)
    revenue: growthBand, // directly from real growth
    growth: clamp(growthBand + 4, 20, 98), // growth factor tracks revenue trend, slightly amplified
    customers: realRetention !== null ? clamp(Math.round(40 + realRetention * 0.6), 20, 97) : synthetic.customers,
  };

  return {
    tone,
    kpis,
    factors,
    forecast: forecastForTone(tone, kpis, locale),
    insights: insightsForTone(tone, kpis, factors, locale),
  };
}

// `locale` only changes the fallback engine's canned prose (see
// forecastForTone/insightsForTone above) — it never affects the numeric
// kpis/factors, and it's a no-op for the live engine (Claude writes its own
// prose in ctx.locale; scenario.ts only supplies live.ts with numbers).
export function deriveScenario(datasetSummary: Record<string, unknown>, locale: Locale = "en"): Scenario {
  const fileName = typeof datasetSummary.fileName === "string" ? datasetSummary.fileName : "";

  // No fileName = the seeded demo dataset (or a no-name manual entry) — stay
  // pinned to the exact client §33 / AC2 numbers, never perturbed (only the
  // prose language changes).
  if (!fileName) {
    return {
      tone: "steady",
      kpis: DEMO_KPIS,
      factors: DEMO_HEALTH_FACTORS,
      forecast: forecastForTone("steady", DEMO_KPIS, locale),
      insights: locale === "ar" ? STEADY_INSIGHTS_AR : DEMO_INSIGHTS,
    };
  }

  const seed = hash(fileName);
  const realRevenue = num(datasetSummary.revenue);
  if (realRevenue !== null && realRevenue > 0) {
    return scenarioFromRealMetrics(datasetSummary, fileName, seed, locale);
  }

  // No usable parsed numbers (PDF, unsupported file, or no revenue-like
  // column found) — filename keywords + hash. Every bucket (including the
  // no-keyword-match one) is jittered per-file; nothing pins to the exact
  // demo numbers here anymore — that was the "every upload looks the same"
  // bug.
  const tone: ScenarioTone = WEAK_RE.test(fileName) ? "weak" : STRONG_RE.test(fileName) ? "strong" : "steady";
  const factors = factorsForTone(tone, seed);
  const kpis = kpisForTone(tone, seed);
  return {
    tone,
    kpis,
    factors,
    forecast: forecastForTone(tone, kpis, locale),
    insights: insightsForTone(tone, kpis, factors, locale),
  };
}

// Self-check lives in scenario.test.ts (npm test) — a `require.main` guard
// here broke dataset-parse.ts (its sibling module) when Turbopack bundled it
// for the browser; keeping the same anti-pattern out of this file too.
