# WORKFLOW_STATE.md
# Shared pipeline state — all agents read/write here.
# Managed by @orchestrator. Updated at each handoff.

## Current Pipeline
- **Phase**: DELIVER
- **Feature**: Regression fixes — TideEffect bidirectional fade + navbar hash navigation (ClientRouter capture phase)
- **Active Agent**: @orchestrator

## Artifacts Generated
| Phase | Artifact | Status | Path |
|-------|----------|--------|------|
| DIAG | Root cause: canvas unmount on hide → webglcontextlost → ST killed permanently; ClientRouter bubble click overrides hash links | Complete | — |
| BUILD | TideEffect: canvas always mounted, `createFadeTrigger()` recreated on restore; Navbar: hash handler in capture phase | Complete | `TideEffect.tsx`, `Navbar.astro`, `AGENTS.md` |
| GATE2 | pnpm check (0 errors) + pnpm build PASS | Complete | — |

## Rule Violation Alerts
| Agent | Rule | File | Description | Severity | Status |
|-------|------|------|-------------|----------|--------|
| @orchestrator | WebGL resilience | `src/components/Hero3D/TideEffect.tsx` | Context loss has no recovery/fallback path | Medium | Fixed |
| @orchestrator | Visibility progressive enhancement | Section components | Several cards defaulted to `opacity: 0` before GSAP reveals them | High | Fixed |
| @orchestrator | WebGL context-loss recovery | `src/components/Hero3D/TideEffect.tsx` | Context loss killed the fade ScrollTrigger permanently (waves disappeared forever) | High | Fixed |
| @orchestrator | Hash navigation vs ClientRouter | `src/components/Navbar.astro` | ClientRouter bubble listener intercepted `/#hash` clicks before Lenis handler | High | Fixed |

## Handoff Log
1. [timestamp] @orchestrator -> @design-overseer: brief delivered
2. [timestamp] @design-overseer -> @orchestrator: spec completed
3. [timestamp] @orchestrator -> @build-craftsman: gate 1 passed
4. [timestamp] @build-craftsman -> @qa-guardian: implementation ready
5. [timestamp] @qa-guardian -> @orchestrator: verdict delivered
