# Page-by-page source audit

Audit date: 2026-11-18 (Asia/Tehran). Evidence is source-based unless explicitly stated. No rendered application, viewport, live API, screen-reader or persistent-data test was performed. Recommendations are documentation only.

Each section below is a route-pattern inspection of selected logic, JSX and style declarations. Dynamic :id routes were not visited with real records. Source strengths indicate implemented affordances, not observed user success. Shared shell findings apply in addition to page-specific entries. Full descriptions and acceptance checks are deduplicated in report 10.

## Architecture and access inventory

- React 19 / Vite 8 SPA; React Router BrowserRouter with nested Routes/Outlet. Django REST backend; Axios /api client proxied to 127.0.0.1:8000 in development. Zustand handles auth/theme. React Query provider is configured; pages generally call Axios directly. React Hook Form is declared but the inspected forms are controlled manually.
- Three shells: MainLayout for public pages; separate auth pages; DashboardLayout and AdminLayout for role-protected tasks. No established UI component package appears in package.json.
- Main entry imports src/index.css. src/App.css and root index.css are not imported by that entry and are not treated as active style evidence.
- Fonts: Google-hosted Vazirmatn (300-800) and Aref Ruqaa (400/700), display=swap. Theme tokens live in src/index.css; preference in themeStore.
- Locale: root lang=fa/dir=rtl, Persian text, fa-IR number/date formatting and a Jalali picker/conversion utility. Native date fields and raw ISO values also occur. No language switch or alternate LTR product locale was found.
- No AGENTS.md was found at workspace/checked parent levels or in frontend/backend. No PRODUCT.md or DESIGN.md was present. No screenshot fixture/golden was found.

## Shared shells and component inventory

| Module | Purpose / implemented strength | Main concerns |
|---|---|---|
| Navbar | Brand, public links, authentication links and responsive menu | F15/F25/F40; menu naming exists but expanded state does not |
| Footer | Public/member links and contact/organization details | F26; heading/phone readability need rendered review |
| Announcement | Type accent and announcement counter | F07/F09; rotating content has no pause |
| ThemeToggle | Named group, title-based option names, aria-pressed | 26px controls exceed the 24px AA dimensional threshold; comfort/focus still untested |
| CustomCursor | Pointer decoration with cleanup in shared implementation | F34; input modality, resize and light-theme visibility require testing |
| JalaliDatePicker | Persian date representation and month selection | F02/F03 |
| FinancialReportView | Shared financial summary/payment sections | F09/F31/F37 |
| MainLayout | Public landmarks, five mobile destinations, common header/footer | F07/F25/F34/F40/F45; repeated cursor implementation and reveal behavior need review |
| DashboardLayout | Task nav, main landmark and member identity | F04/F06; sticky header/short viewport untested |
| AdminLayout | Operations nav, main landmark and role context | F04/F06/F27/F28 |

Count: **7 shared components + 3 layouts**, with the page modules counted separately. AuthGate, role guards, profile helpers and refund/cancel panels were examined as nested implementation patterns, not inflated component counts.

## Routes

### `/`

