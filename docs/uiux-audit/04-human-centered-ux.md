# Human-centered usability

2026-11-18 (Asia/Tehran). Source-only audit; no live tasks, rendered pages, interviews or analytics were tested. Proposed checks are future validation, not observed outcomes.

## Journeys and concrete friction

| Journey | Source path and implemented support | Friction / finding | Recommended outcome |
|---|---|---|---|
| Discover and register for pilgrimage | Home -> login/register -> trip selection -> conditions/companions -> MyTrips | [F01](10-master-findings.md#f01), [F11](10-master-findings.md#f11), [F13](10-master-findings.md#f13), [F14](10-master-findings.md#f14), [F20](10-master-findings.md#f20) | Accurate availability, preserved destination, keyboard-operable selection and acceptance bound to the selected terms |
| Pay and verify trip status | Home savings explanation -> wallet -> MyTrips payment -> tracking/report | [F08](10-master-findings.md#f08), [F09](10-master-findings.md#f09), [F16](10-master-findings.md#f16), [F17](10-master-findings.md#f17) | Clearly separate funding, payment, pending and settled states; truthful balance and recovery |
| Manage trip changes | MyTrips -> cancellation/refund -> AdminRefunds | [F03](10-master-findings.md#f03), [F08](10-master-findings.md#f08), [F09](10-master-findings.md#f09), [F10](10-master-findings.md#f10) | Accessible amount entry and explicit request/approval/credit feedback; preserve existing cancellation confirmation |
| Complete profile/documents | Profile grouped form -> admin profile/documents | [F02](10-master-findings.md#f02), [F03](10-master-findings.md#f03), [F21](10-master-findings.md#f21), [F29](10-master-findings.md#f29), [F36](10-master-findings.md#f36), [F41](10-master-findings.md#f41) | Stable field focus, correct saved values, understandable requirements and a collection path |
| Buy an item | Shop -> ProductDetail -> delivery information -> order request | [F03](10-master-findings.md#f03), [F10](10-master-findings.md#f10), [F11](10-master-findings.md#f11), [F18](10-master-findings.md#f18) | Preserve task through login and provide a durable receipt/status destination |
| Seek support | MyTickets create/list -> thread -> reply | [F01](10-master-findings.md#f01), [F03](10-master-findings.md#f03), [F09](10-master-findings.md#f09), [F19](10-master-findings.md#f19), [F22](10-master-findings.md#f22) | Keyboard-accessible thread, pending reply feedback and an explicit account-recovery path |
| Publish community content | MyGallery/MyArticles -> admin moderation -> public gallery/articles | [F01](10-master-findings.md#f01), [F03](10-master-findings.md#f03), [F05](10-master-findings.md#f05), [F09](10-master-findings.md#f09), [F25](10-master-findings.md#f25), [F40](10-master-findings.md#f40) | Reachable submission, honest loading/review feedback and discoverable accepted content |
| Admin review and finance | Users/Registrations filters -> detail/dialog -> status/notes/groups -> expenses/campaigns/refunds | [F05](10-master-findings.md#f05), [F09](10-master-findings.md#f09), [F27](10-master-findings.md#f27), [F28](10-master-findings.md#f28), [F42](10-master-findings.md#f42), [F43](10-master-findings.md#f43), [F44](10-master-findings.md#f44) | Permission-aware destinations, trustworthy financial data and retained drafts after failure |

These are code-derived journey maps, not end-to-end successful runs. No step count is presented as a measured completion burden.

## Nielsen's ten heuristics

The heuristic structure follows [Nielsen Norman Group](https://www.nngroup.com/articles/ten-usability-heuristics/). Its use here organizes evidence; it does not replace observed user research.

| Heuristic | Application-specific evidence | Interpretation |
|---|---|---|
| Visibility of status | Busy submit labels in many forms; silent catches and visual-only messages ([F08](10-master-findings.md#f08), [F09](10-master-findings.md#f09), [F12](10-master-findings.md#f12), [F19](10-master-findings.md#f19)) | Preserve working busy controls and distinguish outcomes |
| Match with the real world | Persian task labels and local currency; payment and automatic-deduction promises disagree with code ([F16](10-master-findings.md#f16), [F17](10-master-findings.md#f17)) | Financial language must match actual events |
| User control and freedom | Visible cancel/close actions; unpausable rotation and incomplete dialogs ([F05](10-master-findings.md#f05), [F07](10-master-findings.md#f07)) | Users need predictable pause, dismissal and focus return |
| Consistency and standards | Shared tokens, native tables and checkboxes; mouse-only divs and missing selected state ([F01](10-master-findings.md#f01), [F25](10-master-findings.md#f25), [F32](10-master-findings.md#f32)) | Use familiar keyboard/semantic contracts across variants |
| Error prevention | Stock bounds and password match check; stale trip acceptance and repeat submission risk ([F18](10-master-findings.md#f18), [F19](10-master-findings.md#f19), [F20](10-master-findings.md#f20)) | Prevent avoidable errors before they become transactions |
| Recognition over recall | Quick links and grouped profile; lost login destination and absent order receipt ([F11](10-master-findings.md#f11), [F18](10-master-findings.md#f18)) | Preserve task context and durable references |
| Flexibility and efficiency | Admin filters, column chooser and export; inaccessible controls and unavailable fields ([F01](10-master-findings.md#f01), [F02](10-master-findings.md#f02), [F43](10-master-findings.md#f43)) | Retain useful expert controls while making their content operable/truthful |
| Aesthetic and minimalist design | Many decorative layers coexist with real identity cues ([F39](10-master-findings.md#f39)) | Research hypothesis; no visual failure asserted without rendering |
| Recognize, diagnose and recover from errors | Generic validation and lost modal drafts ([F09](10-master-findings.md#f09), [F10](10-master-findings.md#f10), [F28](10-master-findings.md#f28), [F44](10-master-findings.md#f44)) | Explain cause/correction and keep user work |
| Help and documentation | Contact numbers/support tickets; no login recovery and unclear document collection ([F22](10-master-findings.md#f22), [F29](10-master-findings.md#f29), [F41](10-master-findings.md#f41)) | Put useful guidance where the task can stall |

## Additional HCI lenses

- **Fitts's Law:** keyboard-inaccessible large cards are still inaccessible. Do not equate visual card size with usable hit area. Browser measurement of targets is outstanding; 44px is a comfort recommendation, not the web AA minimum.
- **Hick-Hyman:** operational choices benefit from existing progressive filters/columns. Whether public navigation needs article links is a discovery hypothesis ([F40](10-master-findings.md#f40)), not evidence that more links are always better.
- **Jakob's Law:** native links/buttons/radios, consistent back destinations and named dialog patterns reduce relearning ([F01](10-master-findings.md#f01), [F02](10-master-findings.md#f02), [F05](10-master-findings.md#f05), [F11](10-master-findings.md#f11)).
- **Gestalt:** repeated cards group related records; uniform accent/glow may compete with important financial actions. The competition remains a rendered-review question ([F39](10-master-findings.md#f39)).
- **Cognitive load:** hidden error causes and missing references force users to reconstruct state ([F09](10-master-findings.md#f09), [F10](10-master-findings.md#f10), [F18](10-master-findings.md#f18), [F43](10-master-findings.md#f43)). Long sensitive profile completion needs purpose research ([F41](10-master-findings.md#f41)).
- **Progressive disclosure:** health details and advanced admin filters are positive source patterns. Disclosure should expose its state and retain data/focus ([F25](10-master-findings.md#f25), [F36](10-master-findings.md#f36), [F44](10-master-findings.md#f44)).
- **Recognition rather than recall:** saved profile values and order references should be visible ([F18](10-master-findings.md#f18), [F21](10-master-findings.md#f21)); a member should not remember the route they intended before login.
- **Error prevention/recovery and freedom:** tie consent to current terms, show pending state, preserve drafts, allow pausing and provide recovery without performing unapproved backend writes.

No claim is made that a theoretical law predicts this site's conversion, task time or satisfaction. Findings F39-F41 require representative participant work. Use consent-aware sessions covering different input/assistive methods; demographics and sample size should follow actual recruitment evidence.

## Proposed research and validation

1. In an isolated environment, validate the high-risk registration/payment/account-recovery journeys with keyboard and assistive technology.
2. Observe visitors finding a trip, understanding payment state and locating writing/support; record confusion before altering navigation.
3. Evaluate profile purpose/requiredness, document collection and saved-value comprehension. Do not expose real sensitive records during sessions.
4. Inspect order receipt recovery and failed-note retry with realistic fixtures.
5. Review visual identity and hierarchy on the rendered site; retain product-specific strengths rather than substituting a stock aesthetic.
