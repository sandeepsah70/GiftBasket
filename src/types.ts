export interface Profile {
  id: string
  email: string
  full_name: string
  phone: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

export interface SavedBasket {
  id: string
  user_id: string
  basket_name: string
  recipient_name: string
  custom_message: string
  price: number
  status: string
  created_at: string
}

export interface GiftBasketItem {
  id: string
  name: string
  category: string
  price: number
  rating: number
  description: string
  image: string
  items: string[]
}
