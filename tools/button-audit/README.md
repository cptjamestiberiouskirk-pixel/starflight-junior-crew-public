# Button availability audit

This developer-only audit inventories JSX buttons and tests the actual game controller and renderer with fictional state. The instrumented build adds stable source IDs and a state bridge. It is distinct from ordinary player acceptance: it can deliberately select boundary states that are difficult to encounter naturally.

**Never publish the instrumented output or use it on an owner's game origin.** Output is restricted to ignored `artifacts/` directories, and the audit server rejects the owner's standard port 4174. It binds to loopback. The normal Vite build does not load the instrumentation plugin.

Requirements: the project's normal Node dependencies and optional Playwright with Edge. Set `PLAYWRIGHT_MODULE_PATH` to an absolute `playwright/index.mjs` path if Playwright is not installed as a local optional tool. No media generation, account connection, or paid service is involved.

```powershell
node tools/button-audit/inventory.mjs artifacts/button-audit-20261030
node tools/button-audit/build.mjs artifacts/button-audit-20261030/final-v2
node tools/button-audit/serve.mjs artifacts/button-audit-20261030/final-v2/game 5202
```

The build preserves existing output directories. Use a fresh directory for subsequent builds. The ship artwork copied into the audit build comes from the ordinary `dist` build; build production first when its assets have changed.

In another terminal:

```powershell
$env:PLAYWRIGHT_MODULE_PATH = '<absolute path to playwright/index.mjs>'
$env:BUTTON_AUDIT_URL = 'http://127.0.0.1:5202/starflight-junior-crew/'
$env:BUTTON_AUDIT_OUT = 'artifacts/button-audit-20261030/final-definition-coverage'
node tools/button-audit/coverage.mjs
$env:BUTTON_AUDIT_OUT = 'artifacts/button-audit-20261030/final-matrix'
node tools/button-audit/matrix.mjs
$env:BUTTON_AUDIT_OUT = 'artifacts/button-audit-20261030/final-repro-check'
node tools/button-audit/check.mjs
```

Inventory paths inside the audit scripts point to the retained October 30 audit. Update the input path when preparing a new audit directory. `BUTTON_AUDIT_EXTRA_ONLY` and `BUTTON_AUDIT_PRIOR` support explicitly recorded continuation of definition coverage. `BUTTON_MATRIX_EXTRA` runs only the supplemental decision-state cases. Default runs include every phase.

`tools/windows-tester/action-availability.test.mjs` separately exercises ordinary controls in an **uninstrumented** production build and checks that audit hooks are absent. Configure its URL with `JUNIOR_ACTION_URL` and evidence directory with `JUNIOR_ACTION_EVIDENCE`.

Coverage means source definitions, rendered state classes, exact resource boundaries, and observed enabled/disabled outcomes. It does not prove every simultaneous combination of continuous coordinates, timers, random events, imported saves and histories. New button definitions or changed decisions require renewed inventory and review.
