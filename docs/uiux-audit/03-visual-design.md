# Visual design

Audit date: 2026-11-18 (Asia/Tehran). Evidence is source-based unless explicitly stated. No rendered application, viewport, live API, screen-reader or persistent-data test was performed. Recommendations are documentation only.

## Evidence boundary

No screenshot or running UI was available. This report assesses declared visual rules and their consistency. It cannot confirm alignment, clipping, actual text wrapping, rendered font loading, perceived density or visual polish. Findings labelled LIKELY or NEEDS VALIDATION must not be treated as observed visual defects.

## Layout, composition and hierarchy

The public system uses a 1200px container with 24px gutters, a photographic carousel and sections for organization context, statistics, countdown, caravan, promotion, gallery/news and wallet/contribution material. About content has a two-column grid collapsing below 900px. Gallery/news/promotional grids have dedicated mobile arrangements. These show intentional responsive structure, but actual proportional balance is untested.

Member/admin tasks use their own shells, a 240px member sidebar, sticky top bars and narrower form/report panels. Native financial/registration tables have scroll wrappers. A common visual review must distinguish public persuasion/reading from member/admin task completion: decorative ambition should not obscure payment states, labels or operational feedback.

Investigate [F37](10-master-findings.md#f37), [F38](10-master-findings.md#f38) for financial rows and overlay containment. Do not call physical left/right declarations RTL defects without observing incorrect rendering. Global overflow hiding can conceal a problem; it does not prove one is fixed.

## Typography and Persian readability

Vazirmatn body text and Aref Ruqaa display text connect typography to the Persian subject matter. Global line-height is 1.7, with article/news prose around 2.1 and a 760px reading container. Several small metadata roles are 10-13px; the narrow-screen hero/global button overrides go as low as 8-9px ([F33](10-master-findings.md#f33)). This is a concrete readability concern; no universal WCAG minimum-font-size failure is inferred.

Review Persian joining/diacritics, paragraph measure, boldness, real font fallback and mixed Latin numbers/IDs in a browser. Letter spacing appears on some category/quote labels; determine its rendered effect before changing it. Test Persian/Arabic digits, phone numbers, ISO dates, tracking codes and long URLs without assuming their current presentation is broken.

## Color and surfaces

Dark tokens use deep green surfaces, teal emphasis and gold. Light mode adds pale green/cream section surfaces and patterned ornament. Semantic warning/success/danger/info roles have theme alternatives. The system therefore has an identifiable basis rather than arbitrary isolated colors.

[F30](10-master-findings.md#f30) records source-calculated contrast risks, not verified pixel measurements. The faint-text pairs are 3.58:1 on a dark surface and 2.93:1 on a light surface; some light gold/teal pairs also need attention. [F31](10-master-findings.md#f31) documents hardcoded pastels that bypass semantic light-theme roles. Test actual text backgrounds before assigning a verified contrast violation, especially on gradients, image overlays and translucent surfaces.

## Components and state hierarchy

- Buttons: recurring pill primary/secondary actions, repeated per-page implementations and broad mobile overrides ([F32](10-master-findings.md#f32), [F33](10-master-findings.md#f33)). A component contract should define semantic priority, error/danger and pending states, not just radius/color.
- Inputs: shared visual vocabulary but missing label relationships ([F03](10-master-findings.md#f03)), variable font/input type/autofill coverage and incomplete field error recovery ([F10](10-master-findings.md#f10)).
- Cards: repeated surfaces are useful for trips, submissions and financial groups. Their presence is not a defect. Check whether equal visual weight makes important actions hard to distinguish; this remains a hypothesis under [F39](10-master-findings.md#f39).
- Tables: main operations tables have native structure; admin recent registrations visually imitate one without semantics ([F35](10-master-findings.md#f35)). Placeholder-only columns misrepresent implementation availability ([F43](10-master-findings.md#f43)).
- Dialogs/menus: visible overlays and cancellation controls exist, but semantics/focus are incomplete ([F05](10-master-findings.md#f05), [F25](10-master-findings.md#f25)).
- Status/loading/empty: disabled busy submits are implemented in many flows. Failed loads and inline status feedback are the more consequential gaps ([F08](10-master-findings.md#f08), [F09](10-master-findings.md#f09)).

## Visual acceptance review still required

Inspect all six requested viewport widths in both themes, real long/empty/error records, portrait/landscape, 200% text and 400% zoom. Review alignment, line length, font loading, hover/focus/pressed states, stable card proportions, sticky overlaps and image cropping. No aesthetic score or prescribed replacement palette is justified by the current evidence.
