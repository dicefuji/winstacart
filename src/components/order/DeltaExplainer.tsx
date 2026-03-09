'use client'

import React, { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Scale, ArrowRightLeft, RotateCcw, Plus, DollarSign, Package } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { DeltaReason, DeltaReasonType, PaymentState } from '@/lib/charge-clarity-types'
import { trackChargeEvent } from '@/lib/charge-clarity-analytics'

interface DeltaExplainerProps {
  paymentState: PaymentState
}

const deltaIcons: Record<DeltaReasonType, React.ElementType> = {
  weighted_item_adjustment: Scale,
  replacement: ArrowRightLeft,
  refund: RotateCcw,
  add_on: Plus,
  tip_change: DollarSign,
}

const deltaColors: Record<DeltaReasonType, { bg: string; text: string; icon: string }> = {
  weighted_item_adjustment: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'text-amber-500' },
  replacement: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-500' },
  refund: { bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-500' },
  add_on: { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'text-purple-500' },
  tip_change: { bg: 'bg-gray-50', text: 'text-gray-700', icon: 'text-gray-500' },
}

/**
 * Final Receipt: Delta Explainer
 *
 * When the final total differs from the checkout estimate,
 * this component itemises every line-item difference so the
 * customer understands exactly why the amounts differ.
 */
export default function DeltaExplainer({ paymentState }: DeltaExplainerProps) {
  const ps = paymentState

  const meaningfulReasons = useMemo(
    () => ps.deltaReasons.filter(d => d.amount !== 0),
    [ps.deltaReasons]
  )

  const totalDelta = useMemo(
    () => meaningfulReasons.reduce((sum, d) => sum + d.amount, 0),
    [meaningfulReasons]
  )

  const shouldShow = ps.finalTotalLocked && ps.finalTotal !== ps.estimatedTotal && meaningfulReasons.length > 0

  // Track view when visible
  useEffect(() => {
    if (shouldShow) {
      trackChargeEvent('delta_explainer_view', ps.orderId)
    }
  }, [shouldShow, ps.orderId])

  if (!shouldShow) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 p-5 mb-6"
    >
      <div className="flex items-center gap-2 mb-1">
        <Package className="h-5 w-5 text-amber-500" />
        <h2 className="font-semibold text-gray-900">Why your total changed</h2>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Your final charge of <span className="font-semibold text-gray-700">{formatPrice(ps.finalTotal)}</span> differs
        from your estimated total of <span className="font-semibold text-gray-700">{formatPrice(ps.estimatedTotal)}</span>.
        Here&apos;s why:
      </p>

      {/* Delta line items */}
      <div className="space-y-2">
        {meaningfulReasons.map((reason, i) => (
          <DeltaRow key={i} reason={reason} />
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-900">Net adjustment</span>
          <span className={`text-sm font-bold ${totalDelta > 0 ? 'text-amber-600' : 'text-green-600'}`}>
            {totalDelta > 0 ? '+' : ''}{formatPrice(totalDelta)}
          </span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">Estimated total</span>
          <span className="text-xs text-gray-500">{formatPrice(ps.estimatedTotal)}</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-sm font-bold text-gray-900">Final charge</span>
          <span className="text-sm font-bold text-gray-900">{formatPrice(ps.finalTotal)}</span>
        </div>
      </div>
    </motion.div>
  )
}

function DeltaRow({ reason }: { reason: DeltaReason }) {
  const Icon = deltaIcons[reason.type]
  const colors = deltaColors[reason.type]
  const isPositive = reason.amount > 0
  const isZero = reason.amount === 0

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl ${colors.bg}`}>
      <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center shrink-0">
        <Icon className={`h-4 w-4 ${colors.icon}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${colors.text}`}>{reason.label}</p>
        {reason.itemName && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">{reason.itemName}</p>
        )}
      </div>
      <span className={`text-sm font-semibold shrink-0 ${
        isZero ? 'text-gray-400' : isPositive ? 'text-amber-600' : 'text-green-600'
      }`}>
        {isZero ? '$0.00' : `${isPositive ? '+' : ''}${formatPrice(reason.amount)}`}
      </span>
    </div>
  )
}
