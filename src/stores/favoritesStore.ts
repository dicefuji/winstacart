import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface FavoritesState {
  favoriteIds: string[]
  toggleFavorite: (productId: string) => void
  isFavorite: (productId: string) => boolean
  clearFavorites: () => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],

      toggleFavorite: (productId: string) => {
        const { favoriteIds } = get()
        if (favoriteIds.includes(productId)) {
          set({ favoriteIds: favoriteIds.filter(id => id !== productId) })
        } else {
          set({ favoriteIds: [...favoriteIds, productId] })
        }
      },

      isFavorite: (productId: string) => get().favoriteIds.includes(productId),

      clearFavorites: () => set({ favoriteIds: [] }),
    }),
    {
      name: 'winstacart-favorites',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
