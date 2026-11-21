# Design system audit

2026-11-18 (Asia/Tehran). Source-only findings; no rendered visual assessment or application modification.

## Existing system

The interface has a partial shared system: global primitives and semantic-ish CSS variables, common public classes, shared shells, a date picker, theme selector and financial report. Most fields/actions/cards are implemented inside individual pages rather than a shared component layer. No external UI component library is declared. The right next step is to document actual contracts before choosing whether/how to consolidate them.

| Dimension | Observed implementation | Gap / recommendation |
|---|---|---|
| Core color | --bg, --bg-deep, --surface, --surface-2; teal/gold/crimson; ink/dim/faint | Role names mix palette and meaning; verify contrast per role ([F30](10-master-findings.md#f30)) |
| Semantic status | warn/ok/danger/neutral/info foreground and background tokens, theme-specific values | Hardcoded pastel typeColor/error/stats bypass mapping ([F31](10-master-findings.md#f31)) |
| Typography | --font-body Vazirmatn; --font-display Aref Ruqaa; global 1.7 line-height | Font sizes/weights are mostly literals; very small mobile action scale ([F33](10-master-findings.md#f33)) |
| Spacing | 24px container gutter and recurring 8/12/14/16/20/22/24/28/32px page declarations | No named spacing scale; individual values are not inherently wrong; document their purpose and consolidate only repeated roles |
| Radius | --radius-sm 10px, md 16px, lg 24px; many pills | Page literals 8/10/12px and 999px coexist. Establish semantic control/card/dialog roles instead of banning rounding |
| Elevation | Repeated per-page shadows; light theme adds --shadow-xs/sm/md/lg | Incomplete shared role coverage; verify actual hierarchy before assigning token values |
| Breakpoints | Global 380/560/900; some page-specific 700 and additional component rules | Record component-specific intent; test boundaries rather than enforcing one breakpoint everywhere |
| Icons | Inline SVGs in shells/actions, emoji in status/empty/contact/content roles | Mixed appearance is a review question; names/state must follow semantics ([F04](10-master-findings.md#f04), [F25](10-master-findings.md#f25)) |
| Motion | CSS transitions/keyframes, reduced-motion media query; JS intervals/tilt/cursors | No shared behavior policy; JS preference gaps ([F34](10-master-findings.md#f34)) and unpausable rotation ([F07](10-master-findings.md#f07)) |
| Layers | Public content z=2; sticky bars ~50; announcements 60; overlays 200; cursor 9999 | Document overlay/focus relationships; high z-index does not provide modal accessibility ([F05](10-master-findings.md#f05)) |

Evidence: [global stylesheet](../../frontend/src/index.css), [theme store](../../frontend/src/store/themeStore.js), [shared components](../../frontend/src/components), and per-page style tags identified in the master register.

## Inconsistent contracts with user impact

1. Fields share a look but not an accessible naming/error contract ([F03](10-master-findings.md#f03), [F08](10-master-findings.md#f08), [F10](10-master-findings.md#f10)). Reusable field documentation should cover ids, labels, hints, validity, messages, requiredness and focus.
2. Selection/disclosure state is usually CSS-only while ThemeToggle exposes aria-pressed ([F25](10-master-findings.md#f25)). Standardize semantics per interaction rather than indiscriminately adding tab roles.
3. Page-specific input/button/card CSS repeats substantially ([F32](10-master-findings.md#f32)); global mobile .btn overrides change every context ([F33](10-master-findings.md#f33)).
4. Financial transaction colors bypass status roles ([F31](10-master-findings.md#f31)); each theme needs verified foreground/background pairings ([F30](10-master-findings.md#f30)).
5. Light/dark switching changes more than color: the light stylesheet adds patterned sections/surfaces and adjustments. Verify layout and hierarchy in both themes, not just token substitutions.
6. Theme `auto` is based on local clock hours 06:00-19:00 rather than prefers-color-scheme. The clock icon supports this interpretation; whether users understand `auto` is untested. Document the actual behavior instead of claiming it follows the OS.

## Recommended contract documentation for later implementation

| Pattern | Required contract |
|---|---|
| Action | Primary/secondary/danger intent; default/hover/focus/pressed/disabled/pending; text and accessible name; responsive size |
| Field | Associated label; optional/required guidance; type/autofill; hint/error links; validity and retained input |
| Feedback | Loading vs empty vs denied vs failed vs success; announcement behavior and safe retry |
| Dialog | Name/role, trigger, focus entry/return, background behavior, dismissal and height/scroll rules |
| Navigation | Current location, expanded state, permissions, route-return and closed-drawer exposure |
| Table | Headers/relationships, meaningful missing values, column availability, long-value/keyboard scrolling |
| Financial display | Currency/unit, pending/settled meaning, transaction reference and source of balance/progress |
| Motion | When movement supports comprehension; preference handling in CSS and JS; pause/stop rules |

Do not refactor during this audit. This proposed documentation is scoped to the existing product; no replacement design system or palette has been generated.
