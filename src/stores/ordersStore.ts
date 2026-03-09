import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Order, OrderStatus, DeliveryAddress, CartItem, DeliverySlot } from '@/lib/types'
import { generateId, getEstimatedDelivery } from '@/lib/utils'
import { getStoreById } from '@/data/stores'

interface OrdersState {
  orders: Order[]
  activeOrderId: string | null

  placeOrder: (params: {
    items: { product: CartItem['product']; quantity: number; notes?: string; substitutionPreference?: CartItem['substitutionPreference'] }[]
    storeId: string
    subtotal: number
    deliveryFee: number
    serviceFee: number
    tip: number
    promoDiscount: number
    total: number
    deliverySlot: DeliverySlot
    deliveryAddress: DeliveryAddress
    deliveryInstructions: string
    storeName?: string
  }) => string

  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  updateTrackingProgress: (orderId: string, progress: number) => void
  setActiveOrder: (orderId: string | null) => void
  getOrderById: (orderId: string) => Order | undefined
  getActiveOrder: () => Order | undefined
  getRecentOrders: () => Order[]
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      activeOrderId: null,

      placeOrder: (params) => {
        const orderId = generateId()
        const store = getStoreById(params.storeId)
        const shopperNames = ['Sarah M.', 'James K.', 'Emily R.', 'Michael T.', 'Jessica L.', 'David W.']
        const shopperName = shopperNames[Math.floor(Math.random() * shopperNames.length)]
        
        const order: Order = {
          id: orderId,
          storeId: params.storeId,
          storeName: params.storeName || store?.name || 'Unknown Store',
          items: params.items.map(item => ({
            product: item.product,
            quantity: item.quantity,
            priceAtPurchase: item.product.price,
          })),
          subtotal: params.subtotal,
          deliveryFee: params.deliveryFee,
          serviceFee: params.serviceFee,
          tip: params.tip,
          promoDiscount: params.promoDiscount,
          total: params.total,
          status: 'placed',
          createdAt: new Date().toISOString(),
          deliverySlot: params.deliverySlot,
          deliveryAddress: params.deliveryAddress,
          deliveryInstructions: params.deliveryInstructions,
          estimatedDelivery: getEstimatedDelivery(),
          trackingProgress: 0,
          shopperName,
          shopperPhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=${shopperName}`,
        }

        set({
          orders: [order, ...get().orders],
          activeOrderId: orderId,
        })
        return orderId
      },

      updateOrderStatus: (orderId: string, status: OrderStatus) => {
        set({
          orders: get().orders.map(o =>
            o.id === orderId ? { ...o, status } : o
          ),
        })
      },

      updateTrackingProgress: (orderId: string, progress: number) => {
        set({
          orders: get().orders.map(o =>
            o.id === orderId ? { ...o, trackingProgress: progress } : o
          ),
        })
      },

      setActiveOrder: (orderId: string | null) => set({ activeOrderId: orderId }),

      getOrderById: (orderId: string) => get().orders.find(o => o.id === orderId),

      getActiveOrder: () => {
        const { activeOrderId, orders } = get()
        if (!activeOrderId) return undefined
        return orders.find(o => o.id === activeOrderId)
      },

      getRecentOrders: () => get().orders.slice(0, 20),
    }),
    {
      name: 'winstacart-orders',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
