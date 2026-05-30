# Plan de Desarrollo — Mundial XXVI Tracker

## Resumen ejecutivo

App web responsiva para el seguimiento del Mundial 2026. Los datos son de solo lectura desde la app (fuente de verdad: Supabase). El usuario puede ingresar marcadores localmente como predicciones; si el marcador está en la BD, los campos se bloquean y muestran el dato oficial. Las predicciones locales sí afectan las estadísticas del dashboard.

**Stack:** Next.js (App Router) + TypeScript + Tailwind CSS + Supabase + Vercel

---

## Fase 1: Inicialización del proyecto ✅

### Paso 1 — Bootstrap Next.js
- Crear proyecto con `create-next-app` usando App Router, TypeScript y Tailwind CSS
- Estructura de carpetas:
  ```
  /app            → rutas y páginas (App Router)
  /components     → componentes reutilizables
  /lib            → cliente Supabase, helpers, tipos
  /hooks          → hooks personalizados (usePartidos, usePaises, useLocalScores)
  /context        → ScoresContext (estado local de predicciones)
  /public/logos   → we-are-26.avif, logo.svg, logo_white.webp, back.jpg
  /docs           → archivos de referencia (no se sirven)
  ```
- Instalar dependencias clave:
  - `@supabase/supabase-js` → cliente Supabase
  - `recharts` → gráficas del dashboard
  - `lucide-react` → iconos del menú y tabs

### Paso 2 — Variables de entorno
- Crear `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Crear `/lib/supabase.ts` con el cliente configurado (solo lectura desde la app, RLS en Supabase)
- Agregar `.env.local` al `.gitignore`

---

## Fase 2: Base de datos ✅

### Paso 3 — Diseño del esquema
Tres tablas en Supabase (se elimina `resultados`; el marcador se deriva de `goleadores`):

**`paises`**
| Columna | Tipo | Notas |
|---|---|---|
| codigo | text PK | Ej: "ARG", "MEX" |
| nombre_largo | text | "Argentina" |
| nombre_corto | text | "ARG" |
| url_flag | text | URL de la API FIFA |
| background_color | text | Hex color |
| text_color | text | Hex color |
| grupo | text | "A"–"L" |
| tipo | text | "A" = sede, "C" = invitado |

**`partidos`**
| Columna | Tipo | Notas |
|---|---|---|
| num | int PK | Número del partido (1–104) |
| fecha | timestamptz | |
| pais_local | text FK→paises | |
| pais_visitante | text FK→paises | |
| fase | text | "Primera fase", "Dieciseisavos de final", etc. |
| estadio | text | |
| lugar | text | |
| grupo | text | Vacío en fases eliminatorias |
| jugado | boolean DEFAULT false | Permite registrar un 0-0 real (sin filas en goleadores) |
| penales_local | smallint NULL | Solo si el partido se definió en penales. Ej: 4 |
| penales_visitante | smallint NULL | Solo si el partido se definió en penales. Ej: 3 |

**`goleadores`**
| Columna | Tipo | Notas |
|---|---|---|
| id | bigserial PK | |
| partido_num | int FK→partidos NOT NULL | |
| pais_jugador | text FK→paises NOT NULL | Equipo al que pertenece el jugador |
| numero_jugador | smallint NULL | Dorsal (nullable por si no se conoce) |
| nombre_jugador | text NULL | Nombre (nullable por si no se conoce) |
| minuto | int NOT NULL | Minuto del gol. Rango 1–120 |
| es_penal | boolean DEFAULT false | Penal en juego (no tanda). Muestra "(P)" |
| es_autogol | boolean DEFAULT false | Gol en propia. Muestra "(AG)". El gol se acredita al equipo contrario |

#### Reglas de negocio del esquema

**Cálculo del marcador** (derivado de `goleadores`):
```
goles_local     = filas donde (pais_jugador = local  AND NOT es_autogol)
                            + filas donde (pais_jugador = visitante AND es_autogol)

goles_visitante = filas donde (pais_jugador = visitante AND NOT es_autogol)
                            + filas donde (pais_jugador = local  AND es_autogol)
```
Si `jugado = true` y no hay filas en `goleadores` → resultado 0-0.

**Tanda de penales**: Solo se registran los totales en `penales_local` / `penales_visitante` de `partidos`. No se crean filas en `goleadores` para los penales de la tanda. La card muestra el marcador como "1–1 (4–3 pen.)".

**Estadísticas de goleadores** (top scorers): Solo se cuentan filas con `es_autogol = false`. Los autogoles cuentan para el total de goles del torneo pero no para el ranking de goleadores.

**Indicadores visuales en la card**:
- `es_penal = true` → `23' (P)`
- `es_autogol = true` → `54' (AG)` — aparece debajo del equipo contrario (el que recibió el beneficio)

