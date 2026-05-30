'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Pais } from '@/lib/types'

let cache: Pais[] | null = null

export function usePaises() {
  const [paises, setPaises] = useState<Pais[]>(cache ?? [])
  const [loading, setLoading] = useState(cache === null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (cache !== null) return

    supabase
      .from('paises')
      .select('*')
      .then(({ data, error }) => {
        if (error) {
          setError(error.message)
        } else {
          cache = data ?? []
          setPaises(cache)
        }
        setLoading(false)
      })
  }, [])

  return { paises, loading, error }
}
