# NABDA AI — Client Requirements (VERBATIM)

> Source of truth. Every word as shared by the client on 2026-09-26.
> Client shared FOUR documents, reproduced below verbatim:
>   Doc A — MVP Product, Platform, Pricing & Revenue Specification (Investor Demo & IT Development Brief)
>   Doc B — MVP Product & Design Prompt (bilingual AR/EN)
>   Doc C — Investor Pitch Deck (10 slides)
>   Doc D — Pricing summary (monthly + annual)
>
> ⚠️ KNOWN CONFLICTS (flagged by client and by us) collected in `PRICING_CONFLICTS.md`. Do NOT hard-code prices — admin-configurable (see Doc A §52).

---

# DOC A — MVP PRODUCT, PLATFORM, PRICING & REVENUE SPECIFICATION
## Investor Demo & IT Development Brief

## 1. PRODUCT OVERVIEW

Nabda AI is an AI-powered business intelligence and decision-support platform designed to help organizations transform their business data into:

- Business insights
- Risk detection
- Opportunity identification
- Performance analysis
- Forecasts
- AI-generated recommendations
- Management reports
- Presentation-ready outputs
- Strategic decision support

### Strategic Positioning

Nabda AI is designed for businesses and organizations of different sizes, from SMEs to larger enterprises.

The MVP will initially focus on SMEs as the beachhead market, allowing Nabda AI to validate product-market fit with a focused and manageable scope.

The underlying architecture should remain scalable toward:

- SMEs
- Growing companies
- Corporations
- Enterprise organizations
- Multi-branch organizations
- Organizations requiring customized integrations

## 2. CORE PROBLEM

Many businesses have data but do not convert that data into timely decisions.

Typical problems include:

- Data scattered across different systems
- Lack of centralized visibility
- Manual reporting
- Slow analysis
- Difficulty identifying risks early
- Missed opportunities
- Lack of predictive insights
- Management decisions based on incomplete information
- Time-consuming preparation of reports and presentations
- Lack of internal data/AI expertise

Nabda AI aims to create a simple workflow:

DATA → AI ANALYSIS → INSIGHTS → RECOMMENDATIONS → ACTION

## 3. MVP CORE VALUE PROPOSITION

The user should be able to enter the platform and understand the value within minutes.

### Core experience

1. Create account
2. Start free trial
3. Connect/upload business data
4. Select analysis
5. AI processes the data
6. Dashboard displays insights
7. User receives: Risks / Opportunities / Trends / Recommendations
8. User can generate a detailed report
9. User can purchase/generate a presentation separately
10. User can request consultation, training, integration or custom services

## 4. MVP USER JOURNEY

### Step 1 — Landing Page
Main CTA: **Start Free Trial**
Secondary CTAs: Explore Platform / View Plans / Book Consultation / Request Enterprise Solution

## 5. FREE TRIAL

The free trial should demonstrate the product without giving away the full commercial value.

### Free Trial Example — the user receives:
- Limited data upload
- Limited analysis
- Initial AI diagnostic
- 3 Risks
- 3 Opportunities
- Basic recommendations
- Preview dashboard

Objective: Show value → create curiosity → convert to paid plan.
The free trial should NOT expose the entire advanced reporting system.

## 6. ONBOARDING

After registration:

### Company Information
- Company name
- Industry
- Company size
- Number of employees
- Number of branches
- Country
- Business model
- Main business objective

### Data Sources (possible)
Excel, CSV, Manual data entry, API, Accounting systems, CRM, ERP, POS, Inventory systems, Payment systems, Customer systems, Delivery systems.

MVP should initially prioritize simple upload/connect workflows.

## 7. MAIN DASHBOARD

Should contain:

### Executive Overview — Business Health Score

Sections:

**Performance:** Revenue, Sales, Expenses, Profit, Growth, Customer activity

**Risks** — Example: High Risk — Declining sales in Product Category A.

**Opportunities** — Example: Growth Opportunity — Customer segment B shows increasing purchase frequency.

**AI Recommendations** — Example: «Increase inventory allocation for Product B while reducing stock exposure in Product C.»

**Trends:** Revenue trend, Customer trend, Product trend, Expense trend

**Forecast:** Expected revenue, Expected demand, Potential risk

## 8. NABDA AI INSIGHT ENGINE

The core AI engine transforms raw business data into:

1. Descriptive Analytics — What happened?
2. Diagnostic Analytics — Why did it happen?
3. Predictive Analytics — What is likely to happen?
4. Prescriptive Analytics — What should the business do?

This is the main intelligence layer of Nabda AI.

## 9. AI REPORTS

Reports are one of the main monetization engines.

### Standard AI Report — example sections:
1. Executive Summary
2. Business Performance
3. Revenue Analysis
4. Customer Analysis
5. Product/Service Analysis
6. Risk Analysis
7. Opportunity Analysis
8. Trend Analysis
9. Forecast
10. AI Recommendations
11. Priority Actions

## 10. REPORT OUTPUT

The user should be able to: View report online / Download PDF / Save report / Compare reports / Share report / Generate presentation from analysis.

## 11. AI PRESENTATION GENERATION

**Important: Presentation Generation is a separate paid service.** It should NOT be treated as automatically included in Digital Products.

User can take an AI report and request "Generate Presentation". System creates a management-ready presentation containing: Executive summary, Key findings, Charts, Risks, Opportunities, Recommendations, Strategic actions.

Possible formats: Executive Presentation / Management Review / Investor Presentation / Monthly Business Review.

## 12. SUBSCRIPTION PLANS

MVP should show three main subscription plans.

