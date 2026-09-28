## Source of Truth

CLAUDE.md is the codebase reference — stack, conventions, architecture.
It is NOT the source of truth for project state, priorities, or business context.

**Source of truth:** Obsidian vault at `/Users/dezmaeizatt/Documents/Obsidian Vault/Personal/The Cliffhouse/`

**At session start, always:**
1. Read vault `_ctx.md` — routing rules, session protocols
2. Read vault `_state.md` — current phase, blockers, priorities
3. Follow `_ctx.md` LOAD_IF rules to load reference files only when relevant
4. Do not announce what was loaded. Just work.

**If CLAUDE.md contradicts the vault, the vault wins.**

> Note: `_ctx.md` is NOT @imported below because it edits often — @imports get cached and stale. Always Read it fresh at session start.

## Safety Rules

- **Never delete files** — move to `.trash/` (in repo or vault) and log to `.trash/MANIFEST.md`. Applies to vault files AND code files.
- **No force-push to main/master.** Force-push is allowed on feature branches with operator approval, never on shared branches.
- **No skipping hooks** (`--no-verify`, `--no-gpg-sign`) unless operator explicitly authorises.

## Conventions

- British/SA English in copy, docs, commit messages
- Atomic commits — one logical change per commit
- No emojis in code, commits, or docs unless the operator asks
- Plain prose over jargon; terse single-sentence updates over paragraphs

## Stack

Plain HTML/CSS/JS. No framework, no build tooling (no npm/bundler/transpiler). No backend — the booking modal is a fake, client-side-only form (no real submission endpoint).

Run locally: `python3 -m http.server 8000`, then open `http://localhost:8000`.

## Architecture

- `index.html` — home page: cinematic sticky-stage scroll intro (hero, cliff reveal, two story panels, infinite-loop experiences slider), then static sections (about, rooms preview, gallery, location, footer)
- `rooms.html` — full detail for the three featured rooms, shares the same booking modal
- `css/styles.css` — design tokens (`:root` custom properties), the scroll-rig positioning system, responsive breakpoints
- `js/scroll-engine.js` — the scroll/pointer-driven animation engine: a single `requestAnimationFrame` loop reading scroll + pointer position, smoothing both with `lerp`, using a `smoothstep`-based `segmentInOut()` helper to compute per-segment enter/exit/active values that drive CSS custom properties (position, scale, opacity, blur). Also owns the infinite-loop experiences slider (3x-cloned card set + index normalization).
- `js/site.js` — the booking modal: open/close, focus trap, `inert` on background content while open, fake submit → confirmation state
- `images/` — Unsplash photography, see `ATTRIBUTION.md`

The scroll engine's foreground imagery (splitframe/hero-focal images) fades in on scroll and fades out again before the slider phase — this is a deliberate adaptation, not an oversight. The reference page this was adapted from used transparent-PNG cutouts that could visually layer without blocking each other; this build uses opaque photography, so the fade choreography exists specifically to avoid one layer permanently occluding another.
