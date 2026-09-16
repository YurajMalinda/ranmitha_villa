/**
 * Occupancy-based pricing: `pricePerNight` covers up to `baseOccupancy`
 * guests; each guest beyond that adds `extraGuestFee`. Falls back to a flat
 * `pricePerNight` (no extra charge, ever) for rooms saved before these fields
 * existed, since Mongo documents predating this change lack them.
 */
export interface RoomPricing {
  pricePerNight: number
  maxGuests: number
  baseOccupancy?: number
  extraGuestFee?: number
}

export function perNightPrice(room: RoomPricing, guests: number): number {
  const baseOccupancy = room.baseOccupancy ?? room.maxGuests
  const extraGuestFee = room.extraGuestFee ?? 0
  const extraGuests = Math.max(0, guests - baseOccupancy)
  return room.pricePerNight + extraGuests * extraGuestFee
}

export function totalPrice(room: RoomPricing, guests: number, nights: number): number {
  return perNightPrice(room, guests) * nights
}
