# WORKFLOW_STATE.md
# Shared pipeline state — all agents read/write here.
# Managed by @orchestrator. Updated at each handoff.

## Current Pipeline
- **Phase**: [BRIEF | DESIGN | GATE1 | BUILD | GATE2 | DELIVER]
- **Feature**: [description]
- **Active Agent**: [@orchestrator | @design-overseer | @build-craftsman | @qa-guardian]

## Artifacts Generated
| Phase | Artifact | Status | Path |
|-------|----------|--------|------|

## Rule Violation Alerts
| Agent | Rule | File | Description | Severity | Status |
|-------|------|------|-------------|----------|--------|

## Handoff Log
1. [timestamp] @orchestrator -> @design-overseer: brief delivered
2. [timestamp] @design-overseer -> @orchestrator: spec completed
3. [timestamp] @orchestrator -> @build-craftsman: gate 1 passed
4. [timestamp] @build-craftsman -> @qa-guardian: implementation ready
5. [timestamp] @qa-guardian -> @orchestrator: verdict delivered
