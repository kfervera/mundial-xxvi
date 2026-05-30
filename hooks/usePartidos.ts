'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { PartidoCompleto, Pais } from '@/lib/types'

export function usePartidos(fase?: string) {
  const [partidos, setPartidos] = useState<PartidoCompleto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const [partidosRes, paisesRes] = await Promise.all([
        (() => {
          let q = supabase.from('partidos').select('*, goleadores(*)').order('num')
          if (fase) q = q.eq('fase', fase)
          return q
        })(),
        supabase.from('paises').select('*'),
      ])

      if (partidosRes.error) {
        setError(partidosRes.error.message)
        setLoading(false)
        return
      }
      if (paisesRes.error) {
        setError(paisesRes.error.message)
        setLoading(false)
        return
      }

      const paisMap = new Map<string, Pais>(
        (paisesRes.data ?? []).map((p: Pais) => [p.codigo, p])
      )

      const mapped = (partidosRes.data ?? []).map((p: Record<string, unknown>) => ({
        ...p,
        local: paisMap.get(p.pais_local as string) ?? null,
        visitante: paisMap.get(p.pais_visitante as string) ?? null,
        goleadores: Array.isArray(p.goleadores) ? p.goleadores : [],
      })) as PartidoCompleto[]

      setPartidos(mapped)
      setLoading(false)
    }

    fetchData()
  }, [fase])

  return { partidos, loading, error }
}
