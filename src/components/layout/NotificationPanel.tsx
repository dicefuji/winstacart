'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, CheckCheck, ChevronRight, AlertCircle, CreditCard, Sparkles, Scale } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { usePaymentStateStore } from '@/stores/paymentStateStore'
import { ChargeNotification, NotificationTrigger } from '@/lib/charge-clarity-types'
import { trackChargeEvent } from '@/lib/charge-clarity-analytics'

const triggerIcons: Record<NotificationTrigger, React.ElementType> = {
  large_auth_gap: AlertCircle,
  multiple_pending_auths: CreditCard,
  first_order: Sparkles,
  debit_card: CreditCard,
  high_variance_basket: Scale,
}

const triggerColors: Record<NotificationTrigger, { bg: string; icon: string }> = {
  large_auth_gap: { bg: 'bg-amber-50', icon: 'text-amber-500' },
  multiple_pending_auths: { bg: 'bg-red-50', icon: 'text-red-500' },
  first_order: { bg: 'bg-blue-50', icon: 'text-blue-500' },
  debit_card: { bg: 'bg-purple-50', icon: 'text-purple-500' },
  high_variance_basket: { bg: 'bg-green-50', icon: 'text-green-500' },
}

/**
 * Notification Bell + Dropdown Panel
 *
 * Shows proactive billing reassurance messages for high-confusion
 * cases: large auth gap, debit cards, first orders, etc.
 */
export default function NotificationPanel() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const notifications = usePaymentStateStore(s => s.getNotifications())
  const unreadCount = usePaymentStateStore(s => s.getUnreadCount())
  const markNotificationRead = usePaymentStateStore(s => s.markNotificationRead)
  const dismissNotification = usePaymentStateStore(s => s.dismissNotification)
  const markAllRead = usePaymentStateStore(s => s.markAllRead)

  const visibleNotifications = notifications.filter(n => !n.dismissed)

  const handleOpen = () => {
    setOpen(!open)
  }

  const handleNotificationClick = (notif: ChargeNotification) => {
    if (!notif.read) {
      markNotificationRead(notif.id)
      trackChargeEvent('billing_reassurance_notification_open', notif.orderId)
    }
    if (notif.actionUrl) {
      router.push(notif.actionUrl)
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleOpen}
        className="relative text-gray-600"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </Button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-semibold text-gray-900">Billing Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-red-100 text-red-600 font-medium px-1.5 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllRead()}
                      className="text-xs text-blue-600 hover:underline px-2 py-1"
                    >
                      <CheckCheck className="h-3.5 w-3.5 inline mr-0.5" />
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-96 overflow-y-auto">
                {visibleNotifications.length === 0 ? (
                  <div className="text-center py-10 px-4">
                    <Bell className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No billing notifications</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      We&apos;ll notify you about payment holds and charges
                    </p>
                  </div>
                ) : (
                  visibleNotifications.map((notif) => (
                    <NotificationItem
                      key={notif.id}
                      notification={notif}
                      onClick={() => handleNotificationClick(notif)}
                      onDismiss={() => dismissNotification(notif.id)}
                    />
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function NotificationItem({
  notification,
  onClick,
  onDismiss,
}: {
  notification: ChargeNotification
  onClick: () => void
  onDismiss: () => void
}) {
  const Icon = triggerIcons[notification.trigger]
  const colors = triggerColors[notification.trigger]
  const timeAgo = getTimeAgo(notification.createdAt)

  return (
    <div
      className={`flex gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${
        !notification.read ? 'bg-blue-50/30' : ''
      }`}
      onClick={onClick}
    >
      <div className={`w-9 h-9 rounded-xl ${colors.bg} flex items-center justify-center shrink-0 mt-0.5`}>
        <Icon className={`h-4 w-4 ${colors.icon}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm ${notification.read ? 'text-gray-700' : 'font-semibold text-gray-900'}`}>
            {notification.title}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDismiss()
            }}
            className="p-0.5 hover:bg-gray-200 rounded shrink-0"
          >
            <X className="h-3 w-3 text-gray-400" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
          {notification.body}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-gray-400">{timeAgo}</span>
          {notification.actionUrl && (
            <span className="text-xs text-blue-600 flex items-center gap-0.5">
              View order <ChevronRight className="h-3 w-3" />
            </span>
          )}
          {!notification.read && (
            <span className="w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </div>
      </div>
    </div>
  )
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
