'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { usePaises } from '@/hooks/usePaises'
import type { PronosticoState } from '@/lib/types'

const STORAGE_KEY = 'mundial-xxvi-pronostico'

export default function MiPronosticoCard() {
  const { paises } = usePaises()
  const [campeonCode, setCampeonCode] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PronosticoState>
        setCampeonCode(parsed.campeon ?? null)
      }
    } catch {}
    setHydrated(true)
  }, [])

  if (!hydrated) return null

  const campeon = campeonCode ? paises.find(p => p.codigo === campeonCode) : null

  if (!campeon) return null

  return (
    <Link href="/pronostico" className="block">
      <div
        className="rounded-xl shadow-sm p-4 flex items-center gap-3 transition-opacity hover:opacity-90 active:scale-[0.98]"
        style={
          campeon
            ? { backgroundColor: campeon.background_color, color: campeon.text_color }
            : { backgroundColor: '#ffffff', color: '#18181b' }
        }
      >
        <Trophy size={20} strokeWidth={1.8} className="shrink-0 opacity-70" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest opacity-60">Mi Pronóstico</p>
          {campeon ? (
            <p className="text-sm font-bold truncate">{campeon.nombre_largo}</p>
          ) : (
            <p className="text-sm font-medium opacity-50">Completar pronóstico →</p>
          )}
        </div>
        {campeon && (
          <Image
            src={campeon.url_flag}
            alt={campeon.nombre_largo}
            width={40}
            height={28}
            className="object-contain rounded-sm shrink-0"
          />
        )}
      </div>
    </Link>
  )
}
