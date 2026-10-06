export type ShipmentStatus = 'pending' | 'in_transit' | 'customs' | 'delivered' | 'exception';
export type ServiceType = 'Air Freight' | 'Road Freight' | 'Warehousing' | 'Last Mile';

export interface PendingCharge {
  chargeId: string;
  assignedAt: string;
  paid: boolean;
  paidAt?: string;
}

export interface Shipment {
  id: string;
  client: string;
  clientEmail: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  service: ServiceType;
  weight: string;
  weightKg?: number;
  date: string;
  eta: string;
  pendingCharge?: PendingCharge;
}

export const STATUS_LABELS: Record<ShipmentStatus, string> = {
  pending:    'Pending',
  in_transit: 'In Transit',
  customs:    'At Customs',
  delivered:  'Delivered',
  exception:  'Exception',
};

export const STATUS_COLORS: Record<ShipmentStatus, string> = {
  pending:    'bg-yellow-100 text-yellow-800',
  in_transit: 'bg-blue-100 text-blue-800',
  customs:    'bg-purple-100 text-purple-800',
  delivered:  'bg-green-100 text-green-800',
  exception:  'bg-red-100 text-red-800',
};
