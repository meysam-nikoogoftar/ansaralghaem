# Prioritized improvement roadmap

2026-11-18 (Asia/Tehran). Source-only findings; no rendered visual assessment or application modification.

Implementation is not authorized by this report. Ordering below is a reviewable proposal; no dates, staffing capacity or traffic-frequency estimates were supplied. Small/Medium/Large are relative effort estimates. Work should be validated in a disposable environment because backend reads/writes can mutate real data.

## Priority model

- Critical: established essential-task prevention at severe scope; none assigned from the current evidence.
- High / P1: meaningful task, accessibility, trust or recovery impairment; address before broad visual polish.
- Medium / P2: recurring friction/data clarity/consistency; sequence by journey exposure.
- Low / P3: maintainability or unverified polish; avoid displacing task fixes.
- P0 is reserved for an evidenced urgent blocker; no live production incident was established.
- CONFIRMED identifies source defects, LIKELY requires runtime confirmation and NEEDS VALIDATION requires research. Do not merge those counts.

## Immediate fixes, once implementation is separately authorized

| Work package | Findings | Suggested owner | Acceptance evidence |
|---|---|---|---|
| Essential keyboard paths | [F01](10-master-findings.md#f01), [F02](10-master-findings.md#f02), [F04](10-master-findings.md#f04), [F06](10-master-findings.md#f06), [F45](10-master-findings.md#f45) | Frontend + accessibility | Keyboard-only trip/calendar/ticket/gallery operation; no invisible/off-screen focus |
| Dialog and feedback foundations | [F03](10-master-findings.md#f03), [F05](10-master-findings.md#f05), [F08](10-master-findings.md#f08), [F25](10-master-findings.md#f25) | Frontend + accessibility | Named fields/dialogs, exposed state, intentional focus and announcements |
| Financial truth and campaign contract | [F16](10-master-findings.md#f16), [F17](10-master-findings.md#f17), [F42](10-master-findings.md#f42) | Product + backend/frontend | Verified sandbox settlement, matching payment copy and valid schema/progress fixtures |
| Protect entered work | [F10](10-master-findings.md#f10), [F20](10-master-findings.md#f20), [F44](10-master-findings.md#f44) | Frontend + product | Field-level corrections, reset consent for changed terms, retained failed-save drafts |

Validate [F36](10-master-findings.md#f36) at the first available runtime session: likely profile remount/focus loss is a small-effort candidate with high impact. Confirm before presenting it as a reproduced issue.

## High-impact improvements

| Work package | Findings | Dependencies / acceptance |
|---|---|---|
| Resilient loading and honest availability | [F09](10-master-findings.md#f09), [F12](10-master-findings.md#f12), [F13](10-master-findings.md#f13), [F14](10-master-findings.md#f14) | Failure fixtures, bounded auth waiting, empty/error separation, event-based dates |
| Authentication continuity and recovery | [F11](10-master-findings.md#f11), [F22](10-master-findings.md#f22) | Product-approved recovery process; task return and permitted draft preservation |
| Durable purchase closure | [F18](10-master-findings.md#f18) | Order reference/status/history and duplicate-safe retry in approved sandbox |
| Pending/rotation control | [F07](10-master-findings.md#f07), [F19](10-master-findings.md#f19) | Pausable content and one-request-per-intended-submission behavior |
| Navigation/content truth | [F15](10-master-findings.md#f15), [F23](10-master-findings.md#f23), [F24](10-master-findings.md#f24), [F26](10-master-findings.md#f26), [F27](10-master-findings.md#f27), [F28](10-master-findings.md#f28), [F43](10-master-findings.md#f43) | Correct destinations/titles, meaningful errors, permission-aware access and real columns |
| Complete member data journeys | [F21](10-master-findings.md#f21), [F29](10-master-findings.md#f29) | Persisted date fixture; confirmed document collection requirements/process |

## Design system improvements

| Work package | Findings | Acceptance |
|---|---|---|
| Theme status roles | [F30](10-master-findings.md#f30), [F31](10-master-findings.md#f31) | Rendered contrast measurements in both themes, including error/disabled/focus contexts |
| Reusable controls and responsive type | [F32](10-master-findings.md#f32), [F33](10-master-findings.md#f33) | Documented variants/state matrix, readable mobile action labels, no broad accidental overrides |
| Motion preference behavior | [F34](10-master-findings.md#f34) | CSS and JS respect the preference with useful stable feedback |
| Structured operational data | [F35](10-master-findings.md#f35), [F37](10-master-findings.md#f37) | Semantic column relationships and financial rows that reflow with long content/zoom |
| Overlay containment | [F38](10-master-findings.md#f38) | Short landscape and enlarged-text dismissal/submission remain reachable |

## Long-term enhancements and research

Validate [F39](10-master-findings.md#f39), [F40](10-master-findings.md#f40), [F41](10-master-findings.md#f41) with actual visitors before choosing identity changes, expanding navigation or restructuring sensitive-profile completion. Revisit assumptions about document collection and charitable participation with product owners. Consider long-list scale/performance only after realistic record volumes and profiling establish a need.

## Complete planning register

| ID | Priority | Severity | Confidence | Effort | Finding |
|---|---|---|---|---|---|
| [F01](10-master-findings.md#f01) | P1 | High | CONFIRMED | Medium | Mouse-only essential choices and previews |
| [F02](10-master-findings.md#f02) | P1 | High | CONFIRMED | Medium | Jalali calendar cannot be opened with a keyboard |
| [F03](10-master-findings.md#f03) | P1 | High | CONFIRMED | Medium | Visible field labels lack programmatic associations |
| [F04](10-master-findings.md#f04) | P1 | High | CONFIRMED | Small | Sidebar toggles are unnamed |
| [F05](10-master-findings.md#f05) | P1 | High | CONFIRMED | Medium | Custom overlays omit dialog semantics and focus management |
| [F06](10-master-findings.md#f06) | P1 | High | CONFIRMED | Medium | Closed off-canvas navigation remains focusable |
| [F07](10-master-findings.md#f07) | P1 | High | CONFIRMED | Medium | Automatic content rotation cannot be paused |
| [F08](10-master-findings.md#f08) | P1 | High | CONFIRMED | Medium | Inline outcomes have no announcement mechanism |
| [F09](10-master-findings.md#f09) | P1 | High | CONFIRMED | Medium | Failed requests masquerade as empty data or unexplained redirects |
| [F10](10-master-findings.md#f10) | P1 | High | CONFIRMED | Medium | Server validation loses actionable field context |
| [F11](10-master-findings.md#f11) | P1 | High | CONFIRMED | Medium | Login loses the intended destination and drafts |
| [F12](10-master-findings.md#f12) | P1 | High | CONFIRMED | Medium | A stalled profile check can gate public content indefinitely |
| [F13](10-master-findings.md#f13) | P1 | High | CONFIRMED | Medium | Unlabeled sample content substitutes for unavailable live information |
| [F16](10-master-findings.md#f16) | P1 | High | CONFIRMED | Large | “Online payment” currently invokes a test wallet credit |
| [F17](10-master-findings.md#f17) | P1 | High | CONFIRMED | Medium | Automatic wallet-deduction promise contradicts registration behavior |
| [F18](10-master-findings.md#f18) | P1 | High | CONFIRMED | Large | Order success lacks a durable receipt or recovery destination |
| [F20](10-master-findings.md#f20) | P1 | High | CONFIRMED | Small | Trip changes retain acceptance of previous conditions |
| [F22](10-master-findings.md#f22) | P1 | High | CONFIRMED | Large | Login has no forgotten-password recovery path |
| [F30](10-master-findings.md#f30) | P1 | High | LIKELY | Medium | Text token pairs indicate contrast failures requiring rendered confirmation |
| [F36](10-master-findings.md#f36) | P1 | High | LIKELY | Small | Profile helper identity likely replaces fields during typing |
| [F42](10-master-findings.md#f42) | P1 | High | CONFIRMED | Medium | Campaign creation/progress conflicts with backend schema |
| [F44](10-master-findings.md#f44) | P1 | High | CONFIRMED | Small | Failed modal saves close and discard the draft |
| [F45](10-master-findings.md#f45) | P1 | High | CONFIRMED | Medium | Inactive slides retain invisible focusable links |
| [F14](10-master-findings.md#f14) | P2 | Medium | CONFIRMED | Small | Countdown is disconnected from the displayed trip |
| [F15](10-master-findings.md#f15) | P2 | Medium | CONFIRMED | Small | Named actions lead to unrelated destinations |
| [F19](10-master-findings.md#f19) | P2 | Medium | CONFIRMED | Small | Replies/comments lack pending guards |
| [F21](10-master-findings.md#f21) | P2 | Medium | CONFIRMED | Small | Saved passport expiry is not initialized in the member form |
| [F23](10-master-findings.md#f23) | P2 | Medium | CONFIRMED | Small | Unknown URLs have no helpful recovery page |
| [F24](10-master-findings.md#f24) | P2 | Medium | CONFIRMED | Small | Page titles do not identify individual tasks/content |
| [F25](10-master-findings.md#f25) | P2 | Medium | CONFIRMED | Medium | Filter, tab and disclosure state is visual-only |
| [F26](10-master-findings.md#f26) | P2 | Medium | CONFIRMED | Small | Social destinations are placeholder links |
| [F27](10-master-findings.md#f27) | P2 | Medium | CONFIRMED | Medium | Admin navigation does not reflect granular permissions |
| [F28](10-master-findings.md#f28) | P2 | Medium | CONFIRMED | Small | Internal developer dialogue appears in product errors |
| [F29](10-master-findings.md#f29) | P2 | Medium | CONFIRMED | Large | Document review lacks a member collection path in this frontend |
| [F31](10-master-findings.md#f31) | P2 | Medium | CONFIRMED | Medium | Hardcoded pastels bypass semantic status tokens |
| [F33](10-master-findings.md#f33) | P2 | Medium | CONFIRMED | Medium | Mobile overrides shrink action and descriptive text to 8–9px |
| [F34](10-master-findings.md#f34) | P2 | Medium | CONFIRMED | Medium | Reduced-motion CSS does not govern JavaScript effects |
| [F35](10-master-findings.md#f35) | P2 | Medium | CONFIRMED | Small | Recent-registration data has visual columns without table relationships |
| [F37](10-master-findings.md#f37) | P2 | Medium | LIKELY | Medium | Financial metadata may exceed narrow viewports |
| [F38](10-master-findings.md#f38) | P2 | Medium | LIKELY | Medium | Centered overlays may exceed short landscape screens |
| [F40](10-master-findings.md#f40) | P2 | Medium | NEEDS VALIDATION | Small | Public articles may be hard to discover |
| [F41](10-master-findings.md#f41) | P2 | Medium | NEEDS VALIDATION | Medium | Sensitive profile completion needs purpose/comprehension research |
| [F43](10-master-findings.md#f43) | P2 | Medium | CONFIRMED | Small | Column chooser offers permanently placeholder values |
| [F32](10-master-findings.md#f32) | P3 | Low | CONFIRMED | Medium | Shared control styles are duplicated and broadly overridden |
| [F39](10-master-findings.md#f39) | P3 | Low | NEEDS VALIDATION | Medium | Competing effects may weaken product-specific hierarchy |

## Future validation gate

1. Supply an already runnable environment or separately authorize environment preparation. Do not install dependencies under this audit's existing rules.
2. Use a disposable backend/data fixture, sanctioned member/restricted-admin/superadmin identities and payment-provider sandbox. Prevent analytics/view-count and lazy wallet creation from touching live data.
3. Inspect all six requested widths, adjacent breakpoint widths, portrait/landscape, both themes, reduced motion, keyboard, screen reader, 200% text and 400% zoom.
4. Exercise loading/empty/error/success/validation, long Persian text, mixed digits/URLs, dialogs/menus, sticky/fixed elements and back/return navigation.
5. Run an already available accessibility engine and manual checks; do not equate an automated pass with full conformance.
6. Re-audit the relevant findings; record evidence before changing confidence or closing an issue. Visual polish is last, after task and feedback foundations.

## Audit execution and verification ledger

- Consulted the actual three requested skills, with a shared evaluation rather than three duplicate audits. No subagents were spawned; multidisciplinary roles were evaluation perspectives.
- Inspected 31 page modules/route patterns, seven shared components and three layouts. Browser-rendered routes and screenshots: zero.
- Reviewed source/configuration, selected Django contracts and W3C/NNGroup primary references; ran two UI UX Pro Max UX searches with Python -B and no persistence. The modal search returned focus guidance including an AAA item; it was not mistaken for an AA modal test result.
- Did not start frontend/backend, install/update packages, run a build, run formatters or tests that could write caches/files/data, create branches/commits, seed data, submit forms or call application APIs. No environment/configuration changes were made.
- Initial pre-existing git state: deleted html/test.html; untracked .agents/ and skills-lock.json. These were neither reverted nor overwritten.
- A long report-generation command was rejected by the Windows process-length limit before a process launched. Documentation was then generated through supported file editing and shorter commands; no application action was involved.
- Final report/link/count/integrity checks follow below. Integrity hashes were captured after read-only discovery and before documentation writes; git status was also observed at the beginning. This does not retroactively claim an initial hash snapshot.

### Final verification results

- Ten requested Markdown reports exist under docs/uiux-audit/; no other audit artifact was created.
- The route inventory contains 31 distinct route-pattern entries. The component inventory contains seven shared modules and three layouts.
- Master register: 45 unique IDs; 38 CONFIRMED, four LIKELY, three NEEDS VALIDATION. Confirmed severity: 21 High, 16 Medium, one Low, zero Critical.
- Ninety-three exact source locators were resolved against existing source content. Internal file and finding-anchor links were checked.
- All 224 hashed existing frontend/backend/root files were unchanged after documentation generation; no additions were found in those scanned areas. Git tracked diff remains the pre-existing html/test.html deletion. The new untracked documentation comprises only the ten requested Markdown reports.
- These results validate documentation integrity and read-only behavior, not application functionality. Browser, automated a11y, screen-reader, viewport and transaction tests remain unperformed.
