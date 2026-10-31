# Button availability and animation audit — October 30, 2026

The audit reviewed all **327 JSX button definitions** in the current application source. Playwright rendered **all 323 reachable definitions** across 286 recorded state snapshots. Every one of the **104 reachable conditional definitions** was observed both enabled and disabled. Four definitions cannot render in the current app and are documented below.

The final state matrix passed **141 boundary and decision cases**, including native disabled properties and animation checks through ancestor wrappers. The original failure checks passed all 13 cases after correction. An additional **13 cases passed through normal controls in the uninstrumented production bundle**, and 38 existing navigation, communications and player regression cases passed. Typecheck, production build/resource integrity, 10,844 unit assertions across 36 suites, 68 dependency guard checks, 174 source-size checks and 14 server-limit checks passed.

## Corrections

- Purchases, cargo pod removal, appraisals and repairs reflect available funds and hold capacity. The existing partial-quantity commodity purchase rules remain intact.
- Recruit and ship-name submission reflect input validity; recruitment also reflects the roster limit.
- Departure reflects existing crew certification, naming, engine, fuel and evaluation requirements, with a reason in the button tooltip.
- Landing controls reflect solid-surface/thermal restrictions. Descent reflects the existing gravity and fuel requirements; ascent and rover deployment reflect their existing prerequisites. Valid zero-burn low-gravity actions remain available.
- Sensors, treatment, rover movement/fire/pickup, recovery, steering and fuel jettison controls reflect their relevant operating conditions. Empty-target stunner controls no longer advertise a usable shot.
- Duplicate colony recommendations and already-completed evaluation actions are disabled. Reading an evaluation can still advance to the next item under the existing workflow.
- Communications posture/topic controls now show their disabled state during pending questions/business or transceiver failure, in addition to the existing inert boundary.
- Developer crew/target/voice controls reflect selected targets, officers, input and playback status.
- A disabled button cannot pulse/bounce through its own CSS, descendants or a pulsing wrapper. Non-button status indicators retain their warnings. Combat highlighting requires a live armed hostile target.

Changes affect interface availability and feedback. The handlers retain their established rules and failure paths; no saved-state schema, equipment limits, diplomacy thresholds, voices, artwork or mission progression were changed.

## Source and state coverage

The inventory includes title/commissioning, every Starport room, shared training and mining components, all flight consoles, Science and survey states, landing/rover controls, encounters and communications, inventory, logs, pause/settings, save import/export/copy/reset, story overlays, and developer controls. It includes desktop, short compact and touch layouts. The scenarios include the game's 115 declared gallery states plus supplemental resource, modal and interaction states.

The following definitions were inspected but cannot be rendered by the current application:

| Definition | Reason |
| --- | --- |
| `GameInterface.tsx#116` / `#117` | Legacy Command Launch/Disembark branches require On Planet, while their enclosing standard bridge branch explicitly excludes On Planet. The active surface controls were tested separately. |
| `components/SurveyPanel.tsx#11` | Optional `onOpenLanding` callback is not supplied by any current SurveyPanel caller. Current landing buttons were tested. |
| `utils/helper.tsx#1` | Shared Overlay action has no current JSX caller; current screens use MenuOverlay and their own actions. |

The two legacy Command definitions are the only unreachable definitions with disabled expressions. Thus the inventory has 106 conditional definitions, of which 104 are reachable and were observed in both states.

## Evidence and limits

Detailed per-button records, conditions, source locations, observed states, screenshots, baseline failures and final receipts are retained locally under `artifacts/button-audit-20261030/`. The source-ID instrumentation and state bridge exist only in a separate, loopback audit build. Production checks verified both were absent from the normal bundle. See [audit tooling](../tools/button-audit/README.md).

Initial setup failures were kept separately and corrected: incomplete synthetic data, stale scenario names, hidden compact-only controls, automatic system entry after an incoherent test teleport, and an incorrect label for Stop motion. These were not counted as product defects.

This is exhaustive coverage of the current button definitions and their enabled/disabled outcomes, supported by independent-condition and threshold cases. It is not a mathematical proof of every simultaneous combination of continuous positions, timers, random events, campaign history and imported data. That state space is not a finite browser test set. A new button, condition or rule requires updating the inventory and tests.

All browser runs used muted disposable contexts and fictional missions. No owner browser profile or existing save was opened or overwritten. The normal private preview uses the same origin with compatibility assets retained. No GitHub publication or Windows tester ZIP rebuild was performed.
