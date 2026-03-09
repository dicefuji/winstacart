'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Heart, Clock, ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCartStore } from '@/stores/cartStore'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/favorites', icon: Heart, label: 'Saved' },
  { href: '/orders', icon: Clock, label: 'Orders' },
]

export default function MobileNav() {
  const pathname = usePathname()
  const itemCount = useCartStore(s => s.getItemCount())
  const openCart = useCartStore(s => s.openCart)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 md:hidden safe-bottom">
      <div className="flex items-center justify-around px-2 h-16">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 w-16 py-1 relative"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-[1px] left-3 right-3 h-0.5 bg-green-600 rounded-full"
                />
              )}
              <Icon
                className={`h-5 w-5 transition-colors ${
                  isActive ? 'text-green-600' : 'text-gray-400'
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </Link>
          )
        })}
        <button
          onClick={openCart}
          className="flex flex-col items-center justify-center gap-0.5 w-16 py-1 relative"
        >
          <div className="relative">
            <ShoppingCart className="h-5 w-5 text-gray-400" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-green-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium text-gray-400">Cart</span>
        </button>
      </div>
    </nav>
  )
}
