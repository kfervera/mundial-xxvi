'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { PartidoCompleto, Pais } from '@/lib/types'

export function usePartidos(fase?: string) {
  const [partidos, setPartidos] = useState<PartidoCompleto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let query = supabase
      .from('partidos')
      .select(`
        *,
        local:pais_local(codigo, nombre_largo, nombre_corto, url_flag, background_color, text_color, grupo, tipo),
        visitante:pais_visitante(codigo, nombre_largo, nombre_corto, url_flag, background_color, text_color, grupo, tipo),
        goleadores(*)
      `)
      .order('num')

    if (fase) {
      query = query.eq('fase', fase)
    }

    query.then(({ data, error }) => {
      if (error) {
        setError(error.message)
      } else {
        const mapped = (data ?? []).map((p: Record<string, unknown>) => ({
          ...p,
          local: p.local as Pais,
          visitante: p.visitante as Pais,
          goleadores: Array.isArray(p.goleadores) ? p.goleadores : [],
        })) as PartidoCompleto[]
        setPartidos(mapped)
      }
      setLoading(false)
    })
  }, [fase])

  return { partidos, loading, error }
}
