'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  Search,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  Scale,
  ArrowRightLeft,
  RotateCcw,
  Plus,
  DollarSign,
  Headphones,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useOrdersStore } from '@/stores/ordersStore'
import { usePaymentStateStore } from '@/stores/paymentStateStore'
import { formatPrice } from '@/lib/utils'
import { getChargeEvents, getChargeEventsForOrder } from '@/lib/charge-clarity-analytics'
import {
  AuthorizationStatus,
  DeltaReasonType,
  ChargeNotification,
} from '@/lib/charge-clarity-types'

const statusLabels: Record<AuthorizationStatus, string> = {
  pending: 'Pending',
  placed: 'Auth Placed',
  shopping: 'Shopping',
  final_locked: 'Final Locked',
  hold_releasing: 'Hold Releasing',
  settled: 'Settled',
}

const statusColors: Record<AuthorizationStatus, string> = {
  pending: 'bg-gray-100 text-gray-700',
  placed: 'bg-blue-100 text-blue-700',
  shopping: 'bg-amber-100 text-amber-700',
  final_locked: 'bg-green-100 text-green-700',
  hold_releasing: 'bg-purple-100 text-purple-700',
  settled: 'bg-green-200 text-green-800',
}

const deltaTypeIcons: Record<DeltaReasonType, React.ElementType> = {
  weighted_item_adjustment: Scale,
  replacement: ArrowRightLeft,
  refund: RotateCcw,
  add_on: Plus,
  tip_change: DollarSign,
}

/**
 * Support Tooling Page
 *
 * Agent-facing view showing the same payment-state breakdown
 * customers see: estimated total, auth amount, final total,
 * delta reasons, hold guidance, notifications, and analytics
 * events for any order.
 */