### BASIC
- Price: **99 SAR / month**
- Customer: Small businesses beginning their AI/data journey
- Monthly allowance: **50 reports / analysis credits**
- Features: Business dashboard, Basic AI analysis, Risk detection, Opportunity detection, Recommendations, Standard reports, Basic data upload, Basic dashboard, Limited data sources, Free trial

## 13. GROWTH
- Price: **199 SAR / month**
- Customer: Growing SMEs with more data and more frequent analysis
- Monthly allowance: **120 reports / analysis credits**
- Features: Everything in Basic + Advanced analytics, More data sources, More detailed reports, Advanced recommendations, Trend analysis, Forecasting, Comparative analysis, More dashboard functionality, Higher usage limits

## 14. PRO
- Price: **399 SAR / month**
- Customer: Established SMEs and professional organizations requiring higher usage and deeper analytics
- Monthly allowance: **250 reports / analysis credits**
- Features: Everything in Growth + Advanced AI analytics, Higher data volume, Advanced forecasting, Advanced business insights, More detailed reporting, Management-level analytics, Advanced recommendations, Priority processing, Higher usage limits

## 15. CREDIT SYSTEM

The platform should use an internal AI Credit System. Credits represent AI processing/usage rather than simply acting as currency.

Display: **Credits Remaining** — Example: «184 / 250 Credits Remaining».

User should see: Credits used, Credits remaining, Usage history, Cost/credit consumption, Next reset date.

## 16. CREDIT TYPES

For MVP, distinguish between:
- **Standard Analysis** — fewer credits
- **Advanced Analysis** — more credits
- **Comprehensive Report** — more credits
- **AI Presentation** — separate credit allocation or paid transaction
- **Advanced AI Modeling** — additional credits depending on complexity

## 17. CREDIT CONSUMPTION LOGIC

Example internal model:
- Standard Business Analysis — 1 standard workload
- Detailed Report — Higher workload
- Advanced Report — Higher workload
- AI Presentation — Separate paid service
- Custom AI Modeling — Project-based calculation

The IT team should build the credit engine so that the exact LLM/model cost can be changed without changing the customer-facing pricing.

## 18. AI MODEL ROUTING

Nabda AI should NOT depend on one AI model. Architecture should support model routing across providers such as: OpenAI, Claude, Gemini, Other compatible AI models.

Platform chooses model according to: Task, Complexity, Cost, Output requirements, Availability, Performance.

Customer experiences this as **Nabda AI Intelligence Engine** rather than needing to understand which model is used.

## 19. AI MODELING / ADVANCED SERVICES

Separate area: **AI Solutions** — three service levels.

**Package 1 — AI Analysis:** Data analysis, Business insights, Risk detection, Opportunity identification, Recommendations, Advanced report.

**Package 2 — AI Forecasting:** everything in Package 1 + Forecasting, Trend prediction, Demand analysis, Scenario analysis, Predictive insights.

**Package 3 — Custom AI Modeling:** Custom data architecture, Custom AI workflow, Advanced modeling, Custom dashboards, Custom reports, Business-specific logic, Integration requirements.

Pricing for these three packages configured in admin panel, not hard-coded, until final commercial prices approved.

## 20. INTEGRATIONS

Integration is a separate revenue stream. Potential: ERP, CRM, POS, Accounting, Inventory, Payment systems, E-commerce, APIs, Internal databases.

Integration flow — client selects **Request Integration**, enters: System name, Current software, Data source, API availability, Required data, Business objective. Request goes to Nabda AI's technical/business team. Pricing: Custom quotation based on scope, complexity, number of systems and implementation requirements.

## 21. CUSTOM / ENTERPRISE

Dedicated **Enterprise / Custom** section.

Target: Large companies, Corporations, Multi-branch businesses, Organizations with large datasets, Companies requiring custom integrations, Organizations requiring private/custom AI workflows.

Potential components: Custom dashboards, Custom AI models, Custom reports, Custom presentations, Multiple users, Multiple branches, API access, Integrations, Dedicated support, Enterprise analytics.

Pricing: Custom quotation. Enterprise contracts can potentially reach up to **1,000,000 SAR**, depending on implementation scope.

MVP should support a **Request Enterprise Proposal** button.

## 22. CONSULTATION

Separate revenue stream. Current consultation rate: **375 SAR / hour**. Nabda AI platform share: **30% = 112.50 SAR/hour**.

Platform shows **Book Consultation**. Options: Business Analysis, AI Strategy, Data Strategy, Digital Transformation, Business Performance, AI Implementation.

User selects: Topic, Duration, Preferred time, Consultant.

## 23. TRAINING

Another revenue stream. Section: **Training & Academy**.

Categories: AI for Business, Data-Driven Decision Making, AI Adoption, Business Analytics, Leadership & Management, Digital Transformation, AI Tools for Teams.

Formats: Live online, In-person, Corporate training, Workshops, Recorded training.

Corporate training sold as **Request Corporate Training** with custom quotation.

## 24. DIGITAL PRODUCTS

Separate revenue stream. Examples: AI business templates, Business analysis templates, Prompt packs, Strategy toolkits, Worksheets, Business dashboards, AI guides. Displayed separately from Presentation Generation.

## 25. PRESENTATION PRODUCT

Own commercial section: **AI Presentation**.

Presentation Type: Business Review, Executive Summary, Investor Presentation, Sales Presentation, Strategy Presentation, Monthly Performance Review.

User selects: Number of slides, Style, Audience, Objective. Then: **Generate Presentation**.

## 26. SEPARATE PRESENTATION PRICING

Previously modeled net-profit assumptions (internal, not necessarily shown to customer):

