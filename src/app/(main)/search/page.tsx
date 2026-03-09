'use client'

import React, { useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet'
import { searchProducts, products } from '@/data/products'
import ProductCard from '@/components/product/ProductCard'
import { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

const dietaryOptions = [
  { id: 'organic', label: 'Organic' },
  { id: 'glutenFree', label: 'Gluten Free' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'dairyFree', label: 'Dairy Free' },
]

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  )
}

function SearchPageContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQuery)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])
  const [selectedDietary, setSelectedDietary] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [onSaleOnly, setOnSaleOnly] = useState(false)
  const [inStockOnly, setInStockOnly] = useState(true)
  const [sortBy, setSortBy] = useState<'relevance' | 'price-low' | 'price-high' | 'name'>('relevance')

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category))
    return ['all', ...Array.from(cats).sort()]
  }, [])

  const brands = useMemo(() => {
    const b = new Set(products.map(p => p.brand))
    return Array.from(b).sort()
  }, [])

  const [selectedBrands, setSelectedBrands] = useState<string[]>([])

  const filteredProducts = useMemo(() => {
    let result = query ? searchProducts(query) : [...products]

    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory)
    }

    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])

    if (selectedDietary.includes('organic')) result = result.filter(p => p.organic)
    if (selectedDietary.includes('glutenFree')) result = result.filter(p => p.glutenFree)
    if (selectedDietary.includes('vegan')) result = result.filter(p => p.vegan)
    if (selectedDietary.includes('dairyFree')) result = result.filter(p => p.dairyFree)

    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand))
    }

    if (onSaleOnly) result = result.filter(p => p.originalPrice && p.originalPrice > p.price)
    if (inStockOnly) result = result.filter(p => p.inStock)

    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break
      case 'price-high': result.sort((a, b) => b.price - a.price); break
      case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break
    }

    return result
  }, [query, selectedCategory, priceRange, selectedDietary, selectedBrands, onSaleOnly, inStockOnly, sortBy])

  const toggleDietary = (id: string) => {
    setSelectedDietary(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    )
  }

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    )
  }

  const activeFilterCount = [
    selectedCategory !== 'all',
    priceRange[0] > 0 || priceRange[1] < 5000,
    selectedDietary.length > 0,
    selectedBrands.length > 0,
    onSaleOnly,
    !inStockOnly,
  ].filter(Boolean).length

  const clearFilters = () => {
    setSelectedCategory('all')
    setPriceRange([0, 5000])
    setSelectedDietary([])
    setSelectedBrands([])
    setOnSaleOnly(false)
    setInStockOnly(true)
  }

  const filterContentJsx = (
    <div className="space-y-6 py-4">
      {/* Category */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Category</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
        </h3>
        <Slider
          min={0}
          max={5000}
          step={50}
          value={priceRange}
          onValueChange={(v) => setPriceRange(v as [number, number])}
        />
      </div>

      {/* Dietary */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Dietary</h3>
        <div className="space-y-2">
          {dietaryOptions.map(opt => (
            <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedDietary.includes(opt.id)}
                onCheckedChange={() => toggleDietary(opt.id)}
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Brand</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {brands.map(brand => (
            <label key={brand} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() => toggleBrand(brand)}
              />
              <span className="text-sm text-gray-700">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sale & Stock */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Other</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={onSaleOnly} onCheckedChange={(v) => setOnSaleOnly(!!v)} />
            <span className="text-sm text-gray-700">On sale only</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={inStockOnly} onCheckedChange={(v) => setInStockOnly(!!v)} />
            <span className="text-sm text-gray-700">In stock only</span>
          </label>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          Clear all filters
        </Button>
      )}
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Search Bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="pl-10 h-12 rounded-full bg-white text-base"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Mobile filter button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="lg" className="md:hidden shrink-0 rounded-full relative">
              <SlidersHorizontal className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-green-600 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] overflow-y-auto rounded-t-3xl">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>Narrow down your search results</SheetDescription>
            </SheetHeader>
            {filterContentJsx}
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCategory !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {selectedCategory}
              <button onClick={() => setSelectedCategory('all')}><X className="h-3 w-3" /></button>
            </Badge>
          )}
          {selectedDietary.map(d => (
            <Badge key={d} variant="secondary" className="gap-1">
              {dietaryOptions.find(o => o.id === d)?.label}
              <button onClick={() => toggleDietary(d)}><X className="h-3 w-3" /></button>
            </Badge>
          ))}
          {selectedBrands.map(b => (
            <Badge key={b} variant="secondary" className="gap-1">
              {b}
              <button onClick={() => toggleBrand(b)}><X className="h-3 w-3" /></button>
            </Badge>
          ))}
          {onSaleOnly && (
            <Badge variant="sale" className="gap-1">
              On Sale
              <button onClick={() => setOnSaleOnly(false)}><X className="h-3 w-3" /></button>
            </Badge>
          )}
        </div>
      )}

      <div className="flex gap-6">
        {/* Desktop Filters */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Filters</h2>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-green-600 hover:text-green-700">
                  Clear all
                </button>
              )}
            </div>
            {filterContentJsx}
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
              {query && ` for "${query}"`}
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
            >
              <option value="relevance">Most Relevant</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A-Z</option>
            </select>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-lg font-medium text-gray-900">No results found</p>
              <p className="text-sm text-gray-500 mt-1">Try different keywords or adjust your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProducts.map((product: Product, i: number) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
