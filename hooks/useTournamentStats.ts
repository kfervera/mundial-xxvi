'use client'

import { useMemo } from 'react'
import { calcularMarcador } from '@/lib/marcador'
import { useScores } from '@/context/ScoresContext'
import type { PartidoCompleto } from '@/lib/types'

export interface TopScorer {
  nombre: string
  pais_codigo: string
  pais_nombre: string
  pais_flag: string
  goles: number
}

export interface GoalesPorFase {
  fase: string
  goles: number
}

export interface TournamentStats {
  totalPartidos: number
  partidosJugados: number
  totalGoles: number
  promedioGolesPorPartido: number
  topScorers: TopScorer[]
  goalesPorFase: GoalesPorFase[]
  victoriaLocal: number
  victoriaVisitante: number
  empates: number
  maxGolesPartido: { partido: PartidoCompleto; total: number } | null
}

const FASES_ORDER = [
  'Primera fase',
  'Dieciseisavos de final',
  'Octavos de final',
  'Cuartos de final',
  'Semifinal',
  'Partido por el tercer puesto',
  'Final',
]

export function useTournamentStats(partidos: PartidoCompleto[]): TournamentStats {
  const { localScores } = useScores()

  return useMemo(() => {
    const totalPartidos = partidos.length
    let partidosJugados = 0
    let totalGoles = 0
    let victoriaLocal = 0
    let victoriaVisitante = 0
    let empates = 0
    let maxGolesPartido: { partido: PartidoCompleto; total: number } | null = null

    const scorerMap: Record<string, { nombre: string; pais_codigo: string; pais_nombre: string; pais_flag: string; goles: number }> = {}
    const faseGoles: Record<string, number> = {}

    for (const p of partidos) {
      let marcador = calcularMarcador(p)

      if (!marcador && localScores[p.num]) {
        const ls = localScores[p.num]
        marcador = { goles_local: ls.goles_local, goles_visitante: ls.goles_visitante }
      }

      if (!marcador) continue

      partidosJugados++
      const gl = marcador.goles_local
      const gv = marcador.goles_visitante
      const total = gl + gv
      totalGoles += total

      if (gl > gv) victoriaLocal++
      else if (gv > gl) victoriaVisitante++
      else empates++

      if (!maxGolesPartido || total > maxGolesPartido.total) {
        maxGolesPartido = { partido: p, total }
      }

      const fase = p.fase ?? 'Desconocida'
      faseGoles[fase] = (faseGoles[fase] ?? 0) + total

      for (const g of p.goleadores) {
        if (g.es_autogol) continue
        const key = `${g.nombre_jugador ?? '?'}-${g.pais_jugador}`
        if (!scorerMap[key]) {
          const pais = p.local?.codigo === g.pais_jugador ? p.local : p.visitante
          scorerMap[key] = {
            nombre: g.nombre_jugador ?? '?',
            pais_codigo: g.pais_jugador,
            pais_nombre: pais?.nombre_corto ?? g.pais_jugador,
            pais_flag: pais?.url_flag ?? '',
            goles: 0,
          }
        }
        scorerMap[key].goles++
      }
    }

    const topScorers = Object.values(scorerMap)
      .sort((a, b) => b.goles - a.goles)
      .slice(0, 3)

    const goalesPorFase = FASES_ORDER.filter((f) => faseGoles[f] !== undefined).map((f) => ({
      fase: f,
      goles: faseGoles[f],
    }))

    const promedioGolesPorPartido =
      partidosJugados > 0 ? Math.round((totalGoles / partidosJugados) * 100) / 100 : 0

    return {
      totalPartidos,
      partidosJugados,
      totalGoles,
      promedioGolesPorPartido,
      topScorers,
      goalesPorFase,
      victoriaLocal,
      victoriaVisitante,
      empates,
      maxGolesPartido,
    }
  }, [partidos, localScores])
}