**AI Reports — Monthly:** Basic 39 SAR / Growth 109 SAR / Pro 279 SAR net profit.
**AI Reports — Annual:** Basic 351 SAR / Growth 950 SAR / Pro 2,900.91 SAR.

**AI Presentation — Monthly:** Basic 32 SAR / Growth 97 SAR / Pro 256 SAR net profit.
**AI Presentation — Annual:** Basic 266 SAR / Growth 806 SAR / Pro 2,114 SAR.

## 27. ADD-ON CREDITS

Platform has **Buy More Credits**. Example: "You have 12 credits remaining. [Buy Credits]".

Admin configures: Credit bundle, Price, Expiration, Eligible features. Makes platform scalable without forcing every customer into a higher subscription.

## 28. ANNUAL PLANS

Support Monthly subscription + Annual subscription. Annual plans provide a discount relative to monthly billing. Exact final annual customer prices configurable from admin panel.

## 29. ADMIN DASHBOARD

MVP must include an admin panel. Admin should see:

**Users:** Total users, Active users, New users, Paid users, Trial users.
**Revenue:** Monthly revenue, Annual revenue, Subscription revenue, Reports revenue, Presentation revenue, Consultation revenue, Training revenue, Integration revenue, Enterprise revenue, Digital product revenue.
**Usage:** AI credits consumed, Reports generated, Presentations generated, AI model usage, API usage, Data processed.
**Conversion:** Trial → Paid, Basic → Growth, Growth → Pro, Pro → Enterprise, Consultation conversion, Enterprise leads.

## 30. CUSTOMER DASHBOARD

Customer should see:
- **Overview** — Business health
- **Insights** — AI-generated insights
- **Reports** — Previous reports
- **Presentations** — Generated presentations
- **Data** — Connected/uploaded sources
- **Credits** — Credit balance
- **Recommendations** — Recommended actions
- **Services** — Consultation, Training, Integration, Custom AI
- **Billing** — Current plan, Payment, Upgrade, Cancel, Invoice

## 31. NOTIFICATION SYSTEM

Examples: New Insight Available, High Risk Detected, New Opportunity Identified, Report Ready, Presentation Ready, Credits Running Low, Subscription Renewal.

## 32. MVP USER FLOW (investor demo, exact)

01 Landing Page → 02 Start Free Trial → 03 Create Company → 04 Upload Sample Data → 05 AI Analyzes Data → 06 Dashboard Appears → 07 Risks + Opportunities → 08 AI Recommendations → 09 Generate Report → 10 Generate Presentation → 11 Credits Updated → 12 Upgrade Plan → 13 Explore Consultation → 14 Request Integration → 15 Request Custom Enterprise Solution

## 33. SAMPLE DEMO DATA

Fictional SME. Company: **Nabda Retail Demo**. Industry: Retail. Data: Monthly sales, Products, Inventory, Customers, Orders, Expenses, Payments.

Realistic sample insights:
- Revenue: SAR 1,240,000
- Growth: +12.4%
- Risk: Inventory concentration in low-performing products.
- Opportunity: High-value customers increased purchasing frequency.
- AI Recommendation: Reallocate inventory toward higher-performing product categories and create targeted offers for high-value customer segments.

## 34. BUSINESS HEALTH SCORE

Visual score such as **78 / 100**. Breakdown: Revenue Performance, Customer Performance, Inventory, Profitability, Growth, Risk. Primarily a demo visualization; should later be based on a documented scoring methodology.

## 35–38. SWOT ANALYSIS

**Strengths:** 1) AI + Business Intelligence (combines data analysis with actionable recommendations). 2) Decision Support (beyond dashboards toward recommended actions). 3) Multiple Revenue Streams (SaaS, AI reports, AI presentations, Credits, Consultation, Training, Integrations, Custom solutions, Enterprise contracts, Digital products). 4) Scalable Architecture. 5) AI Model Flexibility (model routing reduces single-provider dependence).

**Weaknesses:** New market entrant, Need high-quality business data, AI infrastructure costs, Validate willingness to pay, Need integrations as customers mature, Trust requirements around business data, Continuous AI/model optimization.

**Opportunities:** Rapid AI adoption, SME digital transformation, Corporate AI adoption, AI-powered business analytics, Enterprise integrations, Customized AI solutions, Corporate training, AI consulting, Regional expansion, API-based future products.

**Threats:** Large established BI platforms, AI-native competitors, Rapid AI model evolution, Increasing infrastructure costs, Data privacy/security requirements, Customer resistance to AI adoption, Integration complexity, Competitive pricing pressure.

## 39. REVENUE MODEL (10 streams)

1. SaaS subscriptions
2. Additional AI credits
3. Premium AI reports
4. AI presentations
5. Consultation — 375 SAR/hour (Nabda share 112.50 SAR/hour)
6. Training
7. Integrations
8. Custom AI solutions
9. Enterprise contracts
10. Digital products

## 40. FINANCIAL TARGETS

- Investor Funding Requested: **1,500,000 SAR**
- Planned Operating Cost: **125,000 SAR / month** (1,500,000 SAR / year)
- Target Monthly Revenue: **200,000 SAR**
- Target Annual Revenue Run Rate: **2,400,000 SAR**
- Target Monthly Operating Contribution: **75,000 SAR**
- Target Annual Operating Contribution: **900,000 SAR**

Financial model must distinguish Revenue ≠ Profit. AI infrastructure, personnel, marketing, technology, operations and other costs deducted before net profit.

## 41. TARGET MONTHLY REVENUE MIX

