import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function formatPriceWhole(cents: number): { dollars: string; cents: string } {
  const total = cents / 100
  const dollars = Math.floor(total).toString()
  const c = Math.round((total - Math.floor(total)) * 100).toString().padStart(2, '0')
  return { dollars, cents: c }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function getDeliveryTimeSlots(): { id: string; label: string; date: string; available: boolean; fee: number }[] {
  const slots: { id: string; label: string; date: string; available: boolean; fee: number }[] = []
  const now = new Date()
  
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(now)
    date.setDate(date.getDate() + dayOffset)
    const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    
    const timeWindows = [
      { start: '8:00 AM', end: '10:00 AM' },
      { start: '10:00 AM', end: '12:00 PM' },
      { start: '12:00 PM', end: '2:00 PM' },
      { start: '2:00 PM', end: '4:00 PM' },
      { start: '4:00 PM', end: '6:00 PM' },
      { start: '6:00 PM', end: '8:00 PM' },
      { start: '8:00 PM', end: '10:00 PM' },
    ]
    
    for (const window of timeWindows) {
      const slotId = `${dayOffset}-${window.start.replace(/[: ]/g, '')}`
      slots.push({
        id: slotId,
        label: `${window.start} - ${window.end}`,
        date: dateStr,
        available: Math.random() > 0.2,
        fee: dayOffset === 0 && timeWindows.indexOf(window) === 0 ? 199 : 0,
      })
    }
  }
  
  return slots
}

export function getEstimatedDelivery(): string {
  const now = new Date()
  const min = new Date(now.getTime() + 45 * 60000)
  const max = new Date(now.getTime() + 75 * 60000)
  return `${min.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${max.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
}
