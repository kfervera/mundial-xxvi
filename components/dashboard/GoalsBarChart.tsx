'use client'

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import type { GoalesPorFase } from '@/hooks/useTournamentStats'

const FASE_SHORT: Record<string, string> = {
  'Primera fase': 'Grupos',
  'Dieciseisavos de final': 'R32',
  'Octavos de final': 'R16',
  'Cuartos de final': 'QF',
  'Semifinal': 'SF',
  'Partido por el tercer puesto': '3°',
  'Final': 'Final',
}

const BAR_COLORS = ['#2B54FE', '#6710F2', '#B494FF', '#E70D01', '#FF4B00', '#B0D700', '#5BE1E9']

interface GoalsBarChartProps {
  data: GoalesPorFase[]
}

export default function GoalsBarChart({ data }: GoalsBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-center min-h-[160px]">
        <p className="text-xs text-zinc-400">Sin datos aún</p>
      </div>
    )
  }

  const chartData = data.map((d) => ({ ...d, label: FASE_SHORT[d.fase] ?? d.fase }))

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Goles por fase</p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData} barSize={24}>
          <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
          <Tooltip formatter={(v) => [`${v} goles`]} cursor={{ fill: '#f4f4f5' }} />
          <Bar dataKey="goles" radius={[4, 4, 0, 0]}>
            {chartData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
