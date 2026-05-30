import Image from 'next/image'
import type { Pais } from '@/lib/types'

interface CountryDisplayProps {
  pais: Pais | null
  placeholder?: string
  size?: 'sm' | 'md'
}

export default function CountryDisplay({ pais, placeholder, size = 'md' }: CountryDisplayProps) {
  const flagSize = size === 'sm' ? 24 : 36

  if (!pais) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div
          style={{ width: flagSize, height: flagSize }}
          className="rounded bg-zinc-200 flex items-center justify-center text-zinc-400 text-xs font-bold"
        >
          ?
        </div>
        <span className="text-xs font-bold text-zinc-500 text-center">{placeholder ?? '?'}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <Image
        src={pais.url_flag}
        alt={pais.nombre_largo}
        width={flagSize}
        height={flagSize}
        className="object-contain rounded-sm"
      />
      <span className="hidden sm:block text-xs font-medium text-center leading-tight max-w-[80px] truncate">
        {pais.nombre_largo}
      </span>
      <span className="block sm:hidden text-xs font-bold text-center">{pais.nombre_corto}</span>
    </div>
  )
}