Demonstrate reaching 200,000 SAR/month via combination of: Subscription customers, Additional credits, Reports, Presentations, Consultation, Training, Integrations, Custom projects, Enterprise contracts, Digital products. Diversified model reduces dependence on one source.

## 42. PAYMENT STRUCTURE

- Subscription — Monthly / Annual
- One-Time Purchase — Reports / Presentations / Digital products
- Service Purchase — Consultation / Training
- Custom Quote — Integration / Enterprise / AI modeling

## 43. SECURITY

MVP should communicate enterprise-readiness. Minimum: Secure authentication, Role-based access, Data encryption, Secure API communication, User/company isolation, Access control, Audit logs, Secure file upload, Data deletion capability. Enterprise: expand per customer requirements and applicable Saudi regulations.

## 44. MVP SCOPE — WHAT THE INVESTOR SHOULD SEE

A Landing Page, B Registration, C Company Onboarding, D Data Upload, E AI Processing, F Dashboard, G Risks, H Opportunities, I Recommendations, J AI Report, K AI Presentation, L Credit System, M Pricing, N Subscription Upgrade, O Consultation, P Training, Q Integration Request, R Enterprise/Custom Request, S Admin Dashboard.

## 45. MVP NAVIGATION (main menu)

Dashboard, Insights, Reports, Presentations, Data, AI Solutions, Consultation, Training, Integrations, Digital Products, Credits, Billing, Settings.

## 46. AI SOLUTIONS PAGE

Visually separate: AI Reports, AI Presentations, AI Forecasting, AI Modeling, Custom AI.

## 47. ENTERPRISE CTA

At multiple strategic locations: "Need a Custom AI Solution?" Button: **Talk to Our Team**. Form: Company, Industry, Company size, Requirement, Data systems, Integration needs, Expected users, Contact details.

## 48. CONSULTATION CTA

"Need expert guidance?" [Book Consultation] — Price 375 SAR/hour.

## 49. TRAINING CTA

"Build AI Capability in Your Team" [Explore Training] — Options: Individual, Team, Corporate. Corporate: Request a Quote.

## 50. CREDIT DASHBOARD

Example: Current Plan: Growth / Monthly Credits: 120 / Used: 67 / Remaining: 53 / Renewal: 12 October. Buttons: Generate Report, Buy Credits, Upgrade Plan.

## 51. PLAN COMPARISON

| Feature | Basic | Growth | Pro | Enterprise |
|---|---|---|---|---|
| Monthly Price | 99 SAR | 199 SAR | 399 SAR | Custom |
| Monthly Usage | 50 | 120 | 250 | Custom |
| AI Dashboard | ✓ | ✓ | ✓ | ✓ |
| AI Insights | ✓ | ✓ | ✓ | ✓ |
| Risk Detection | ✓ | ✓ | ✓ | ✓ |
| Opportunity Detection | ✓ | ✓ | ✓ | ✓ |
| Standard Reports | ✓ | ✓ | ✓ | ✓ |
| Advanced Analytics | — | ✓ | ✓ | ✓ |
| Forecasting | — | ✓ | ✓ | ✓ |
| Advanced AI | — | — | ✓ | ✓ |
| Custom Integration | — | — | Optional | ✓ |
| Custom AI | — | — | Optional | ✓ |
| Enterprise Support | — | — | — | ✓ |

## 52. IMPORTANT PRODUCT ARCHITECTURE PRINCIPLE

Build the MVP with configurable commercial logic. Do NOT hard-code: Prices, Credit limits, Report limits, AI model, Feature availability, Add-on pricing. Instead create an admin configuration system. Allows changing Price → Credits → Features → AI model → Usage limits without rebuilding the application.

## 53. MVP DESIGN STYLE

Communicate: AI + Business + Intelligence + Trust. Visual direction: Clean, Premium, Modern, Professional, Enterprise-ready, Data-driven. Avoid looking like a generic chatbot. Central identity: **Business Intelligence Platform powered by AI**, not AI Chatbot.

## 54. INVESTOR DEMO SCRIPT

Understand Nabda AI in ~3–5 minutes. Opening: "This is Nabda AI — an AI-powered decision intelligence platform for businesses." Steps: 1 Show company dashboard → 2 Upload business data → 3 Run AI analysis → 4 Show Risks/Opportunities/Trends/Recommendations → 5 Generate report → 6 Generate presentation → 7 Show credit deduction → 8 Show pricing → 9 Show additional services (Consultation, Training, Integration, Custom AI, Enterprise) → Closing: business model and scalable revenue streams.

## 55. MVP SUCCESS CRITERIA

MVP should answer five questions immediately: 1) What problem does Nabda AI solve? 2) How does the platform work? 3) What does the customer receive? 4) How does Nabda AI make money? 5) How can the product scale? If investor understands these five, MVP is doing its job.

## 56. FINAL MVP STRUCTURE

1 Landing Page → 2 Registration/Free Trial → 3 Company Onboarding → 4 Data Connection → 5 AI Analysis Engine → 6 Business Intelligence Dashboard → 7 Insights → 8 Risks → 9 Opportunities → 10 Recommendations → 11 AI Reports → 12 AI Presentations (Paid Separately) → 13 Credit System → 14 Basic/Growth/Pro → 15 AI Solutions → 16 Consultation → 17 Training → 18 Integrations → 19 Custom AI → 20 Enterprise → 21 Digital Products → 22 Billing → 23 Admin Dashboard → 24 Analytics & Revenue Dashboard.

## 57. SCREENS TO BUILD FIRST (investor-facing MVP)

