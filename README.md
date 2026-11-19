# InternHub — Internship Board

A responsive, accessible internship listing web app built with **vanilla HTML5, CSS3, and JavaScript** — zero dependencies, no build step.

---

## Project Overview

InternHub fetches internship data from a local JSON file and renders filterable, searchable cards. It was built to demonstrate:

- Semantic HTML5 structure (`<header>`, `<main>`, `<section>`, `<article>`, `<dialog>`)
- Mobile-first CSS Grid and Flexbox layout
- Full keyboard navigation with visible focus management
- Accessible modal dialogs using the native `<dialog>` element
- Graceful UI states for loading, empty results, and fetch errors

---

## File Structure

```
internship-board/
├── index.html          # Semantic markup, modal, skip link
├── styles.css          # CSS custom properties, responsive grid, states
├── app.js              # Fetch, filter, render, modal, keyboard logic
├── internships.json    # Data source (5 sample records)
└── README.md           # This file
```

---

## Local Setup

> No build tools required. You only need a local HTTP server (browsers block `fetch()` on `file://` URLs).

### Option 1 — VS Code Live Server

1. Open the `internship-board/` folder in VS Code.
2. Install the **Live Server** extension (Ritwick Dey).
3. Right-click `index.html` → **Open with Live Server**.
4. Browser opens at `http://127.0.0.1:5500`.

### Option 2 — Python (3.x)

```bash
cd internship-board
python3 -m http.server 8080
# → open http://localhost:8080
```

### Option 3 — Node.js `npx serve`

```bash
cd internship-board
npx serve .
# → follow the printed URL
```

---

## Features

| Feature | Detail |
|---|---|
| **Search** | Filters by title, location, or any skill in real-time (180ms debounce) |
| **Domain filter** | Dropdown: Full Stack Development, UI/UX, Data Analytics, Cyber Security |
| **Mode filter** | Dropdown: Remote, Hybrid, On-site |
| **Reset** | Clears all filters; focus returns to the search field |
| **Loading state** | Spinner + status message while fetching |
| **Error state** | Alert with error detail + Retry button |
| **Empty state** | Friendly message + Reset filters button |
| **Card detail modal** | Native `<dialog>` with full internship info, focus trap, Escape closes |
| **Keyboard nav** | Tab through all controls; Enter/Space opens modal; Escape closes modal |

---

## Responsive Testing Notes

### 360px (small mobile)
- Single-column card grid
- Filters stack vertically (search above, dropdowns below)
- No horizontal overflow — all content wraps cleanly
- Modal fills viewport width with 16px side margins

**To test:** Open DevTools → Device toolbar → set to 360 × 800 (or Galaxy S8+).

### 768px (tablet)
- Two-column card grid
- Controls row goes horizontal (search + filters side by side)
- Modal centers with max-width 540px

**To test:** DevTools → set to 768 × 1024 (or iPad Mini).

### Desktop (1024px+)
- Three-column card grid
- Full-width header and sticky controls bar
- Modal centered over backdrop blur

**To test:** DevTools responsive or just resize browser to > 1024px.

---

## Accessibility Checklist

- [x] All form controls have associated `<label>` elements
- [x] Search input has `aria-label`; dropdowns have both `<label>` and `aria-label`
- [x] Results count updates via `aria-live="polite"` region
- [x] Loading and empty states use `role="status"` with `aria-live`
- [x] Error state uses `role="alert"` (assertive)
- [x] Modal uses `aria-labelledby`, `aria-modal="true"`, and native `<dialog>`
- [x] Focus trapped inside modal; restored to trigger on close
- [x] All interactive elements reachable by keyboard
- [x] `:focus-visible` outlines on every focusable element
- [x] Card "View Details" buttons have descriptive `aria-label` with title + ID
- [x] `prefers-reduced-motion` respected (spinner animation disabled)
- [x] Color contrast: teal accent on white exceeds WCAG AA

---

## Screenshots

> Replace each placeholder with an actual screenshot after running locally.

### Desktop (1280px)
![Desktop view](screenshots/desktop.png)

### Tablet (768px)
![Tablet view](screenshots/tablet.png)

### Mobile (360px)
![Mobile view](screenshots/mobile-360.png)

### Detail Modal
![Detail modal open](screenshots/modal.png)

### Empty State
![Empty state — no results](screenshots/empty-state.png)

---

## Extending the Data

Edit `internships.json` to add more records. Each record must follow:

```json
{
  "id":       "INT-106",
  "title":    "Your Role Title",
  "domain":   "Full Stack Development",
  "mode":     "Remote",
  "location": "City or Region",
  "skills":   ["Skill A", "Skill B"],
  "openings": 2
}
```

Valid `domain` values: `Full Stack Development`, `UI/UX`, `Data Analytics`, `Cyber Security`  
Valid `mode` values: `Remote`, `Hybrid`, `On-site`

---

## License

MIT — free to use and adapt.
