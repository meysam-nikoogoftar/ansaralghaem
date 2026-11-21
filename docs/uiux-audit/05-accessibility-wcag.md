# WCAG 2.2 AA accessibility audit

2026-11-18 (Asia/Tehran). Source-only audit; no live tasks, rendered pages, interviews or analytics were tested. Proposed checks are future validation, not observed outcomes.

## Standard and confidence

Reference: [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/). This is an implementation review against A/AA expectations, **not a conformance determination**. No automated browser scan, accessibility-tree inspection, screen reader, real keyboard traversal, text-resize or zoom test ran. No accessibility dependencies were installed.

CONFIRMED findings establish code defects or missing mechanisms. Where final DOM, computed style or user-agent behavior matters, the related criterion remains a risk until reproduced. Source-level keyboard/relationship/name failures below are stronger evidence than visual hypotheses; neither establishes full-page/process compliance.

## Source-verified accessibility findings

Reproduction and correction details are also in each linked master finding. The following steps have not been executed.

| Finding | Criterion / level | Affected element | Impact and source evidence | Reproduction / recommended correction |
|---|---|---|---|---|
| [F01](10-master-findings.md#f01) | 2.1.1 / A | Trip option, ticket row, gallery preview, slide dot | Div click handlers omit keyboard operation | Tab/activate populated choices; replace with native controls |
| [F02](10-master-findings.md#f02) | 2.1.1 / A | Date input opener | readOnly input has only click behavior | Open and select with keys; provide a named operable trigger |
| [F03](10-master-findings.md#f03) | 1.3.1 / A; 4.1.2 / A for unnamed fields | Sibling field labels and unlabeled fields | No label association; context lost | Inspect name/label focus; associate stable ids and labels |
| [F04](10-master-findings.md#f04) | 4.1.2 / A | Sidebar buttons | SVG-only unnamed button | Inspect name/state; supply action name and expanded/controlled state |
| [F05](10-master-findings.md#f05) | 4.1.2 / A | Custom dialog overlays | No dialog role/name | Inspect role/name; use an accessible dialog pattern; verify focus separately |
| [F07](10-master-findings.md#f07) | 2.2.2 / A, when rotation is present | Carousel/announcements | Automatic updates lack user pause | Wait through update intervals; provide pause/resume |
| [F08](10-master-findings.md#f08) | 4.1.3 / AA, for status messages | New inline outcomes | No live/status or equivalent focus mechanism | Listen during isolated operation; announce context once |
| [F25](10-master-findings.md#f25) | 4.1.2 / A | Filters/tabs/disclosures | Active/open state represented only by classes/content | Inspect selected/expanded state; expose proper state semantics |
| [F35](10-master-findings.md#f35) | 1.3.1 / A | Recent registration visual table | Missing programmatic column/value relationships | Navigate by headers; use native table or labeled list |

No measured AA target-size violation is declared. ThemeToggle's 26x26px options and calendar's 26px arrows exceed the 24px dimensional threshold; they may still merit larger comfort targets. Other sizes and spacing exceptions require rendered geometry.

## Supported risks requiring runtime/DOM verification

| Findings | Criterion / level to investigate | Required evidence |
|---|---|---|
| [F06](10-master-findings.md#f06), [F45](10-master-findings.md#f45) | 2.4.3 / A; 2.4.7, 2.4.11 / AA | Actual off-screen/invisible focus traversal, viewport and focused-element screenshots |
| [F05](10-master-findings.md#f05) | 2.4.3 / A; 2.1.2 / A | Dialog traversal, escape route and focus restoration; missing focus trap is not itself evidence of a keyboard trap |
| [F10](10-master-findings.md#f10) | 3.3.1 / A; 3.3.3 / AA | Field-specific failures with realistic server responses, retained values and announced corrections |
| [F24](10-master-findings.md#f24) | 2.4.2 / A | Actual titles and page purposes across routes |
| [F30](10-master-findings.md#f30) | 1.4.3 / AA | Final colors, text size/weight and composed backgrounds; source token ratios alone are insufficient |
| [F37](10-master-findings.md#f37), [F38](10-master-findings.md#f38) | 1.4.10 / AA | Measured reflow/scrollability with zoom, long content and short screens |
| [F34](10-master-findings.md#f34) | User motion preference; no automatic AA mapping | CSS and JS behavior with reduced motion; related automatic updates are covered by F07 |

## All A/AA criterion coverage ledger

**S** = source evidence above; **R** = risk/source signal requiring runtime confirmation; **U** = untested. S is not a full-criterion or whole-page pass/fail verdict. Media applicability is unknown until actual content is inventoried; it is not assumed N/A.

| Principle | Criterion states |
|---|---|
| Perceivable | 1.1.1 U; 1.2.1 U; 1.2.2 U; 1.2.3 U; 1.2.4 U; 1.2.5 U; 1.3.1 S; 1.3.2 U; 1.3.3 U; 1.3.4 U; 1.3.5 R; 1.4.1 U; 1.4.2 U; 1.4.3 R; 1.4.4 U; 1.4.5 U; 1.4.10 R; 1.4.11 U; 1.4.12 U; 1.4.13 U |
| Operable | 2.1.1 S; 2.1.2 U; 2.1.4 U; 2.2.1 U; 2.2.2 S; 2.3.1 U; 2.4.1 U; 2.4.2 R; 2.4.3 R; 2.4.4 U; 2.4.5 U; 2.4.6 U; 2.4.7 R; 2.4.11 R; 2.5.1 U; 2.5.2 U; 2.5.3 U; 2.5.4 U; 2.5.7 U; 2.5.8 U |
| Understandable | 3.1.1 R; 3.1.2 U; 3.2.1 U; 3.2.2 U; 3.2.3 U; 3.2.4 U; 3.2.6 U; 3.3.1 R; 3.3.2 R; 3.3.3 R; 3.3.4 U; 3.3.7 U; 3.3.8 U |
| Robust | 4.1.2 S; 4.1.3 S |

## Manual checks still required

- **Perceivable:** actual meaningful-image alternatives, extra images/posters, any video/audio captions or descriptions; color-only meaning; text/non-text contrast; reading sequence; 200% text/400% zoom; text spacing; hover/focus content. Root lang/dir are present, but mixed-language passages need review.
- **Operable:** keyboard reachability/traps, visible/unobscured focus, route-change focus, bypassing repeated navigation, touch hit areas and spacing, pointer cancellation, gestures/drag alternatives, flashing and timing behavior. No flashing/seizure failure was measured or inferred merely from animation.
- **Understandable:** labels/instructions, input-purpose autofill, specific error identification, transaction review/correction, repeated-entry burden, navigation/help consistency and authentication with password managers/paste. No paste prevention was found, but browser/password-manager compatibility was not tested.
- **Robust:** real accessibility-tree names/roles/values, assistive technology traversal and contextual dynamic announcements, including tab/filter/loading/error/success state.

Heading structure includes organization h1 elements in public header/footer as well as page headings. This warrants a heading-outline review, not an automatic multiple-h1 WCAG failure. No universal missing-skip-link violation is asserted solely from lack of a skip link: alternate bypass mechanisms must be assessed. No AAA focus-area or 44px target rule has been misrepresented as AA.

Use sanctioned test accounts and isolated records. Article/news detail reads and wallet reads can write persistent data; do not run a broad automated crawler against the live backend under the present read-only authorization.
