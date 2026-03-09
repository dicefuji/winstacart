'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ShoppingCart, MapPin, ChevronDown, Heart, Clock, Menu, X, Headphones } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/stores/cartStore'
import { useAddressStore } from '@/stores/addressStore'
import NotificationPanel from '@/components/layout/NotificationPanel'

export default function Header() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddressDropdown, setShowAddressDropdown] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const itemCount = useCartStore(s => s.getItemCount())
  const openCart = useCartStore(s => s.openCart)
  const addresses = useAddressStore(s => s.addresses)
  const selectedAddress = useAddressStore(s => s.getSelectedAddress())
  const selectAddress = useAddressStore(s => s.selectAddress)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top row */}
        <div className="flex items-center justify-between h-16">
          {/* Logo + Address */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block tracking-tight">
                Winstacart
              </span>
            </Link>

            {/* Address Selector */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowAddressDropdown(!showAddressDropdown)}
                className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50"
              >
                <MapPin className="h-4 w-4 text-green-600" />
                <span className="font-medium max-w-[200px] truncate">
                  {selectedAddress?.street || 'Set delivery address'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </button>

              <AnimatePresence>
                {showAddressDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                  >
                    {addresses.map((addr) => (
                      <button
                        key={addr.id}
                        onClick={() => {
                          selectAddress(addr.id)
                          setShowAddressDropdown(false)
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                          selectedAddress?.id === addr.id ? 'bg-green-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            {addr.label}
                          </span>
                          {addr.isDefault && (
                            <span className="text-xs text-gray-400">Default</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{addr.street}</p>
                        <p className="text-xs text-gray-400">{addr.city}, {addr.state} {addr.zip}</p>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, stores, and recipes"
                className="pl-10 h-11 bg-gray-50 border-gray-200 rounded-full focus:bg-white"
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Link href="/favorites">
              <Button variant="ghost" size="icon" className="hidden sm:flex text-gray-600">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/orders">
              <Button variant="ghost" size="icon" className="hidden sm:flex text-gray-600">
                <Clock className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/support">
              <Button variant="ghost" size="icon" className="hidden sm:flex text-gray-600">
                <Headphones className="h-5 w-5" />
              </Button>
            </Link>
            <NotificationPanel />
            <Button
              variant="ghost"
              size="icon"
              onClick={openCart}
              className="relative text-gray-600"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 h-5 w-5 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </motion.span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, stores, and recipes"
                className="pl-10 h-10 bg-gray-50 border-gray-200 rounded-full focus:bg-white text-sm"
              />
            </div>
          </form>
        </div>

        {/* Mobile Address */}
        <div className="sm:hidden pb-2 -mt-1">
          <button
            onClick={() => setShowAddressDropdown(!showAddressDropdown)}
            className="flex items-center gap-1.5 text-sm text-gray-700"
          >
            <MapPin className="h-3.5 w-3.5 text-green-600" />
            <span className="font-medium truncate max-w-[250px]">
              {selectedAddress?.street || 'Set address'}
            </span>
            <ChevronDown className="h-3 w-3 text-gray-400" />
          </button>
          <AnimatePresence>
            {showAddressDropdown && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 bg-gray-50 rounded-xl overflow-hidden"
              >
                {addresses.map((addr) => (
                  <button
                    key={addr.id}
                    onClick={() => {
                      selectAddress(addr.id)
                      setShowAddressDropdown(false)
                    }}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-0 ${
                      selectedAddress?.id === addr.id ? 'bg-green-50' : ''
                    }`}
                  >
                    <Badge variant="default" className="text-xs mb-1">{addr.label}</Badge>
                    <p className="text-sm text-gray-700">{addr.street}</p>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white"
          >
            <nav className="px-4 py-4 space-y-1">
              <Link href="/favorites" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
                <Heart className="h-5 w-5" /> <span>Favorites</span>
              </Link>
              <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
                <Clock className="h-5 w-5" /> <span>Orders</span>
              </Link>
              <Link href="/support" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
                <Headphones className="h-5 w-5" /> <span>Support</span>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
