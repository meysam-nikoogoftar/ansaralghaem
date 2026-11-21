# Responsive and interaction audit

2026-11-18 (Asia/Tehran). Source-only audit; no live tasks, rendered pages, interviews or analytics were tested. Proposed checks are future validation, not observed outcomes.

## Viewport coverage ledger

| Width / proposed height | Coverage | Source behavior to verify |
|---|---|---|
| 360x800 | Not rendered | <=380px overrides, 8px hero copy, small .btn, member/admin header fit |
| 390x844 | Not rendered | <=560px mobile hero/buttons, bottom navigation, closed/open drawers |
| 768x1024 | Not rendered | <=900px public/member navigation, two-column grids and form fit |
| 1024x768 | Not rendered | Full public/member navigation; admin breakpoint and table/overlay fit |
| 1440x900 | Not rendered | 1200px container, sidebar proportions, long text and pointer behavior |
| 1920x1080 | Not rendered | Maximum-width balance, image crop, reading measure and decorative density |
| 844x390 landscape | Not rendered | Image/dialog containment, focused controls and scrolling |
| 560/561, 380/381, 900/901, 700/701, 1024/1025 | Not rendered | Adjacent widths around declared global/component breakpoints |

Heights are proposed test dimensions, not requirements inferred from the source. No screenshot exists and no overflow, touch or landscape test is claimed.

## Source-supported responsive concerns

- [F33](10-master-findings.md#f33): mobile typography contracts aggressively shrink generic action labels and descriptions. This is the only confirmed narrow-screen visual declaration finding; its final computed appearance remains untested.
- [F06](10-master-findings.md#f06): transformed closed sidebars remain mounted/focusable. Open/close state must govern accessibility exposure as well as position.
- [F37](10-master-findings.md#f37): non-shrinking financial metadata needs a long-content/zoom test.
- [F38](10-master-findings.md#f38): fixed centered overlays need short-height containment/scroll checks.
- Global `body` receives 72px bottom padding even where no mobile bottom bar exists; public bottom navigation is shown below 900px. This may create unnecessary space on other shells, but was not promoted to a confirmed usability issue without rendering.
- Dashboard sticky sidebar assumes a 62px top offset; actual header height with long names must be measured. Do not claim overlap from the constant alone.
- `overflow-x:hidden` is pervasive. Measure scrollWidth and inspect clipped descendants rather than treating suppressed scrolling as proof of reflow.

## Interaction/state coverage

| Pattern | Source evidence | Remaining test |
|---|---|---|
| Desktop/mobile navigation | Buttons and drawers exist; [F04](10-master-findings.md#f04), [F06](10-master-findings.md#f06), [F25](10-master-findings.md#f25) | Keyboard, focus visibility, Escape, resizing while open, route return |
| Carousel/announcement | Intervals and dot/arrow controls; [F01](10-master-findings.md#f01), [F07](10-master-findings.md#f07), [F45](10-master-findings.md#f45) | Pause, focus, inactive content, pointer/touch, updates under slow loads |
| Forms | Controlled values, many required/busy states; [F03](10-master-findings.md#f03), [F08](10-master-findings.md#f08), [F10](10-master-findings.md#f10), [F21](10-master-findings.md#f21), [F36](10-master-findings.md#f36) | Autofill, numeric localization, validation, caret/focus, error/success announcements |
| Modal/lightbox/menu | Visible cancel/close/backdrop; [F05](10-master-findings.md#f05), [F25](10-master-findings.md#f25), [F38](10-master-findings.md#f38), [F44](10-master-findings.md#f44) | Focus lifecycle, outside click, Escape, long content, pending/failure recovery |
| Content filters | Buttons trigger requests and visual active classes | Selected state, rapid request ordering, back-state restoration; race behavior remains unverified |
| Table toolbar/export | Filters, column chooser, scroll wrappers and export handler | Keyboard scroll, long values, permitted columns, export correctness; no export executed |
| Payment/order/refund | Source only; [F16](10-master-findings.md#f16), [F17](10-master-findings.md#f17), [F18](10-master-findings.md#f18), [F20](10-master-findings.md#f20), [F42](10-master-findings.md#f42) | Approved sandbox states, duplicates, review/correction, stable references |
| Motion | Reduced-motion CSS exists; JS exceptions in [F34](10-master-findings.md#f34) | Preference before/during load, counter/cursor/tilt/rotation behavior |

No hover-only discovery defect is inferred from CSS alone: gallery titles reveal on hover but have image alt text and an open preview; their keyboard operation defect is already F01. Actual touch discoverability still needs observation.

## Loading, empty, error and success

Lists often initialize as empty arrays. Some use loading booleans; some immediately show empty UI; many catches suppress failure ([F09](10-master-findings.md#f09)). Busy labels on create/save actions are an implemented strength. Inline outcomes require accessible announcements ([F08](10-master-findings.md#f08)), repeated replies need pending state ([F19](10-master-findings.md#f19)), and modal failure must retain drafts ([F44](10-master-findings.md#f44)). Real network latency, offline transitions and success states were not produced.

## Performance distinction

The source includes continuous cursor requestAnimationFrame, mouse-driven transforms, blur layers, scrolling state updates and image effects. These are profiling candidates, not measured performance failures. No LCP, CLS, INP, frame rate, bandwidth or bundle-size result is asserted. Do not optimize based solely on presence of blur or motion; profile an authorized running environment first.
