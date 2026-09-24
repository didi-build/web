# Didi Build · handoff (Next.js + Tailwind)

Page: `Didi Build.dc.html`. Variants + states: `Didi Build Canvas.dc.html`.
Font: Figtree 400/500/600/700 via next/font/google. Copy rule: no em dashes.

## Color tokens (CSS vars on [data-theme])

| token | light | dark |
|---|---|---|
| --bg | oklch(0.985 0.006 120) | oklch(0.19 0.012 160) |
| --surface | oklch(0.997 0.003 120) | oklch(0.225 0.014 160) |
| --surface-2 | oklch(0.955 0.012 135) | oklch(0.26 0.016 160) |
| --ink | oklch(0.24 0.02 155) | oklch(0.95 0.008 120) |
| --ink-muted | oklch(0.44 0.02 155) | oklch(0.77 0.015 140) |
| --line | oklch(0.89 0.012 140) | oklch(0.34 0.014 160) |
| --line-strong (input borders) | oklch(0.6 0.015 150) | oklch(0.56 0.015 155) |
| --accent | oklch(0.44 0.09 158) | oklch(0.8 0.1 150) |
| --accent-hover | oklch(0.38 0.08 158) | oklch(0.86 0.09 148) |
| --accent-ink (text on accent) | oklch(0.99 0.005 120) | oklch(0.2 0.03 160) |
| --accent-soft | oklch(0.935 0.035 150) | oklch(0.29 0.04 158) |
| --accent-text | oklch(0.42 0.09 158) | oklch(0.82 0.1 150) |
| --error | oklch(0.5 0.18 28) | oklch(0.76 0.13 28) |
| --error-soft | oklch(0.955 0.03 28) | oklch(0.28 0.05 28) |

Tailwind v4: `@theme { --color-bg: var(--bg); ... }` → `bg-bg text-ink border-line`. Dark: `@custom-variant dark (&:where([data-theme=dark] *))`; default from prefers-color-scheme, toggle persisted in localStorage.

## Type (Figtree)

| name | size | lh | weight | tracking |
|---|---|---|---|---|
| display | clamp(2.2rem, 1.1rem + 4.4vw, 4.5rem) | 1.07 | 600 (hero B 700) | -0.03em |
| h2 | clamp(1.75rem, 1.2rem + 2vw, 2.75rem) | 1.15 | 600 | -0.022em |
| h3 | 1.25rem | 1.3 | 600 | -0.01em |
| lead | clamp(1.125rem, 1rem + .45vw, 1.3rem) | 1.55 | 400 | 0 |
| body | 17px | 1.6 | 400 | 0 |
| small / eyebrow | 15px | 1.5 | 400 / 600 | 0 |
| caption | 13px | 1.4 | 600 | 0 |

## Spacing, radius, sizing

- Spacing (px): 4 8 12 16 20 24 28 32 40 48 56 64 80 96 112
- Section wrapper: max-w 1168, px clamp(20px,5vw,48px), py clamp(56px,9vw,112px)
- Radius: sm 8 · md 12 (inputs) · lg 24 (cards, form) · xl 28 (hero image) · pill 999
- Targets: min 44px; primary button 56; inputs 52
- Focus: 3px accent outline, 3px offset; inputs: accent border + 3px accent ring

## Components

- Button: primary | outline; md 44 | lg 56; pill.
- Card: surface, 1px line, radius 24, p 28, "Example N" tag.
- Step: 2px ink top rule, accent numeral, h3, muted body.
- FormField: label (htmlFor), "(optional)", hint, error (aria-describedby, aria-invalid, --error border).
- Alert (role=alert, error-soft) and SuccessPanel (role=status, accent-soft, receives focus).
- SectionWrapper: id, aria-labelledby, tone default | tinted (surface-2).
- Image: leaf/plant photos. Hero A wide r28; Hero B arch (999px top corners); contact r24.

## Form behaviour

- Required: name, email, message. Validate on blur + submit; on submit focus first invalid and show a count summary.
- Sending: button "Sending…", disabled. Success replaces form. Failure keeps input, shows alert, button "Try again".
- Spam widget slot 300×65 above submit.