01 Landing Page, 02 Sign Up/Login, 03 Free Trial, 04 Company Onboarding, 05 Data Upload, 06 AI Processing, 07 Executive Dashboard, 08 AI Insights, 09 Risk & Opportunity Center, 10 AI Recommendations, 11 Report Generator, 12 Report Viewer, 13 Presentation Generator, 14 Pricing Plans, 15 Credit Wallet, 16 AI Solutions, 17 Consultation, 18 Training, 19 Integration Request, 20 Enterprise/Custom Request, 21 Billing, 22 Admin Dashboard.

## 58. COMMERCIAL LOGIC SUMMARY

SaaS: Basic 99 / Growth 199 / Pro 399 SAR/month / Enterprise Custom.
Monthly usage: Basic 50 / Growth 120 / Pro 250 / Enterprise Custom.
Consultation: 375 SAR/hour (Nabda share 112.50 SAR/hour).
Investor funding 1.5M SAR. Operating cost target 125K SAR/month. Revenue target 200K SAR/month. Target operating contribution 75K SAR/month.

## 59. CORE BUSINESS MODEL

LOW-COST ENTRY → Free Trial → Basic → Growth → Pro → Additional Credits → Premium Reports → AI Presentations → Consultation → Training → Integration → Custom AI → Enterprise. Customer expansion path rather than relying only on monthly subscriptions.

## 60. FINAL MESSAGE FOR THE IT TEAM

Build the MVP as a realistic investor demonstration of the future Nabda AI platform, not merely a static UI prototype. Investor must see: Input → AI Processing → Business Intelligence → Recommendation → Report → Presentation → Purchase → Expansion. Architecture scalable; MVP focused and commercially demonstrable. Objective: prove Nabda AI can transform business data into actionable intelligence and monetize it through subscriptions, AI usage, premium outputs, professional services, integrations and enterprise solutions.

---

# DOC B — MVP PRODUCT & DESIGN PROMPT (bilingual AR/EN)

## 1. Product Overview

**Nabda AI – العقل الذكي للمنشآت**

منصة ذكاء اصطناعي تساعد الشركات والمنشآت على تحويل بياناتها اليومية إلى تحليلات، تنبؤات، تنبيهات، فرص، وتوصيات قابلة للتنفيذ.

المنصة تجمع البيانات من مصادر مختلفة مثل: المبيعات، المخزون، العملاء، المدفوعات، الطلبات، التوصيل، الأداء التشغيلي، البيانات التسويقية، الملفات والتقارير، أنظمة الشركة المتكاملة.

ثم تحللها بالذكاء الاصطناعي لإظهار: What happened → Why it happened → What may happen next → What should the business do?

**Strategic Positioning:** السوق المستهدف على المدى الطويل جميع الشركات بمختلف أحجامها. الـMVP يبدأ بالمنشآت الصغيرة والمتوسطة SMEs كسوق أولي، مع بنية تقنية قابلة للتوسع للمؤسسات الكبيرة.

## 2. MVP OBJECTIVE

إثبات أن Nabda AI يستطيع: 1) استقبال بيانات حقيقية. 2) تنظيم وتنظيف البيانات. 3) تحليل بالذكاء الاصطناعي. 4) اكتشاف الأنماط والمشكلات. 5) تحديد المخاطر. 6) اكتشاف الفرص. 7) تقديم توصيات عملية. 8) إنشاء تقارير ولوحات معلومات. 9) إنشاء عروض تقديمية PPT بالذكاء الاصطناعي. 10) تجربة بسيطة وسريعة وقابلة للتوسع.

## 3. CORE MVP MODULES

**A. AI Business Dashboard** — Business Health: إجمالي المبيعات، معدل النمو، عدد العملاء، متوسط قيمة الطلب، المنتجات الأكثر مبيعًا، المنتجات الأقل أداءً، المخزون، التدفق النقدي، مؤشرات الأداء الرئيسية.

**AI Insights:**
- Opportunities: فرص نمو، منتجات قابلة للتوسع، شرائح عملاء واعدة، فرص زيادة الإيرادات
- Risks: انخفاض المبيعات، مخزون راكد، فقدان العملاء، انخفاض هامش الربح، مشاكل تشغيلية
- Alerts: تنبيهات تلقائية، انخفاض غير طبيعي، ارتفاع غير طبيعي، تجاوز مؤشرات محددة

## 4. AI BUSINESS ANALYST

المستخدم يسأل Nabda AI باللغة الطبيعية. مثال: «لماذا انخفضت مبيعاتي هذا الشهر؟» — Answer / Possible Reasons / Recommended Actions.

أمثلة أخرى: «ما المنتج الأكثر ربحية؟» «ما المنتجات التي قد تنفد قريبًا؟» «ما العملاء الأكثر قيمة؟» «أين أخسر المال؟» «ما الفرص المتاحة لزيادة الإيرادات؟» «ماذا تتوقع للمبيعات الشهر القادم؟» «ما أهم مشكلة تحتاج إلى معالجة الآن؟»

## 5. DATA INPUT

Upload: Excel, CSV, PDF, Business reports. Manual Input: إدخال بيانات أساسية يدويًا. Future Integrations: POS, ERP, CRM, Payment systems, E-commerce, Accounting systems, Delivery platforms, APIs.

## 6. DATA PROCESSING

Step 1 Upload → Step 2 Data Validation → Step 3 Data Cleaning → Step 4 Data Classification → Step 5 AI Analysis → Step 6 Insights Generation → Step 7 Recommendations → Step 8 Dashboard & Reports. مؤشر واضح لحالة المعالجة: "Analyzing your business data…" ثم "Analysis Complete".

## 7. AI INSIGHT ENGINE

