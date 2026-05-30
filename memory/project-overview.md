---
name: project-overview
description: Stack, scope, and key design decisions for the Mundial XXVI tracker app
metadata:
  type: project
---

## Stack
- Next.js 16.2.6 (App Router, all pages `'use client'`)
- React 19, TypeScript, Tailwind CSS v4
- Supabase (PostgreSQL): tables `paises`, `partidos`, `goleadores`
- Deployed to GitHub Pages via `gh-pages`

## Routes
- `/` — Dashboard (stats, charts, Mi Pronóstico card)
- `/partidos` — Match viewer with tabs: Grupos, Fixture, Bracket
- `/pronostico` — Mi Pronóstico (full prediction wizard)

## Key Data Types (lib/types.ts)
- `Pais`: `codigo`, `nombre_largo`, `nombre_corto`, `url_flag`, `background_color`, `text_color`, `grupo`, `tipo`
- `Partido`: `num`, `fecha`, `pais_local`, `pais_visitante`, `fase`, `grupo`, `jugado`, etc.
- `PronosticoState`: full prediction state stored in localStorage key `mundial-xxvi-pronostico`

## Grupos / Tournament Structure
- 12 groups (A–L), 4 teams each, 48 teams total
- Knockout phases: `Dieciseisavos de final` (R32), `Octavos de final` (R16), `Cuartos de final`, `Semifinal`, `Final`
- Knockout match codes in DB: `1A`/`2B` (position+group), `T1`–`T8` (best thirds), `W49` (winner of match N)

## Mi Pronóstico Feature
- `context/PronosticoContext.tsx` — localStorage persistence, full state management
- `components/pronostico/GruposPronostico.tsx` — @dnd-kit drag/drop reordering within each group
- `components/pronostico/TercerosPronostico.tsx` — pick 8 of 12 third-place teams
- `components/pronostico/KnockoutPronostico.tsx` — tap to pick match winner; includes champion display for Final
- `components/pronostico/PronosticoScreen.tsx` — container with phase footer nav (7 tabs) + clear button
- `components/dashboard/MiPronosticoCard.tsx` — reads localStorage directly, shows champion on dashboard
- Phase unlock chain: grupos → terceros → dieciseisavos → octavos → cuartos → semifinal → final
- Team resolver: maps position codes to actual Pais objects using user's predictions

## Dependencies
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` — drag & drop in groups phase
- `recharts` — dashboard charts
- `lucide-react` — icons

## Hooks
- `usePaises()` — cached fetch of all countries
- `usePartidos(fase?)` — fetch matches, optionally filtered by phase