- Purpose / access: Introduce the organization, promote trips/content/savings; public.
- Source strength: Relevant local imagery, about section and task CTAs.
- Problems: [F07](10-master-findings.md#f07), [F11](10-master-findings.md#f11), [F13](10-master-findings.md#f13), [F14](10-master-findings.md#f14), [F15](10-master-findings.md#f15), [F17](10-master-findings.md#f17), [F33](10-master-findings.md#f33), [F34](10-master-findings.md#f34), [F45](10-master-findings.md#f45).
- Evidence: [Home/Home.jsx](../../frontend/src/pages/Home/Home.jsx), plus [App route tree](../../frontend/src/App.jsx) and the associated shared shell.
- Recommended correction: Keep availability/date claims authoritative, correct CTA destinations, pause rotation and remove invisible slide actions from focus. See linked findings for acceptance checks.
- Rendered states: initial/loading/empty/error/success/focus/hover/scroll behavior **not observed**. State branches in source do not establish a successful runtime test.

### `/news`

- Purpose / access: Browse news; public.
- Source strength: Semantic linked cards, lazy images, Persian dates.
- Problems: [F09](10-master-findings.md#f09), [F24](10-master-findings.md#f24).
- Evidence: [News/News.jsx](../../frontend/src/pages/News/News.jsx), plus [App route tree](../../frontend/src/App.jsx) and the associated shared shell.
- Recommended correction: Separate failed news loading from a truly empty list and provide recovery. See linked findings for acceptance checks.
- Rendered states: initial/loading/empty/error/success/focus/hover/scroll behavior **not observed**. State branches in source do not establish a successful runtime test.

### `/news/:id`

- Purpose / access: Read news detail; public.
- Source strength: Constrained reading container and list return.
- Problems: [F09](10-master-findings.md#f09), [F24](10-master-findings.md#f24).
- Evidence: [News/NewsDetail.jsx](../../frontend/src/pages/News/NewsDetail.jsx), plus [App route tree](../../frontend/src/App.jsx) and the associated shared shell.
- Recommended correction: Retain the requested detail context on failure, offer retry and set a content-specific title. See linked findings for acceptance checks.
- Rendered states: initial/loading/empty/error/success/focus/hover/scroll behavior **not observed**. State branches in source do not establish a successful runtime test.

### `/articles`

- Purpose / access: Filter community writing/media; public.
- Source strength: Six meaningful categories, linked cards and loading text.
- Problems: [F09](10-master-findings.md#f09), [F25](10-master-findings.md#f25), [F40](10-master-findings.md#f40).
- Evidence: [Content/Articles.jsx](../../frontend/src/pages/Content/Articles.jsx), plus [App route tree](../../frontend/src/App.jsx) and the associated shared shell.
- Recommended correction: Expose the active filter, distinguish load failure and validate discoverability before expanding navigation. See linked findings for acceptance checks.
- Rendered states: initial/loading/empty/error/success/focus/hover/scroll behavior **not observed**. State branches in source do not establish a successful runtime test.

### `/articles/:id`

- Purpose / access: Read, react, comment and reply; public.
- Source strength: Byline/date, reply structure, external media destination.
- Problems: [F03](10-master-findings.md#f03), [F08](10-master-findings.md#f08), [F09](10-master-findings.md#f09), [F11](10-master-findings.md#f11), [F19](10-master-findings.md#f19), [F24](10-master-findings.md#f24).
- Evidence: [Content/ArticleDetail.jsx](../../frontend/src/pages/Content/ArticleDetail.jsx), plus [App route tree](../../frontend/src/App.jsx) and the associated shared shell.
- Recommended correction: Label comment/reply fields, preserve intent through login and prevent duplicate pending submissions. See linked findings for acceptance checks.
- Rendered states: initial/loading/empty/error/success/focus/hover/scroll behavior **not observed**. State branches in source do not establish a successful runtime test.

### `/gallery`

- Purpose / access: Browse and enlarge photos; public.
- Source strength: Aspect-ratio image grid, lazy images, visible close.
- Problems: [F01](10-master-findings.md#f01), [F05](10-master-findings.md#f05), [F09](10-master-findings.md#f09), [F38](10-master-findings.md#f38).
- Evidence: [Gallery/Gallery.jsx](../../frontend/src/pages/Gallery/Gallery.jsx), plus [App route tree](../../frontend/src/App.jsx) and the associated shared shell.
- Recommended correction: Use keyboard-operable previews and a named dialog with safe focus and height behavior. See linked findings for acceptance checks.
- Rendered states: initial/loading/empty/error/success/focus/hover/scroll behavior **not observed**. State branches in source do not establish a successful runtime test.

### `/shop`

- Purpose / access: Browse products by category; public.
- Source strength: Stock text, price/discount roles and category filtering.
- Problems: [F09](10-master-findings.md#f09), [F25](10-master-findings.md#f25).
- Evidence: [Shop/Shop.jsx](../../frontend/src/pages/Shop/Shop.jsx), plus [App route tree](../../frontend/src/App.jsx) and the associated shared shell.
- Recommended correction: Expose category state and distinguish failed product/category loads from empty results. See linked findings for acceptance checks.
- Rendered states: initial/loading/empty/error/success/focus/hover/scroll behavior **not observed**. State branches in source do not establish a successful runtime test.

### `/shop/:id`

- Purpose / access: Review product and submit delivery order; public.
- Source strength: Stock-aware quantity bounds, busy submit text.
- Problems: [F03](10-master-findings.md#f03), [F09](10-master-findings.md#f09), [F10](10-master-findings.md#f10), [F11](10-master-findings.md#f11), [F18](10-master-findings.md#f18).
- Evidence: [Shop/ProductDetail.jsx](../../frontend/src/pages/Shop/ProductDetail.jsx), plus [App route tree](../../frontend/src/App.jsx) and the associated shared shell.
- Recommended correction: Associate delivery labels, preserve the product task through login and provide a durable order receipt. See linked findings for acceptance checks.
- Rendered states: initial/loading/empty/error/success/focus/hover/scroll behavior **not observed**. State branches in source do not establish a successful runtime test.

### `/track`

- Purpose / access: Look up a registration by tracking/national codes; public.
- Source strength: Public access, explicit textual registration/payment status.
- Problems: [F03](10-master-findings.md#f03), [F08](10-master-findings.md#f08), [F10](10-master-findings.md#f10).
- Evidence: [Dashboard/TrackRegistration.jsx](../../frontend/src/pages/Dashboard/TrackRegistration.jsx), plus [App route tree](../../frontend/src/App.jsx) and the associated shared shell.
- Recommended correction: Associate code labels, explain invalid identifiers and announce the result or failure. See linked findings for acceptance checks.
- Rendered states: initial/loading/empty/error/success/focus/hover/scroll behavior **not observed**. State branches in source do not establish a successful runtime test.

### `/login`

- Purpose / access: Authenticate a member; public.
- Source strength: Native required controls, tel keyboard hint, busy submit.
- Problems: [F03](10-master-findings.md#f03), [F08](10-master-findings.md#f08), [F11](10-master-findings.md#f11), [F22](10-master-findings.md#f22), [F31](10-master-findings.md#f31).
- Evidence: [Auth/Login.jsx](../../frontend/src/pages/Auth/Login.jsx), plus [App route tree](../../frontend/src/App.jsx) and the associated shared shell.
- Recommended correction: Associate fields, preserve the originating task and provide a working recovery path. See linked findings for acceptance checks.
- Rendered states: initial/loading/empty/error/success/focus/hover/scroll behavior **not observed**. State branches in source do not establish a successful runtime test.

### `/register`

- Purpose / access: Create an account; public.
- Source strength: Password confirmation and retained input state on failure.
- Problems: [F03](10-master-findings.md#f03), [F08](10-master-findings.md#f08), [F10](10-master-findings.md#f10), [F31](10-master-findings.md#f31).
- Evidence: [Auth/Register.jsx](../../frontend/src/pages/Auth/Register.jsx), plus [App route tree](../../frontend/src/App.jsx) and the associated shared shell.
- Recommended correction: Associate fields and show all actionable validation errors with retained values. See linked findings for acceptance checks.
- Rendered states: initial/loading/empty/error/success/focus/hover/scroll behavior **not observed**. State branches in source do not establish a successful runtime test.

### `/dashboard`

- Purpose / access: Summarize member services; member authentication.
- Source strength: Quick links and textual recent-trip badges.
- Problems: [F09](10-master-findings.md#f09).
- Evidence: [Dashboard/Dashboard.jsx](../../frontend/src/pages/Dashboard/Dashboard.jsx), plus [App route tree](../../frontend/src/App.jsx) and the associated shared shell.
- Recommended correction: Distinguish failed balances/registrations from missing values and keep task destinations clear. See linked findings for acceptance checks.
- Rendered states: initial/loading/empty/error/success/focus/hover/scroll behavior **not observed**. State branches in source do not establish a successful runtime test.

### `/dashboard/profile`

- Purpose / access: Edit member details; member authentication.
- Source strength: Grouped fields and conditional health detail.
- Problems: [F02](10-master-findings.md#f02), [F03](10-master-findings.md#f03), [F08](10-master-findings.md#f08), [F10](10-master-findings.md#f10), [F21](10-master-findings.md#f21), [F29](10-master-findings.md#f29), [F36](10-master-findings.md#f36), [F41](10-master-findings.md#f41).
- Evidence: [Dashboard/Profile.jsx](../../frontend/src/pages/Dashboard/Profile.jsx), plus [App route tree](../../frontend/src/App.jsx) and the associated shared shell.
- Recommended correction: Fix saved-date initialization, validate stable input identity and provide clear document-collection guidance. See linked findings for acceptance checks.
- Rendered states: initial/loading/empty/error/success/focus/hover/scroll behavior **not observed**. State branches in source do not establish a successful runtime test.

### `/dashboard/trips`

- Purpose / access: Manage registrations/payments/cancellation/refund; member authentication.
- Source strength: Empty-state next action, balance and partial-payment information.
- Problems: [F03](10-master-findings.md#f03), [F08](10-master-findings.md#f08), [F09](10-master-findings.md#f09), [F17](10-master-findings.md#f17).
- Evidence: [Dashboard/MyTrips.jsx](../../frontend/src/pages/Dashboard/MyTrips.jsx), plus [App route tree](../../frontend/src/App.jsx) and the associated shared shell.
- Recommended correction: Make payment state and required next action explicit; associate amount fields and announce outcomes. See linked findings for acceptance checks.
- Rendered states: initial/loading/empty/error/success/focus/hover/scroll behavior **not observed**. State branches in source do not establish a successful runtime test.

### `/dashboard/trips/register`

- Purpose / access: Select trip/companions and accept conditions; member authentication.
- Source strength: Optional companions and visible conditions checkbox.
- Problems: [F01](10-master-findings.md#f01), [F03](10-master-findings.md#f03), [F09](10-master-findings.md#f09), [F10](10-master-findings.md#f10), [F11](10-master-findings.md#f11), [F20](10-master-findings.md#f20).
- Evidence: [Dashboard/TripRegister.jsx](../../frontend/src/pages/Dashboard/TripRegister.jsx), plus [App route tree](../../frontend/src/App.jsx) and the associated shared shell.
- Recommended correction: Use accessible trip choices, reset terms acceptance on trip change and preserve meaningful field errors. See linked findings for acceptance checks.
- Rendered states: initial/loading/empty/error/success/focus/hover/scroll behavior **not observed**. State branches in source do not establish a successful runtime test.

### `/dashboard/wallet`

- Purpose / access: Charge wallet and inspect transactions; member authentication.
- Source strength: Minimum charge hint, transaction descriptions/dates.
- Problems: [F03](10-master-findings.md#f03), [F08](10-master-findings.md#f08), [F09](10-master-findings.md#f09), [F16](10-master-findings.md#f16), [F31](10-master-findings.md#f31).
- Evidence: [Dashboard/MyWallet.jsx](../../frontend/src/pages/Dashboard/MyWallet.jsx), plus [App route tree](../../frontend/src/App.jsx) and the associated shared shell.
- Recommended correction: Align online-payment wording with verified settlement and use consistent transaction theme roles. See linked findings for acceptance checks.
- Rendered states: initial/loading/empty/error/success/focus/hover/scroll behavior **not observed**. State branches in source do not establish a successful runtime test.

### `/dashboard/tickets`

- Purpose / access: Create/read/reply to support tickets; member authentication.
- Source strength: Priority/status text, closed-thread reply suppression.
- Problems: [F01](10-master-findings.md#f01), [F03](10-master-findings.md#f03), [F09](10-master-findings.md#f09), [F19](10-master-findings.md#f19).
- Evidence: [Dashboard/MyTickets.jsx](../../frontend/src/pages/Dashboard/MyTickets.jsx), plus [App route tree](../../frontend/src/App.jsx) and the associated shared shell.
- Recommended correction: Use accessible thread links/buttons, label message fields and show a guarded pending reply state. See linked findings for acceptance checks.
- Rendered states: initial/loading/empty/error/success/focus/hover/scroll behavior **not observed**. State branches in source do not establish a successful runtime test.

### `/dashboard/gallery`

- Purpose / access: Submit images for moderation; member authentication.
- Source strength: Image file accept hint, optional-title wording and cancel.
- Problems: [F03](10-master-findings.md#f03), [F09](10-master-findings.md#f09).
- Evidence: [Dashboard/MyGallery.jsx](../../frontend/src/pages/Dashboard/MyGallery.jsx), plus [App route tree](../../frontend/src/App.jsx) and the associated shared shell.
- Recommended correction: Associate upload metadata labels and distinguish failed loading/upload from genuine emptiness. See linked findings for acceptance checks.
- Rendered states: initial/loading/empty/error/success/focus/hover/scroll behavior **not observed**. State branches in source do not establish a successful runtime test.

### `/dashboard/articles`

- Purpose / access: Submit community writing/media; member authentication.
- Source strength: Content categories, optional media link and cancel.
- Problems: [F03](10-master-findings.md#f03), [F09](10-master-findings.md#f09), [F10](10-master-findings.md#f10).
- Evidence: [Dashboard/MyArticles.jsx](../../frontend/src/pages/Dashboard/MyArticles.jsx), plus [App route tree](../../frontend/src/App.jsx) and the associated shared shell.
- Recommended correction: Associate fields and retain actionable errors and truthful moderation feedback. See linked findings for acceptance checks.
- Rendered states: initial/loading/empty/error/success/focus/hover/scroll behavior **not observed**. State branches in source do not establish a successful runtime test.

### `/dashboard/financial-report`

- Purpose / access: Review personal finances; member authentication.
- Source strength: Shared report groups multiple payment sources.
- Problems: [F08](10-master-findings.md#f08), [F09](10-master-findings.md#f09), [F31](10-master-findings.md#f31), [F37](10-master-findings.md#f37).
- Evidence: [Dashboard/FinancialReport.jsx](../../frontend/src/pages/Dashboard/FinancialReport.jsx), plus [App route tree](../../frontend/src/App.jsx) and the associated shared shell.
- Recommended correction: Provide a real error state and responsive financial values instead of blank report content. See linked findings for acceptance checks.
- Rendered states: initial/loading/empty/error/success/focus/hover/scroll behavior **not observed**. State branches in source do not establish a successful runtime test.

### `/admin`

- Purpose / access: Summarize operations; admin/superadmin authentication, with backend permission checks.
- Source strength: Explicit loading/error branches and labeled chart values.
- Problems: [F31](10-master-findings.md#f31), [F35](10-master-findings.md#f35).
- Evidence: [Admin/AdminDashboard.jsx](../../frontend/src/pages/Admin/AdminDashboard.jsx), plus [App route tree](../../frontend/src/App.jsx) and the associated shared shell.
- Recommended correction: Give recent registrations semantic column relationships and consistent status colors. See linked findings for acceptance checks.
- Rendered states: initial/loading/empty/error/success/focus/hover/scroll behavior **not observed**. State branches in source do not establish a successful runtime test.

### `/admin/users`

- Purpose / access: Search users/filter roles; admin/superadmin authentication, with backend permission checks.
- Source strength: Native table, explicit search, role-change feedback.
- Problems: [F03](10-master-findings.md#f03), [F08](10-master-findings.md#f08), [F09](10-master-findings.md#f09), [F25](10-master-findings.md#f25), [F27](10-master-findings.md#f27).
- Evidence: [Admin/AdminUsers.jsx](../../frontend/src/pages/Admin/AdminUsers.jsx), plus [App route tree](../../frontend/src/App.jsx) and the associated shared shell.
- Recommended correction: Label search controls, expose filter state and keep permissions/action results understandable. See linked findings for acceptance checks.
- Rendered states: initial/loading/empty/error/success/focus/hover/scroll behavior **not observed**. State branches in source do not establish a successful runtime test.

### `/admin/users/:id`

- Purpose / access: Review/edit profile/documents/finance/permissions; admin/superadmin authentication, with backend permission checks.
- Source strength: Document labels, grouped profile and permission presets.
- Problems: [F02](10-master-findings.md#f02), [F03](10-master-findings.md#f03), [F05](10-master-findings.md#f05), [F09](10-master-findings.md#f09), [F25](10-master-findings.md#f25), [F27](10-master-findings.md#f27), [F29](10-master-findings.md#f29), [F37](10-master-findings.md#f37).
- Evidence: [Admin/AdminUserDetail.jsx](../../frontend/src/pages/Admin/AdminUserDetail.jsx), plus [App route tree](../../frontend/src/App.jsx) and the associated shared shell.
- Recommended correction: Use accessible dates/tabs and permission-aware financial access; explain document collection. See linked findings for acceptance checks.
- Rendered states: initial/loading/empty/error/success/focus/hover/scroll behavior **not observed**. State branches in source do not establish a successful runtime test.

### `/admin/trips`

- Purpose / access: Create/edit/toggle/delete trips; admin/superadmin authentication, with backend permission checks.
- Source strength: Explicit destructive confirmation and distinct audience/type fields.
- Problems: [F02](10-master-findings.md#f02), [F03](10-master-findings.md#f03), [F08](10-master-findings.md#f08), [F09](10-master-findings.md#f09), [F10](10-master-findings.md#f10).
- Evidence: [Admin/AdminTrips.jsx](../../frontend/src/pages/Admin/AdminTrips.jsx), plus [App route tree](../../frontend/src/App.jsx) and the associated shared shell.
- Recommended correction: Use accessible date entry, associated labels and field-specific save errors. See linked findings for acceptance checks.
- Rendered states: initial/loading/empty/error/success/focus/hover/scroll behavior **not observed**. State branches in source do not establish a successful runtime test.

### `/admin/registrations`

- Purpose / access: Filter/export registrations and update status/groups; admin/superadmin authentication, with backend permission checks.
- Source strength: Progressively revealed filters/columns, native scrollable table.
- Problems: [F03](10-master-findings.md#f03), [F05](10-master-findings.md#f05), [F08](10-master-findings.md#f08), [F09](10-master-findings.md#f09), [F10](10-master-findings.md#f10), [F25](10-master-findings.md#f25), [F38](10-master-findings.md#f38), [F43](10-master-findings.md#f43), [F44](10-master-findings.md#f44).
- Evidence: [Admin/AdminRegistrations.jsx](../../frontend/src/pages/Admin/AdminRegistrations.jsx), plus [App route tree](../../frontend/src/App.jsx) and the associated shared shell.
- Recommended correction: Make dialogs and filters accessible, retain failed drafts and remove or explain unavailable columns. See linked findings for acceptance checks.
- Rendered states: initial/loading/empty/error/success/focus/hover/scroll behavior **not observed**. State branches in source do not establish a successful runtime test.

### `/admin/articles`

- Purpose / access: Review/moderate writing; admin/superadmin authentication, with backend permission checks.
- Source strength: Status filters, content expansion and per-item busy state.
- Problems: [F03](10-master-findings.md#f03), [F09](10-master-findings.md#f09), [F25](10-master-findings.md#f25).
- Evidence: [Admin/AdminArticles.jsx](../../frontend/src/pages/Admin/AdminArticles.jsx), plus [App route tree](../../frontend/src/App.jsx) and the associated shared shell.
- Recommended correction: Expose moderation filter state and distinguish failed loads from zero submissions. See linked findings for acceptance checks.
- Rendered states: initial/loading/empty/error/success/focus/hover/scroll behavior **not observed**. State branches in source do not establish a successful runtime test.

### `/admin/gallery`

- Purpose / access: Review/moderate photos; admin/superadmin authentication, with backend permission checks.
- Source strength: Pending count, preview and busy moderation actions.
- Problems: [F01](10-master-findings.md#f01), [F05](10-master-findings.md#f05), [F09](10-master-findings.md#f09), [F25](10-master-findings.md#f25).
- Evidence: [Admin/AdminGalleryModeration.jsx](../../frontend/src/pages/Admin/AdminGalleryModeration.jsx), plus [App route tree](../../frontend/src/App.jsx) and the associated shared shell.
- Recommended correction: Use keyboard-operable previews, accessible dialogs and announced review outcomes. See linked findings for acceptance checks.
- Rendered states: initial/loading/empty/error/success/focus/hover/scroll behavior **not observed**. State branches in source do not establish a successful runtime test.

### `/admin/news`

- Purpose / access: Create/edit/publish news; admin/superadmin authentication, with backend permission checks.
- Source strength: Draft/published text, image support and delete confirmation.
- Problems: [F03](10-master-findings.md#f03), [F08](10-master-findings.md#f08), [F09](10-master-findings.md#f09), [F10](10-master-findings.md#f10).
- Evidence: [Admin/AdminNews.jsx](../../frontend/src/pages/Admin/AdminNews.jsx), plus [App route tree](../../frontend/src/App.jsx) and the associated shared shell.
- Recommended correction: Associate editor fields, preserve specific errors and distinguish failed lists from no news. See linked findings for acceptance checks.
- Rendered states: initial/loading/empty/error/success/focus/hover/scroll behavior **not observed**. State branches in source do not establish a successful runtime test.

### `/admin/expenses`

- Purpose / access: Manage itemized expenses; admin/superadmin authentication, with backend permission checks.
- Source strength: Total amount and semantic table.
- Problems: [F03](10-master-findings.md#f03), [F08](10-master-findings.md#f08), [F09](10-master-findings.md#f09), [F10](10-master-findings.md#f10), [F28](10-master-findings.md#f28).
- Evidence: [Admin/AdminExpenses.jsx](../../frontend/src/pages/Admin/AdminExpenses.jsx), plus [App route tree](../../frontend/src/App.jsx) and the associated shared shell.
- Recommended correction: Use operator-facing errors with associated fields and reliable loading/empty states. See linked findings for acceptance checks.
- Rendered states: initial/loading/empty/error/success/focus/hover/scroll behavior **not observed**. State branches in source do not establish a successful runtime test.

### `/admin/contributions`

- Purpose / access: Manage fundraising campaigns; admin/superadmin authentication, with backend permission checks.
- Source strength: Public/active flags and intended progress summary.
- Problems: [F03](10-master-findings.md#f03), [F08](10-master-findings.md#f08), [F09](10-master-findings.md#f09), [F10](10-master-findings.md#f10), [F28](10-master-findings.md#f28), [F42](10-master-findings.md#f42).
- Evidence: [Admin/AdminContributions.jsx](../../frontend/src/pages/Admin/AdminContributions.jsx), plus [App route tree](../../frontend/src/App.jsx) and the associated shared shell.
- Recommended correction: Align creation/progress with the actual campaign schema and replace implementation-dialogue errors. See linked findings for acceptance checks.
- Rendered states: initial/loading/empty/error/success/focus/hover/scroll behavior **not observed**. State branches in source do not establish a successful runtime test.

### `/admin/refunds`

- Purpose / access: Approve/reject wallet refunds; admin/superadmin authentication, with backend permission checks.
- Source strength: Paid/requested/default amounts and busy actions.
- Problems: [F03](10-master-findings.md#f03), [F08](10-master-findings.md#f08), [F09](10-master-findings.md#f09), [F10](10-master-findings.md#f10).
- Evidence: [Admin/AdminRefunds.jsx](../../frontend/src/pages/Admin/AdminRefunds.jsx), plus [App route tree](../../frontend/src/App.jsx) and the associated shared shell.
- Recommended correction: Label each override amount and announce request/action results with useful recovery. See linked findings for acceptance checks.
- Rendered states: initial/loading/empty/error/success/focus/hover/scroll behavior **not observed**. State branches in source do not establish a successful runtime test.

## Access and coverage gaps

All 31 routes remain unavailable for rendered verification. Member/admin views additionally require sanctioned test identities and realistic records. No authentication bypass, mock application or database seed was created. Browser navigation to article/news details or wallet-backed pages requires an isolated fixture or explicit authorization because some GET handlers write persistent state. No real success, payment, cancellation, moderation, export or account-change action was executed.