يحلل: Trends, Anomalies, Risks, Opportunities, Predictions, Recommendations. كل Insight يحتوي: What happened? / Why? / Business Impact / Recommended Action.

## 8. AI SCORE

Business Health Score 0–100. مثال 78/100. تقسيم: Sales, Customers, Inventory, Finance, Operations, Growth. «الـScore في الـMVP مؤشر تحليلي مبني على البيانات المتاحة وليس حكمًا ماليًا أو محاسبيًا مستقلًا.»

## 9. REPORT GENERATOR

Generate Business Report → 1 Executive Summary, 2 Business Performance, 3 Key Trends, 4 Risks, 5 Opportunities, 6 Predictions, 7 Recommendations, 8 KPIs. خيارات: PDF, PPT, Dashboard view.

## 10. NABDA AI PPT GENERATOR

قسم مستقل. المستخدم يدخل Topic (مثال: «خطة تسويقية للربع القادم») ثم: عدد الشرائح، نوع العرض، الجمهور، اللغة، أسلوب التصميم. ثم Generate PPT.

## 11. PPT CREDIT SYSTEM (Slides Credits)

- Basic: 80 Slides — 49 SAR / month
- Growth: 300 Slides — 149 SAR / month
- Pro: 900 Slides — 399 SAR / month
- Custom: حسب حجم الاستخدام/عدد الشرائح/احتياجات العميل/التخصيص/التكاملات/متطلبات المؤسسة

## 12. ANNUAL PPT PLANS (خصم 20%)

- Basic Annual: 960 Slides/year — قبل 588 SAR → بعد 470.40 SAR (يُعرض ~470 SAR)
- Growth Annual: 3,600 Slides/year — قبل 1,788 SAR → بعد 1,430.40 SAR (يُعرض ~1,430 SAR)
- Pro Annual: 10,800 Slides/year — قبل 4,788 SAR → بعد 3,830.40 SAR (يُعرض ~3,830 SAR)

## 13. NABDA AI CREDITS

- Basic: 1,000 Credits — 49 SAR / month
- Growth: 4,000 Credits — 149 SAR / month
- Pro: 12,000 Credits — 3,399 SAR / month

## 14. ANNUAL AI CREDIT PLANS (خصم 20%)

- Basic Annual: 12,000 Credits/year — قبل 588 SAR → بعد ~471 SAR
- Growth Annual: 48,000 Credits/year — قبل 1,788 SAR → بعد ~1,430 SAR
- Pro Annual: 144,000 Credits/year — قبل 40,788 SAR (3,399×12) → بعد خصم 20% ~32,630.40 SAR

⚠️ مهم (client note): الرقم 4,788 SAR المذكور سابقًا لا يتطابق حسابيًا مع سعر Pro الشهري 3,399 SAR. يجب حسم هذا قبل إطلاق صفحة الأسعار.

## 15. PRICING PAGE

Toggle Monthly | Annual — "Save 20% with Annual". Cards: BASIC 1,000 Credits 49 SAR/month / GROWTH 4,000 Credits 149 SAR/month (Recommended) / PRO 12,000 Credits 3,399 SAR/month / CUSTOM "Let's build your plan" [Contact Sales].

## 16. CUSTOM PLAN

لعملاء المؤسسات: Custom Credits, Custom Slides, Advanced analytics, Data integrations, API, Dedicated support, Customized dashboards, Custom AI models/workflows, Enterprise requirements. السعر: Custom Pricing.

## 17. CONSULTING MODEL

خدمات استشارية: Business Data Analysis, AI Strategy, Digital Transformation, Data Strategy, Business Intelligence, AI Adoption, Process Optimization. Nabda AI يحصل على 30% من قيمة الاستشارة (نموذج شراكة/إحالة). تظهر داخليًا في نموذج الإيرادات، ليس بالضرورة للمستخدم النهائي.

## 18. TRAINING

AI for Business, AI Literacy, Data-driven Decision Making, AI Tools, Business Intelligence, Digital Transformation, AI Strategy. صيغ: Online, In-person, Corporate, Customized. الإيراد حسب: عدد المشاركين، مدة التدريب، نوع البرنامج، احتياجات المؤسسة، مستوى التخصيص.

## 19. INTEGRATION SERVICES

API/CRM/ERP/POS/Accounting/E-commerce/Payment Integration, Data Warehouses. التسعير حسب: النظام، حجم البيانات، التعقيد، عدد الأنظمة، متطلبات الأمان، الدعم المستمر.

## 20. MVP USER JOURNEY

Landing: "Turn Your Business Data Into Intelligent Decisions" → Start Free / Get Started.
Step 1 Create Account (Name, Email, Password, Company, Industry, Company Size).
Step 2 Choose Business Type (Retail, E-commerce, Services, Restaurant, Education, Healthcare, Other).
Step 3 Upload Data (Excel/CSV/PDF).
Step 4 AI Analysis ("Nabda AI is analyzing your business…").
Step 5 Dashboard (Business Health Score, Revenue, Customers, Inventory, Growth, Risks, Opportunities).
Step 6 AI Recommendations (Priority Alert example) → button "Take Action".

## 21. AI CHAT

Inside Dashboard: **Ask Nabda AI**. Placeholder: «Ask anything about your business…». Suggested: Analyze my sales / Find my biggest risk / What should I focus on? / Predict next month's sales / Find growth opportunities.

## 22. MVP ADMIN DASHBOARD

Users (Total/Active/New). Subscriptions (Basic/Growth/Pro/Custom). Credits (purchased/consumed/remaining). PPT Usage (Slides generated / Average slides per user). Revenue (MRR, ARR, Subscription, Consulting, Training, Integration). AI Usage (analyses, reports, predictions, recommendations).

