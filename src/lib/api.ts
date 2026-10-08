import type { Shipment } from './shipments';
import type { ChargeableStatus } from './charges';

const BASE = 'https://cargo-dhl.onrender.com';

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${res.status} ${method} ${path}`);
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
} 

export const shipmentApi = {
  list:   ()            => req<Shipment[]>('GET', '/shipments'),
  create: (s: Shipment) => req<Shipment>('POST', '/shipments', s),
  update: (s: Shipment) => req<Shipment>('PUT', `/shipments/${encodeURIComponent(s.id)}`, s),
  remove: (id: string)  => req<void>('DELETE', `/shipments/${encodeURIComponent(id)}`),
};

export const chargeApi = {
  list:   ()                    => req<ChargeableStatus[]>('GET', '/charges'),
  create: (c: ChargeableStatus) => req<ChargeableStatus>('POST', '/charges', c),
  update: (c: ChargeableStatus) => req<ChargeableStatus>('PUT', `/charges/${encodeURIComponent(c.id)}`, c),
  remove: (id: string)          => req<void>('DELETE', `/charges/${encodeURIComponent(id)}`),
};
 