import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { shipments as initialShipments, STATUS_LABELS, STATUS_COLORS, type Shipment, type ShipmentStatus } from '@/lib/shipments';
import { Search, Plus, X, Filter } from 'lucide-react';

const STATUS_OPTIONS: ShipmentStatus[] = ['pending', 'in_transit', 'customs', 'delivered', 'exception'];

function Badge({ status }: { status: ShipmentStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export default function AdminShipments() {
  const [shipments, setShipments] = useState<Shipment[]>(initialShipments);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ShipmentStatus | 'all'>('all');
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  const [form, setForm] = useState({
    id: '', client: '', clientEmail: '', origin: '', destination: '',
    status: 'pending' as ShipmentStatus, service: 'Air Freight' as Shipment['service'],
    weight: '', date: '', eta: '',
  });

  const filtered = shipments.filter(s => {
    const matchQ = !query || s.id.toLowerCase().includes(query.toLowerCase()) || s.client.toLowerCase().includes(query.toLowerCase()) || s.destination.toLowerCase().includes(query.toLowerCase());
    const matchF = filter === 'all' || s.status === filter;
    return matchQ && matchF;
  });

  function openNew() {
    setEditingId(null);
    setForm({ id: `CDHL-${String(shipments.length + 1).padStart(4, '0')}-XX`, client: '', clientEmail: '', origin: '', destination: '', status: 'pending', service: 'Air Freight', weight: '', date: new Date().toISOString().split('T')[0], eta: '' });
    setModal(true);
  }

  function openEdit(s: Shipment) {
    setEditingId(s.id);
    setForm({ ...s });
    setModal(true);
  }

  function saveForm() {
    if (!form.client || !form.origin || !form.destination) return;
    if (editingId) {
      setShipments(prev => prev.map(s => s.id === editingId ? { ...form } : s));
    } else {
      setShipments(prev => [form, ...prev]);
    }
    setModal(false);
  }

  function updateStatus(id: string, status: ShipmentStatus) {
    setStatusUpdating(id);
    setTimeout(() => {
      setShipments(prev => prev.map(s => s.id === id ? { ...s, status } : s));
      setStatusUpdating(null);
    }, 400);
  }

  function deleteShipment(id: string) {
    if (confirm('Delete this shipment?')) setShipments(prev => prev.filter(s => s.id !== id));
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
                {['Tracking ID', 'Client', 'Route', 'Service', 'Weight', 'Status', 'ETA', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-slate-400 text-sm">No shipments found</td></tr>
              )}
              {filtered.map(s => (
                <tr key={s.id} className={`hover:bg-slate-50/50 transition-colors ${statusUpdating === s.id ? 'opacity-50' : ''}`}>
                  <td className="px-5 py-4 font-mono text-sm font-semibold text-slate-900 whitespace-nowrap">{s.id}</td>
                  <td className="px-5 py-4">
                    <div className="text-sm font-semibold text-slate-900">{s.client}</div>
                    <div className="text-xs text-slate-400">{s.clientEmail}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">{s.origin} → {s.destination}</td>
                  <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">{s.service}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{s.weight}</td>
                  <td className="px-5 py-4">
                    <select
                      value={s.status}
                      onChange={e => updateStatus(s.id, e.target.value as ShipmentStatus)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${STATUS_COLORS[s.status]}`}
                    >
                      {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{STATUS_LABELS[opt]}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">{s.eta}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
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

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 text-lg">{editingId ? 'Edit Shipment' : 'New Shipment'}</h3>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Tracking ID', key: 'id', type: 'text', disabled: !!editingId },
                { label: 'Client Name', key: 'client', type: 'text' },
                { label: 'Client Email', key: 'clientEmail', type: 'email', full: true },
                { label: 'Origin', key: 'origin', type: 'text' },
                { label: 'Destination', key: 'destination', type: 'text' },
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
    </AdminLayout>
  );
}
