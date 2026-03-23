# Design Token Generator
Link: https://figma-token-generator-umber.vercel.app/
Generate a full design token palette from two colors — brand and neutral. Export to CSS, JSON, or Figma Variables in one click.

<img width="1051" height="1004" alt="image" src="https://github.com/user-attachments/assets/18430308-1384-4152-92b1-8ed631f830e0" />

## What it does

Pick a **brand color** and a **neutral/dark base** — the tool instantly builds a complete, production-ready token set:

- **Brand scale** — 6 tints and shades derived from your brand color
- **Neutral scale** — 7 steps from dark base to white
- **Additional palette** — 7 contextual colors (Paris, New York, Tokyo, Sydney, Cape Town, Dubai, Barcelona) with hue adapted to your brand
- **Text tokens** — primary, secondary, tertiary, accent, link states
- **Surface tokens** — backgrounds, elevation, overlays, selected states
- **Border tokens** — dividers and element borders
- **Button tokens** — fill, text, border, shadow for all button variants
- **State tokens** — success, warning, error, info, inactive with background tints

## Features

- **WCAG AA auto-correction** — if your color fails 4.5:1 contrast, it's automatically adjusted and flagged
- **Live preview** — buttons, typography, badges, and surfaces rendered in real time
- **CSS export** — `:root {}` variables block, syntax-highlighted
- **JSON export** — W3C design token format, alpha colors as `rgba()` for Figma Tokens Studio compatibility
- **Figma Scripter** — ready-to-run script that creates a `Design Tokens` Variables collection via the Figma Variables API
- **Copy buttons** — one click to copy any token value, the full CSS block, JSON, or the Figma script

## Usage

Just open `token-generator.html` in a browser — no build step, no dependencies, no server needed.

```
git clone https://github.com/denysosadchyi/design-token-generator.git
cd design-token-generator
open token-generator.html
```

## Figma integration

1. Install the [Scripter](https://www.figma.com/community/plugin/1014127678655895) plugin in Figma
2. Click **Copy script** in the Figma Scripter panel
3. Open Scripter in your Figma file, paste, and hit **Run**

The script creates (or updates) a `Design Tokens` collection with all color variables, including alpha tokens.

## Token format

**CSS**
```css
:root {
  --base-brand-primary: #13D16A;
  --surface-overlay: #00000033;
  --text-primary: #17181D;
  /* ... */
}
```

**JSON** (W3C Design Tokens spec)
```json
{
  "base-brand-primary": { "value": "#13D16A", "type": "color" },
  "surface-overlay":    { "value": "rgba(0, 0, 0, 0.200)", "type": "color" }
}
```

## Stack

Vanilla HTML + CSS + JS. Zero dependencies, zero build tools.