### Paso 4 — Archivo `database.sql` (idempotente)
- Usar `CREATE TABLE IF NOT EXISTS` para todas las tablas
- Usar `INSERT ... ON CONFLICT DO NOTHING` para los datos de seed
- Secciones en orden:
  1. Create tables (con `IF NOT EXISTS`): `paises`, `partidos`, `goleadores`
  2. Create indexes: `idx_goleadores_partido`, `idx_goleadores_pais`, `idx_partidos_fase`, `idx_partidos_jugado`
  3. Enable RLS en las 3 tablas
  4. Policies de solo lectura (`SELECT` para `anon` y `authenticated`)
  5. Seed de `paises` (48 equipos desde `países.json`) con `ON CONFLICT (codigo) DO NOTHING`
  6. Seed de `partidos` (104 partidos desde `partidos.json`) con `ON CONFLICT (num) DO NOTHING`
     - `jugado = false`, `penales_local = NULL`, `penales_visitante = NULL` en el seed inicial
  7. `goleadores` vacío — se llena desde Supabase Dashboard partido a partido

> El archivo se puede ejecutar N veces y siempre deja la BD en el mismo estado: tablas creadas y datos iniciales cargados, sin duplicados.

---

## Fase 3: Tipos y capa de datos ✅

### Paso 5 — Tipos TypeScript
- Crear `/lib/types.ts` con interfaces `Pais`, `Partido`, `Goleador`
- Crear tipos derivados:
  - `PartidoCompleto`: partido + pais_local expandido + pais_visitante expandido + array de goleadores
  - `MarcadorCalculado`: `{ goles_local: number, goles_visitante: number, penales_local?: number, penales_visitante?: number }` — resultado derivado de contar filas en `goleadores` + columnas de tanda en `partidos`
- Crear función helper `calcularMarcador(partido: PartidoCompleto): MarcadorCalculado | null` → retorna `null` si `jugado = false`

### Paso 6 — Hooks de datos
- `usePaises()` → fetch de toda la tabla `paises`, cacheado en memoria
- `usePartidos(fase?)` → fetch de partidos con JOIN a `paises` (local y visitante) y sus `goleadores`, filtrable por fase
- No existe hook de resultados separado — el marcador se calcula en el cliente con `calcularMarcador()` sobre los datos ya cargados

---

## Fase 4: Estado local de marcadores ✅

### Paso 7 — ScoresContext
- Crear `context/ScoresContext.tsx` con:
  - `localScores: Record<number, {goles_local: number, goles_visitante: number}>` (keyed por `partido_num`)
  - `setLocalScore(partidoNum, golesLocal, golesVisitante)` → actualiza el estado local
  - `getDisplayScore(partido)` → lógica: si `partido.jugado = true`, retorna `calcularMarcador(partido)` y marca como bloqueado; si no, retorna el score local y marca como editable
  - Persistir en `localStorage` para que sobreviva recargas
- Envolver el layout raíz con este provider

### Paso 8 — Lógica de inputs de resultado en cards
- Si `partido.jugado = true` → mostrar marcador calculado desde `goleadores`, inputs `disabled`
  - Si además `penales_local != null` → mostrar indicador de tanda: "4–3 pen."
- Si `jugado = false` → inputs editables; al cambiar, `setLocalScore` actualiza el contexto
- El componente `ScoreInput` encapsula esta lógica: recibe `partido` completo y decide el estado

---

## Fase 5: Layout y navegación

### Paso 9 — Header negro (top bar)
- Fondo `#000000`, altura fija en todos los tamaños
- Izquierda: botón hamburguesa (icono de tres líneas, color blanco)
- Derecha: imagen `we-are-26.avif` como logo
- El header es persistente en todas las pantallas (parte del layout raíz)

### Paso 10 — Menú hamburguesa (full screen)
- Al hacer clic, un overlay ocupa toda la pantalla con fondo negro
- Animación slide-in o fade desde el header
- Ítems del menú (3 opciones de navegación + rutas):
  - **Dashboard** → `/` → fondo con color de la paleta (ej: azul real `#2B54FE`)
  - **Partidos** → `/partidos` → fondo con color de la paleta (ej: rojo `#E70D01`)
  - (el cuadrangular es una pestaña dentro de Partidos, no una ruta separada)
- Cada ítem ocupa un bloque de altura generosa, texto blanco grande
- Botón de cierre (X) en la esquina superior izquierda donde estaba el hamburguesa
- En desktop: misma experiencia (menú full screen sobre el contenido)

