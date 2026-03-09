'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Shield, CheckCircle2, Clock, AlertCircle, ChevronRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { PaymentState, AuthorizationStatus } from '@/lib/charge-clarity-types'
import { trackChargeEvent } from '@/lib/charge-clarity-analytics'

interface PaymentStateCardProps {
  paymentState: PaymentState
}

const statusConfig: Record<
  AuthorizationStatus,
  { label: string; sublabel: string; color: string; bgColor: string; icon: React.ElementType }
> = {
  pending: {
    label: 'Authorization pending',
    sublabel: 'Waiting for order confirmation',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: Clock,
  },
  placed: {
    label: 'Authorization placed',
    sublabel: 'A temporary hold has been placed on your card',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: CreditCard,
  },
  shopping: {
    label: 'Shopping in progress',
    sublabel: 'Your shopper is fulfilling your order — total may change',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    icon: AlertCircle,
  },
  final_locked: {
    label: 'Final total locked',
    sublabel: 'Shopping complete — your final charge has been determined',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: CheckCircle2,
  },
  hold_releasing: {
    label: 'Pending hold releasing',
    sublabel: 'The temporary hold is being released by your bank',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: Shield,
  },
  settled: {
    label: 'Final charge posted',
    sublabel: 'Your payment is complete',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: CheckCircle2,
  },
}

/**
 * Order Tracking: Payment State Card
 *
 * Persistent card shown on order detail / tracking page.
 * Displays estimated total, authorized amount, current
 * authorization status, final total status, and pending
 * hold indicator with bank guidance.
 */
export default function PaymentStateCard({ paymentState }: PaymentStateCardProps) {
  const ps = paymentState
  const config = statusConfig[ps.authorizationStatus]
  const StatusIcon = config.icon

  // Track card view on mount
  useEffect(() => {
    trackChargeEvent('payment_state_card_view', ps.orderId)
  }, [ps.orderId])

  const showDelta = ps.finalTotalLocked && ps.finalTotal !== ps.estimatedTotal

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 p-5 mb-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-blue-600" />
        <h2 className="font-semibold text-gray-900">Payment Status</h2>
      </div>

      {/* Current status badge */}
      <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-gray-50">
        <div className={`w-9 h-9 rounded-lg ${config.bgColor} flex items-center justify-center shrink-0`}>
          <StatusIcon className={`h-4 w-4 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${config.color}`}>{config.label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{config.sublabel}</p>
        </div>
      </div>

      {/* Amount breakdown */}
      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Estimated total</span>
          <span className="font-medium text-gray-900">{formatPrice(ps.estimatedTotal)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Temporary authorization</span>
          <span className="font-medium text-gray-900">{formatPrice(ps.authorizationAmount)}</span>
        </div>

        {ps.finalTotalLocked ? (
          <div className="flex justify-between">
            <span className="text-gray-500">Final charge</span>
            <span className={`font-semibold ${showDelta ? 'text-amber-600' : 'text-green-600'}`}>
              {formatPrice(ps.finalTotal)}
            </span>
          </div>
        ) : (
          <div className="flex justify-between">
            <span className="text-gray-500">Final charge</span>
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Pending
            </span>
          </div>
        )}
      </div>

      {/* Delta hint */}
      {showDelta && (
        <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>
            Final charge differs from estimate by{' '}
            <span className="font-semibold">
              {ps.finalTotal > ps.estimatedTotal ? '+' : ''}
              {formatPrice(ps.finalTotal - ps.estimatedTotal)}
            </span>
            . See breakdown below.
          </span>
        </div>
      )}

      {/* Pending hold indicator */}
      {ps.pendingHoldPresent && ps.authorizationStatus !== 'settled' && (
        <div className="mt-3 flex items-start gap-2 text-xs text-blue-700 bg-blue-50 p-2.5 rounded-lg">
          <Clock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>
            <span className="font-semibold">Pending hold active.</span> Your bank may show a temporary pending amount
            of {formatPrice(ps.authorizationAmount)}. This will be updated to reflect your final charge. Release timing
            varies by bank — typically 1–3 business days.
          </span>
        </div>
      )}

      {/* Payment method */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <CreditCard className="h-3.5 w-3.5" />
          <span>
            {ps.paymentMethodType === 'credit_card' && 'Credit Card'}
            {ps.paymentMethodType === 'debit_card' && 'Debit Card'}
            {ps.paymentMethodType === 'apple_pay' && 'Apple Pay'}
            {ps.paymentMethodType === 'google_pay' && 'Google Pay'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-blue-600 cursor-pointer hover:underline">
          <span>Learn more</span>
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </motion.div>
  )
}
