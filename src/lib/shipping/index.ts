import type { CourierIntegration, ShippingLabel } from '@/shared/types/shipping'

class GenericCourier implements CourierIntegration {
  name = 'Generic'

  async generateLabel(label: ShippingLabel): Promise<{ url: string }> {
    // Generic courier just provides a printable label URL
    return { url: `/admin/orders/${encodeURIComponent(label.orderNumber)}/label` }
  }

  getTrackingUrl(trackingNumber: string): string {
    return `#tracking-${trackingNumber}`
  }
}

const couriers: Record<string, () => CourierIntegration> = {
  generic: () => new GenericCourier(),
  // Future: aramex: () => new AramexCourier(),
  // Future: smsa: () => new SmsaCourier(),
}

export function getCourierIntegration(): CourierIntegration {
  const provider = process.env.SHIPPING_COURIER || 'generic'
  const factory = couriers[provider]
  if (!factory) return new GenericCourier()
  return factory()
}
