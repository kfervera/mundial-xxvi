'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface TournamentProgressChartProps {
  jugados: number
  total: number
}

export default function TournamentProgressChart({ jugados, total }: TournamentProgressChartProps) {
  const pct = total > 0 ? Math.round((jugados / total) * 100) : 0
  const data = [
    { value: jugados },
    { value: total - jugados },
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center gap-2">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Progreso</p>
      <div className="relative w-28 h-28">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={36} outerRadius={52} startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
              <Cell fill="#2B54FE" />
              <Cell fill="#e4e4e7" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-zinc-800">
          {pct}%
        </span>
      </div>
      <p className="text-xs text-zinc-400">{jugados} / {total} partidos</p>
    </div>
  )
}