## 23. BUSINESS MODEL (Hybrid Revenue)

1 SaaS Subscriptions (Basic/Growth/Pro/Custom). 2 PPT Generation (slides-based credit packages). 3 Consulting (30% revenue share). 4 Training (corporate/customized). 5 Integrations (one-time or recurring). 6 Enterprise (custom contracts).

## 24. MVP KPI TRACKING

Acquisition (visitors, sign-ups, conversion rate). Activation (users uploading data, completing first analysis, time to first insight). Engagement (analyses/user, AI questions/user, reports/user, PPTs/user). Revenue (MRR, ARR, ARPU, CAC, LTV). Retention (MAU, churn, renewal rate). Product (data processing success rate, AI response time, recommendation usage, user feedback).

## 25. MVP TECHNICAL ARCHITECTURE

Frontend: Web application responsive (Desktop, Tablet, Mobile). Backend: User authentication, Subscription management, Credit management, Data processing, AI orchestration, Analytics, Reporting. AI Layer: قابل لاستبدال/تطوير النماذج مستقبلًا. Database: Users, Companies, Uploaded datasets, Insights, Reports, Credits, Subscriptions, Transactions, Usage.

## 26. SECURITY

Authentication, Authorization, Encryption, Secure file upload, Tenant isolation, Role-based access, Data privacy, Audit logs, Secure API architecture. كل شركة ترى بياناتها فقط.

## 27. DESIGN DIRECTION

Modern + Intelligent + Saudi + Professional + Scalable. لا يبدو كـChatbot فقط. يشعر المستخدم أنه يستخدم AI Business Intelligence Platform.

## 28. MAIN NAVIGATION (sidebar)

Dashboard, My Data, AI Analyst, Insights, Predictions, Reports, PPT Generator, Credits, Integrations, Consulting, Training, Settings.

## 29. LANDING PAGE STRUCTURE

Hero: Nabda AI — "Turn Your Business Data Into Intelligent Decisions" / حوّل بيانات منشأتك إلى رؤى وتوقعات وتوصيات. CTA: Get Started. Secondary: See How It Works.
How It Works: Connect → Analyze → Understand → Act. (1 Connect your data, 2 AI analyzes it, 3 Discover insights, 4 Take action).

## 30. MVP DEMO SCENARIO

شركة لديها Sales/Customer/Inventory data ترفع Excel. Nabda AI يحلل. يظهر: Business Health Score 78, Revenue Growth +12%, Customer Retention 64%, Inventory Risk High, Growth Opportunity High. AI Recommendation ثم Generate Report ثم Generate PPT.

## 31. PHASE 1 — Core MVP (build first)

1 User registration, 2 Company profile, 3 Data upload, 4 Excel/CSV processing, 5 Basic data cleaning, 6 AI analysis, 7 Business dashboard, 8 AI insights, 9 Risk detection, 10 Opportunity detection, 11 AI recommendations, 12 AI chat, 13 Basic reports, 14 Credit system, 15 Subscription plans, 16 Usage tracking, 17 Basic PPT generator.

## 32. PHASE 2

PDF analysis, Advanced predictions, More integrations, CRM/ERP/POS integration, Advanced dashboards, Team accounts, Role management, Advanced reports, API, Mobile app.

## 33. PHASE 3 — Enterprise expansion

Enterprise AI, Custom AI workflows, Advanced forecasting, Industry-specific models, Enterprise integrations, Dedicated environments, Advanced security, Custom dashboards, Enterprise API, White-label options.

## 34. FINAL MVP DESIGN PRINCIPLE

لا يتم بناء كل شيء منذ البداية. الـMVP يثبت ثلاث فرضيات: H1 الشركات مستعدة لرفع بياناتها إلى منصة AI. H2 العملاء يجدون قيمة في تحويل البيانات إلى Insights + Recommendations. H3 العملاء مستعدون للدفع. النسخة الأولى: Simple → Fast → Useful → Measurable → Scalable.

## 35. FINAL BUILDER INSTRUCTION

Build a professional SaaS MVP for Nabda AI. Must include: Landing page, Authentication, Company onboarding, Data upload, AI analysis, Business dashboard, Business Health Score, AI Insights, Risks, Opportunities, Predictions, Recommendations, AI Business Analyst Chat, Reports, AI PPT Generator, Credits system, Subscription management, Pricing page, Annual plans (20% discount), Custom plans, Consulting, Training, Integrations, Admin dashboard. Clean/premium/modern B2B SaaS. Communicate: Intelligence + Trust + Business Value + Simplicity + Scalability. SME-first, scalable architecture.

Primary flow: Upload Data → AI Analysis → Dashboard → Insights → Risks & Opportunities → Recommendations → Report/PPT → Action.

Pricing (AI Credits): Basic 1,000 Credits 49 SAR/month / Growth 4,000 Credits 149 SAR/month / Pro 12,000 Credits 3,399 SAR/month / Custom. Annual 20% discount.
Pricing (PPT Slides): Basic 80 Slides 49 SAR/month / Growth 300 Slides 149 SAR/month / Pro 900 Slides 399 SAR/month / Custom. Annual: Basic ~470 SAR/yr, Growth ~1,430 SAR/yr, Pro ~3,830 SAR/yr (after 20%).

Track credits and usage in real time. Consulting 30% revenue share. Training/integration customized pricing. Modular architecture for future integrations, enterprise, advanced AI, APIs, industry-specific solutions. Prototype should look investor-ready.

---

# DOC C — INVESTOR PITCH DECK (10 slides)

