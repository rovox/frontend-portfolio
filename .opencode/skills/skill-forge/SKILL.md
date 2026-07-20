---
name: skill-forge
description: Generates valid technical structure for new skills, validating name regex, YAML frontmatter, and description lengths.
---

Validate skill name matches directory name.
Name must match regex: `^[a-z0-9]+(-[a-z0-9]+)*$` (1-64 chars, lowercase, hyphens only, no leading/trailing hyphens, no consecutive hyphens).
Description must be 1-1024 characters.
SKILL.md must have YAML frontmatter with `name` (required), `description` (required), `license` (optional), `compatibility` (optional), `metadata` (optional).
Place files: `.opencode/skills/<name>/SKILL.md`