export default function SupportPage() {
  const [searchId, setSearchId] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [showEvents, setShowEvents] = useState(false)
  const orders = useOrdersStore(s => s.orders)
  const getPaymentState = usePaymentStateStore(s => s.getPaymentState)
  const notifications = usePaymentStateStore(s => s.getNotifications())
  const allEvents = getChargeEvents()

  const handleSearch = () => {
    if (searchId.trim()) {
      setSelectedOrderId(searchId.trim())
    }
  }

  const selectedPS = selectedOrderId ? getPaymentState(selectedOrderId) : undefined
  const selectedOrder = selectedOrderId
    ? orders.find(o => o.id === selectedOrderId)
    : undefined
  const orderNotifications = selectedOrderId
    ? notifications.filter(n => n.orderId === selectedOrderId)
    : []
  const orderEvents = selectedOrderId ? getChargeEventsForOrder(selectedOrderId) : []

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
          <Headphones className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tooling</h1>
          <p className="text-sm text-gray-500">Payment state viewer — see what the customer sees</p>
        </div>
      </div>

      {/* Order Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-500" />
          Look up order payment state
        </h2>
        <div className="flex gap-2">
          <Input
            placeholder="Enter order ID..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={!searchId.trim()}>
            Search
          </Button>
        </div>

        {/* Quick select from recent orders */}
        {orders.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-400 mb-2">Recent orders:</p>
            <div className="flex flex-wrap gap-1.5">
              {orders.slice(0, 8).map(o => (
                <button
                  key={o.id}
                  onClick={() => setSelectedOrderId(o.id)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    selectedOrderId === o.id
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-700 font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {o.storeName} · {o.id.slice(0, 8)}...
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Order Details */}
      {selectedOrderId && !selectedPS && (
        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5 text-center">
          <AlertCircle className="h-8 w-8 text-amber-400 mx-auto mb-2" />
          <p className="text-sm text-amber-700 font-medium">No payment state found for order {selectedOrderId}</p>
          <p className="text-xs text-amber-600 mt-1">This order may not have charge clarity data yet.</p>
        </div>
      )}

      {selectedPS && (
        <div className="space-y-6">
          {/* Order Info Header */}
          {selectedOrder && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedOrder.storeName} — Order {selectedOrder.id.slice(0, 12)}...
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Placed {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <Badge className={`${statusColors[selectedPS.authorizationStatus]} border-0 text-xs`}>
                  {statusLabels[selectedPS.authorizationStatus]}
                </Badge>
              </div>
            </div>
          )}

          {/* Payment State Breakdown (same view customer sees) */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
              <Shield className="h-5 w-5 text-blue-600" />
              Payment State Breakdown
            </h3>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <StatBox label="Estimated total" value={formatPrice(selectedPS.estimatedTotal)} icon={FileText} color="blue" />
              <StatBox label="Temporary authorization" value={formatPrice(selectedPS.authorizationAmount)} icon={CreditCard} color="indigo" />
              <StatBox
                label="Final charge"
                value={selectedPS.finalTotalLocked ? formatPrice(selectedPS.finalTotal) : 'Pending'}
                icon={selectedPS.finalTotalLocked ? CheckCircle2 : Clock}
                color={selectedPS.finalTotalLocked ? 'green' : 'amber'}
              />
              <StatBox
                label="Pending hold"
                value={selectedPS.pendingHoldPresent ? 'Active' : 'Released'}
                icon={selectedPS.pendingHoldPresent ? AlertCircle : CheckCircle2}
                color={selectedPS.pendingHoldPresent ? 'amber' : 'green'}
              />
            </div>

            <Separator className="my-4" />

            {/* Authorization lifecycle */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Authorization lifecycle
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(['pending', 'placed', 'shopping', 'final_locked', 'hold_releasing', 'settled'] as AuthorizationStatus[]).map(
                  (status) => (
                    <span
                      key={status}
                      className={`text-xs px-2 py-1 rounded-full ${
                        status === selectedPS.authorizationStatus
                          ? statusColors[status] + ' font-semibold ring-2 ring-offset-1 ring-current'
                          : 'bg-gray-50 text-gray-400'
                      }`}
                    >
                      {statusLabels[status]}
                    </span>
                  )
                )}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Payment method + hold guidance */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Payment method</span>
                <span className="font-medium text-gray-900">
                  {selectedPS.paymentMethodType.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Auth-to-estimate gap</span>
                <span className="font-medium text-gray-900">
                  +{formatPrice(selectedPS.authorizationAmount - selectedPS.estimatedTotal)} (
                  {((selectedPS.authorizationAmount - selectedPS.estimatedTotal) / selectedPS.estimatedTotal * 100).toFixed(1)}%)
                </span>
              </div>
              {selectedPS.finalTotalLocked && selectedPS.finalTotal !== selectedPS.estimatedTotal && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Estimate-to-final delta</span>
                  <span className={`font-medium ${selectedPS.finalTotal > selectedPS.estimatedTotal ? 'text-amber-600' : 'text-green-600'}`}>
                    {selectedPS.finalTotal > selectedPS.estimatedTotal ? '+' : ''}
                    {formatPrice(selectedPS.finalTotal - selectedPS.estimatedTotal)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Last updated</span>
                <span className="text-xs text-gray-500">
                  {new Date(selectedPS.lastUpdated).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Delta Reasons */}
          {selectedPS.deltaReasons.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
                <Scale className="h-5 w-5 text-amber-500" />
                Delta Reasons
              </h3>
              <div className="space-y-2">
                {selectedPS.deltaReasons.map((reason, i) => {
                  const Icon = deltaTypeIcons[reason.type]
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Icon className="h-4 w-4 text-gray-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700">{reason.label}</p>
                        {reason.itemName && (
                          <p className="text-xs text-gray-400 truncate">{reason.itemName}</p>
                        )}
                      </div>
                      <span className={`text-sm font-medium shrink-0 ${
                        reason.amount === 0 ? 'text-gray-400' : reason.amount > 0 ? 'text-amber-600' : 'text-green-600'
                      }`}>
                        {reason.amount === 0 ? '$0.00' : `${reason.amount > 0 ? '+' : ''}${formatPrice(reason.amount)}`}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Notifications sent for this order */}
          {orderNotifications.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Proactive Notifications ({orderNotifications.length})
              </h3>
              <div className="space-y-2">
                {orderNotifications.map((notif: ChargeNotification) => (
                  <div key={notif.id} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{notif.title}</span>
                      <div className="flex items-center gap-1.5">
                        <Badge className="text-xs bg-gray-200 text-gray-600 border-0">{notif.trigger}</Badge>
                        <Badge className={`text-xs border-0 ${notif.read ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {notif.read ? 'Read' : 'Unread'}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{notif.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Events */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <button
              onClick={() => setShowEvents(!showEvents)}
              className="flex items-center justify-between w-full"
            >
              <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                <FileText className="h-5 w-5 text-indigo-500" />
                Analytics Events ({orderEvents.length} for order, {allEvents.length} total)
              </h3>
              {showEvents ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showEvents && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 space-y-1 max-h-64 overflow-y-auto"
              >
                {(orderEvents.length > 0 ? orderEvents : allEvents.slice(0, 20)).map((evt, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs p-2 bg-gray-50 rounded-lg font-mono">
                    <span className="text-indigo-600 font-medium shrink-0">{evt.event}</span>
                    <span className="text-gray-400 shrink-0">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                    {evt.orderId && (
                      <span className="text-gray-500 truncate">{evt.orderId.slice(0, 10)}...</span>
                    )}
                  </div>
                ))}
                {orderEvents.length === 0 && allEvents.length === 0 && (
                  <p className="text-xs text-gray-400 py-4 text-center">No events recorded yet</p>
                )}
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Empty state when nothing selected */}
      {!selectedOrderId && orders.length === 0 && (
        <div className="text-center py-20">
          <Headphones className="h-12 w-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">No orders yet</p>
          <p className="text-xs text-gray-400">Place an order to see payment state data here</p>
        </div>
      )}
    </div>
  )
}

function StatBox({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  icon: React.ElementType
  color: string
}) {
  const colorMap: Record<string, { bg: string; iconColor: string }> = {
    blue: { bg: 'bg-blue-50', iconColor: 'text-blue-500' },
    indigo: { bg: 'bg-indigo-50', iconColor: 'text-indigo-500' },
    green: { bg: 'bg-green-50', iconColor: 'text-green-500' },
    amber: { bg: 'bg-amber-50', iconColor: 'text-amber-500' },
  }
  const c = colorMap[color] || colorMap.blue

  return (
    <div className={`${c.bg} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`h-4 w-4 ${c.iconColor}`} />
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  )
}
