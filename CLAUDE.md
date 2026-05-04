# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Response rules

1. After modifying any file, always provide a **Brief Summary of Changes**.
2. When the requested goal is complete, end the response with **TASK COMPLETE**.
3. When waiting for confirmation before a dangerous or destructive command, state **AWAITING USER APPROVAL**.

## What this repo is

A **handoff bundle from Claude Design** (claude.ai/design), not a runnable application. The user mocked up a site in HTML/CSS/JS using an AI design tool and exported this bundle so a coding agent can reimplement it for real. There is no build system, package manager, test suite, or server — just static files.

## Bundle contents

- [README.md](README.md) — handoff instructions (authoritative)
- [index.html](index.html) — primary design (~75KB, inline CSS design system + inline JS + `data-i18n` attributes)
- [courses.html](courses.html), [faq.html](faq.html) — secondary pages, same pattern
- [mobile.css](mobile.css) — shared responsive overrides (≤768px and ≤420px breakpoints), linked from all HTML pages
- [languageManager.js](languageManager.js) — shared ES/EN i18n module (fetches `translations.json`, writes to `data-i18n` elements, exposes `window.BGC_I18N`)
- [translations.json](translations.json) — all UI strings keyed by dot-notation key (e.g. `hero.headline.1`), each with `es` and `en` values
- [map-preview.html](map-preview.html) — standalone color/layout preview for the Puerto Rico course map; not linked from main pages and has no i18n wiring

All three HTML pages link `mobile.css` and `languageManager.js`. The inline `<style>` block in each HTML file holds the full design system; `mobile.css` only adds responsive overrides on top.

## How to work in this repo

**Default task: recreate these designs pixel-perfectly in whatever stack the target codebase uses** (React, Vue, native, etc.). The prototypes are reference material, not code to ship.

1. **Read the target HTML file in full** before implementing — don't skim. All dimensions, colors, spacing, and interaction rules are in the source.
2. **Do not render in a browser or take screenshots** unless the user explicitly asks. The HTML/CSS is the source of truth.
3. **Match the visual output, not the prototype's internal structure.** Class names and DOM layout are expedient, not prescriptive.
4. **Ask before implementing when scope is ambiguous.**

## i18n system

Elements carry `data-i18n="key"` (sets `innerHTML`) or `data-i18n-attr="key|attr"` (sets an attribute). Language-toggle buttons use `data-lang-toggle`. The `<html>` element carries `data-i18n-title="key"` for the page `<title>`.

`BGC_I18N` public API: `t(key)`, `lang` (getter), `setLang(lang)`, `toggle()`, `onReady(fn)`, `apply(root)`. `setLang` also fires a `bgc:langchange` CustomEvent on `document`; initial load fires `bgc:ready`. Language preference is persisted in `localStorage` under key `bgc.lang`; defaults to `es`.

When reimplementing, port the i18n pattern to the destination framework's i18n system rather than copying `languageManager.js` verbatim.

## Design system (shared across all pages)

Defined via CSS custom properties in the `:root` block at the top of each HTML file. Key tokens:

- **Palette (sage/green):** `--sage oklch(58% 0.09 152)`, `--ink #111a13`, `--ink-soft #2d3e30`, `--muted #6b7260`, `--bg #f0ebe0`, `--bg2 #e8e1d3`, `--cream #faf6ee`
- **Typography:** DM Serif Display (display serif), Inter (sans), DM Mono (mono) — loaded from Google Fonts
- **Radii:** `--radius 12px`, `--radius-lg 20px`
- **Signature effects:** sticky blurred nav (`backdrop-filter: blur(16px) saturate(130%)`), fixed SVG film-grain overlay on `body::after` (opacity .045, mix-blend-mode multiply)
- **Container:** `.wrap` at `max-width: 1280px`, 28px side padding (18px under 600px)
- **External scripts:** Tailwind CDN (utility classes available, but the primary style system is the inline `<style>` block); Stripe JS v3 included in `index.html`

Port these tokens into the destination's theming system (Tailwind config, CSS vars, design-token file) rather than copying the inline `<style>` block verbatim.

## Page sections

**index.html** sections (by anchor ID): `#benefits`, `#network`, `#card`, `#faq`, `#join`.

The `#join` section is a **3-step membership signup flow** (stepper: Player Details → Payment → Digital ID). The Stripe card element mounts at `#card-element`; the pk_test_ key in the source is a placeholder mock — no real charge occurs. On "payment", it generates a random `LGM-#####` member number and reveals the Digital ID panel. The member card live-updates as the user fills in their name and uploads a selfie photo.

**courses.html** has a JS-driven searchable/filterable course table: a text input filters `#rows` by name/town/type, and `.pill` buttons filter by course type. The count label updates live.

**faq.html** has a sticky sidebar nav (`#side`) linking to `<details>`/`<summary>` accordion groups by ID, each a `<div class="group">` with a `<summary class="q">` pattern.

## Language

Copy is in **Spanish** (Puerto Rico). Preserve original strings when reimplementing unless the user asks for translation. English equivalents for every string are in `translations.json`.
