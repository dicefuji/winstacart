'use client'

import React from 'react'
import { ArrowRight } from 'lucide-react'
import { products } from '@/data/products'
import ProductCard from '@/components/product/ProductCard'

export default function DealsSection() {
  const dealProducts = products.filter(p => p.originalPrice && p.originalPrice > p.price).slice(0, 8)

  if (dealProducts.length === 0) return null

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Deals & Sales</h2>
          <p className="text-sm text-gray-500 mt-0.5">Save on your favorites</p>
        </div>
        <button className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700">
          Show all <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {dealProducts.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </section>
  )
}