**SLIDE 1 — VISION:** Nabda AI — The Intelligent Brain for Businesses. From Data to Decisions. AI-powered BI and Decision Intelligence platform. Launch Market: Saudi Arabia. Beachhead: SMEs. Long-term: mid-market, enterprises, industries, regional. Core Journey: Data → Analysis → Insights → Predictions → Recommendations → Decisions → Action.

**SLIDE 2 — THE PROBLEM:** Businesses have data but not enough intelligence. Sources fragmented (Sales, Inventory, Customers, Payments, Operations, Marketing, Delivery, Financial). Traditional journey: Fragmented Data → Manual Analysis → Delayed Reports → Limited Interpretation → Uncertain Decisions. Real problem: not just "what happened?" but why, what risks, where opportunities, what next, what action. Gap: DATA → INTELLIGENCE → DECISION.

**SLIDE 3 — THE SOLUTION:** Decision Intelligence Layer. 01 DATA → 02 AI ANALYSIS → 03 INSIGHTS → 04 PREDICTIONS → 05 RISKS & OPPORTUNITIES → 06 RECOMMENDATIONS → 07 ACTION. Value: does not simply display data — helps businesses understand data and turn into better decisions.

**SLIDE 4 — MVP:** Validate: Can AI transform business data into useful intelligence and actionable decisions? Components: 1 Data Input, 2 Intelligent Business Dashboard, 3 AI Analytics, 4 Risk Detection, 5 Opportunity Detection, 6 Predictive Indicators, 7 AI Recommendations, 8 Smart Reports, 9 AI Credit System, 10 Business Deliverables (feasibility studies, business plans, presentations, data-driven reports). Principle: Start focused. Validate the value. Scale the intelligence layer.

**SLIDE 5 — MARKET OPPORTUNITY:** 1.7 Million active commercial registrations in KSA by end Q3 2025. 8.4+ Million workers in SMEs as of Aug 2025. SME GDP contribution target 20%→35% by 2030. GTM: Phase 1 Saudi SMEs → Phase 2 Mid-Market & Multi-Branch → Phase 3 Large/Enterprise → Phase 4 Multiple Industries & Regional. SMEs = beachhead, not the limit.

**SLIDE 6 — BUSINESS MODEL:** SaaS + AI Credits + Business Services.
- BASIC SAR 99/month, 50 AI Credits
- GROWTH SAR 199/month, 120 AI Credits
- PRO SAR 399/month, 250 AI Credits
- ENTERPRISE Custom Pricing (business size, users, data volume, integration, customization, security, enterprise support)
Additional: Additional AI Credits, Advanced analytics, Premium reports, AI presentations, Feasibility studies, Business plans, Consulting, Integrations, Custom enterprise, Future API. Consulting SAR 375/hour (Nabda share SAR 112.50/consultation hour).

**SLIDE 7 — COMPETITIVE ADVANTAGE:** Positioned around DATA → INTELLIGENCE → DECISION → ACTION. Differentiators: AI-First, Decision-Oriented, SME-First GTM, Saudi & Arabic Market Readiness, Scalable Architecture, Insight-to-Action. Positioning: Not just another dashboard — a decision intelligence layer.

**SLIDE 8 — SWOT:** (Strengths: scalable SaaS, AI+BI, decision-oriented, multiple revenue, AI credit monetization, enterprise scalability, ecosystem potential. Weaknesses: early-stage, limited track record, trust-building, data quality dependence, integration dev required, continuous AI infra investment. Opportunities: KSA digital transformation, AI adoption, large SME ecosystem, enterprise expansion, integrations, multi-industry, regional, demand for data-driven decisions. Threats: BI competition, AI competition, AI infra cost changes, data privacy/cyber, customer resistance, regulatory/compliance, integration complexity.)

**SLIDE 9 — FINANCIAL PLAN:** Investment Required SAR 1,500,000. Operating Cost SAR 125,000/month (SAR 1,500,000/year). Target Revenue SAR 200,000/month (SAR 2,400,000 annual run-rate). Target Operating Contribution SAR 75,000/month (SAR 900,000 annual run-rate). Planning Break-Even Range 15–24 Months. Growth engine: Subscriptions → AI Credits → Advanced Analytics → Business Deliverables → Enterprise → Integrations → Custom. Note: all figures are planning targets/projections, not guaranteed.

**SLIDE 10 — INVESTMENT & VISION:** Investment Ask SAR 1,500,000. Use of Funds: Product Development, Technology Infrastructure (cloud, data, AI computing, security, data governance), Team (software, AI, product, sales & marketing, operations), Market Growth (customer acquisition, pilots, partnerships, market entry, initial scaling). Roadmap: SMEs → Mid-Market → Enterprise → Multiple Industries → Regional. Vision: DATA OVERLOAD → DECISION INTELLIGENCE → SUSTAINABLE BUSINESS GROWTH. "From Data to Decisions."

---

# DOC D — PRICING SUMMARY

**Monthly:** Basic 1,000 Credits SAR 49/month · Growth 4,000 Credits SAR 149/month · Pro 12,000 Credits SAR 399/month · Extra Credits available · Custom: customized.

**Annual:**
- Basic: 12,000 Credits — SAR 588/year → SAR 471/year after 20% discount
- Growth: 48,000 Credits — SAR 1,788/year → SAR 1,430/year after 20% discount
- Pro: 144,000 Credits — SAR 4,078/year → SAR 383/year after 20% discount  ⚠️ (math inconsistent — see PRICING_CONFLICTS.md)
- Extra Credits available · Custom: customized.

Tagline: **Nabda AI — From Data to Decisions.**
