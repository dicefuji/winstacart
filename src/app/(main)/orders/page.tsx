'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Package, ChevronRight, RotateCcw, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useOrdersStore } from '@/stores/ordersStore'
import { useCartStore } from '@/stores/cartStore'
import { formatPrice } from '@/lib/utils'
import { Order } from '@/lib/types'

const statusColors: Record<string, string> = {
  placed: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shopping: 'bg-amber-100 text-amber-700',
  checkout: 'bg-amber-100 text-amber-700',
  delivering: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const statusLabels: Record<string, string> = {
  placed: 'Order Placed',
  confirmed: 'Confirmed',
  shopping: 'Shopping',
  checkout: 'Checking Out',
  delivering: 'On the Way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export default function OrdersPage() {
  const orders = useOrdersStore(s => s.orders)
  const addItem = useCartStore(s => s.addItem)
  const openCart = useCartStore(s => s.openCart)

  const handleReorder = (order: Order) => {
    order.items.forEach(item => {
      addItem(item.product, item.quantity)
    })
    openCart()
  }

  const sortedOrders = [...orders].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Orders</h1>

      {sortedOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-8 w-8 text-gray-300" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">No orders yet</h2>
          <p className="text-sm text-gray-500 mb-6">Start shopping to see your orders here.</p>
          <Link href="/home">
            <Button>Start Shopping</Button>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {sortedOrders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{order.storeName}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <Badge className={`${statusColors[order.status]} border-0 text-xs`}>
                  {statusLabels[order.status]}
                </Badge>
              </div>

              {/* Items preview */}
              <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
                {order.items.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden shrink-0 relative">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                ))}
                {order.items.length > 5 && (
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-xs text-gray-500 font-medium">+{order.items.length - 5}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-gray-900 font-medium">
                    {formatPrice(order.total)} · {order.items.length} item{order.items.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {order.status === 'delivered' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReorder(order)}
                      className="text-xs gap-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reorder
                    </Button>
                  )}
                  {(order.status !== 'delivered' && order.status !== 'cancelled') && (
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline" size="sm" className="text-xs gap-1">
                        <Package className="h-3 w-3" />
                        Track
                      </Button>
                    </Link>
                  )}
                  <Link href={`/orders/${order.id}`}>
                    <Button variant="ghost" size="icon-sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
