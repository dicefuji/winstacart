// ============================================================
// Final Charge Clarity — Payment State Store
// Single source of truth for estimated total, authorization,
// final charge, delta reasons, and proactive notifications.
// ============================================================

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  PaymentState,
  AuthorizationStatus,
  PaymentMethodType,
  DeltaReason,
  DeltaReasonType,
  ChargeNotification,
} from '@/lib/charge-clarity-types'
import { generateId } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Helpers — mock simulation of realistic payment-state transitions
// ---------------------------------------------------------------------------

/** Buffer factor banks apply to the estimated total for auth holds */
const AUTH_BUFFER_FACTOR = 1.08 // 8 % over estimate

/** Pick a mock payment method (weighted toward credit cards) */
function pickPaymentMethod(): PaymentMethodType {
  const roll = Math.random()
  if (roll < 0.45) return 'credit_card'
  if (roll < 0.75) return 'debit_card'
  if (roll < 0.9) return 'apple_pay'
  return 'google_pay'
}

/** Generate deterministic delta reasons based on order items */
function generateDeltaReasons(
  estimatedTotal: number,
  itemCount: number,
): { deltaReasons: DeltaReason[]; finalTotal: number } {
  const reasons: DeltaReason[] = []
  let delta = 0

  // Weighted item adjustment (common for produce / deli)
  if (itemCount >= 3) {
    const adj = Math.round(estimatedTotal * 0.028) // ~2.8 %
    reasons.push({
      type: 'weighted_item_adjustment' as DeltaReasonType,
      label: 'Weighted produce adjustment',
      amount: adj,
      itemName: 'Organic Bananas',
    })
    delta += adj
  }

  // Replacement price difference
  if (itemCount >= 5) {
    const repl = Math.round(estimatedTotal * 0.012) // ~1.2 %
    reasons.push({
      type: 'replacement' as DeltaReasonType,
      label: 'Replacement item price difference',
      amount: repl,
      itemName: 'Almond Butter → Cashew Butter',
    })
    delta += repl
  }

  // Small refund for unavailable item
  if (itemCount >= 7) {
    const refund = -Math.round(estimatedTotal * 0.035) // -3.5 %
    reasons.push({
      type: 'refund' as DeltaReasonType,
      label: 'Refunded unavailable item',
      amount: refund,
      itemName: 'Sparkling Water Variety Pack',
    })
    delta += refund
  }

  // Tip stays unchanged — but we always include it as a $0 line so the
  // user sees "Tip: no change" in the delta explainer.
  reasons.push({
    type: 'tip_change' as DeltaReasonType,
    label: 'Tip — no change',
    amount: 0,
  })

  return {
    deltaReasons: reasons,
    finalTotal: estimatedTotal + delta,
  }
}

