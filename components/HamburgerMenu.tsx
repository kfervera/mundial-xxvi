'use client'

import Link from 'next/link'
import { X } from 'lucide-react'

interface HamburgerMenuProps {
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  { label: 'Dashboard', href: '/', color: '#2B54FE' },
  { label: 'Partidos', href: '/partidos', color: '#E70D01' },
  { label: 'Mi Pronóstico', href: '/pronostico', color: '#16a34a' },
]

export default function HamburgerMenu({ isOpen, onClose }: HamburgerMenuProps) {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col bg-black transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex items-center h-16 px-4">
        <button
          onClick={onClose}
          aria-label="Cerrar menú"
          className="flex items-center justify-center w-10 h-10 text-white"
        >
          <X size={28} />
        </button>
      </div>

      <nav className="flex flex-col flex-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="flex flex-1 items-center px-8 text-white text-4xl font-bold tracking-tight transition-opacity hover:opacity-80"
            style={{ backgroundColor: item.color }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
