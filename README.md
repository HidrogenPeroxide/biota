# Biota — A Living Atlas of Biodiversity

A web-based biodiversity exploration platform built on **iNaturalist** data.
Think *National Geographic* + *Apple Design* + an interactive natural history
museum — not a dashboard, not a GIS tool, not an academic paper.

Biota turns millions of real citizen-science observations into an editorial,
documentary-style experience: a slow hero, a living tree of life, a cinematic
atlas map, rich species profiles, and a scientific insights portal.

---

## ✨ Experience

| Page | Purpose |
| --- | --- |
| **Home** `/` | Full-bleed wildlife hero (Ken Burns), animated biodiversity stats, featured species, branches of life, CTA. |
| **Explore** `/explore` | Interactive taxonomy tree that *grows* live, a synced observation map, and a slide-in species panel. |
| **Species** `/species/:id` | Photography-first profile: hero image, Wikipedia description, distribution map, full taxonomy chain, field gallery. |
| **Insights** `/statistics` | The analytical heart — D3 treemap, sunburst, growth trend, seasonal heatmap, most-observed & top contributors. |
| **Atlas** `/map` | Dedicated map with observation points / heatmap layers, branch filters, a year time-slider, and cinematic fly-to. |

### Design language
- **Palette**: warm ivory backgrounds, deep forest greens, natural browns &
  stone, charcoal text. No saturated greens, no clutter.
- **Typography**: *Fraunces* (organic editorial serif) for display, *Inter*
  for body.
- **Motion**: slow, organic, documentary — fade dissolves, gentle zooms,
  slide-in panels, count-up stats, growing tree branches. Powered by
  Framer Motion and D3 transitions. No bouncy or gamified effects.

---

## 🧱 Tech stack

- **React 18 + TypeScript + Vite**
- **Tailwind CSS** + shadcn-style primitives (`Button`, `Card`, `Badge`, …)
- **Framer Motion** — page & component animation
- **D3.js** — treemap, sunburst, line/area, heatmap, bars
- **Leaflet** (+ `leaflet.heat`) — interactive maps
  *The map is wrapped imperatively so it can migrate to **Mapbox GL** later.*
- **iNaturalist API v1** — live data, no key required (read-only, CORS-enabled)

Routes are code-split: D3 and Leaflet only load on the pages that need them.

---

## 🚀 Getting started

```bash
cd inaturalist
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # type-check + production bundle
npm run preview  # preview the production build
```

> The app reads live data from `api.inaturalist.org`. An internet connection
> is expected; the UI degrades gracefully (skeletons / fallback copy) if the
> API is rate-limited or unreachable.

---

## 🔌 iNaturalist API notes

Base URL: `https://api.inaturalist.org/v1` — no auth for public read-only
GET requests. ~100 req/min/IP; the client (see
[`src/api/inaturalist.ts`](src/api/inaturalist.ts)) adds an in-memory TTL cache
and collapses duplicate in-flight requests.

| Endpoint | Used for |
| --- | --- |
| `GET /observations` | explore & map observations |
| `GET /observations/{id}` | single observation |
| `GET /observations/species_counts` | diversity, featured & most-observed |
| `GET /observations/observers` | top contributors |
| `GET /taxa/{id}?include=ancestors` | species detail + taxonomy chain |
| `GET /taxa/autocomplete` | map species search |
| `GET /taxa?parent_id=…` | lazy-growing tree branches |

**Photo URLs**: iNaturalist serves sized variants by swapping the final path
segment, e.g. `…/photos/<id>/square.jpg` → `/medium.jpg` → `/large.jpg` →
`/original.jpg`. Helpers in
[`src/lib/photos.ts`](src/lib/photos.ts) (`photoUrl`, `pickPhoto`) derive the
right size from the square URL that list endpoints return.

---

## 📁 Project structure

```
src/
├── api/inaturalist.ts        # typed, cached, fault-tolerant client
├── components/
│   ├── ui/                   # shadcn-style primitives
│   ├── layout/               # Navbar, Footer, ScrollToTop
│   ├── motion/               # CountUp, Reveal, LazyImage, PageTransition
│   ├── explore/              # TaxonomyTree, SpeciesPanel
│   ├── map/                  # ObservationMap (Leaflet), SpeciesSearch
│   ├── charts/               # Treemap, Sunburst, TrendLine, Heatmap, BarList
│   └── shared/               # HeroSlideshow, States
├── data/taxonomy.ts          # curated tree root + palette + fallbacks
├── hooks/                    # useAsync, useBiodiversity, useStatistics
├── pages/                    # Landing, Explore, SpeciesDetail, Statistics, MapExplore
└── types/                    # domain models
```

---

## ⚖️ Attribution

All biodiversity data © [iNaturalist](https://www.inaturalist.org) and its
contributors (a joint initiative of the California Academy of Sciences and the
National Geographic Society). Photography remains the property of the original
observers. Biota is a non-commercial showcase.
