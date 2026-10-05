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

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  shipments: number;
  status: 'active' | 'inactive';
  joined: string;
}

export const shipments: Shipment[] = [
  { id: 'CDHL-0012-NY', client: 'TechFlow Inc.', clientEmail: 'ops@techflow.com', origin: 'Frankfurt', destination: 'New York', status: 'delivered', service: 'Air Freight', weight: '12 kg', date: '2026-09-28', eta: '2026-10-01' },
  { id: 'CDHL-0013-LG', client: 'NordRetail', clientEmail: 'logistics@nordretail.com', origin: 'Dubai', destination: 'Lagos', status: 'in_transit', service: 'Air Freight', weight: '34 kg', date: '2026-10-01', eta: '2026-10-05' },
  { id: 'CDHL-0014-LN', client: 'MediSource', clientEmail: 'supply@medisource.com', origin: 'New York', destination: 'London', status: 'customs', service: 'Air Freight', weight: '8 kg', date: '2026-10-02', eta: '2026-10-06' },
  { id: 'CDHL-0015-DB', client: 'GlobalGoods', clientEmail: 'ship@globalgoods.com', origin: 'Lagos', destination: 'Dubai', status: 'pending', service: 'Road Freight', weight: '120 kg', date: '2026-10-04', eta: '2026-10-10' },
  { id: 'CDHL-0016-FR', client: 'ArtHouse Berlin', clientEmail: 'studio@arthouse.de', origin: 'London', destination: 'Frankfurt', status: 'in_transit', service: 'Last Mile', weight: '5 kg', date: '2026-10-03', eta: '2026-10-05' },
  { id: 'CDHL-0017-NY', client: 'FashionFwd', clientEmail: 'export@fashionfwd.com', origin: 'Dubai', destination: 'New York', status: 'exception', service: 'Air Freight', weight: '22 kg', date: '2026-09-30', eta: '2026-10-04' },
  { id: 'CDHL-0018-LG', client: 'SolarTech NG', clientEmail: 'import@solartech.ng', origin: 'Frankfurt', destination: 'Lagos', status: 'in_transit', service: 'Air Freight', weight: '60 kg', date: '2026-10-03', eta: '2026-10-07' },
  { id: 'CDHL-0019-LN', client: 'BookBridge', clientEmail: 'dispatch@bookbridge.co.uk', origin: 'New York', destination: 'London', status: 'delivered', service: 'Last Mile', weight: '3 kg', date: '2026-09-27', eta: '2026-09-30' },
];

export const clients: Client[] = [
  { id: 'CLT-001', name: 'TechFlow Inc.', email: 'ops@techflow.com', phone: '+1 212 555 0101', country: 'United States', shipments: 14, status: 'active', joined: '2025-03-12' },
  { id: 'CLT-002', name: 'NordRetail', email: 'logistics@nordretail.com', phone: '+47 22 555 0188', country: 'Norway', shipments: 9, status: 'active', joined: '2025-05-20' },
  { id: 'CLT-003', name: 'MediSource', email: 'supply@medisource.com', phone: '+1 617 555 0190', country: 'United States', shipments: 6, status: 'active', joined: '2025-07-08' },
  { id: 'CLT-004', name: 'GlobalGoods', email: 'ship@globalgoods.com', phone: '+234 801 555 0102', country: 'Nigeria', shipments: 3, status: 'active', joined: '2025-09-01' },
  { id: 'CLT-005', name: 'ArtHouse Berlin', email: 'studio@arthouse.de', phone: '+49 30 555 0177', country: 'Germany', shipments: 4, status: 'inactive', joined: '2025-06-15' },
  { id: 'CLT-006', name: 'FashionFwd', email: 'export@fashionfwd.com', phone: '+971 4 555 0133', country: 'UAE', shipments: 7, status: 'active', joined: '2025-08-22' },
];

const SHIP_KEY = 'cdhl_shipments';

function loadShipments(): Shipment[] {
  try {
    const raw = localStorage.getItem(SHIP_KEY);
    return raw ? JSON.parse(raw) : shipments;
  } catch {
    return shipments;
  }
}

function persistShipments(data: Shipment[]) {
  localStorage.setItem(SHIP_KEY, JSON.stringify(data));
}

export function getShipments(): Shipment[] {
  return loadShipments();
}

export function saveShipment(s: Shipment): void {
  const all = loadShipments();
  const idx = all.findIndex(x => x.id === s.id);
  if (idx >= 0) all[idx] = s;
  else all.unshift(s);
  persistShipments(all);
}

export function replaceAllShipments(data: Shipment[]): void {
  persistShipments(data);
}

export function removeShipment(id: string): void {
  persistShipments(loadShipments().filter(s => s.id !== id));
}

export function getShipmentById(id: string): Shipment | undefined {
  return loadShipments().find(s => s.id.toLowerCase() === id.toLowerCase());
}

export const STATUS_LABELS: Record<ShipmentStatus, string> = {
  pending: 'Pending',
  in_transit: 'In Transit',
  customs: 'At Customs',
  delivered: 'Delivered',
  exception: 'Exception',
};

export const STATUS_COLORS: Record<ShipmentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_transit: 'bg-blue-100 text-blue-800',
  customs: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  exception: 'bg-red-100 text-red-800',
};
