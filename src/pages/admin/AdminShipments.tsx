import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getShipments, saveShipment, removeShipment, replaceAllShipments, STATUS_LABELS, STATUS_COLORS, type Shipment, type ShipmentStatus, type PendingCharge } from '@/lib/shipments';
import { getCharges, getChargeById, formatFee, type ChargeableStatus } from '@/lib/charges';
import { Search, Plus, X, Filter, DollarSign, CheckCircle2, AlertCircle, Trash2, ChevronDown } from 'lucide-react';

const LOCATIONS = [
  'New York',
  'London',
  'Dubai',
  'Lagos',
  'Frankfurt',
  'Paris',
  'Amsterdam',
  'Singapore',
  'Hong Kong',
  'Shanghai',
  'Tokyo',
  'Sydney',
  'Toronto',
  'Los Angeles',
  'Chicago',
  'Nairobi',
  'Johannesburg',
  'Cairo',
  'Istanbul',
  'Mumbai',
];

function LocationField({
  label, value, onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const [custom, setCustom] = useState(() => value !== '' && !LOCATIONS.includes(value));

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative mb-2">
        <select
          value={custom ? '__custom__' : value}
          onChange={e => {
            if (e.target.value === '__custom__') {
              setCustom(true);
              onChange('');
            } else {
              setCustom(false);
              onChange(e.target.value);
            }
          }}
          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 appearance-none bg-white"
        >
          <option value="">— Select city —</option>
          {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
          <option value="__custom__">Custom…</option>
        </select>
        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
      {custom && (
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Type city or country…"
          autoFocus
          className="w-full border border-orange-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
        />
      )}
    </div>
  );
}

const STATUS_OPTIONS: ShipmentStatus[] = ['pending', 'in_transit', 'customs', 'delivered', 'exception'];

function Badge({ status }: { status: ShipmentStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export default function AdminShipments() {
  const [shipments, setShipments] = useState<Shipment[]>(getShipments);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ShipmentStatus | 'all'>('all');
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [chargeModal, setChargeModal] = useState<string | null>(null); // shipment id
  const [selectedChargeId, setSelectedChargeId] = useState('');
  const charges = getCharges().filter(c => c.active);

  const [form, setForm] = useState({
    id: '', client: '', clientEmail: '', origin: '', destination: '',
    status: 'pending' as ShipmentStatus, service: 'Air Freight' as Shipment['service'],
    weight: '', date: '', eta: '',
  });

  const filtered = shipments.filter(s => {
    const q = query.toLowerCase();
    const matchQ = !query || s.id.toLowerCase().includes(q) || s.client.toLowerCase().includes(q) || s.destination.toLowerCase().includes(q);
    const matchF = filter === 'all' || s.status === filter;
    return matchQ && matchF;
  });

  function openNew() {
    setEditingId(null);
    setForm({
      id: `CDHL-${String(shipments.length + 1).padStart(4, '0')}-XX`,
      client: '', clientEmail: '', origin: '', destination: '',
      status: 'pending', service: 'Air Freight', weight: '',
      date: new Date().toISOString().split('T')[0], eta: '',
    });
    setModal(true);
  }

  function openEdit(s: Shipment) {
    setEditingId(s.id);
    setForm({ ...s });
    setModal(true);
  }

  const [formError, setFormError] = useState('');

  function saveForm() {
    const id          = form.id.trim();
    const client      = form.client.trim();
    const origin      = form.origin.trim();
    const destination = form.destination.trim();

    if (!id)          { setFormError('Tracking ID is required.'); return; }
    if (!client)      { setFormError('Client name is required.'); return; }
    if (!origin)      { setFormError('Origin is required.'); return; }
    if (!destination) { setFormError('Destination is required.'); return; }

    setFormError('');
    const cleanForm = { ...form, id, client, origin, destination };
    const updated = editingId
      ? shipments.map(s => s.id === editingId ? { ...s, ...cleanForm } : s)
      : [cleanForm as Shipment, ...shipments];
    replaceAllShipments(updated);
    setShipments(updated);
    setModal(false);
  }

  function updateStatus(id: string, status: ShipmentStatus) {
    setStatusUpdating(id);
    setTimeout(() => {
      setShipments(prev => {
        const next = prev.map(s => s.id === id ? { ...s, status } : s);
        const target = next.find(s => s.id === id);
        if (target) saveShipment(target);
        return next;
      });
      setStatusUpdating(null);
    }, 300);
  }

  function deleteShipment(id: string) {
    if (confirm('Delete this shipment?')) {
      removeShipment(id);
      setShipments(prev => prev.filter(s => s.id !== id));
    }
  }

  function openChargeModal(shipmentId: string) {
    setSelectedChargeId('');
    setChargeModal(shipmentId);
  }

  function assignCharge() {
    if (!selectedChargeId || !chargeModal) return;
    const pc: PendingCharge = {
      chargeId: selectedChargeId,
      assignedAt: new Date().toISOString().split('T')[0],
      paid: false,
    };
    setShipments(prev => {
      const next = prev.map(s => s.id === chargeModal ? { ...s, pendingCharge: pc } : s);
      const target = next.find(s => s.id === chargeModal);
      if (target) saveShipment(target);
      return next;
    });
    setChargeModal(null);
  }

  function markPaid(shipmentId: string) {
    setShipments(prev => {
      const next = prev.map(s =>
        s.id === shipmentId && s.pendingCharge
          ? { ...s, pendingCharge: { ...s.pendingCharge, paid: true, paidAt: new Date().toISOString().split('T')[0] } }
          : s
      );
      const target = next.find(s => s.id === shipmentId);
      if (target) saveShipment(target);
      return next;
    });
  }

  function removeCharge(shipmentId: string) {
    if (!confirm('Remove the charge from this shipment?')) return;
    setShipments(prev => {
      const next = prev.map(s => s.id === shipmentId ? { ...s, pendingCharge: undefined } : s);
      const target = next.find(s => s.id === shipmentId);
      if (target) saveShipment(target);
      return next;
    });
  }

  function ChargeBadge({ s }: { s: Shipment }) {
    if (!s.pendingCharge) return null;
    const ch = getChargeById(s.pendingCharge.chargeId);
    if (!ch) return null;
    if (s.pendingCharge.paid) {
      return (
        <div className="flex items-center gap-1 text-green-600 text-[10px] font-bold mt-1 whitespace-nowrap">
          <CheckCircle2 size={11} /> Paid
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-orange-500 text-[10px] font-bold mt-1 whitespace-nowrap">
        <DollarSign size={11} /> {formatFee(ch)}
      </div>
    );
  }

  return (
    <AdminLayout title="Shipments">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search by ID, client, destination…"
              className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white"
            />
          </div>
          <div className="relative">
            <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select value={filter} onChange={e => setFilter(e.target.value as ShipmentStatus | 'all')}
              className="border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white appearance-none cursor-pointer">
              <option value="all">All Status</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/20">
          <Plus size={16} /> New Shipment
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Tracking ID', 'Client', 'Route', 'Service', 'Weight', 'Status', 'Charge', 'ETA', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="text-center py-12 text-slate-400 text-sm">No shipments found</td></tr>
              )}
              {filtered.map(s => (
                <tr key={s.id} className={`hover:bg-slate-50/50 transition-colors ${statusUpdating === s.id ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-4 font-mono text-sm font-semibold text-slate-900 whitespace-nowrap">{s.id}</td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-semibold text-slate-900">{s.client}</div>
                    <div className="text-xs text-slate-400">{s.clientEmail}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-500 whitespace-nowrap">{s.origin} → {s.destination}</td>
                  <td className="px-4 py-4 text-sm text-slate-500 whitespace-nowrap">{s.service}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{s.weight}</td>
                  <td className="px-4 py-4">
                    <select
                      value={s.status}
                      onChange={e => updateStatus(s.id, e.target.value as ShipmentStatus)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${STATUS_COLORS[s.status]}`}
                    >
                      {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{STATUS_LABELS[opt]}</option>)}
                    </select>
                  </td>

                  {/* Charge column */}
                  <td className="px-4 py-4">
                    {s.pendingCharge ? (
                      <div className="flex flex-col gap-1">
                        <ChargeBadge s={s} />
                        <div className="flex items-center gap-1">
                          {!s.pendingCharge.paid && (
                            <button onClick={() => markPaid(s.id)}
                              className="text-[10px] font-bold text-green-600 hover:text-green-700 px-2 py-0.5 rounded-md hover:bg-green-50 transition-colors whitespace-nowrap">
                              Mark paid
                            </button>
                          )}
                          <button onClick={() => removeCharge(s.id)}
                            className="text-[10px] font-bold text-red-400 hover:text-red-600 px-1.5 py-0.5 rounded-md hover:bg-red-50 transition-colors">
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => openChargeModal(s.id)}
                        className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-orange-500 px-2 py-1 rounded-lg hover:bg-orange-50 transition-colors whitespace-nowrap border border-dashed border-slate-200 hover:border-orange-200">
                        <DollarSign size={10} /> Assign
                      </button>
                    )}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-500 whitespace-nowrap">{s.eta}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(s)}
                        className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors px-2.5 py-1 rounded-lg hover:bg-orange-50">
                        Edit
                      </button>
                      <button onClick={() => deleteShipment(s.id)}
                        className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors px-2.5 py-1 rounded-lg hover:bg-red-50">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-50 text-xs text-slate-400">
          {filtered.length} of {shipments.length} shipments
        </div>
      </div>

      {/* Shipment Edit/Create Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setModal(false); setFormError(''); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 my-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 text-lg">{editingId ? 'Edit Shipment' : 'New Shipment'}</h3>
              <button onClick={() => { setModal(false); setFormError(''); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            {formError && (
              <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 font-medium">
                <AlertCircle size={14} className="shrink-0" /> {formError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Tracking ID', key: 'id', type: 'text', disabled: !!editingId },
                { label: 'Client Name', key: 'client', type: 'text' },
                { label: 'Client Email', key: 'clientEmail', type: 'email', full: true },
                { label: 'Weight', key: 'weight', type: 'text' },
                { label: 'Ship Date', key: 'date', type: 'date' },
                { label: 'ETA', key: 'eta', type: 'date' },
              ].map(f => (
                <div key={f.key} className={f.full ? 'col-span-2' : ''}>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{f.label}</label>
                  <input
                    type={f.type}
                    disabled={f.disabled}
                    value={(form as Record<string, string>)[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>
              ))}
              <LocationField label="Origin" value={form.origin} onChange={v => setForm(p => ({ ...p, origin: v }))} />
              <LocationField label="Destination" value={form.destination} onChange={v => setForm(p => ({ ...p, destination: v }))} />
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Service</label>
                <select value={form.service} onChange={e => setForm(p => ({ ...p, service: e.target.value as Shipment['service'] }))}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30">
                  {['Air Freight', 'Road Freight', 'Warehousing', 'Last Mile'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as ShipmentStatus }))}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30">
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={saveForm} className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold shadow-lg shadow-orange-500/20">
                {editingId ? 'Save Changes' : 'Create Shipment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Charge Assignment Modal */}
      {chargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setChargeModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
                  <DollarSign size={17} className="text-orange-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-none">Assign Charge</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Shipment {chargeModal}</p>
                </div>
              </div>
              <button onClick={() => setChargeModal(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-3 mb-5">
              <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-amber-700 text-xs leading-relaxed">
                The customer will be notified on their tracking page and instructed to contact <strong>cdhl04192@gmail.com</strong> to clear this charge. No payment is collected online.
              </p>
            </div>

            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Select Chargeable Status</label>
            <select
              value={selectedChargeId}
              onChange={e => setSelectedChargeId(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 mb-3"
            >
              <option value="">— Choose a charge —</option>
              {charges.map((c: ChargeableStatus) => (
                <option key={c.id} value={c.id}>{c.name} ({formatFee(c)})</option>
              ))}
            </select>

            {selectedChargeId && (() => {
              const ch = charges.find(c => c.id === selectedChargeId);
              if (!ch) return null;
              return (
                <div className="bg-slate-50 rounded-xl p-4 mb-5 text-sm">
                  <div className="font-bold text-slate-800 mb-1">{ch.name}</div>
                  <div className="text-slate-500 text-xs mb-2">{ch.description}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Customer message preview:</div>
                  <p className="text-slate-600 text-xs leading-relaxed">{ch.customerMessage}</p>
                </div>
              );
            })()}

            <div className="flex justify-end gap-3">
              <button onClick={() => setChargeModal(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={assignCharge} disabled={!selectedChargeId}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-orange-500/20">
                Assign Charge
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
