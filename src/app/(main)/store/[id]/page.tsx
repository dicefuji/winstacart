'use client'

import React, { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, Star, Truck, Search } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getStoreById } from '@/data/stores'
import { getProductsByStore } from '@/data/products'
import ProductCard from '@/components/product/ProductCard'
import { Product } from '@/lib/types'

export default function StorePage() {
  const params = useParams()
  const storeId = params.id as string
  const store = getStoreById(storeId)
  const allProducts = getProductsByStore(storeId)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'name'>('default')

  const categories = useMemo(() => {
    const cats = new Set(allProducts.map((p: Product) => p.category))
    return ['all', ...Array.from(cats)]
  }, [allProducts])

  const filteredProducts = useMemo(() => {
    let result = allProducts

    if (selectedCategory !== 'all') {
      result = result.filter((p: Product) => p.category === selectedCategory)
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter((p: Product) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
    }

    switch (sortBy) {
      case 'price-low':
        result = [...result].sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        result = [...result].sort((a, b) => b.price - a.price)
        break
      case 'name':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return result
  }, [allProducts, selectedCategory, searchQuery, sortBy])

  if (!store) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Store not found</h1>
        <p className="text-gray-500 mb-6">The store you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/home">
          <Button>Back to stores</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Store Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link href="/home" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to stores
        </Link>

        <div className="flex items-start gap-4 sm:gap-6">
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shrink-0 shadow-md"
            style={{ backgroundColor: store.color }}
          >
            {store.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{store.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{store.deliveryTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span>{store.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Truck className="h-4 w-4" />
                <span>{store.deliveryFee === 0 ? 'Free delivery' : `$${store.deliveryFee.toFixed(2)} delivery`}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {store.tags.map((tag) => (
                <Badge key={tag} variant="tag">{tag}</Badge>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-3 max-w-2xl">{store.description}</p>
          </div>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search in ${store.name}...`}
            className="pl-10 h-11 rounded-full bg-white"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="h-11 px-4 rounded-full border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="default">Sort: Default</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name">Name: A-Z</option>
        </select>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="mb-4">
        <span className="text-sm text-gray-500">{filteredProducts.length} products</span>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">No products found</p>
          <p className="text-gray-400 text-sm mt-1">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredProducts.map((product: Product, i: number) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
