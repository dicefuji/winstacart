'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, Trash2, Tag, ChevronDown, ChevronUp, MessageSquare, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCartStore } from '@/stores/cartStore'
import { formatPrice } from '@/lib/utils'
import { getStoreById } from '@/data/stores'
import { SubstitutionPreference } from '@/lib/types'

export default function CartDrawer() {
  const router = useRouter()
  const isOpen = useCartStore(s => s.isOpen)
  const closeCart = useCartStore(s => s.closeCart)
  const items = useCartStore(s => s.items)
  const activeStoreId = useCartStore(s => s.activeStoreId)
  const updateQuantity = useCartStore(s => s.updateQuantity)
  const removeItem = useCartStore(s => s.removeItem)
  const updateNotes = useCartStore(s => s.updateNotes)
  const updateSubstitution = useCartStore(s => s.updateSubstitution)
  const clearCart = useCartStore(s => s.clearCart)
  const promoCode = useCartStore(s => s.promoCode)
  const promoInput = useCartStore(s => s.promoInput)
  const setPromoInput = useCartStore(s => s.setPromoInput)
  const applyPromo = useCartStore(s => s.applyPromo)
  const removePromo = useCartStore(s => s.removePromo)
  const getSubtotal = useCartStore(s => s.getSubtotal)
  const getDeliveryFee = useCartStore(s => s.getDeliveryFee)
  const getServiceFee = useCartStore(s => s.getServiceFee)
  const getPromoDiscount = useCartStore(s => s.getPromoDiscount)
  const getTotal = useCartStore(s => s.getTotal)

  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [promoError, setPromoError] = useState('')
  const [promoSuccess, setPromoSuccess] = useState('')

  const store = activeStoreId ? getStoreById(activeStoreId) : null

  const handleApplyPromo = () => {
    setPromoError('')
    setPromoSuccess('')
    const result = applyPromo()
    if (result.success) {
      setPromoSuccess(result.message)
    } else {
      setPromoError(result.message)
    }
  }

  const handleCheckout = () => {
    closeCart()
    router.push('/checkout')
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className="flex flex-col p-0 w-full sm:w-[420px]">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="text-xl">
            {items.length > 0 ? `Cart${store ? ` - ${store.name}` : ''}` : 'Your Cart'}
          </SheetTitle>
          <SheetDescription>
            {items.length > 0
              ? `${items.length} item${items.length > 1 ? 's' : ''}`
              : 'Your cart is empty'
            }
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🛒</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Your cart is empty</h3>
            <p className="text-sm text-gray-500 mb-6">Browse stores and add items to get started</p>
            <Button onClick={closeCart}>Start Shopping</Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    className="py-4 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex gap-3">
                      <div className="w-16 h-16 bg-gray-50 rounded-xl shrink-0 overflow-hidden relative">
                        <Image src={item.product.image} alt={item.product.name} fill className="object-cover rounded-xl" sizes="64px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{item.product.name}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{item.product.brand} · {item.product.unit}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-lg bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expand/Collapse for notes and substitution */}
                    <button
                      onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                      className="flex items-center gap-1 mt-2 text-xs text-gray-500 hover:text-gray-700"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>Notes & Substitutions</span>
                      {expandedItem === item.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>

                    <AnimatePresence>
                      {expandedItem === item.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 space-y-3">
                            <Textarea
                              placeholder="Add a note (e.g., 'pick green bananas')"
                              value={item.notes}
                              onChange={(e) => updateNotes(item.id, e.target.value)}
                              className="text-xs h-16"
                            />
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">If item is unavailable:</label>
                              <Select
                                value={item.substitutionPreference}
                                onValueChange={(value) => updateSubstitution(item.id, value as SubstitutionPreference)}
                              >
                                <SelectTrigger className="h-9 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="best_match">Best match</SelectItem>
                                  <SelectItem value="dont_replace">Don&apos;t replace</SelectItem>
                                  <SelectItem value="specific">Choose specific</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Promo Code */}
            <div className="px-6 py-3 border-t border-gray-100">
              {promoCode ? (
                <div className="flex items-center justify-between bg-green-50 px-3 py-2 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">{promoCode.code}</span>
                    <Badge variant="default" className="text-xs">{promoCode.description}</Badge>
                  </div>
                  <button onClick={removePromo} className="text-xs text-gray-500 hover:text-gray-700">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Promo code"
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value)
                      setPromoError('')
                    }}
                    className="h-9 text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleApplyPromo}
                    disabled={!promoInput.trim()}
                  >
                    Apply
                  </Button>
                </div>
              )}
              {promoError && <p className="text-xs text-red-500 mt-1">{promoError}</p>}
              {promoSuccess && <p className="text-xs text-green-600 mt-1">{promoSuccess}</p>}
            </div>

            {/* Order Summary */}
            <div className="px-6 py-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(getSubtotal())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery fee</span>
                <span className="font-medium">
                  {getDeliveryFee() === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    formatPrice(getDeliveryFee())
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service fee</span>
                <span className="font-medium">{formatPrice(getServiceFee())}</span>
              </div>
              {getPromoDiscount() > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Promo discount</span>
                  <span className="font-medium text-green-600">-{formatPrice(getPromoDiscount())}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base font-semibold">
                <span>Estimated total</span>
                <span>{formatPrice(getTotal())}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={clearCart} className="text-xs">
                  Clear Cart
                </Button>
                <Button onClick={handleCheckout} className="flex-1 h-12 text-base font-semibold rounded-2xl">
                  Go to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
