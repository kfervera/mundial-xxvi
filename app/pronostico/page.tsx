'use client'

import { PronosticoProvider } from '@/context/PronosticoContext'
import PronosticoScreen from '@/components/pronostico/PronosticoScreen'

export default function PronosticoPage() {
  return (
    <PronosticoProvider>
      <PronosticoScreen />
    </PronosticoProvider>
  )
}
