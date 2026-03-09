import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { DeliveryAddress } from '@/lib/types'
import { generateId } from '@/lib/utils'

interface AddressState {
  addresses: DeliveryAddress[]
  selectedAddressId: string | null

  addAddress: (address: Omit<DeliveryAddress, 'id'>) => string
  updateAddress: (id: string, updates: Partial<DeliveryAddress>) => void
  removeAddress: (id: string) => void
  setDefault: (id: string) => void
  selectAddress: (id: string) => void
  getSelectedAddress: () => DeliveryAddress | undefined
  getDefaultAddress: () => DeliveryAddress | undefined
}

const defaultAddresses: DeliveryAddress[] = [
  {
    id: 'addr-1',
    label: 'Home',
    street: '2550 Van Ness Avenue',
    apt: 'Apt 4B',
    city: 'San Francisco',
    state: 'CA',
    zip: '94109',
    instructions: 'Leave at door. Ring doorbell.',
    isDefault: true,
  },
  {
    id: 'addr-2',
    label: 'Work',
    street: '101 Market Street',
    apt: 'Suite 300',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105',
    instructions: 'Leave with front desk security.',
    isDefault: false,
  },
]

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: defaultAddresses,
      selectedAddressId: 'addr-1',

      addAddress: (address) => {
        const id = generateId()
        const newAddress: DeliveryAddress = { ...address, id }
        if (address.isDefault) {
          set({
            addresses: [...get().addresses.map(a => ({ ...a, isDefault: false })), newAddress],
            selectedAddressId: id,
          })
        } else {
          set({ addresses: [...get().addresses, newAddress] })
        }
        return id
      },

      updateAddress: (id, updates) => {
        set({
          addresses: get().addresses.map(a => a.id === id ? { ...a, ...updates } : a),
        })
      },

      removeAddress: (id) => {
        const addresses = get().addresses.filter(a => a.id !== id)
        set({
          addresses,
          selectedAddressId: get().selectedAddressId === id 
            ? (addresses.find(a => a.isDefault)?.id || addresses[0]?.id || null)
            : get().selectedAddressId,
        })
      },

      setDefault: (id) => {
        set({
          addresses: get().addresses.map(a => ({ ...a, isDefault: a.id === id })),
        })
      },

      selectAddress: (id) => set({ selectedAddressId: id }),

      getSelectedAddress: () => {
        const { addresses, selectedAddressId } = get()
        return addresses.find(a => a.id === selectedAddressId) || addresses.find(a => a.isDefault) || addresses[0]
      },

      getDefaultAddress: () => get().addresses.find(a => a.isDefault) || get().addresses[0],
    }),
    {
      name: 'winstacart-addresses',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
