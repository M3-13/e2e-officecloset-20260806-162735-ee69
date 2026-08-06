# Design — Project Identity

> This document is project-long-lived. Tokens are not changed without
> the Architect's approval. Developers MUST use these tokens
> instead of improvising their own colors/spacings.

## Style Direction

Glamouröser Hollywood-Red-Carpet-Stil: tiefes Dunkelviolett-Schwarz (#0F0712) als Bühnenhintergrund, warmes Champagnergold (#D4A843) als Akzentfarbe, edle Serifentypografie (Playfair Display) für Überschriften, klare Sans-Serif (Inter) für Bedienelemente. Dezente Spotlight-Effekte und elegante Übergänge vermitteln Couture-Atmosphäre.

## Colors

- `--color-bg`: **#0F0712**
- `--color-bg-elevated`: **#1A1024**
- `--color-bg-card`: **#231836**
- `--color-bg-hover`: **#2D1F45**
- `--color-fg`: **#F5EDE0**
- `--color-fg-muted`: **#ADA0B8**
- `--color-accent`: **#D4A843**
- `--color-accent-hover`: **#E8C56D**
- `--color-accent-soft`: **rgba(212, 168, 67, 0.15)**
- `--color-border`: **#332848**
- `--color-border-accent`: **#6B5B3A**
- `--color-danger`: **#E0556A**
- `--color-success`: **#4CAF8D**
- `--color-spotlight`: **radial-gradient(ellipse at center, rgba(212,168,67,0.18) 0%, transparent 70%)**

## Typography

- `font_family`: 'Inter', 'Helvetica Neue', Arial, sans-serif
- `heading_font_family`: 'Playfair Display', 'Times New Roman', Georgia, serif
- `heading_weight`: 700
- `body_weight`: 400
- `body_size`: 16px
- `caption_size`: 13px
- `heading_sizes`: 2.75rem, 2rem, 1.5rem, 1.25rem

## Spacing Scale

- `--space-0`: 4px
- `--space-1`: 8px
- `--space-2`: 12px
- `--space-3`: 16px
- `--space-4`: 24px
- `--space-5`: 32px
- `--space-6`: 48px
- `--space-7`: 64px

## Border-Radii

- `--radius-sm`: 4px
- `--radius-md`: 8px
- `--radius-lg`: 16px
- `--radius-xl`: 24px
- `--radius-pill`: 999px

## Components

### Button – Primary Gold

Hintergrund: accent (#D4A843), Text: bg (#0F0712), Schrift: Inter weight 600, padding 12px 24px, border-radius md (8px), min-height 44px (mobile Touch), box-shadow: 0 2px 12px rgba(212,168,67,0.3). hover: accent-hover (#E8C56D), shadow verstärkt 0 4px 20px rgba(212,168,67,0.45), translateY(-1px). active: accent dunkler (#C49A30), shadow auf 0 1px 6px reduziert, translateY(0). disabled: opacity 0.4, cursor not-allowed, kein Hover-Effekt. focus-visible: outline 2px #D4A843, outline-offset 2px. Übergang: all 0.2s ease.

### Button – Secondary Outline

Hintergrund: transparent, Text: accent (#D4A843), Rand: 1px solid accent (#D4A843), padding 12px 24px, border-radius md (8px), min-height 44px. hover: Hintergrund accent-soft (rgba 0.15), Rand accent-hover. active: Hintergrund accent-soft (rgba 0.25). disabled: opacity 0.35. focus-visible: outline 2px #D4A843, outline-offset 2px.

### Button – Danger

Hintergrund: danger (#E0556A), Text: #FFFFFF, padding 12px 24px, border-radius md, min-height 44px. hover: #C94859. active: #B33D4C. disabled: opacity 0.4.

### Input Field

Hintergrund: bg-elevated (#1A1024), Text: fg (#F5EDE0), Rand: 1px solid border (#332848), border-radius md (8px), padding 12px 16px, Schrift: Inter 16px, min-height 44px, width 100%. placeholder: fg-muted (#ADA0B8). focus: Rand accent (#D4A843), box-shadow 0 0 0 3px rgba(212,168,67,0.2). error: Rand danger (#E0556A). disabled: opacity 0.4. Übergang: border-color 0.2s, box-shadow 0.2s.

### Card – Kleidungsstück-Kachel

Hintergrund: bg-card (#231836), border-radius lg (16px), overflow hidden, border: 1px solid border (#332848). Bildbereich: Seitenverhältnis 1:1, object-fit cover, Hintergrund bg-elevated. Label: padding 12px 16px, Schrift Inter caption (13px), Farbe fg-muted, abgeschnitten mit ellipsis. hover: border-accent (#6B5B3A), box-shadow 0 8px 32px rgba(212,168,67,0.12), transform scale(1.03) – Spotlight-Effekt. Übergang: all 0.3s cubic-bezier(0.4, 0, 0.2, 1). active: scale(0.98). Fokus: outline 2px accent, outline-offset 2px. Zusätzlich radialer Spotlight-Gradient hinter dem Bild bei hover.

### Modal / Dialog

Hintergrund: bg-elevated (#1A1024), border-radius lg (16px), border: 1px solid border (#332848), padding 32px, max-width 520px, box-shadow: 0 24px 80px rgba(0,0,0,0.6). Overlay: rgba(0,0,0,0.7) mit backdrop-filter blur(4px). Titel: Playfair Display heading_weight 700, Farbe fg, 1.5rem. Schließen-Button: Icon 24x24, Farbe fg-muted, hover: fg, position absolut top 16px right 16px. Animation: fade-in + scale(0.95→1) 0.25s ease-out.

### Navbar – Obere Leiste

Hintergrund: rgba(15,7,18,0.85) mit backdrop-filter blur(12px), border-bottom: 1px solid border (#332848), Höhe 64px, padding 0 24px, position sticky top 0, z-index 50. Logo/App-Name: Playfair Display, Farbe accent (#D4A843), 1.5rem, weight 700, letter-spacing 0.5px. Nav-Links: Inter weight 500, Farbe fg-muted, 14px, padding 8px 16px, border-radius pill. hover: Farbe fg, Hintergrund accent-soft. active Link: Farbe accent.

### Filter-Pill / Badge

Hintergrund: bg-card (#231836), Text: fg-muted (#ADA0B8), padding 6px 16px, border-radius pill (999px), Schrift Inter 13px weight 500, border: 1px solid transparent. hover: border-accent, Farbe fg. aktiv: Hintergrund accent, Text bg (#0F0712), weight 600. Übergang: all 0.2s.

### Outfit-Creator – Vorschau-Bereich (Bühne)

Zentraler Bühnenbereich: Hintergrund radialer Spotlight-Gradient vom Zentrum aus (ellipse, rgba(212,168,67,0.1) → transparent), min-height 400px, border: 1px dashed border-accent (#6B5B3A), border-radius xl (24px), padding 32px. Leerzustand: zentrierter Platzhalter-Text fg-muted, Italic, Playfair Display, 'Dein Outfit erscheint hier...'. Enthaltene Kleidungsstücke: zentriert übereinander oder nebeneinander angeordnet, mit dezentem drop-shadow. Darunter: Garderoben-Stange als horizontale Scroll-Leiste mit bg-card Hintergrund, padding 16px, border-radius lg, mit miniaturisierten Kacheln (80x80px), die per drag oder klick hinzugefügt werden.

### Toast / Notification

Hintergrund: bg-elevated (#1A1024), border: 1px solid border (#332848), border-radius md, padding 14px 20px, box-shadow 0 8px 24px rgba(0,0,0,0.5). Icon links (18px). Text Inter 14px, Farbe fg. Erfolg: linker Rand 3px solid success (#4CAF8D). Fehler: linker Rand 3px solid danger (#E0556A). Animation: slide-in von oben rechts (translateY(-8px) → 0, opacity 0→1), 0.3s ease. Position fixed top 20px right 20px, z-index 100.

## Layout Principles

- Container max-width: 1280px, zentriert, padding links/rechts 24px (Desktop), 16px (Tablet).
- Breakpoints: Tablet ab 768px (Navbar kollabiert nicht, aber Grids werden 2-spaltig), Desktop ab 1024px (volle 3-4-spaltige Grids).
- Garderoben-Grid: CSS Grid, auto-fill, minmax(220px, 1fr), gap 20px. Kacheln einheitlich quadratisch (1:1).
- Outfit-Creator zweigeteilt: oben Bühnenbereich (60% Viewport-Höhe), darunter horizontale Garderoben-Stange (max 180px Höhe) mit overflow-x auto und sanftem Scroll-Snap.
- Vertikaler Abstand zwischen Sektionen: 48px (Desktop), 32px (Tablet).
- Seitenlayout: Navbar (sticky top), darunter Hauptinhalt mit max-width-Container, Footer (optional, bg-card, padding 24px, zentrierter Text fg-muted 13px).
- Formulare (Login, Registrierung, Kleidungsstück anlegen): max-width 480px, zentriert im Viewport (vertikal + horizontal), padding 32px, bg-elevated, border-radius lg.
- Typografische Hierarchie: Seiten-Titel Playfair Display 2.75rem, Sektions-Titel 2rem, Karten-Titel 1.25rem, Body Inter 16px.
- Bewegung & Übergänge: alle interaktiven Elemente transition 0.2s–0.3s ease; Seitenwechsel mit leichter Fade-Animation (opacity 0→1, 0.2s).
