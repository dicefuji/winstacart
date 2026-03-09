// ============================================================
// Final Charge Clarity — Type Definitions
// Unified payment-state layer powering checkout, order tracking,
// receipts, support tooling, and notifications.
// ============================================================

/** Authorization lifecycle status */
export type AuthorizationStatus =
  | 'pending'          // Order not yet placed
  | 'placed'           // Auth hold placed on card
  | 'shopping'         // Shopper actively fulfilling
  | 'final_locked'     // Final total determined after shopping
  | 'hold_releasing'   // Pending hold being released by bank
  | 'settled'          // Final charge posted

/** Supported payment method types */
export type PaymentMethodType =
  | 'credit_card'
  | 'debit_card'
  | 'apple_pay'
  | 'google_pay'

/** Reason types for estimate-to-final delta */
export type DeltaReasonType =
  | 'weighted_item_adjustment'
  | 'replacement'
  | 'refund'
  | 'add_on'
  | 'tip_change'

/** A single line-item explaining why estimated != final */
export interface DeltaReason {
  type: DeltaReasonType
  label: string
  /** Signed amount in cents (+positive = increased, -negative = decreased) */
  amount: number
  /** Optional item name for context */
  itemName?: string
}

/** Core payment state for an order (mirrors suggested API shape) */
export interface PaymentState {
  orderId: string
  /** Checkout-time estimated total in cents */
  estimatedTotal: number
  /** Bank authorization hold amount in cents */
  authorizationAmount: number
  /** Current authorization lifecycle stage */
  authorizationStatus: AuthorizationStatus
  /** Actual final total in cents (may differ from estimate) */
  finalTotal: number
  /** Whether the final total has been determined */
  finalTotalLocked: boolean
  /** Whether a pending hold is still visible on bank statement */
  pendingHoldPresent: boolean
  /** Customer's payment method */
  paymentMethodType: PaymentMethodType
  /** Line-by-line reasons for any estimate ↔ final delta */
  deltaReasons: DeltaReason[]
  /** Timestamp of last state update */
  lastUpdated: string
}

/** Notification priority levels */
export type NotificationPriority = 'low' | 'medium' | 'high'

/** Trigger reasons for proactive billing notifications */
export type NotificationTrigger =
  | 'large_auth_gap'
  | 'multiple_pending_auths'
  | 'first_order'
  | 'debit_card'
  | 'high_variance_basket'

/** In-app billing reassurance notification */
export interface ChargeNotification {
  id: string
  orderId: string
  trigger: NotificationTrigger
  title: string
  body: string
  priority: NotificationPriority
  read: boolean
  dismissed: boolean
  createdAt: string
  actionUrl?: string
}

/** Analytics event names for charge clarity instrumentation */
export type ChargeEventName =
  | 'charge_clarity_module_impression'
  | 'charge_clarity_module_expand'
  | 'payment_state_card_view'
  | 'delta_explainer_view'
  | 'billing_reassurance_notification_sent'
  | 'billing_reassurance_notification_open'
  | 'billing_related_support_contact'
  | 'chargeback_initiated'

/** Payload for a tracked charge clarity event */
export interface ChargeEvent {
  event: ChargeEventName
  orderId?: string
  timestamp: string
  metadata?: Record<string, string | number | boolean>
}
