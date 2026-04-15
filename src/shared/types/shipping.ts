export interface ShippingLabel {
  sender: {
    name: string
    company: string
    address: string
    city: string
    country: string
    phone: string
  }
  recipient: {
    name: string
    address: string
    city: string
    emirate: string
    postalCode: string
    phone: string
  }
  orderNumber: string
  weight?: number
  courierRef?: string
}

export interface CourierIntegration {
  name: string
  generateLabel(label: ShippingLabel): Promise<{ url: string } | { error: string }>
  getTrackingUrl(trackingNumber: string): string
}
