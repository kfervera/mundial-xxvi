'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Menu } from 'lucide-react'
import HamburgerMenu from './HamburgerMenu'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 bg-black">
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menú"
          className="flex items-center justify-center w-10 h-10 text-white"
        >
          <Menu size={28} />
        </button>

        <Image
          src="/logos/we-are-26.avif"
          alt="We Are 26"
          width={120}
          height={40}
          priority
          className="object-contain"
        />
      </header>

      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
