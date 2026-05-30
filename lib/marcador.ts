import type { PartidoCompleto, MarcadorCalculado } from './types'

export function calcularMarcador(partido: PartidoCompleto): MarcadorCalculado | null {
  if (!partido.jugado) return null

  const goles_local =
    partido.goleadores.filter(
      (g) => g.pais_jugador === partido.pais_local && !g.es_autogol
    ).length +
    partido.goleadores.filter(
      (g) => g.pais_jugador === partido.pais_visitante && g.es_autogol
    ).length

  const goles_visitante =
    partido.goleadores.filter(
      (g) => g.pais_jugador === partido.pais_visitante && !g.es_autogol
    ).length +
    partido.goleadores.filter(
      (g) => g.pais_jugador === partido.pais_local && g.es_autogol
    ).length

  const resultado: MarcadorCalculado = { goles_local, goles_visitante }

  if (partido.penales_local != null && partido.penales_visitante != null) {
    resultado.penales_local = partido.penales_local
    resultado.penales_visitante = partido.penales_visitante
  }

  return resultado
}
