# Consolidated findings register

2026-11-18, Asia/Tehran. **Source inspection only.** No application was rendered or interaction reproduced. CONFIRMED means directly established from source; LIKELY means a supported runtime inference; NEEDS VALIDATION means a research hypothesis. Reproduction checks below are future acceptance checks, not completed tests. Effort is relative, not a delivery commitment. No user-frequency statistics are available: scope identifies the circumstances in which each issue occurs.

Every record below supplies category, severity, priority, confidence, location/scope, description, impact, evidence, principle, recommendation, effort and a reproduction/acceptance check. Shared causes are grouped rather than counted per page. WCAG interpretations and qualifications are in [05](05-accessibility-wcag.md).

## F01

**Mouse-only essential choices and previews** — Keyboard; High; P1; CONFIRMED; effort Medium.

- Scope: trip selection, ticket rows, public/admin gallery thumbnails and homepage carousel dots whenever available.
- Evidence: `frontend/src/pages/Dashboard/TripRegister.jsx`, `Dashboard/MyTickets.jsx`, `Gallery/Gallery.jsx`, `Admin/AdminGalleryModeration.jsx`, `Home/Home.jsx` under `frontend/src/pages/`. These controls are divs with onClick and no keyboard alternative.
- Impact / principle: keyboard users cannot select a trip or open a support thread through these controls; WCAG 2.1.1 A, native-control expectations.
- Correction: radio inputs for trip selection; native buttons/links for opening content and carousel navigation; visible focus and meaningful names.
- Check: Tab through each populated page, then select/open using the native keyboard action. No mouse should be required.

