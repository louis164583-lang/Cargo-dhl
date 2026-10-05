export type FeeType = 'flat' | 'per_day' | 'per_kg';

export interface ChargeableStatus {
  id: string;
  name: string;
  description: string;
  feeType: FeeType;
  amount: number;
  currency: string;
  customerMessage: string;
  active: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'cdhl_chargeable_statuses';

const DEFAULTS: ChargeableStatus[] = [
  {
    id: 'cs-001',
    name: 'Awaiting Customs Duty',
    description: 'Customs authority has assessed import duties on the shipment.',
    feeType: 'flat',
    amount: 65.00,
    currency: 'USD',
    customerMessage: 'Import duties have been assessed on your shipment by the customs authority. Payment is required before your package can be released.',
    active: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'cs-002',
    name: 'Warehouse Storage Hold',
    description: 'Shipment has exceeded the free storage window at the hub.',
    feeType: 'per_day',
    amount: 4.50,
    currency: 'USD',
    customerMessage: 'Your shipment has exceeded the complimentary storage window at our bonded hub. Daily storage fees are accruing until the shipment is cleared or re-shipped.',
    active: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'cs-003',
    name: 'Customs Examination Fee',
    description: 'Shipment selected for physical examination by customs authority.',
    feeType: 'flat',
    amount: 45.00,
    currency: 'USD',
    customerMessage: 'Your shipment has been selected for a physical examination by the customs authority. An examination handling fee applies before release.',
    active: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'cs-004',
    name: 'Re-delivery Charge',
    description: 'A delivery attempt was unsuccessful and re-booking is required.',
    feeType: 'flat',
    amount: 18.00,
    currency: 'USD',
    customerMessage: 'A delivery attempt was made but could not be completed. A re-delivery fee applies to reschedule your delivery.',
    active: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'cs-005',
    name: 'Address Correction Fee',
    description: 'Delivery address requires amendment before dispatch.',
    feeType: 'flat',
    amount: 22.00,
    currency: 'USD',
    customerMessage: 'The delivery address on your shipment is incomplete or incorrect. An address correction fee applies before your shipment can be dispatched.',
    active: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'cs-006',
    name: 'Express Hub Release',
    description: 'Expedited release from hub or customs — bypasses standard queue.',
    feeType: 'flat',
    amount: 80.00,
    currency: 'USD',
    customerMessage: 'You have requested or been assigned an expedited release from the processing hub. This fee covers priority handling to bypass the standard clearance queue.',
    active: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'cs-007',
    name: 'Dangerous Goods Handling',
    description: 'Shipment contains items requiring special handling per IATA/IMDG.',
    feeType: 'flat',
    amount: 95.00,
    currency: 'USD',
    customerMessage: 'Your shipment has been identified as containing goods that require special handling in compliance with IATA or IMDG regulations. A handling surcharge applies.',
    active: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'cs-008',
    name: 'Overweight Surcharge',
    description: 'Shipment exceeds declared weight — additional per-kg charges apply.',
    feeType: 'per_kg',
    amount: 8.00,
    currency: 'USD',
    customerMessage: 'Your shipment has been found to exceed the declared weight at the hub. An additional per-kilogram surcharge applies for the excess weight.',
    active: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'cs-009',
    name: 'Held — Documents Required',
    description: 'Missing customs documents are blocking clearance.',
    feeType: 'flat',
    amount: 12.00,
    currency: 'USD',
    customerMessage: 'Your shipment is on hold pending receipt of required documentation (e.g. commercial invoice, certificate of origin, or import permit). An admin processing fee applies.',
    active: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'cs-010',
    name: 'Insurance Excess Payment',
    description: 'Deductible payment required to process an active insurance claim.',
    feeType: 'flat',
    amount: 30.00,
    currency: 'USD',
    customerMessage: 'An insurance claim has been opened for your shipment. The policy excess payment is required to progress the claim.',
    active: true,
    createdAt: '2026-01-01',
  },
];

function load(): ChargeableStatus[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function save(data: ChargeableStatus[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getCharges(): ChargeableStatus[] {
  return load();
}

export function saveCharge(charge: ChargeableStatus): void {
  const all = load();
  const idx = all.findIndex(c => c.id === charge.id);
  if (idx >= 0) all[idx] = charge;
  else all.push(charge);
  save(all);
}

export function deleteCharge(id: string): void {
  save(load().filter(c => c.id !== id));
}

export function getChargeById(id: string): ChargeableStatus | undefined {
  return load().find(c => c.id === id);
}

export const FEE_TYPE_LABELS: Record<FeeType, string> = {
  flat:    'Flat fee',
  per_day: 'Per day',
  per_kg:  'Per kg',
};

export function formatFee(charge: ChargeableStatus): string {
  const symbol = charge.currency === 'USD' ? '$' : charge.currency;
  return `${symbol}${charge.amount.toFixed(2)} ${FEE_TYPE_LABELS[charge.feeType]}`;
}
