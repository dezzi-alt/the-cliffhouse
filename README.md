# The Cliffhouse

A static, vanilla HTML/CSS/JS demo site for a fictional boutique guesthouse in Hermanus, South Africa. Built as a capability showcase — cinematic scroll-driven storytelling, no framework, no build step, no backend.

## Run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000

## Structure

- `index.html` — home page: cinematic scroll intro, about, rooms preview, gallery, location, footer
- `rooms.html` — full detail for the three rooms
- `css/styles.css` — design tokens, scroll-rig positioning, responsive breakpoints
- `js/scroll-engine.js` — the scroll/pointer-driven animation engine (CSS custom properties set via `requestAnimationFrame`) and the infinite-loop experiences slider
- `js/site.js` — the booking modal (open/close, focus trap, fake submit)
- `images/` — Unsplash photography, see `ATTRIBUTION.md`

## Notes

This is a fictional property built for demonstration purposes only. The booking form does not submit anywhere real.
