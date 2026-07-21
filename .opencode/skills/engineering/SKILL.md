---
name: engineering
description: "Core engineering principles for all OpenCode sessions. Use when: starting any task, planning implementation, or reviewing code. Prevents assumptions and over-engineering."
---

# Engineering Principles

## Discovery Phase (Before Any Code)

1. **Understand the requirement** — What problem are we solving?
2. **Inspect existing code** — Read relevant files first
3. **Search for patterns** — Has this been solved before?
4. **Check for reuse** — Can existing code be extended?

## Planning Phase

5. **Summarize findings** — What exists vs what we need
6. **Propose minimal solution** — Smallest change that works
7. **Present plan to user** — Wait for confirmation if &gt;3 files or &gt;100 lines

## Implementation Phase

8. **Extend before replacing** — Don't rewrite working code
9. **Prefer configuration** — Can this be a setting change?
10. **Delete unused code** — Remove before adding
11. **No premature abstraction** — Solve today's problem

## Validation Phase

12. **Run checks** — pnpm check, pnpm build, lint
13. **Verify no regressions** — Existing features still work
14. **Document decisions** — Why was this approach chosen?

## Forbidden Patterns

- ❌ New files for &lt;20 lines of logic
- ❌ New hooks for single-use cases
- ❌ New libraries when native works
- ❌ "What if we need..." abstractions
- ❌ Copy-paste instead of reuse

## Required Questions

Before any implementation, ask:
- "Can this be solved by editing existing code?"
- "Can this be solved by configuration?"
- "Can this be solved by documentation?"
- "Is this the minimal change?"

If YES to any → Do that instead.