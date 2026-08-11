# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/webprekandidata/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** WebPreKandidata
**Generated:** 2026-08-11 00:05:56
**Category:** Government/Public Service
**Design Dials:** Variance 4/10 (Balanced / Modern) | Motion 3/10 (Subtle) | Density 7/10 (Standard)

---

## Global Rules

### Color Palette

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#163B65` | `--color-primary` |
| On Primary | `#FFFFFF` | `--color-on-primary` |
| Secondary | `#0F766E` | `--color-secondary` |
| On Secondary | `#FFFFFF` | `--color-on-secondary` |
| Accent/CTA | `#163B65` | `--color-accent` |
| Background | `#F5F8FB` | `--color-background` |
| Surface | `#FFFFFF` | `--color-surface` |
| Foreground | `#0F172A` | `--color-foreground` |
| Muted | `#EAF0F5` | `--color-muted` |
| Muted Foreground | `#64748B` | `--color-muted-foreground` |
| Border | `#DCE5EE` | `--color-border` |
| Success | `#15803D` | `--color-success` |
| Warning | `#B45309` | `--color-warning` |
| Destructive | `#B91C1C` | `--color-destructive` |
| Ring | `#0F766E` | `--color-ring` |

**Color Notes:** Neutral civic navy + distinguishing teal. Candidate theme colors never recolor platform controls.

### Typography

- **Heading Font:** Inter
- **Body Font:** Inter
- **Mood:** minimal, clean, swiss, functional, neutral, professional
- **Google Fonts:** [Inter + Inter](https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap)

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
```

### Spacing Variables

*Density: 7/10 — Standard*

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #163B65;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: background-color 180ms ease-out, box-shadow 180ms ease-out, transform 180ms ease-out;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #0F766E;
  border: 1px solid #0F766E;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: color 180ms ease-out, background-color 180ms ease-out, border-color 180ms ease-out;
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: #FFFFFF;
  border: 1px solid #DCE5EE;
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.card-interactive:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
  cursor: pointer;
}

.card-interactive {
  transition: box-shadow 180ms ease-out, transform 180ms ease-out;
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #0F766E;
  outline: none;
  box-shadow: 0 0 0 3px #0F766E24;
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Civic Minimal

**Keywords:** Trustworthy, neutral, calm, accessible, form-first, structured, light

**Best For:** Candidate dashboard, guided content editor, public-service-like workflows

**Key Effects:** Crisp surfaces, subtle borders, restrained shadows. Blur only behind an active modal.

### Page Pattern

**Pattern Name:** Responsive Editor Shell

- **Desktop:** Persistent sidebar, page header, form column and optional live preview.
- **Mobile:** Navigation drawer, single-column form and separate full-screen preview.
- **Primary Action:** One primary action per screen; autosave status remains visible but subordinate.
- **Content Order:** Page title, guidance/status, form groups, validation summary, secondary actions.

---

## Motion

**State transition** (Subtle) — Trigger: save, expand, modal or navigation state | Duration: 150–250ms | Easing: `ease-out`

```css
transition: color 180ms ease-out, background-color 180ms ease-out, border-color 180ms ease-out, opacity 180ms ease-out, transform 180ms ease-out;
```

- ✅ Use motion to explain state changes and preserve spatial continuity.
- ❌ Do not add decorative scroll reveals to the dashboard.
- ⚡ Respect `prefers-reduced-motion` and never block interaction during animation.

---

## Anti-Patterns (Do NOT Use)

- ❌ Ornate design
- ❌ Low contrast
- ❌ Motion effects
- ❌ AI purple/pink gradients

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
