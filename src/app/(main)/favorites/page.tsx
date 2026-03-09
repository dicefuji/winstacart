'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { getProductById } from '@/data/products'
import ProductCard from '@/components/product/ProductCard'
import { Product } from '@/lib/types'

export default function FavoritesPage() {
  const favoriteIds = useFavoritesStore(s => s.favoriteIds)
  const clearFavorites = useFavoritesStore(s => s.clearFavorites)

  const favoriteProducts = favoriteIds
    .map(id => getProductById(id))
    .filter((p): p is Product => p !== undefined)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Items</h1>
          <p className="text-sm text-gray-500 mt-1">
            {favoriteProducts.length} item{favoriteProducts.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        {favoriteProducts.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearFavorites}>
            Clear All
          </Button>
        )}
      </div>

      {favoriteProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-gray-300" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">No saved items yet</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Tap the heart icon on any product to save it here for quick access later.
          </p>
          <Link href="/home">
            <Button>Browse Stores</Button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {favoriteProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
