/** Product status */
export type ProductStatus = 'draft' | 'active' | 'archived'

/** Product variant (size, color, etc.) */
export type ProductVariant = {
  id: string
  productId: string
  name: string
  sku: string | null
  price: number
  compareAtPrice: number | null
  currency: string
  inventory: number
  options: Record<string, string>
  image: string | null
  weight: number | null
  weightUnit: 'kg' | 'g' | 'lb' | 'oz' | null
}

/** Product */
export type Product = {
  id: string
  siteId: string
  title: string
  slug: string
  description: string | null
  descriptionHtml: string | null
  status: ProductStatus
  images: { src: string; alt: string; order: number }[]
  variants: ProductVariant[]
  category: string | null
  tags: string[]
  seoTitle: string | null
  seoDescription: string | null
  createdAt: Date
  updatedAt: Date
}

/** Cart item */
export type CartItem = {
  id: string
  variantId: string
  productId: string
  title: string
  variantName: string
  image: string | null
  price: number
  currency: string
  quantity: number
}

/** Shopping cart */
export type Cart = {
  id: string
  siteId: string
  userId: string | null
  sessionId: string | null
  items: CartItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  currency: string
  couponCode: string | null
  discount: number
  createdAt: Date
  updatedAt: Date
}

/** Order status */
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

/** Payment method */
export type PaymentMethod = 'stripe' | 'payplus'

/** Payment status */
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

/** Order item */
export type OrderItem = {
  id: string
  orderId: string
  variantId: string
  productId: string
  title: string
  variantName: string
  image: string | null
  price: number
  quantity: number
  total: number
}

/** Customer order */
export type Order = {
  id: string
  siteId: string
  userId: string | null
  email: string
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  paymentId: string | null
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  currency: string
  shippingAddress: ShippingAddress | null
  billingAddress: ShippingAddress | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

/** Shipping/billing address */
export type ShippingAddress = {
  firstName: string
  lastName: string
  company: string | null
  address1: string
  address2: string | null
  city: string
  state: string | null
  postalCode: string
  country: string
  phone: string | null
}
