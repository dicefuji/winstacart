// ============================================================
// Final Charge Clarity — Event Instrumentation
// Tracks all charge-clarity related user interactions.
// In production this would forward to an analytics backend;
// here we log to console and persist in-memory for the
// support-tooling view.
// ============================================================

import { ChargeEvent, ChargeEventName } from './charge-clarity-types'

/** In-memory event log (also exposed to support tooling) */
const eventLog: ChargeEvent[] = []

/**
 * Track a charge-clarity analytics event.
 * Logs to console in dev and stores in the event buffer.
 */
export function trackChargeEvent(
  event: ChargeEventName,
  orderId?: string,
  metadata?: Record<string, string | number | boolean>,
): void {
  const entry: ChargeEvent = {
    event,
    orderId,
    timestamp: new Date().toISOString(),
    metadata,
  }
  eventLog.push(entry)

  if (process.env.NODE_ENV === 'development') {
    console.log('[ChargeClarity]', entry.event, entry.orderId ?? '', entry.metadata ?? '')
  }
}

/** Return all logged events (for support tooling / debugging) */
export function getChargeEvents(): ChargeEvent[] {
  return [...eventLog]
}

/** Return events filtered by order */
export function getChargeEventsForOrder(orderId: string): ChargeEvent[] {
  return eventLog.filter(e => e.orderId === orderId)
}

/** Clear the event log (for testing) */
export function clearChargeEvents(): void {
  eventLog.length = 0
}
