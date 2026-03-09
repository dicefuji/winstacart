export interface Store {
  id: string
  name: string
  logo: string
  color: string
  deliveryTime: string
  deliveryFee: number
  minOrder: number
  rating: number
  categories: string[]
  tags: StoreTag[]
  description: string
  address: string
  isOpen: boolean
}

export type StoreTag = 'No markups' | 'EBT' | 'Pickup' | 'New' | 'In-store prices'

export interface Category {
  id: string
  name: string
  icon: string
  color: string
}

export interface Product {
  id: string
  storeId: string
  name: string
  brand: string
  price: number
  originalPrice?: number
  unit: string
  image: string
  category: string
  subcategory: string
  description: string
  inStock: boolean
  organic: boolean
  glutenFree: boolean
  vegan: boolean
  dairyFree: boolean
  nutrition: NutritionInfo
  ingredients: string
  weight: string
  sku: string
  tags: string[]
  dealText?: string
}

export interface NutritionInfo {
  servingSize: string
  calories: number
  totalFat: number
  saturatedFat: number
  transFat: number
  cholesterol: number
  sodium: number
  totalCarbs: number
  dietaryFiber: number
  totalSugars: number
  addedSugars: number
  protein: number
  vitaminD: number
  calcium: number
  iron: number
  potassium: number
}

export type SubstitutionPreference = 'best_match' | 'dont_replace' | 'specific'

export interface CartItem {
  id: string
  product: Product
  quantity: number
  notes: string
  substitutionPreference: SubstitutionPreference
  specificSubstitution?: string
}

export interface DeliverySlot {
  id: string
  label: string
  date: string
  available: boolean
  fee: number
}

export type DeliveryTimeSlot = DeliverySlot

export interface PromoCode {
  code: string
  discount: number
  type: 'percentage' | 'fixed'
  minOrder: number
  description: string
  valid: boolean
}

export interface DeliveryAddress {
  id: string
  label: string
  street: string
  apt?: string
  city: string
  state: string
  zip: string
  instructions: string
  isDefault: boolean
}

export interface OrderItem {
  product: Product
  quantity: number
  priceAtPurchase?: number
  notes?: string
  substitutionPreference?: SubstitutionPreference
}

export type OrderStatus = 'placed' | 'confirmed' | 'shopping' | 'checkout' | 'delivering' | 'delivered' | 'cancelled'

export interface Order {
  id: string
  storeId: string
  storeName: string
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  serviceFee: number
  tip: number
  promoDiscount: number
  total: number
  status: OrderStatus
  createdAt: string
  deliverySlot: DeliverySlot
  deliveryAddress: DeliveryAddress
  deliveryInstructions: string
  estimatedDelivery: string
  trackingProgress: number
  shopperName?: string
  shopperPhoto?: string
}

export interface SearchFilters {
  query: string
  category: string
  minPrice: number
  maxPrice: number
  organic: boolean
  glutenFree: boolean
  vegan: boolean
  dairyFree: boolean
  onSale: boolean
  inStock: boolean
  sortBy: 'relevance' | 'price_low' | 'price_high' | 'name' | 'popular'
}