/** Build the initial PaymentState when an order is placed */
export function buildInitialPaymentState(
  orderId: string,
  estimatedTotal: number,
  itemCount: number,
): PaymentState {
  const authAmount = Math.round(estimatedTotal * AUTH_BUFFER_FACTOR)
  const paymentMethod = pickPaymentMethod()
  const { deltaReasons, finalTotal } = generateDeltaReasons(estimatedTotal, itemCount)

  return {
    orderId,
    estimatedTotal,
    authorizationAmount: authAmount,
    authorizationStatus: 'placed',
    finalTotal,
    finalTotalLocked: false,
    pendingHoldPresent: true,
    paymentMethodType: paymentMethod,
    deltaReasons,
    lastUpdated: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Notification generation helpers
// ---------------------------------------------------------------------------

function generateNotifications(
  orderId: string,
  ps: PaymentState,
  isFirstOrder: boolean,
): ChargeNotification[] {
  const notifs: ChargeNotification[] = []
  const now = new Date().toISOString()

  // Large auth-to-estimate gap (> 5 %)
  const gapPct = ((ps.authorizationAmount - ps.estimatedTotal) / ps.estimatedTotal) * 100
  if (gapPct > 5) {
    notifs.push({
      id: generateId(),
      orderId,
      trigger: 'large_auth_gap',
      title: 'About your pending bank hold',
      body: `Your bank may show a temporary hold of $${(ps.authorizationAmount / 100).toFixed(2)}, which is slightly higher than your estimated total of $${(ps.estimatedTotal / 100).toFixed(2)}. This is normal — the hold covers possible changes like weighted items or replacements. Your final charge will reflect only what you actually received.`,
      priority: 'high',
      read: false,
      dismissed: false,
      createdAt: now,
      actionUrl: `/orders/${orderId}`,
    })
  }

  // Debit card warning
  if (ps.paymentMethodType === 'debit_card') {
    notifs.push({
      id: generateId(),
      orderId,
      trigger: 'debit_card',
      title: 'Debit card hold notice',
      body: 'Since you\'re paying with a debit card, the temporary authorization may temporarily reduce your available balance. The hold will be released once your final charge is posted, but timing depends on your bank — typically 1–3 business days.',
      priority: 'high',
      read: false,
      dismissed: false,
      createdAt: now,
      actionUrl: `/orders/${orderId}`,
    })
  }

  // First order
  if (isFirstOrder) {
    notifs.push({
      id: generateId(),
      orderId,
      trigger: 'first_order',
      title: 'Welcome! Here\'s how billing works',
      body: 'After checkout, your bank may show a temporary pending amount. This is not your final charge — it\'s a hold to reserve funds while your order is being shopped. Your final charge will be calculated after all items are picked, and may differ slightly due to weighted items or substitutions.',
      priority: 'medium',
      read: false,
      dismissed: false,
      createdAt: now,
      actionUrl: `/orders/${orderId}`,
    })
  }

  // High-variance basket (many items = more chance of weight / sub differences)
  const itemCount = ps.deltaReasons.filter(d => d.type !== 'tip_change').length
  if (itemCount >= 3) {
    notifs.push({
      id: generateId(),
      orderId,
      trigger: 'high_variance_basket',
      title: 'Your order may have price adjustments',
      body: 'Your basket includes items that are sold by weight or may be substituted. This means your final total could differ slightly from the estimate. We\'ll show you a detailed breakdown once shopping is complete.',
      priority: 'low',
      read: false,
      dismissed: false,
      createdAt: now,
      actionUrl: `/orders/${orderId}`,
    })
  }

  return notifs
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface PaymentStateStoreData {
  paymentStates: Record<string, PaymentState>
  notifications: ChargeNotification[]

  // Actions
  initPaymentState: (orderId: string, estimatedTotal: number, itemCount: number, isFirstOrder: boolean) => void
  advanceAuthorizationStatus: (orderId: string, status: AuthorizationStatus) => void
  lockFinalTotal: (orderId: string) => void
  releaseHold: (orderId: string) => void
  getPaymentState: (orderId: string) => PaymentState | undefined
  getNotifications: () => ChargeNotification[]
  getUnreadCount: () => number
  markNotificationRead: (notifId: string) => void
  dismissNotification: (notifId: string) => void
  markAllRead: () => void
}

export const usePaymentStateStore = create<PaymentStateStoreData>()(
  persist(
    (set, get) => ({
      paymentStates: {},
      notifications: [],

      initPaymentState: (orderId, estimatedTotal, itemCount, isFirstOrder) => {
        const ps = buildInitialPaymentState(orderId, estimatedTotal, itemCount)
        const notifs = generateNotifications(orderId, ps, isFirstOrder)
        set({
          paymentStates: { ...get().paymentStates, [orderId]: ps },
          notifications: [...notifs, ...get().notifications],
        })
      },

      advanceAuthorizationStatus: (orderId, status) => {
        const current = get().paymentStates[orderId]
        if (!current) return
        set({
          paymentStates: {
            ...get().paymentStates,
            [orderId]: {
              ...current,
              authorizationStatus: status,
              lastUpdated: new Date().toISOString(),
            },
          },
        })
      },

      lockFinalTotal: (orderId) => {
        const current = get().paymentStates[orderId]
        if (!current) return
        set({
          paymentStates: {
            ...get().paymentStates,
            [orderId]: {
              ...current,
              finalTotalLocked: true,
              authorizationStatus: 'final_locked',
              lastUpdated: new Date().toISOString(),
            },
          },
        })
      },

      releaseHold: (orderId) => {
        const current = get().paymentStates[orderId]
        if (!current) return
        set({
          paymentStates: {
            ...get().paymentStates,
            [orderId]: {
              ...current,
              pendingHoldPresent: false,
              authorizationStatus: 'settled',
              lastUpdated: new Date().toISOString(),
            },
          },
        })
      },

      getPaymentState: (orderId) => get().paymentStates[orderId],

      getNotifications: () => get().notifications,

      getUnreadCount: () => get().notifications.filter(n => !n.read && !n.dismissed).length,

      markNotificationRead: (notifId) => {
        set({
          notifications: get().notifications.map(n =>
            n.id === notifId ? { ...n, read: true } : n
          ),
        })
      },

      dismissNotification: (notifId) => {
        set({
          notifications: get().notifications.map(n =>
            n.id === notifId ? { ...n, dismissed: true } : n
          ),
        })
      },

      markAllRead: () => {
        set({
          notifications: get().notifications.map(n => ({ ...n, read: true })),
        })
      },
    }),
    {
      name: 'winstacart-payment-state',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