### Paso 11 — Rutas
- `/` → Dashboard
- `/partidos` → Pantalla de partidos con tabs internos

---

## Fase 6: Componentes base

### Paso 12 — Componente `MatchCard`
Información en el card:
- **Cabecera**: nombre del estadio y lugar
- **Fecha y hora**: formato "Jue 11 Jun · 14:00"
- **Centro**: bandera + nombre del equipo (largo en desktop, corto en mobile) vs resultado vs bandera + nombre del equipo visitante
- **Inputs de marcador**: `ScoreInput` para local y visitante (bloqueado si hay resultado en BD)
- **Pie del card**: goleadores (solo si hay datos)
  - Formato por línea: `(N°) Nombre Apellido  23', 67'`
  - Una línea por goleador, separados visualmente por equipo
- **Bordes de color**:
  - Borde izquierdo de 4px con `backgroundColor` del equipo local
  - Borde derecho de 4px con `backgroundColor` del equipo visitante
- Para partidos de fase eliminatoria donde aún no se conocen los equipos (ej: `W73`, `1A`) → mostrar el código como placeholder

### Paso 13 — Componente `CountryDisplay`
- Bandera (img desde `url_flag`), nombre largo o corto según breakpoint
- Reutilizable en cards y en el bracket

---

## Fase 7: Pantalla de partidos (`/partidos`)

### Paso 14 — Tab navigator inferior
- 3 opciones fijas en la parte inferior de la pantalla (sticky bottom)
- **Desktop**: icono + nombre centrados verticalmente
- **Mobile**: solo icono
- Iconos sugeridos (Lucide):
  - Fase de grupos → `Grid3x3` o `LayoutGrid`
  - Fixture final → `ListOrdered` o `Trophy`
  - Cuadrangular → `GitFork` o `Network`
- Color activo: color de acento de la paleta; inactivo: gris neutro
- Background del tab bar: blanco con borde superior sutil

### Paso 15 — Vista "Fase de grupos"
- Grid de cards agrupados por grupo (A, B, C... L)
- Título de grupo (ej: "Grupo A") como separador
- Cards ordenados por `num` de partido
- En mobile: 1 columna; en desktop: 2 o 3 columnas

### Paso 16 — Vista "Fixture final"
- Lista vertical de cards con títulos de fase como separadores:
  - "Dieciseisavos de final" (16 partidos)
  - "Octavos de final" (8 partidos)
  - "Cuartos de final" (4 partidos)
  - "Semifinal" (2 partidos)
  - "Partido por el tercer puesto" (1 partido)
  - "Final" (1 partido)
- Los cards muestran el código del equipo si aún no está definido (ej: "W73", "1A")

### Paso 17 — Vista "Cuadrangular" (bracket visual)
- Diagrama SVG o CSS grid con las fases de eliminación
- Columnas de izquierda a derecha: R32 → R16 → QF → SF → Final ← SF ← QF ← R16 ← R32 (árbol simétrico)
- Cada nodo del bracket: mini-card con bandera + nombre corto + marcador
- Líneas conectoras entre ganadores (SVG lines o CSS borders)
- Solo muestra resultados, no inputs editables
- Scroll horizontal en mobile para ver el bracket completo
- Los equipos no definidos aún muestran "Por definir" o el código (ej: "W73")

---

## Fase 8: Dashboard (`/`)

### Paso 18 — Estadísticas del dashboard
Las stats se calculan combinando resultados de la BD con predicciones locales del `ScoresContext`.

**Stats siempre visibles (mobile y desktop):**
- Total de goles en el torneo
- % del torneo jugado (partidos con resultado / 104 total) → gráfico de dona o barra de progreso
- Top 3 goleadores (foto/bandera del país, nombre, cantidad de goles)

**Stats adicionales solo en desktop (o en mobile en scroll):**
- Promedio de goles por partido
- Partido con más goles
- Equipos con más goles a favor / más goles en contra
- Distribución de resultados (victoria local vs. visitante vs. empate) → gráfico de dona
- Goles por fase del torneo → gráfico de barras

### Paso 19 — Componentes de gráficas
- Usar `recharts` para todos los gráficos
- `TournamentProgressChart` → gráfico de dona (% partidos jugados)
- `GoalsBarChart` → barras de goles por fase o por jornada
- `ResultsDistributionChart` → dona con victoria local/visitante/empate
- Los gráficos son responsive (usar `ResponsiveContainer` de recharts)

