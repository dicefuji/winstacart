'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Clock, Tag, DollarSign, MessageSquare, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useCartStore } from '@/stores/cartStore'
import { useAddressStore } from '@/stores/addressStore'
import { useOrdersStore } from '@/stores/ordersStore'
import { formatPrice, getDeliveryTimeSlots } from '@/lib/utils'
import { getStoreById } from '@/data/stores'
import { DeliveryTimeSlot } from '@/lib/types'

const tipOptions = [
  { value: 0, label: 'None' },
  { value: 2, label: '$2' },
  { value: 5, label: '$5' },
  { value: 10, label: '$10' },
  { value: 15, label: '$15' },
]

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore(s => s.items)
  const activeStoreId = useCartStore(s => s.activeStoreId)
  const promoCode = useCartStore(s => s.promoCode)
  const promoInput = useCartStore(s => s.promoInput)
  const setPromoInput = useCartStore(s => s.setPromoInput)
  const applyPromo = useCartStore(s => s.applyPromo)
  const removePromo = useCartStore(s => s.removePromo)
  const deliveryTip = useCartStore(s => s.deliveryTip)
  const setTip = useCartStore(s => s.setTip)
  const deliveryInstructions = useCartStore(s => s.deliveryInstructions)
  const setDeliveryInstructions = useCartStore(s => s.setDeliveryInstructions)
  const selectedSlotId = useCartStore(s => s.selectedSlotId)
  const setSelectedSlot = useCartStore(s => s.setSelectedSlot)
  const getSubtotal = useCartStore(s => s.getSubtotal)
  const getDeliveryFee = useCartStore(s => s.getDeliveryFee)
  const getServiceFee = useCartStore(s => s.getServiceFee)
  const getPromoDiscount = useCartStore(s => s.getPromoDiscount)
  const getTotal = useCartStore(s => s.getTotal)
  const clearCart = useCartStore(s => s.clearCart)

  const selectedAddress = useAddressStore(s => s.getSelectedAddress())
  const addresses = useAddressStore(s => s.addresses)
  const selectAddress = useAddressStore(s => s.selectAddress)

  const placeOrder = useOrdersStore(s => s.placeOrder)

  const [customTip, setCustomTip] = useState('')
  const [showCustomTip, setShowCustomTip] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [isPlacing, setIsPlacing] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null)

  const store = activeStoreId ? getStoreById(activeStoreId) : null
  const deliverySlots = getDeliveryTimeSlots()
  const total = getTotal() + deliveryTip

  const handleApplyPromo = () => {
    setPromoError('')
    const result = applyPromo()
    if (!result.success) {
      setPromoError(result.message)
    }
  }

  const handlePlaceOrder = () => {
    if (!selectedAddress || !selectedSlotId) return
    setIsPlacing(true)

    setTimeout(() => {
      const selectedSlot = deliverySlots.find(s => s.id === selectedSlotId)
      const orderId = placeOrder({
        items: items.map(item => ({
          product: item.product,
          quantity: item.quantity,
          notes: item.notes,
          substitutionPreference: item.substitutionPreference,
        })),
        storeId: activeStoreId || '',
        storeName: store?.name || 'Store',
        deliveryAddress: selectedAddress,
        deliverySlot: selectedSlot || deliverySlots[0],
        deliveryInstructions,
        subtotal: getSubtotal(),
        deliveryFee: getDeliveryFee(),
        serviceFee: getServiceFee(),
        tip: deliveryTip,
        promoDiscount: getPromoDiscount(),
        total,
      })

      setPlacedOrderId(orderId)
      setOrderPlaced(true)
      clearCart()
      setIsPlacing(false)
    }, 1500)
  }

  if (orderPlaced && placedOrderId) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
        >
          <CheckCircle2 className="h-20 w-20 text-green-600 mx-auto mb-6" />
        </motion.div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed!</h1>
        <p className="text-gray-500 mb-8">Your order has been confirmed and is being prepared.</p>
        <div className="space-y-3">
          <Button onClick={() => router.push(`/orders/${placedOrderId}`)} className="w-full h-12 rounded-2xl">
            Track Your Order
          </Button>
          <Button variant="outline" onClick={() => router.push('/home')} className="w-full h-12 rounded-2xl">
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Add some items before checking out</p>
        <Link href="/home">
          <Button className="rounded-2xl">Start Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <Link href="/home" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to shopping
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid md:grid-cols-[1fr,360px] gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Delivery Address */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-gray-100"
          >
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
              <MapPin className="h-5 w-5 text-green-600" />
              Delivery Address
            </h2>
            <div className="space-y-2">
              {addresses.map(addr => (
                <button
                  key={addr.id}
                  onClick={() => selectAddress(addr.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedAddress?.id === addr.id
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={selectedAddress?.id === addr.id ? 'default' : 'tag'} className="text-xs">
                      {addr.label}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{addr.street}</p>
                  <p className="text-xs text-gray-500">{addr.city}, {addr.state} {addr.zip}</p>
                </button>
              ))}
            </div>
          </motion.section>

          {/* Delivery Time */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-gray-100"
          >
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
              <Clock className="h-5 w-5 text-green-600" />
              Delivery Time
            </h2>
            <RadioGroup value={selectedSlotId || ''} onValueChange={setSelectedSlot}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {deliverySlots.map((slot: DeliveryTimeSlot) => (
                  <label
                    key={slot.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedSlotId === slot.id
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-100 hover:border-gray-200'
                    } ${!slot.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <RadioGroupItem value={slot.id} disabled={!slot.available} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{slot.label}</p>
                      <p className="text-xs text-gray-500">{slot.date}</p>
                    </div>
                    {slot.fee === 0 ? (
                      <Badge variant="default" className="text-xs">Free</Badge>
                    ) : (
                      <span className="text-xs text-gray-500">+{formatPrice(slot.fee)}</span>
                    )}
                  </label>
                ))}
              </div>
            </RadioGroup>
          </motion.section>

          {/* Delivery Instructions */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-gray-100"
          >
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
              <MessageSquare className="h-5 w-5 text-green-600" />
              Delivery Instructions
            </h2>
            <Textarea
              value={deliveryInstructions}
              onChange={(e) => setDeliveryInstructions(e.target.value)}
              placeholder="e.g., Leave at front door, ring the doorbell, gate code #1234..."
              className="text-sm"
            />
          </motion.section>

          {/* Tip */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border border-gray-100"
          >
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
              <DollarSign className="h-5 w-5 text-green-600" />
              Delivery Tip
            </h2>
            <p className="text-sm text-gray-500 mb-4">100% of the tip goes to your shopper</p>
            <div className="flex flex-wrap gap-2">
              {tipOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setTip(opt.value)
                    setShowCustomTip(false)
                  }}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                    deliveryTip === opt.value && !showCustomTip
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              <button
                onClick={() => setShowCustomTip(true)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                  showCustomTip
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                Custom
              </button>
            </div>
            {showCustomTip && (
              <div className="flex gap-2 mt-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <Input
                    type="number"
                    value={customTip}
                    onChange={(e) => {
                      setCustomTip(e.target.value)
                      setTip(parseFloat(e.target.value) || 0)
                    }}
                    placeholder="0.00"
                    className="pl-7"
                    min="0"
                    step="0.50"
                  />
                </div>
              </div>
            )}
          </motion.section>
        </div>

        {/* Right Column - Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="md:sticky md:top-24"
        >
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">
              Order Summary {store && `· ${store.name}`}
            </h2>

            {/* Items */}
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden shrink-0 relative">
                    <Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="40px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-medium">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Promo Code */}
            {promoCode ? (
              <div className="flex items-center justify-between bg-green-50 px-3 py-2 rounded-xl mb-4">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">{promoCode.code}</span>
                </div>
                <button onClick={removePromo} className="text-xs text-gray-500">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Promo code"
                  value={promoInput}
                  onChange={(e) => {
                    setPromoInput(e.target.value)
                    setPromoError('')
                  }}
                  className="h-9 text-sm"
                />
                <Button variant="outline" size="sm" onClick={handleApplyPromo} disabled={!promoInput.trim()}>
                  Apply
                </Button>
              </div>
            )}
            {promoError && <p className="text-xs text-red-500 mb-3">{promoError}</p>}

            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(getSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span className="font-medium">
                  {getDeliveryFee() === 0 ? <span className="text-green-600">Free</span> : formatPrice(getDeliveryFee())}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service fee</span>
                <span className="font-medium">{formatPrice(getServiceFee())}</span>
              </div>
              {deliveryTip > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tip</span>
                  <span className="font-medium">{formatPrice(deliveryTip)}</span>
                </div>
              )}
              {getPromoDiscount() > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Promo</span>
                  <span className="font-medium">-{formatPrice(getPromoDiscount())}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <Button
              onClick={handlePlaceOrder}
              disabled={!selectedAddress || !selectedSlotId || isPlacing}
              className="w-full h-14 mt-6 text-base font-semibold rounded-2xl"
            >
              {isPlacing ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Placing Order...
                </span>
              ) : (
                `Place Order · ${formatPrice(total)}`
              )}
            </Button>

            {!selectedSlotId && (
              <p className="text-xs text-red-500 text-center mt-2">Please select a delivery time</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
