'use client'

import React, { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Clock, Phone, MessageSquare, Package, CheckCircle2, Truck, ShoppingCart, CreditCard } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useOrdersStore } from '@/stores/ordersStore'
import { formatPrice } from '@/lib/utils'

const OrderMap = dynamic(() => import('@/components/order/OrderMap'), { ssr: false })

const steps = [
  { key: 'placed', label: 'Order Placed', icon: ShoppingCart },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'shopping', label: 'Shopping', icon: Package },
  { key: 'checkout', label: 'Checkout', icon: CreditCard },
  { key: 'delivering', label: 'On the Way', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: MapPin },
]

export default function OrderTrackingPage() {
  const params = useParams()
  const orderId = params.id as string
  const order = useOrdersStore(s => s.getOrderById(orderId))
  const updateOrderStatus = useOrdersStore(s => s.updateOrderStatus)
  const updateTrackingProgress = useOrdersStore(s => s.updateTrackingProgress)

  // Simulate order progress
  useEffect(() => {
    if (!order || order.status === 'delivered' || order.status === 'cancelled') return

    const statusOrder = ['placed', 'confirmed', 'shopping', 'checkout', 'delivering', 'delivered'] as const
    const currentIndex = statusOrder.indexOf(order.status as typeof statusOrder[number])

    const timer = setInterval(() => {
      if (order.status === 'delivering') {
        const currentProgress = order.trackingProgress || 0
        if (currentProgress < 100) {
          updateTrackingProgress(orderId, Math.min(currentProgress + 5, 100))
        } else {
          updateOrderStatus(orderId, 'delivered')
        }
      } else if (currentIndex < statusOrder.length - 1) {
        updateOrderStatus(orderId, statusOrder[currentIndex + 1])
      }
    }, 3000)

    return () => clearInterval(timer)
  }, [order, orderId, updateOrderStatus, updateTrackingProgress])

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h1>
        <p className="text-gray-500 mb-6">This order doesn&apos;t exist or has been removed.</p>
        <Link href="/orders">
          <Button>View All Orders</Button>
        </Link>
      </div>
    )
  }

  const currentStepIndex = steps.findIndex(s => s.key === order.status)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        All orders
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order from {order.storeName}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* Map */}
      {(order.status === 'delivering' || order.status === 'delivered') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6"
        >
          <div className="h-64 sm:h-80">
            <OrderMap
              progress={order.trackingProgress || 0}
              deliveryAddress={order.deliveryAddress}
            />
          </div>
          {order.status === 'delivering' && (
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Delivery in progress</span>
                <span className="text-sm text-green-600 font-medium">{order.trackingProgress || 0}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-green-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${order.trackingProgress || 0}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Shopper Info */}
      {order.status !== 'placed' && order.status !== 'cancelled' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 p-5 mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-lg">👤</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Alex M.</p>
              <p className="text-xs text-gray-500">Your shopper</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-full">
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <Phone className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Progress Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 p-5 mb-6"
      >
        <h2 className="font-semibold text-gray-900 mb-4">Order Status</h2>
        <div className="space-y-0">
          {steps.map((step, i) => {
            const StepIcon = step.icon
            const isCompleted = i < currentStepIndex
            const isCurrent = i === currentStepIndex
            void (i > currentStepIndex) // isPending - used for future styling

            return (
              <div key={step.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isCompleted
                        ? 'bg-green-600 text-white'
                        : isCurrent
                        ? 'bg-green-100 text-green-700 ring-2 ring-green-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <StepIcon className="h-4 w-4" />
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`w-0.5 h-8 ${
                        isCompleted ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
                <div className="pb-6">
                  <p
                    className={`text-sm font-medium ${
                      isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-green-600 mt-0.5">In progress...</p>
                  )}
                  {isCompleted && (
                    <p className="text-xs text-gray-400 mt-0.5">Completed</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Order Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-gray-100 p-5 mb-6"
      >
        <h2 className="font-semibold text-gray-900 mb-4">Order Details</h2>

        {/* Delivery Address */}
        <div className="flex items-start gap-3 mb-4">
          <MapPin className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900">{order.deliveryAddress.street}</p>
            <p className="text-xs text-gray-500">
              {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zip}
            </p>
          </div>
        </div>

        {/* Delivery Time */}
        <div className="flex items-start gap-3 mb-4">
          <Clock className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900">{order.deliverySlot.label}</p>
            <p className="text-xs text-gray-500">{order.deliverySlot.date}</p>
          </div>
        </div>

        {order.deliveryInstructions && (
          <div className="flex items-start gap-3">
            <MessageSquare className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Delivery instructions</p>
              <p className="text-sm text-gray-700">{order.deliveryInstructions}</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-gray-100 p-5 mb-6"
      >
        <h2 className="font-semibold text-gray-900 mb-4">
          Items ({order.items.length})
        </h2>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden shrink-0 relative">
                <Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="48px" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">{item.product.name}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
              <span className="text-sm font-medium">{formatPrice(item.product.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery</span>
            <span>{order.deliveryFee === 0 ? 'Free' : formatPrice(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Service fee</span>
            <span>{formatPrice(order.serviceFee)}</span>
          </div>
          {order.tip > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Tip</span>
              <span>{formatPrice(order.tip)}</span>
            </div>
          )}
          {order.promoDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Promo discount</span>
              <span>-{formatPrice(order.promoDiscount)}</span>
            </div>
          )}
          <Separator className="my-2" />
          <div className="flex justify-between font-bold text-base">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
