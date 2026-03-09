'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ChevronDown, ChevronUp, Info, CreditCard, AlertCircle } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { trackChargeEvent } from '@/lib/charge-clarity-analytics'

interface ChargeClarityProps {
  estimatedTotal: number
  subtotal: number
  deliveryFee: number
  serviceFee: number
  tip: number
  promoDiscount: number
}

/**
 * Checkout: Charge Clarity Module
 *
 * Displayed before the Place Order button. Shows:
 * - Estimated total
 * - Fee breakdown with explanations
 * - Temporary authorization amount/range
 * - Why the final total may change
 * - Bank pending hold explanation
 */
export default function ChargeClarity({
  estimatedTotal,
  subtotal,
  deliveryFee,
  serviceFee,
  tip,
  promoDiscount,
}: ChargeClarityProps) {
  const [expanded, setExpanded] = useState(false)

  // Authorization range: estimate to estimate + 8%
  const authLow = estimatedTotal
  const authHigh = Math.round(estimatedTotal * 1.08)

  // Track impression on mount
  useEffect(() => {
    trackChargeEvent('charge_clarity_module_impression')
  }, [])

  const handleToggle = () => {
    const next = !expanded
    setExpanded(next)
    if (next) {
      trackChargeEvent('charge_clarity_module_expand')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 overflow-hidden"
    >
      {/* Summary row — always visible */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <Shield className="h-4.5 w-4.5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Charge Clarity</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Estimated total: <span className="font-medium text-gray-700">{formatPrice(estimatedTotal)}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-blue-600 font-medium hidden sm:block">
            {expanded ? 'Hide details' : 'View details'}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-blue-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-blue-500" />
          )}
        </div>
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              {/* Fee Breakdown */}
              <div className="bg-white/70 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                  Fee Breakdown
                </p>
                <Row label="Items subtotal" value={formatPrice(subtotal)} />
                <Row
                  label="Delivery fee"
                  value={deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}
                  valueClass={deliveryFee === 0 ? 'text-green-600' : undefined}
                />
                <Row label="Service fee (5%)" value={formatPrice(serviceFee)} />
                {tip > 0 && <Row label="Tip (100% to shopper)" value={formatPrice(tip)} />}
                {promoDiscount > 0 && (
                  <Row label="Promo discount" value={`-${formatPrice(promoDiscount)}`} valueClass="text-green-600" />
                )}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <Row label="Estimated total" value={formatPrice(estimatedTotal)} bold />
                </div>
              </div>

              {/* Temporary Authorization */}
              <div className="bg-white/70 rounded-xl p-4">
                <div className="flex items-start gap-2.5">
                  <CreditCard className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Temporary authorization</p>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Your bank may place a temporary hold of{' '}
                      <span className="font-semibold text-gray-800">
                        {formatPrice(authLow)} – {formatPrice(authHigh)}
                      </span>{' '}
                      on your card. This is <span className="font-medium">not</span> a second charge — it&apos;s a
                      standard authorization to reserve funds while your order is being fulfilled.
                    </p>
                  </div>
                </div>
              </div>

              {/* Why it may change */}
              <div className="bg-white/70 rounded-xl p-4">
                <div className="flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Why your final charge may differ</p>
                    <ul className="text-xs text-gray-600 mt-1.5 space-y-1 leading-relaxed">
                      <li className="flex items-start gap-1.5">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span><span className="font-medium text-gray-700">Weighted items</span> like produce are priced by actual weight at pickup</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span><span className="font-medium text-gray-700">Replacements</span> may have a different price than your original item</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span><span className="font-medium text-gray-700">Add-ons</span> requested during shopping will increase the total</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span><span className="font-medium text-gray-700">Tip changes</span> made after checkout will adjust the final amount</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Bank notice */}
              <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-100">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <span className="font-semibold">Pending hold notice:</span> Your bank may show a temporary pending
                    amount that is <span className="font-medium">not</span> a second or final charge. The pending hold
                    will be released once your final charge is posted. Timing varies by bank — typically 1–3 business
                    days after delivery.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/** Small helper row for the fee breakdown */
function Row({
  label,
  value,
  bold,
  valueClass,
}: {
  label: string
  value: string
  bold?: boolean
  valueClass?: string
}) {
  return (
    <div className={`flex justify-between text-xs ${bold ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
      <span>{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  )
}
