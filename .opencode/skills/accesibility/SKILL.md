---
name: accessibility
description: "Accessibility principles for web projects. Use when: implementing UI, reviewing code, or testing for a11y compliance."
---

# Accessibility Principles

## Motion

- Respect `prefers-reduced-motion: reduce`
- Provide static fallback for all animations
- Never use motion as the only cue

## Navigation

- Full keyboard operability
- Visible focus indicators
- Logical tab order
- Skip links for repetitive content

## Content

- Contrast ≥ 4.5:1 for normal text
- Contrast ≥ 3:1 for large text/UI
- Don't rely on color alone
- Alt text for images

## Structure

- Semantic HTML (nav, main, section, article)
- Proper heading hierarchy
- ARIA labels where needed
- Screen reader testing