**Exact source locators:** [frontend/src/pages/Dashboard/TripRegister.jsx:85](../../frontend/src/pages/Dashboard/TripRegister.jsx#L85); [frontend/src/pages/Dashboard/MyTickets.jsx:161](../../frontend/src/pages/Dashboard/MyTickets.jsx#L161); [frontend/src/pages/Gallery/Gallery.jsx:31](../../frontend/src/pages/Gallery/Gallery.jsx#L31).

## F02

**Jalali calendar cannot be opened with a keyboard** — Keyboard; High; P1; CONFIRMED; effort Medium.

- Scope: `JalaliDatePicker` in member profile, admin trip dates and user editor.
- Evidence: `frontend/src/components/JalaliDatePicker.jsx`: a readOnly input opens only through onClick. No key handler or separate opening button exists. Arrow buttons have glyph-only text; date buttons expose day numbers without full-date context.
- Impact / principle: date-dependent tasks cannot be completed using this control by keyboard alone; WCAG 2.1.1 A; name/state concerns under 4.1.2 A.
- Correction: named keyboard-operable opening control or editable localized field; expanded state, full-date labels, selected state and predictable calendar navigation.
- Check: focus the closed field, open it, choose a date, dismiss and return focus using keys alone.

**Exact source locators:** [frontend/src/components/JalaliDatePicker.jsx:72](../../frontend/src/components/JalaliDatePicker.jsx#L72).

## F03

**Visible field labels lack programmatic associations** — Forms/accessibility; High; P1; CONFIRMED; effort Medium.

- Scope: authentication, tracking, profile, checkout, member submissions and admin forms. Wrapped checkbox labels are an exception.
- Evidence: `Auth/Login.jsx`, `Auth/Register.jsx`, `Dashboard/Profile.jsx`, `Shop/ProductDetail.jsx`, `Dashboard/TrackRegistration.jsx` under `frontend/src/pages/`: sibling labels have no htmlFor; fields have no associated id. Search, amount and comment fields also depend on placeholders.
- Impact / principle: users lose reliable field context and cannot click labels to focus fields; WCAG 1.3.1 A and, for unnamed controls, 4.1.2 A. A placeholder is not a substitute for the missing visible-label relationship.
- Correction: stable ids and associated labels; persistent instructions and linked error descriptions.
- Check: inspect accessible names and activate every label, including dynamic fields and repeated table inputs.

**Exact source locators:** [frontend/src/pages/Auth/Login.jsx:49](../../frontend/src/pages/Auth/Login.jsx#L49); [frontend/src/pages/Dashboard/Profile.jsx:54](../../frontend/src/pages/Dashboard/Profile.jsx#L54); [frontend/src/pages/Shop/ProductDetail.jsx:101](../../frontend/src/pages/Shop/ProductDetail.jsx#L101).

## F04

**Sidebar toggles are unnamed** — Accessibility; High; P1; CONFIRMED; effort Small.

- Scope: member and admin navigation at mobile breakpoints.
- Evidence: `frontend/src/layouts/DashboardLayout.jsx` button with `className="sidebar-toggle"`; `AdminLayout.jsx` button with `className="adm-sidebar-toggle"`. Each contains SVG geometry without text, title or aria-label; expanded state is absent.
- Impact / principle: primary navigation is exposed as an unnamed button; WCAG 4.1.2 A.
- Correction: Persian action name, aria-expanded and aria-controls.
- Check: inspect the button's name/state before and after opening the drawer.

**Exact source locators:** [frontend/src/layouts/DashboardLayout.jsx:118](../../frontend/src/layouts/DashboardLayout.jsx#L118); [frontend/src/layouts/AdminLayout.jsx:63](../../frontend/src/layouts/AdminLayout.jsx#L63).

## F05

**Custom overlays omit dialog semantics and focus management** — Accessibility/overlays; High; P1; CONFIRMED; effort Medium.

- Scope: public/admin lightboxes and registration rejection, note, attendance and companion overlays.
- Evidence: `frontend/src/pages/Gallery/Gallery.jsx`; `Admin/AdminRegistrations.jsx` onward; `Admin/AdminGalleryModeration.jsx` lightbox block. Div-based overlays have no dialog role/name, focus entry/return, background inertness or Escape handler. Visible close/cancel actions do exist.
- Impact / principle: overlay context is not identified; focus may remain behind the overlay. WCAG 4.1.2 A; runtime focus-order risk under 2.4.3 A, untested.
- Correction: accessible named dialog pattern with initial focus, contained traversal, Escape and opener focus restoration.
- Check: inspect dialog semantics; exercise Tab, Shift+Tab, Escape and focus return. Check every overlay, not just one implementation.

**Exact source locators:** [frontend/src/pages/Gallery/Gallery.jsx:43](../../frontend/src/pages/Gallery/Gallery.jsx#L43); [frontend/src/pages/Admin/AdminRegistrations.jsx:529](../../frontend/src/pages/Admin/AdminRegistrations.jsx#L529).

## F06

**Closed off-canvas navigation remains focusable** — Accessibility/responsive; High; P1; CONFIRMED; effort Medium.

- Scope: member/admin sidebars when closed at their narrow breakpoints.
- Evidence: both layout style blocks use `transform: translateX(100%)`; links remain mounted without hidden/inert/tab removal. Inspect `frontend/src/layouts/DashboardLayout.jsx` and `AdminLayout.jsx` responsive sidebar rules.
- Impact / principle: keyboard traversal can enter visually off-screen links; WCAG 2.4.7 AA / 2.4.11 AA risk. Source behavior is established; actual browser focus traversal is untested.
- Correction: remove closed drawer contents from focus traversal and accessibility exposure; restore on open with intentional focus behavior.
- Check: at 390px, Tab with drawer closed/open/closed again and after navigation; no hidden destination should receive focus.

**Exact source locators:** [frontend/src/layouts/DashboardLayout.jsx:225](../../frontend/src/layouts/DashboardLayout.jsx#L225); [frontend/src/layouts/AdminLayout.jsx:226](../../frontend/src/layouts/AdminLayout.jsx#L226).

## F07

**Automatic content rotation cannot be paused** — Motion/accessibility; High; P1; CONFIRMED; effort Medium.

- Scope: homepage slides and announcement bar with multiple records.
- Evidence: `frontend/src/pages/Home/Home.jsx` rotates every 6000ms; `frontend/src/components/Announcement.jsx` rotates every 5000ms. Neither has pause/resume or focus-pause logic.
- Impact / principle: text/actions change while users read or prepare to activate them; WCAG 2.2.2 A, user control.
- Correction: explicit pause/resume and appropriate focus/pointer pausing; honor motion preferences for automatic updates.
- Check: focus and pause each rotating region, wait beyond its interval and confirm it remains stable.

**Exact source locators:** [frontend/src/pages/Home/Home.jsx:160](../../frontend/src/pages/Home/Home.jsx#L160); [frontend/src/components/Announcement.jsx:18](../../frontend/src/components/Announcement.jsx#L18).

## F08

**Inline outcomes have no announcement mechanism** — Accessibility/feedback; High; P1; CONFIRMED; effort Medium.

- Scope: authentication errors, tracking result/error, profile, wallet and payment/admin inline feedback.
- Evidence: ordinary `.auth-message`, `.tg-error`, `.tg-result`, `.pf-message`, `.wl-message` divs in their page components; source search finds no live/status/error-focus infrastructure. Native alert calls elsewhere are a different mechanism and are excluded.
- Impact / principle: users may not hear a completed or failed operation and may repeat it; WCAG 4.1.3 AA where these are status messages.
- Correction: contextual status/live regions and appropriate error-summary focus without announcing unrelated content repeatedly.
- Check: in a sanctioned isolated flow, confirm each meaningful outcome is announced once while preserving user control of focus.

**Exact source locators:** [frontend/src/pages/Auth/Login.jsx:35](../../frontend/src/pages/Auth/Login.jsx#L35); [frontend/src/pages/Dashboard/TrackRegistration.jsx:72](../../frontend/src/pages/Dashboard/TrackRegistration.jsx#L72).

## F09

**Failed requests masquerade as empty data or unexplained redirects** — Reliability/UX; High; P1; CONFIRMED; effort Medium.

- Scope: public lists/details, member lists and financial reports, most admin lists.
- Evidence: empty catches in `News.jsx`, `Articles.jsx`, `Gallery.jsx`, `Shop.jsx`, member/admin fetch functions; `NewsDetail.jsx` redirects on every error; `frontend/src/components/FinancialReportView.jsx` returns null for missing data.
- Impact / principle: records or money can appear absent after network/permission failures, with no retry. Nielsen visibility of system status and recovery.
- Correction: distinct loading/empty/denied/not-found/failed states, useful retry and retained detail context.
- Check: isolated responses for 200-empty, 403, 404, 500 and offline must yield distinct understandable states; no live API calls were made in this audit.

**Exact source locators:** [frontend/src/pages/News/News.jsx:12](../../frontend/src/pages/News/News.jsx#L12); [frontend/src/components/FinancialReportView.jsx:8](../../frontend/src/components/FinancialReportView.jsx#L8).

## F10

**Server validation loses actionable field context** — Forms/recovery; High; P1; CONFIRMED; effort Medium.

- Scope: profile, trip registration, checkout, registration and admin forms.
- Evidence: `Profile.jsx` reduces all update failures to generic text; TripRegister/ProductDetail use `response.data.error` while backend serializers return field-error objects; `Auth/Register.jsx` shows only the first object value.
- Impact / principle: users cannot identify all rejected fields or recover efficiently; error identification/suggestion risks under WCAG 3.3.1 A / 3.3.3 AA. Runtime validation is untested.
- Correction: preserve values, map every field error, show persistent constraints and a linked summary; avoid vague alerts for serializer objects.
- Check: return multiple field errors in a fixture; each must identify the control and explain correction without erasing work.

**Exact source locators:** [frontend/src/pages/Dashboard/Profile.jsx:43](../../frontend/src/pages/Dashboard/Profile.jsx#L43); [frontend/src/pages/Auth/Register.jsx:40](../../frontend/src/pages/Auth/Register.jsx#L40).

## F11

**Login loses the intended destination and drafts** — Navigation; High; P1; CONFIRMED; effort Medium.

- Scope: protected trip URLs, checkout and authenticated article participation.
- Evidence: `frontend/src/App.jsx` redirects without return state; `Auth/Login.jsx` always navigates to `/dashboard`; ProductDetail sends unauthenticated users to login with address/quantity held locally.
- Impact / principle: users must find their task again and may lose entered text; continuity and recognition over recall.
- Correction: preserve a safe internal return destination and appropriate non-sensitive drafts through authentication.
- Check: start signed out at a trip/product/article task and verify login returns to the same context with permitted draft values.

**Exact source locators:** [frontend/src/App.jsx:47](../../frontend/src/App.jsx#L47); [frontend/src/pages/Auth/Login.jsx:16](../../frontend/src/pages/Auth/Login.jsx#L16).

## F12

**A stalled profile check can gate public content indefinitely** — Loading/architecture; High; P1; CONFIRMED; effort Medium.

- Scope: any initial route when an access token exists and the profile request stalls.
- Evidence: App's AuthGate wraps the entire router; `store/authStore.js` waits on `getProfile().finally()`; `services/api.js` defines no timeout or gate recovery action.
- Impact / principle: public home/news/help can be replaced by an indefinite loading message; visibility and graceful degradation. This is a conditional code path, not an observed outage.
- Correction: bounded authentication waiting and recovery; render public content independently where appropriate.
- Check: hold a synthetic profile request pending in a disposable context; verify a bounded recoverable experience.

**Exact source locators:** [frontend/src/App.jsx:89](../../frontend/src/App.jsx#L89); [frontend/src/store/authStore.js:69](../../frontend/src/store/authStore.js#L69); [frontend/src/services/api.js:3](../../frontend/src/services/api.js#L3).

## F13

**Unlabeled sample content substitutes for unavailable live information** — Trust/content; High; P1; CONFIRMED; effort Medium.

- Scope: homepage initial, empty and failed API states.
- Evidence: `Home.jsx` default slides/news/gallery; `:141–155` fallback selection; `:198` fixed statistics targets. Sample slides announce open, limited registration. Static statistics have no visible provenance in this implementation.
- Impact / principle: visitors cannot distinguish current availability from fallback claims. Historical counts may be accurate; their truth was not independently verified. Trust and error prevention.
- Correction: distinguish editorial/static material from live availability; use dated verified claims and honest unavailable/empty states.
- Check: empty and failed endpoint fixtures must not produce unverified live-registration claims.

**Exact source locators:** [frontend/src/pages/Home/Home.jsx:19](../../frontend/src/pages/Home/Home.jsx#L19); [frontend/src/pages/Home/Home.jsx:69](../../frontend/src/pages/Home/Home.jsx#L69); [frontend/src/pages/Home/Home.jsx:198](../../frontend/src/pages/Home/Home.jsx#L198).

## F14

**Countdown is disconnected from the displayed trip** — Content/dates; Medium; P2; CONFIRMED; effort Small.

- Scope: homepage countdown and active-trip section.
- Evidence: `Home.jsx` targets literal `2027-07-27T00:00:00`; `:142` selects activeTrip independently from API data.
- Impact / principle: the countdown can describe a different date from the trip beside it; consistency and temporal clarity.
- Correction: derive time from the named event with explicit timezone and past/unknown-date handling.
- Check: supply different event dates and no event; display must track the actual named event.

**Exact source locators:** [frontend/src/pages/Home/Home.jsx:175](../../frontend/src/pages/Home/Home.jsx#L175).

## F15

**Named actions lead to unrelated destinations** — Navigation/copy; Medium; P2; CONFIRMED; effort Small.

- Scope: homepage about and contribution calls to action.
- Evidence: `Home.jsx` sends signed-out “آشنایی با هیئت” to login despite `#about`; `:581–584` sends “همپای قافله” to the generic dashboard, which has no matching contribution task.
- Impact / principle: labels do not predict the next step; information scent and match to expectations.
- Correction: link about actions to about content; provide the named contribution journey or accurately label its destination.
- Check: follow each CTA signed in/out and compare its promise to the next page heading/action.

**Exact source locators:** [frontend/src/pages/Home/Home.jsx:288](../../frontend/src/pages/Home/Home.jsx#L288); [frontend/src/pages/Home/Home.jsx:583](../../frontend/src/pages/Home/Home.jsx#L583).

## F16

**“Online payment” currently invokes a test wallet credit** — Financial trust; High; P1; CONFIRMED; effort Large.

- Scope: wallet charge flow; deployment status unknown.
- Evidence: `Dashboard/MyWallet.jsx–86` labels direct API charging as online payment; `backend/financial/views.py` marks a transaction successful and credits the wallet immediately. Comments explicitly describe a temporary test implementation before gateway integration.
- Impact / principle: a simulated credit can be mistaken for verified payment; truthful status and financial error prevention. No charge was executed.
- Correction: verified settlement, pending/failure handling and truthful environment labels before offering a real online-payment journey.
- Check: in an approved payment sandbox, only verified settlement may produce success; failed/pending attempts must not appear paid.

**Exact source locators:** [frontend/src/pages/Dashboard/MyWallet.jsx:28](../../frontend/src/pages/Dashboard/MyWallet.jsx#L28); [backend/financial/views.py:50](../../backend/financial/views.py#L50).

## F17

**Automatic wallet-deduction promise contradicts registration behavior** — Financial UX; High; P1; CONFIRMED; effort Medium.

- Scope: homepage savings explanation and trip registration/payment journey.
- Evidence: `Home.jsx` promises automatic deduction at registration; `backend/trips/serializers.py` creates full remaining cost with no deduction; `Dashboard/MyTrips.jsx` provides separate manual wallet payment.
- Impact / principle: a member may assume a trip is paid although it remains unpaid; truthful expectations and error prevention.
- Correction: align the explanation with the intended payment model; show explicit post-registration payment state and next step.
- Check: register in a sandbox with a funded wallet and compare balance/payment state to the preceding promise.

**Exact source locators:** [frontend/src/pages/Home/Home.jsx:546](../../frontend/src/pages/Home/Home.jsx#L546); [backend/trips/serializers.py:58](../../backend/trips/serializers.py#L58).

## F18

**Order success lacks a durable receipt or recovery destination** — Checkout/recovery; High; P1; CONFIRMED; effort Large.

- Scope: successful product orders.
- Evidence: `ProductDetail.jsx` discards the order response and shows a generic string; order fields/submit remain. App has no order-history/detail route, although `backend/shop/views.py` defines MyOrdersView and OrderDetailView.
- Impact / principle: buyers cannot recover a reference/status from the frontend and may submit again; closure and error prevention.
- Correction: durable order receipt/reference, totals and fulfillment/payment status, reachable history and retry protection.
- Check: make one approved sandbox order, revisit it and attempt a repeat click/retry without creating an unintended duplicate.

**Exact source locators:** [frontend/src/pages/Shop/ProductDetail.jsx:36](../../frontend/src/pages/Shop/ProductDetail.jsx#L36); [backend/shop/views.py:55](../../backend/shop/views.py#L55).

## F19

**Replies/comments lack pending guards** — Submission feedback; Medium; P2; CONFIRMED; effort Small.

- Scope: MyTickets replies; ArticleDetail comments, replies and reactions.
- Evidence: `MyTickets.jsx`, `ArticleDetail.jsx`: async writes have no submitting guard or disabled pending action. Ticket creation does have loading feedback and is excluded.
- Impact / principle: rapid activation can send duplicate messages and gives weak request feedback; visibility and error prevention.
- Correction: per-action pending/disabled state and safe retry/idempotency where needed.
- Check: delay a fixture response and activate twice; one intended submission and visible pending feedback should result.

**Exact source locators:** [frontend/src/pages/Dashboard/MyTickets.jsx:36](../../frontend/src/pages/Dashboard/MyTickets.jsx#L36); [frontend/src/pages/Content/ArticleDetail.jsx:58](../../frontend/src/pages/Content/ArticleDetail.jsx#L58).

## F20

**Trip changes retain acceptance of previous conditions** — Error prevention; High; P1; CONFIRMED; effort Small.

- Scope: selecting a second trip after agreeing to the first.
- Evidence: `TripRegister.jsx–117`: selection changes selectedTrip only; agreed is not reset.
- Impact / principle: acceptance can apply to terms the member has not accepted for the newly selected trip; informed action.
- Correction: reset acceptance when trip/terms change and bind it to the relevant trip/version.
- Check: choose A, agree, choose B with different terms; submission must require new acceptance.

**Exact source locators:** [frontend/src/pages/Dashboard/TripRegister.jsx:85](../../frontend/src/pages/Dashboard/TripRegister.jsx#L85); [frontend/src/pages/Dashboard/TripRegister.jsx:13](../../frontend/src/pages/Dashboard/TripRegister.jsx#L13).

## F21

**Saved passport expiry is not initialized in the member form** — Data fidelity; Medium; P2; CONFIRMED; effort Small.

- Scope: profile with existing passport_expiry.
- Evidence: `Profile.jsx` omits passport_expiry from formData; `:137` renders that field. The backend model and admin view include the persisted value.
- Impact / principle: users see a blank expiry instead of the saved date and may re-enter or overwrite it; recognition and data fidelity.
- Correction: initialize every displayed persisted field with explicit empty handling.
- Check: open a fixture profile with a known expiry; verify the initial value before editing.

**Exact source locators:** [frontend/src/pages/Dashboard/Profile.jsx:9](../../frontend/src/pages/Dashboard/Profile.jsx#L9); [frontend/src/pages/Dashboard/Profile.jsx:137](../../frontend/src/pages/Dashboard/Profile.jsx#L137).

## F22

**Login has no forgotten-password recovery path** — Account recovery; High; P1; CONFIRMED; effort Large.

- Scope: members unable to recall a password.
- Evidence: full Login component and App routes contain no recovery action/route; `backend/accounts/urls.py` has change-password but no signed-out recovery route. ChangePasswordSerializer requires the old password.
- Impact / principle: the login journey provides no explicit way back to trips/wallet; recovery and user control. Whether an external assisted process exists is unknown.
- Correction: secure recovery journey or a clear working assisted-recovery contact from login.
- Check: a signed-out member without the password must be able to find a documented recovery path.

**Exact source locators:** [frontend/src/pages/Auth/Login.jsx:71](../../frontend/src/pages/Auth/Login.jsx#L71); [backend/accounts/serializers.py:30](../../backend/accounts/serializers.py#L30).

## F23

**Unknown URLs have no helpful recovery page** — Navigation/errors; Medium; P2; CONFIRMED; effort Small.

- Scope: non-matching frontend URLs.
- Evidence: `frontend/src/App.jsx` route tree has no catch-all/not-found route.
- Impact / principle: outdated/mistyped links produce no purposeful recovery view; error recovery.
- Correction: Persian not-found page with relevant working destinations and clear distinction from permission errors.
- Check: open a non-matching URL directly; verify useful explanation and navigation.

**Exact source locators:** [frontend/src/App.jsx:144](../../frontend/src/App.jsx#L144).

## F24

**Page titles do not identify individual tasks/content** — Orientation; Medium; P2; CONFIRMED; effort Small.

- Scope: all routes.
- Evidence: `frontend/index.html` sets the organization title; a source search found no document.title or per-route title infrastructure.
- Impact / principle: browser tabs/history do not distinguish login, wallet and articles; WCAG 2.4.2 A risk, pending page-context validation.
- Correction: task/content-specific title plus organization suffix, including error/loading handling.
- Check: inspect titles for login, tracking, wallet and content details; each should identify its purpose.

**Exact source locators:** [frontend/index.html:7](../../frontend/index.html#L7); [frontend/src/App.jsx:90](../../frontend/src/App.jsx#L90).

## F25

**Filter, tab and disclosure state is visual-only** — Accessibility/state; Medium; P2; CONFIRMED; effort Medium.

- Scope: article/shop filters, admin user-detail tabs, public navigation disclosure and registration menus.
- Evidence: `Articles.jsx`, `Shop.jsx`, `AdminUserDetail.jsx` aud-tabs, Navbar's menu button and AdminRegistrations art-menu-btn use active classes/open content without pressed/selected/expanded state. ThemeToggle is a positive exception.
- Impact / principle: assistive technology users cannot reliably identify the active option or disclosure state; WCAG 4.1.2 A.
- Correction: pressed filters, correct tab semantics for actual tab panels, expanded/controlled disclosure states. Do not add tab roles to every filter.
- Check: inspect the accessible state before and after each activation.

**Exact source locators:** [frontend/src/pages/Content/Articles.jsx:44](../../frontend/src/pages/Content/Articles.jsx#L44); [frontend/src/pages/Admin/AdminUserDetail.jsx:364](../../frontend/src/pages/Admin/AdminUserDetail.jsx#L364); [frontend/src/components/Navbar.jsx:86](../../frontend/src/components/Navbar.jsx#L86).

## F26

**Social destinations are placeholder links** — Navigation/trust; Medium; P2; CONFIRMED; effort Small.

- Scope: three footer social controls.
- Evidence: `frontend/src/components/Footer.jsx`: named channels all use href="#".
- Impact / principle: visitors seeking communication receive no named destination; information scent and trust.
- Correction: verified official destinations or removal of inactive actions; optionally make useful phone contacts callable.
- Check: activate every channel and verify the expected official destination.

**Exact source locators:** [frontend/src/components/Footer.jsx:48](../../frontend/src/components/Footer.jsx#L48).

## F27

**Admin navigation does not reflect granular permissions** — Navigation/permissions; Medium; P2; CONFIRMED; effort Medium.

- Scope: restricted administrators and user-detail financial tab.
- Evidence: AdminLayout maps all menuItems for all admins; `backend/accounts/permissions.py` enforces per-domain HasAdminPermission; AdminUserDetail fetches `/financial/admin/report/` regardless of financial permission.
- Impact / principle: users are invited into unavailable tasks; F09 can disguise permission failure as empty content. Consistency and error prevention; this is not a claim that backend authorization is bypassed.
- Correction: permission-aware task exposure, explicit denied deep links and retained backend checks.
- Check: financial-only/content-only fixtures should expose relevant tasks and explain denied direct URLs.

**Exact source locators:** [frontend/src/layouts/AdminLayout.jsx:99](../../frontend/src/layouts/AdminLayout.jsx#L99); [backend/accounts/permissions.py:24](../../backend/accounts/permissions.py#L24).

## F28

**Internal developer dialogue appears in product errors** — Content/identity; Medium; P2; CONFIRMED; effort Small.

- Scope: expense/campaign save failures and admin sidebar note.
- Evidence: AdminExpenses/AdminContributions catch messages ask whether model field names differ and ask the operator to tell the developer; AdminLayout says implemented user/content sections will be added later.
- Impact / principle: operators receive no useful correction and the product appears unfinished; useful recovery language and coherence.
- Correction: specific operator-facing errors, field guidance and support reference; remove stale feature notes.
- Check: fixture validation failure must explain a recovery action without implementation conversation.

**Exact source locators:** [frontend/src/pages/Admin/AdminExpenses.jsx:61](../../frontend/src/pages/Admin/AdminExpenses.jsx#L61); [frontend/src/layouts/AdminLayout.jsx:114](../../frontend/src/layouts/AdminLayout.jsx#L114).

## F29

**Document review lacks a member collection path in this frontend** — Journey completeness; Medium; P2; CONFIRMED; effort Large.

- Scope: portrait, national/student card and passport documents reviewed by administrators.
- Evidence: AdminUserDetail DOCUMENT_FIELDS/DocumentsPanel shows uploaded/missing documents; the complete member Profile has no file input/upload link and sends plain formData. No member document route appears in App.
- Impact / principle: members cannot supply these documents through the inspected interface. Whether collection intentionally occurs elsewhere requires confirmation; end-to-end task completeness.
- Correction: confirm intended collection; provide an accessible upload/review/correction journey or explain the external process clearly.
- Check: trace each document administrators expect to a visible member collection instruction and status/recovery path.

**Exact source locators:** [frontend/src/pages/Admin/AdminUserDetail.jsx:78](../../frontend/src/pages/Admin/AdminUserDetail.jsx#L78); [frontend/src/pages/Dashboard/Profile.jsx:84](../../frontend/src/pages/Dashboard/Profile.jsx#L84).

## F30

**Text token pairs indicate contrast failures requiring rendered confirmation** — Visual/accessibility; High; P1; LIKELY; effort Medium.

- Scope: both themes' metadata/headings and fixed transaction colors.
- Evidence: standard sRGB luminance calculation on `frontend/src/index.css` gives dark #7b7267 on #0f2019 = 3.58:1; light #899892 on #FBFCFA = 2.93:1; #B49662 on #F5F8F6 = 2.63:1; #158F80 on #FBFCFA = 3.87:1. These are declared-color pairs, not sampled rendered pixels.
- Impact / principle: muted small text and some headings risk poor readability; WCAG 1.4.3 AA is not declared verified until actual size, weight, cascade and composed background are established.
- Correction: measure final combinations in both themes and adjust semantic foreground/background roles.
- Check: record computed sizes/weights, actual backgrounds and contrast for each role; translucent/gradient regions require composed-color measurement.

**Exact source locators:** [frontend/src/index.css:16](../../frontend/src/index.css#L16); [frontend/src/index.css:1136](../../frontend/src/index.css#L1136).

## F31

**Hardcoded pastels bypass semantic status tokens** — Design system/theme; Medium; P2; CONFIRMED; effort Medium.

- Scope: wallet/report transaction colors, authentication errors and admin stats.
- Evidence: `MyWallet.jsx`, `FinancialReportView.jsx`, Login/Register `.auth-message.error`, AdminDashboard cards use fixed light pastels despite theme-specific status tokens in index.css.
- Impact / principle: status emphasis does not consistently adapt to the theme; contrast impact is consolidated in F30. Semantic consistency.
- Correction: role-based theme tokens for transaction and feedback text/backgrounds.
- Check: inspect the same status across wallet, reports and forms in both themes.

**Exact source locators:** [frontend/src/pages/Dashboard/MyWallet.jsx:50](../../frontend/src/pages/Dashboard/MyWallet.jsx#L50); [frontend/src/components/FinancialReportView.jsx:2](../../frontend/src/components/FinancialReportView.jsx#L2).

## F32

**Shared control styles are duplicated and broadly overridden** — Design system; Low; P3; CONFIRMED; effort Medium.

- Scope: authentication fields/cards/buttons, page-specific admin controls and global mobile buttons.
- Evidence: Login and Register independently repeat .auth-* definitions; admin pages repeat action/input CSS; index.css has successive mobile .btn overrides reaching 8.5px.
- Impact / principle: fixes require repeated changes and controls drift between contexts; mobile readability is separately tracked in F33. Reusable state/variant contracts.
- Correction: document common variants and scoped responsive behavior before a later authorized consolidation; do not refactor as part of this audit.
- Check: compare default/hover/focus/pressed/disabled/loading/error states against one agreed matrix.

**Exact source locators:** [frontend/src/pages/Auth/Login.jsx:166](../../frontend/src/pages/Auth/Login.jsx#L166); [frontend/src/pages/Auth/Register.jsx:239](../../frontend/src/pages/Auth/Register.jsx#L239).

## F33

**Mobile overrides shrink action and descriptive text to 8–9px** — Typography/responsive; Medium; P2; CONFIRMED; effort Medium.

- Scope: hero copy and generic .btn at <=560px and <=380px.
- Evidence: index.css narrow-screen rules set .slide-desc to 8–8.5px, .btn to 8.5–9px and .btn-sm to 8.5px. Source values are verified; computed browser sizes are untested.
- Impact / principle: essential labels become difficult to scan/read on phones. Readability/mobile ergonomics; WCAG does not set a universal minimum font size, so this is not an automatic AA violation.
- Correction: wrap/recompose content and reduce decorative density before shrinking essential text.
- Check: inspect 360/390px computed styles and readability; repeat with enlarged text.

**Exact source locators:** [frontend/src/index.css:988](../../frontend/src/index.css#L988); [frontend/src/index.css:978](../../frontend/src/index.css#L978).

## F34

**Reduced-motion CSS does not govern JavaScript effects** — Motion; Medium; P2; CONFIRMED; effort Medium.

- Scope: custom cursor, homepage tilt and numeric animation.
- Evidence: index.css disables CSS animation/transition under prefers-reduced-motion; Home handleTilt and counter requestAnimationFrame plus CustomCursor/MainLayout cursor loops never inspect that preference.
- Impact / principle: users requesting reduced motion still receive JavaScript movement; user control. No automatic AA failure is asserted. Rotation is consolidated in F07.
- Correction: honor the preference in JS and use stable non-motion feedback.
- Check: enable reduced motion before load and during a session; test tilt/cursor/counters separately from rotation.

**Exact source locators:** [frontend/src/index.css:855](../../frontend/src/index.css#L855); [frontend/src/pages/Home/Home.jsx:235](../../frontend/src/pages/Home/Home.jsx#L235); [frontend/src/components/CustomCursor.jsx:33](../../frontend/src/components/CustomCursor.jsx#L33).

## F35

**Recent-registration data has visual columns without table relationships** — Accessibility/data; Medium; P2; CONFIRMED; effort Small.

- Scope: admin dashboard recent registrations.
- Evidence: AdminDashboard `.adb-table-head`/`.adb-table-row` are divs with spans, without table semantics or equivalent associations. Full user/registration tables are positive counterexamples.
- Impact / principle: screen reader users cannot navigate the values by named column; WCAG 1.3.1 A.
- Correction: native table and headers, or explicitly labeled structured list if cards are intended.
- Check: verify user/trip/status relationships using assistive technology.

**Exact source locators:** [frontend/src/pages/Admin/AdminDashboard.jsx:85](../../frontend/src/pages/Admin/AdminDashboard.jsx#L85).

## F36

**Profile helper identity likely replaces fields during typing** — Frontend interaction; High; P1; LIKELY; effort Small.

- Scope: all member profile fields/calendar state.
- Evidence: `Profile.jsx` defines Section and Field component functions inside Profile and renders them as JSX; state updates recreate component identities. React reconciliation is expected to remount those subtrees; no runtime reproduction was available.
- Impact / principle: typing may lose focus/caret on each character; date popup state may reset. Stable component identity and uninterrupted input.
- Correction: stabilize component identities and verify focus before cosmetic changes.
- Check: type a full name without re-focusing; compare input DOM identity and activeElement across keystrokes in a runnable app.

**Exact source locators:** [frontend/src/pages/Dashboard/Profile.jsx:47](../../frontend/src/pages/Dashboard/Profile.jsx#L47); [frontend/src/pages/Dashboard/Profile.jsx:54](../../frontend/src/pages/Dashboard/Profile.jsx#L54).

## F37

**Financial metadata may exceed narrow viewports** — Responsive; Medium; P2; LIKELY; effort Medium.

- Scope: member/admin FinancialReportView with long descriptions/large amounts or zoom.
- Evidence: `.fr-row-left` is an unshrinkable flex group containing amount/status/date; rows have no mobile stacking override. Global overflow-x:hidden can mask overflow.
- Impact / principle: financial values may be clipped or unreadable; WCAG 1.4.10 AA risk, untested.
- Correction: wrap/stack metadata while keeping amounts and currency together where useful.
- Check: long Persian strings, large amounts and 200%/400% zoom at 360,390,768px; all information must remain reachable.

**Exact source locators:** [frontend/src/components/FinancialReportView.jsx:113](../../frontend/src/components/FinancialReportView.jsx#L113).

## F38

**Centered overlays may exceed short landscape screens** — Responsive/overlays; Medium; P2; LIKELY; effort Medium.

- Scope: public lightbox and registration modals.
- Evidence: Gallery `.gl-lightbox` and AdminRegistrations `.art-modal-backdrop` center content in a fixed viewport without explicit height containment/scrolling; images size by width.
- Impact / principle: dismiss/submit controls may leave the reachable viewport on short screens; reflow and user control risk.
- Correction: dynamic-viewport height constraints and intentional scrolling with reachable dismissal.
- Check: tall images/expanded lists at 844x390 and 1024x768; every control must remain reachable.

**Exact source locators:** [frontend/src/pages/Gallery/Gallery.jsx:91](../../frontend/src/pages/Gallery/Gallery.jsx#L91); [frontend/src/pages/Admin/AdminRegistrations.jsx:740](../../frontend/src/pages/Admin/AdminRegistrations.jsx#L740).

## F39

**Competing effects may weaken product-specific hierarchy** — Visual identity; Low; P3; NEEDS VALIDATION; effort Medium.

- Scope: public and authentication surfaces.
- Evidence: MainLayout renders particles/orbs/cursor/reveals; Home adds tilt/counters; CSS adds glows, gradients and patterns. Persian text, local logo and shrine imagery establish relevant identity cues. No rendered composition was inspected.
- Impact / principle: competing emphasis could reduce clarity, but effects alone are not defects. Gestalt figure/ground and intentional visual identity.
- Correction: review actual hierarchy with representative visitors; retain effects that support recognition or comprehension. Do not replace the visual system with another template.
- Check: rendered critique and task sessions; compare understanding/attention before proposing changes. No claim of AI authorship is made.

**Exact source locators:** [frontend/src/layouts/MainLayout.jsx:170](../../frontend/src/layouts/MainLayout.jsx#L170); [frontend/src/pages/Home/Home.jsx:227](../../frontend/src/pages/Home/Home.jsx#L227).

## F40

**Public articles may be hard to discover** — Information architecture; Medium; P2; NEEDS VALIDATION; effort Small.

- Scope: public article discovery from home and persistent navigation.
- Evidence: /articles exists but is absent from Navbar navItems and MainLayout bottomNavItems; contextual/footer links may compensate.
- Impact / principle: visitors may overlook community writing; priority and actual findability are unknown. Recognition over recall; Hick-Hyman choice structure.
- Correction: validate task priority and discovery paths before adding navigation choices.
- Check: ask representative visitors to find community writing from home on mobile/desktop; record successful paths and effort.

**Exact source locators:** [frontend/src/components/Navbar.jsx:19](../../frontend/src/components/Navbar.jsx#L19); [frontend/src/layouts/MainLayout.jsx:136](../../frontend/src/layouts/MainLayout.jsx#L136).

## F41

**Sensitive profile completion needs purpose/comprehension research** — Human-centered UX; Medium; P2; NEEDS VALIDATION; effort Medium.

- Scope: identity, health, passport and emergency-contact form sections.
- Evidence: Profile groups these data fields but offers little visible explanation of purpose or completion sufficiency. No analytics, research or required-data brief was available.
- Impact / principle: possible hesitation/abandonment, not observed user behavior. Trust, cognitive load and progressive disclosure; no legal compliance claim.
- Correction: validate necessary information and explain purpose/optional status; consider completion guidance after requirements are confirmed.
- Check: consent-aware usability sessions identify unclear purpose and unnecessary effort without assuming demographics or policies.

**Exact source locators:** [frontend/src/pages/Dashboard/Profile.jsx:141](../../frontend/src/pages/Dashboard/Profile.jsx#L141).

## F42

**Campaign creation/progress conflicts with backend schema** — Forms/integration; High; P1; CONFIRMED; effort Medium.

- Scope: AdminContributions create/edit and progress display.
- Evidence: frontend emptyForm/payload omits share_count/share_amount/start_date/end_date required by `backend/financial/models.py`. The admin serializer redefined in `backend/financial/views.py` exposes model fields only, omitting computed progress_percent/collected_amount. UI reads current_amount/raised_amount fallback, neither of which is the model property.
- Impact / principle: campaign creation is expected to fail validation; funded campaigns can display zero progress. Contract fidelity and truthful feedback; source-confirmed integration defect, not a live submission result.
- Correction: align form and serializer contracts, expose authoritative progress and actionable required-field errors; remove unsupported description assumptions.
- Check: schema fixture with required fields/nonzero payments; valid creation and matching progress must be demonstrable.

**Exact source locators:** [frontend/src/pages/Admin/AdminContributions.jsx:4](../../frontend/src/pages/Admin/AdminContributions.jsx#L4); [frontend/src/pages/Admin/AdminContributions.jsx:141](../../frontend/src/pages/Admin/AdminContributions.jsx#L141); [backend/financial/models.py:79](../../backend/financial/models.py#L79); [backend/financial/views.py:215](../../backend/financial/views.py#L215).

## F43

**Column chooser offers permanently placeholder values** — Data clarity; Medium; P2; CONFIRMED; effort Small.

- Scope: registration table payment_number, credit and pilgrim_id columns when enabled.
- Evidence: AdminRegistrations corresponding `col(...)` cells unconditionally render a dash rather than row data.
- Impact / principle: unavailable implementation can be mistaken for genuinely missing financial/identity data; truthful representation.
- Correction: bind supported fields or remove/explicitly label unavailable columns; distinguish unknown from unimplemented.
- Check: enable each field with known fixture values; supported data must appear and unavailable data must be explained.

**Exact source locators:** [frontend/src/pages/Admin/AdminRegistrations.jsx:451](../../frontend/src/pages/Admin/AdminRegistrations.jsx#L451); [frontend/src/pages/Admin/AdminRegistrations.jsx:452](../../frontend/src/pages/Admin/AdminRegistrations.jsx#L452); [frontend/src/pages/Admin/AdminRegistrations.jsx:467](../../frontend/src/pages/Admin/AdminRegistrations.jsx#L467).

## F44

**Failed modal saves close and discard the draft** — Error recovery; High; P1; CONFIRMED; effort Small.

- Scope: admin registration rejection reasons and internal notes.
- Evidence: AdminRegistrations runAction catches errors without reporting failure to callers; submitReject/submitNote await it and clear modal state regardless of success.
- Impact / principle: an operator loses drafted content on validation/network failure; preserve user work and recover from errors.
- Correction: propagate operation success/failure; close only on success, retain draft and display an actionable error otherwise.
- Check: fail an isolated save, retain text/dialog, then retry successfully before closing.

**Exact source locators:** [frontend/src/pages/Admin/AdminRegistrations.jsx:153](../../frontend/src/pages/Admin/AdminRegistrations.jsx#L153); [frontend/src/pages/Admin/AdminRegistrations.jsx:179](../../frontend/src/pages/Admin/AdminRegistrations.jsx#L179); [frontend/src/pages/Admin/AdminRegistrations.jsx:184](../../frontend/src/pages/Admin/AdminRegistrations.jsx#L184).

## F45

**Inactive slides retain invisible focusable links** — Accessibility/carousel; High; P1; CONFIRMED; effort Medium.

- Scope: homepage carousel whenever multiple slides render.
- Evidence: Home maps every slide including its links; index.css `.slide` uses opacity:0/layering, with no hidden/inert or conditional focus treatment for inactive content.
- Impact / principle: keyboard users can encounter invisible actions and screen readers receive multiple apparently current slides; focus visibility/order risk under WCAG 2.4.7 AA and 2.4.3 A. Rendered traversal is untested.
- Correction: keep inactive slide content outside the focus/accessibility tree; identify the current slide and name its navigation controls.
- Check: pause the carousel and Tab through it; only visible slide actions should receive focus.

**Exact source locators:** [frontend/src/index.css:257](../../frontend/src/index.css#L257); [frontend/src/pages/Home/Home.jsx:247](../../frontend/src/pages/Home/Home.jsx#L247).
