'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { stores } from '@/data/stores'
import CategoryBar from '@/components/home/CategoryBar'
import FilterBar from '@/components/home/FilterBar'
import StoreCard from '@/components/home/StoreCard'
import DealsSection from '@/components/home/DealsSection'
import PopularItems from '@/components/home/PopularItems'
import { Store, StoreTag } from '@/lib/types'

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedFilter, setSelectedFilter] = useState('all')

  const filteredStores = useMemo(() => {
    let result = stores

    if (selectedCategory !== 'all') {
      result = result.filter((s: Store) => s.categories.includes(selectedCategory))
    }

    if (selectedFilter !== 'all') {
      result = result.filter((s: Store) => s.tags.includes(selectedFilter as StoreTag))
    }

    return result
  }, [selectedCategory, selectedFilter])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-3xl p-6 sm:p-8 mb-8 text-white"
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Groceries delivered in as fast as 1 hour
        </h1>
        <p className="text-green-100 text-sm sm:text-base max-w-lg">
          Shop your favorite stores, compare prices, and get everything delivered to your door.
        </p>
      </motion.div>

      {/* Categories */}
      <section className="mb-6">
        <CategoryBar selected={selectedCategory} onSelect={setSelectedCategory} />
      </section>

      {/* Filters */}
      <section className="mb-6">
        <FilterBar selected={selectedFilter} onSelect={setSelectedFilter} />
      </section>

      {/* Stores Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {selectedCategory === 'all' ? 'All Stores' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Stores`}
          </h2>
          <span className="text-sm text-gray-500">{filteredStores.length} stores</span>
        </div>

        {filteredStores.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No stores found</p>
            <p className="text-gray-400 text-sm mt-1">Try a different category or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStores.map((store: Store, i: number) => (
              <StoreCard key={store.id} store={store} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Deals Section */}
      <DealsSection />

      {/* Popular Items */}
      <PopularItems />
    </div>
  )
}
