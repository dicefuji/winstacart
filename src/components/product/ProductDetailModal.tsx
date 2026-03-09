'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus, Heart, Leaf, WheatOff, MilkOff, Info, ChevronDown, ChevronUp } from 'lucide-react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Product, SubstitutionPreference } from '@/lib/types'
import { formatPrice, formatPriceWhole } from '@/lib/utils'
import { useCartStore } from '@/stores/cartStore'
import { useFavoritesStore } from '@/stores/favoritesStore'

interface ProductDetailModalProps {
  product: Product
  open: boolean
  onClose: () => void
}

export default function ProductDetailModal({ product, open, onClose }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [substitution, setSubstitution] = useState<SubstitutionPreference>('best_match')
  const [showNutrition, setShowNutrition] = useState(false)
  const [showIngredients, setShowIngredients] = useState(false)
  
  const addItem = useCartStore(s => s.addItem)
  const items = useCartStore(s => s.items)
  const toggleFavorite = useFavoritesStore(s => s.toggleFavorite)
  const isFavorite = useFavoritesStore(s => s.isFavorite)

  const cartItem = items.find(i => i.product.id === product.id)
  const fav = isFavorite(product.id)
  const { dollars, cents } = formatPriceWhole(product.price)
  const n = product.nutrition

  const handleAddToCart = () => {
    addItem(product, quantity)
    onClose()
    setQuantity(1)
    setNotes('')
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        {/* Image */}
        <div className="relative aspect-video bg-gray-50 overflow-hidden rounded-t-2xl">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 512px"
          />
          <button
            onClick={() => toggleFavorite(product.id)}
            className="absolute top-4 right-12 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
          >
            <Heart className={`h-5 w-5 ${fav ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </button>
          <div className="absolute bottom-3 left-3 flex gap-1.5">
            {product.organic && <Badge variant="organic">Organic</Badge>}
            {product.glutenFree && <Badge variant="secondary"><WheatOff className="h-3 w-3 mr-1" />GF</Badge>}
            {product.vegan && <Badge variant="secondary"><Leaf className="h-3 w-3 mr-1" />Vegan</Badge>}
            {product.dairyFree && <Badge variant="secondary"><MilkOff className="h-3 w-3 mr-1" />DF</Badge>}
          </div>
        </div>

        <div className="p-6 pt-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 text-left">{product.name}</DialogTitle>
            <DialogDescription className="text-sm text-gray-500 text-left">
              {product.brand} · {product.unit} · {product.weight}
            </DialogDescription>
          </DialogHeader>

          {/* Price */}
          <div className="flex items-baseline gap-1 mt-3">
            <span className="text-3xl font-bold text-gray-900">${dollars}</span>
            <span className="text-xl font-bold text-gray-900">{cents}</span>
            {product.originalPrice && (
              <span className="text-base text-gray-400 line-through ml-2">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span className="text-sm text-gray-500 ml-1">/ {product.unit}</span>
          </div>

          {product.dealText && (
            <Badge variant="sale" className="mt-2">{product.dealText}</Badge>
          )}

          <p className="text-sm text-gray-600 mt-4 leading-relaxed">{product.description}</p>

          <Separator className="my-4" />

          {/* Quantity Selector */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Quantity</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-lg font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 rounded-xl bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Item notes</label>
            <Textarea
              placeholder="e.g., 'Pick green bananas' or 'Extra ripe please'"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* Substitution */}
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">If unavailable</label>
            <Select value={substitution} onValueChange={(v) => setSubstitution(v as SubstitutionPreference)}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="best_match">Pick best match</SelectItem>
                <SelectItem value="dont_replace">Don&apos;t replace</SelectItem>
                <SelectItem value="specific">Choose specific alternative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="my-4" />

          {/* Nutrition */}
          <button
            onClick={() => setShowNutrition(!showNutrition)}
            className="flex items-center justify-between w-full py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span>Nutrition Facts</span>
            </div>
            {showNutrition ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showNutrition && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="bg-gray-50 rounded-xl p-4 text-sm"
            >
              <p className="text-xs text-gray-500 mb-2">Serving size: {n.servingSize}</p>
              <div className="border-t-8 border-gray-900 pt-1">
                <div className="flex justify-between font-bold text-lg border-b-4 border-gray-900 pb-1">
                  <span>Calories</span>
                  <span>{n.calories}</span>
                </div>
                <p className="text-right text-xs text-gray-500 py-1">% Daily Value*</p>
                {[
                  { label: 'Total Fat', value: `${n.totalFat}g`, bold: true },
                  { label: '  Saturated Fat', value: `${n.saturatedFat}g`, bold: false },
                  { label: '  Trans Fat', value: `${n.transFat}g`, bold: false },
                  { label: 'Cholesterol', value: `${n.cholesterol}mg`, bold: true },
                  { label: 'Sodium', value: `${n.sodium}mg`, bold: true },
                  { label: 'Total Carbohydrate', value: `${n.totalCarbs}g`, bold: true },
                  { label: '  Dietary Fiber', value: `${n.dietaryFiber}g`, bold: false },
                  { label: '  Total Sugars', value: `${n.totalSugars}g`, bold: false },
                  { label: '  Added Sugars', value: `${n.addedSugars}g`, bold: false },
                  { label: 'Protein', value: `${n.protein}g`, bold: true },
                ].map((row) => (
                  <div key={row.label} className={`flex justify-between py-0.5 border-b border-gray-200 ${row.bold ? 'font-semibold' : 'text-gray-600'}`}>
                    <span>{row.label}</span>
                    <span>{row.value}</span>
                  </div>
                ))}
                <Separator className="my-2" />
                <div className="space-y-0.5 text-gray-600">
                  <div className="flex justify-between"><span>Vitamin D</span><span>{n.vitaminD}mcg</span></div>
                  <div className="flex justify-between"><span>Calcium</span><span>{n.calcium}mg</span></div>
                  <div className="flex justify-between"><span>Iron</span><span>{n.iron}mg</span></div>
                  <div className="flex justify-between"><span>Potassium</span><span>{n.potassium}mg</span></div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Ingredients */}
          <button
            onClick={() => setShowIngredients(!showIngredients)}
            className="flex items-center justify-between w-full py-2 mt-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <span>Ingredients</span>
            {showIngredients ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showIngredients && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600"
            >
              {product.ingredients}
            </motion.div>
          )}

          {/* Add to Cart */}
          <div className="mt-6 sticky bottom-0 bg-white pt-2">
            <Button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="w-full h-14 text-base font-semibold rounded-2xl shadow-lg"
            >
              {product.inStock
                ? `Add to Cart · ${formatPrice(product.price * quantity)}`
                : 'Out of Stock'
              }
            </Button>
            {cartItem && (
              <p className="text-center text-xs text-gray-500 mt-2">
                {cartItem.quantity} already in cart
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
