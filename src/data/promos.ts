import { PromoCode } from '@/lib/types'

export const promoCodes: PromoCode[] = [
  { code: 'WELCOME20', discount: 20, type: 'percentage', minOrder: 2000, description: '20% off your first order', valid: true },
  { code: 'SAVE10', discount: 1000, type: 'fixed', minOrder: 5000, description: '$10 off orders $50+', valid: true },
  { code: 'FREEDELIVERY', discount: 599, type: 'fixed', minOrder: 3500, description: 'Free delivery on orders $35+', valid: true },
  { code: 'FRESH15', discount: 15, type: 'percentage', minOrder: 3000, description: '15% off fresh produce', valid: true },
  { code: 'SPRING25', discount: 25, type: 'percentage', minOrder: 4000, description: '25% off orders $40+', valid: true },
  { code: 'BULK5', discount: 500, type: 'fixed', minOrder: 7500, description: '$5 off bulk orders $75+', valid: true },
  { code: 'EXPIRED2024', discount: 10, type: 'percentage', minOrder: 0, description: 'Expired promo', valid: false },
]

export function validatePromoCode(code: string): PromoCode | null {
  const promo = promoCodes.find(p => p.code.toUpperCase() === code.toUpperCase())
  if (!promo || !promo.valid) return null
  return promo
}

export function calculatePromoDiscount(promo: PromoCode, subtotal: number): number {
  if (subtotal < promo.minOrder) return 0
  if (promo.type === 'percentage') {
    return Math.round(subtotal * (promo.discount / 100))
  }
  return Math.min(promo.discount, subtotal)
}
