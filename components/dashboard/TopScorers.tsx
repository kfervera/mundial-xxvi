'use client'

import Image from 'next/image'
import type { TopScorer } from '@/hooks/useTournamentStats'

interface TopScorersProps {
  scorers: TopScorer[]
}

const MEDALS = ['🥇', '🥈', '🥉']

export default function TopScorers({ scorers }: TopScorersProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Top goleadores</p>
      {scorers.length === 0 ? (
        <p className="text-xs text-zinc-400">Sin goleadores aún</p>
      ) : (
        <ul className="space-y-2">
          {scorers.map((s, i) => (
            <li key={`${s.nombre}-${s.pais_codigo}`} className="flex items-center gap-3">
              <span className="text-base w-5 text-center">{MEDALS[i]}</span>
              {s.pais_flag ? (
                <Image src={s.pais_flag} alt={s.pais_nombre} width={22} height={22} className="rounded-sm object-contain" />
              ) : (
                <div className="w-[22px] h-[22px] rounded bg-zinc-200" />
              )}
              <span className="flex-1 text-sm font-medium text-zinc-700 truncate">{s.nombre}</span>
              <span className="text-xs text-zinc-400">{s.pais_nombre}</span>
              <span className="text-sm font-bold text-brand-blue min-w-[24px] text-right">{s.goles}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
