'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus, Heart } from 'lucide-react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/lib/types'
import { formatPrice, formatPriceWhole } from '@/lib/utils'
import { useCartStore } from '@/stores/cartStore'
import { useFavoritesStore } from '@/stores/favoritesStore'
import ProductDetailModal from '@/components/product/ProductDetailModal'

interface ProductCardProps {
  product: Product
  index?: number
  compact?: boolean
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [showDetail, setShowDetail] = useState(false)
  const addItem = useCartStore(s => s.addItem)
  const items = useCartStore(s => s.items)
  const updateQuantity = useCartStore(s => s.updateQuantity)
  const toggleFavorite = useFavoritesStore(s => s.toggleFavorite)
  const isFavorite = useFavoritesStore(s => s.isFavorite)

  const cartItem = items.find(i => i.product.id === product.id)
  const quantity = cartItem?.quantity || 0
  const fav = isFavorite(product.id)
  const { dollars, cents } = formatPriceWhole(product.price)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: index * 0.03 }}
        className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
      >
        {/* Image */}
        <div
          className="relative aspect-square bg-gray-50 cursor-pointer overflow-hidden"
          onClick={() => setShowDetail(true)}
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.organic && <Badge variant="organic" className="text-[10px] px-1.5 py-0">Organic</Badge>}
            {product.dealText && <Badge variant="sale" className="text-[10px] px-1.5 py-0">{product.dealText}</Badge>}
            {!product.inStock && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Out of stock</Badge>}
          </div>

          {/* Favorite */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id) }}
            className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
          >
            <Heart className={`h-3.5 w-3.5 ${fav ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </button>

          {/* Add to cart button */}
          {product.inStock && (
            <div className="absolute bottom-2 right-2">
              {quantity === 0 ? (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); addItem(product) }}
                  className="w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </motion.button>
              ) : (
                <div className="flex items-center gap-1 bg-white rounded-full shadow-lg border border-gray-200 p-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (cartItem) updateQuantity(cartItem.id, quantity - 1)
                    }}
                    className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold text-green-700">{quantity}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (cartItem) updateQuantity(cartItem.id, quantity + 1)
                    }}
                    className="w-7 h-7 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 cursor-pointer" onClick={() => setShowDetail(true)}>
          <div className="flex items-baseline gap-0.5">
            <span className="text-lg font-bold text-gray-900">${dollars}</span>
            <span className="text-sm font-bold text-gray-900">{cents}</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through ml-1.5">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <h3 className="text-sm text-gray-700 mt-1 line-clamp-2 leading-snug">{product.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{product.unit}</p>
        </div>
      </motion.div>

      <ProductDetailModal
        product={product}
        open={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </>
  )
}
