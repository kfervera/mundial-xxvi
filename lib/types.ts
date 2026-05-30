export interface Pais {
  codigo: string
  nombre_largo: string
  nombre_corto: string
  url_flag: string
  background_color: string
  text_color: string
  grupo: string
  tipo: string
}

export interface Partido {
  num: number
  fecha: string
  pais_local: string
  pais_visitante: string
  fase: string
  estadio: string
  lugar: string
  grupo: string
  jugado: boolean
  penales_local: number | null
  penales_visitante: number | null
}

export interface Goleador {
  id: number
  partido_num: number
  pais_jugador: string
  numero_jugador: number | null
  nombre_jugador: string | null
  minuto: number
  es_penal: boolean
  es_autogol: boolean
}

export interface PartidoCompleto extends Partido {
  local: Pais | null
  visitante: Pais | null
  goleadores: Goleador[]
}

export interface MarcadorCalculado {
  goles_local: number
  goles_visitante: number
  penales_local?: number
  penales_visitante?: number
}