### Paso 20 — Cálculo de stats con estado mixto
- Hook `useTournamentStats()`:
  - Recibe todos los partidos, resultados de BD, y scores locales del contexto
  - Para cada partido: si tiene resultado en BD, usa ese; si no, usa el score local si existe
  - Calcula todas las métricas y retorna un objeto de stats
  - Se recalcula automáticamente cuando cambia el contexto local

---

## Fase 9: Diseño visual y paleta

### Paso 21 — Tokens de diseño (Tailwind config)
Extender `tailwind.config.ts` con la paleta personalizada:
```
colors:
  brand-red: #E70D01
  brand-orange: #FF4B00
  brand-purple-light: #B494FF
  brand-blue: #2B54FE
  brand-lime: #B0D700
  brand-burgundy: #81150B
  brand-purple-dark: #6710F2
  brand-cyan: #5BE1E9
  brand-teal: #014141
```

### Paso 22 — Aplicación de paleta
- Header/menú: fondo negro `#000000`, texto blanco
- Cuerpo de la app: fondo claro neutro (blanco o gris muy claro), texto oscuro
- Secciones del dashboard: usar colores de la paleta como acentos en tarjetas de stats
- Tabs activos: color de acento de la paleta
- Ítems del menú hamburguesa: cada ítem tiene su propio color de la paleta como fondo

---

## Fase 10: Responsividad

### Paso 23 — Breakpoints y ajustes mobile/desktop
| Elemento | Mobile | Desktop |
|---|---|---|
| Nombre de país en cards | `NombreShortPais` (3 letras) | `NombrePais` (nombre completo) |
| Stats del dashboard | Solo top 3 + progreso + total goles | Todas las stats |
| Tabs de partidos | Solo icono | Icono + nombre |
| Columnas de cards | 1 columna | 2–3 columnas |
| Bracket | Scroll horizontal | Completo en pantalla |
| Header | Compacto | Compacto (mismo diseño) |

---

## Fase 11: Deploy

### Paso 24 — Configuración de Vercel
- Conectar repositorio GitHub a Vercel
- Agregar variables de entorno (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) en Vercel Dashboard
- Configurar dominio si se desea

### Paso 25 — Revisión final
- Audit de responsividad en mobile (375px) y desktop (1280px)
- Verificar que los inputs bloqueados (con dato en BD) no sean editables
- Verificar que el bracket muestre los resultados correctamente
- Verificar que el menú hamburguesa funcione en ambos tamaños
- Probar el flujo: ingresar predicción local → ver que el dashboard la refleja

---

## Resumen de archivos a crear

| Archivo | Descripción |
|---|---|
| `database.sql` | Script idempotente con schema + seed (3 tablas: paises, partidos, goleadores) |
| `app/layout.tsx` | Layout raíz con Header y ScoresProvider |
| `app/page.tsx` | Dashboard |
| `app/partidos/page.tsx` | Pantalla de partidos con tabs |
| `components/Header.tsx` | Barra negra + hamburguesa + logo |
| `components/HamburgerMenu.tsx` | Overlay full screen del menú |
| `components/MatchCard.tsx` | Card de partido |
| `components/ScoreInput.tsx` | Input de marcador (bloqueado/editable) |
| `components/CountryDisplay.tsx` | Bandera + nombre responsivo |
| `components/BracketView.tsx` | Vista del cuadro de eliminación |
| `components/TabNavigator.tsx` | Tabs inferiores de la pantalla partidos |
| `components/dashboard/` | Componentes de stats y gráficas |
| `context/ScoresContext.tsx` | Estado global de predicciones locales |
| `hooks/usePartidos.ts` | Fetch de partidos con datos expandidos |
| `hooks/usePaises.ts` | Fetch de países |
| `hooks/useTournamentStats.ts` | Cálculo de estadísticas (combina goleadores BD + local scores) |
| `lib/marcador.ts` | Helper `calcularMarcador()` con lógica de autogoles y tandas |
| `lib/supabase.ts` | Cliente Supabase |
| `lib/types.ts` | Tipos TypeScript |
| `tailwind.config.ts` | Paleta de colores personalizada |

---

## Orden de ejecución sugerido

1. Fase 1 → Setup del proyecto
2. Fase 2 → `database.sql` y configuración de Supabase
3. Fase 3 → Tipos y hooks de datos
4. Fase 5 → Layout y navegación (Header + menú)
5. Fase 6 → Componentes base (`MatchCard`, `CountryDisplay`)
6. Fase 4 → Estado local de marcadores (`ScoresContext`)
7. Fase 7 → Pantalla de partidos (las 3 vistas)
8. Fase 8 → Dashboard y gráficas
9. Fase 9 → Paleta visual y Tailwind config
10. Fase 10 → Audit de responsividad
11. Fase 11 → Deploy a Vercel
