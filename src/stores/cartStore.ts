import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { CartItem, Product, SubstitutionPreference, PromoCode } from '@/lib/types'
import { generateId } from '@/lib/utils'
import { validatePromoCode, calculatePromoDiscount } from '@/data/promos'

interface CartState {
  items: CartItem[]
  isOpen: boolean
  activeStoreId: string | null
  promoCode: PromoCode | null
  promoInput: string
  deliveryTip: number
  deliveryInstructions: string
  selectedSlotId: string | null

  addItem: (product: Product, quantity?: number) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  updateNotes: (itemId: string, notes: string) => void
  updateSubstitution: (itemId: string, pref: SubstitutionPreference, specific?: string) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  setPromoInput: (input: string) => void
  applyPromo: () => { success: boolean; message: string }
  removePromo: () => void
  setTip: (tip: number) => void
  setDeliveryInstructions: (instructions: string) => void
  setSelectedSlot: (slotId: string | null) => void

  getSubtotal: () => number
  getDeliveryFee: () => number
  getServiceFee: () => number
  getPromoDiscount: () => number
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      activeStoreId: null,
      promoCode: null,
      promoInput: '',
      deliveryTip: 200,
      deliveryInstructions: '',
      selectedSlotId: null,

      addItem: (product: Product, quantity = 1) => {
        const state = get()
        if (state.activeStoreId && state.activeStoreId !== product.storeId && state.items.length > 0) {
          if (!confirm('Adding items from a different store will clear your current cart. Continue?')) return
          set({ items: [], activeStoreId: product.storeId })
        }
        
        const existing = state.items.find(item => item.product.id === product.id)
        if (existing) {
          set({
            items: state.items.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
            activeStoreId: product.storeId,
          })
        } else {
          set({
            items: [...state.items, {
              id: generateId(),
              product,
              quantity,
              notes: '',
              substitutionPreference: 'best_match',
            }],
            activeStoreId: product.storeId,
          })
        }
      },

      removeItem: (itemId: string) => {
        const newItems = get().items.filter(item => item.id !== itemId)
        set({
          items: newItems,
          activeStoreId: newItems.length === 0 ? null : get().activeStoreId,
        })
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }
        set({
          items: get().items.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        })
      },

      updateNotes: (itemId: string, notes: string) => {
        set({
          items: get().items.map(item =>
            item.id === itemId ? { ...item, notes } : item
          ),
        })
      },

      updateSubstitution: (itemId: string, pref: SubstitutionPreference, specific?: string) => {
        set({
          items: get().items.map(item =>
            item.id === itemId
              ? { ...item, substitutionPreference: pref, specificSubstitution: specific }
              : item
          ),
        })
      },

      clearCart: () => set({ items: [], activeStoreId: null, promoCode: null, promoInput: '', deliveryTip: 200, selectedSlotId: null, deliveryInstructions: '' }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      setPromoInput: (input: string) => set({ promoInput: input }),

      applyPromo: () => {
        const { promoInput } = get()
        const promo = validatePromoCode(promoInput)
        if (!promo) {
          return { success: false, message: 'Invalid or expired promo code' }
        }
        const subtotal = get().getSubtotal()
        if (subtotal < promo.minOrder) {
          return { success: false, message: `Minimum order of $${(promo.minOrder / 100).toFixed(2)} required` }
        }
        set({ promoCode: promo })
        return { success: true, message: promo.description }
      },

      removePromo: () => set({ promoCode: null, promoInput: '' }),
      setTip: (tip: number) => set({ deliveryTip: tip }),
      setDeliveryInstructions: (instructions: string) => set({ deliveryInstructions: instructions }),
      setSelectedSlot: (slotId: string | null) => set({ selectedSlotId: slotId }),

      getSubtotal: () => get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      getDeliveryFee: () => get().getSubtotal() >= 3500 ? 0 : 399,
      getServiceFee: () => Math.round(get().getSubtotal() * 0.05),
      getPromoDiscount: () => {
        const { promoCode } = get()
        if (!promoCode) return 0
        return calculatePromoDiscount(promoCode, get().getSubtotal())
      },
      getTotal: () => {
        const subtotal = get().getSubtotal()
        const deliveryFee = get().getDeliveryFee()
        const serviceFee = get().getServiceFee()
        const tip = get().deliveryTip
        const discount = get().getPromoDiscount()
        return subtotal + deliveryFee + serviceFee + tip - discount
      },
      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'winstacart-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        activeStoreId: state.activeStoreId,
        promoCode: state.promoCode,
        deliveryTip: state.deliveryTip,
        deliveryInstructions: state.deliveryInstructions,
        selectedSlotId: state.selectedSlotId,
      }),
    }
  )
)
