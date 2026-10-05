import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { clients as initialClients, type Client } from '@/lib/shipments';
import { Search, Plus, X, Users } from 'lucide-react';

export default function AdminClients() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Client, 'shipments'> & { shipments: string }>({
    id: '', name: '', email: '', phone: '', country: '', shipments: '0', status: 'active', joined: '',
  });

  const filtered = clients.filter(c =>
    !query || c.name.toLowerCase().includes(query.toLowerCase()) || c.email.toLowerCase().includes(query.toLowerCase()) || c.country.toLowerCase().includes(query.toLowerCase())
  );

  function openNew() {
    setEditingId(null);
    setForm({ id: `CLT-${String(clients.length + 1).padStart(3, '0')}`, name: '', email: '', phone: '', country: '', shipments: '0', status: 'active', joined: new Date().toISOString().split('T')[0] });
    setModal(true);
  }

  function openEdit(c: Client) {
    setEditingId(c.id);
    setForm({ ...c, shipments: String(c.shipments) });
    setModal(true);
  }

  function saveForm() {
    if (!form.name || !form.email) return;
    const client: Client = { ...form, shipments: parseInt(form.shipments) || 0 };
    if (editingId) {
      setClients(prev => prev.map(c => c.id === editingId ? client : c));
    } else {
      setClients(prev => [client, ...prev]);
    }
    setModal(false);
  }

  function deleteClient(id: string) {
    if (confirm('Delete this client?')) setClients(prev => prev.filter(c => c.id !== id));
  }

  function toggleStatus(id: string) {
    setClients(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c));
  }

  const activeCount = clients.filter(c => c.status === 'active').length;
  const totalShipments = clients.reduce((sum, c) => sum + c.shipments, 0);

  return (
    <AdminLayout title="Clients">
      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Clients', value: clients.length, color: 'bg-orange-50 text-orange-500' },
          { label: 'Active', value: activeCount, color: 'bg-green-50 text-green-600' },
          { label: 'Total Shipments', value: totalShipments, color: 'bg-blue-50 text-blue-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className={`w-11 h-11 ${s.color} rounded-xl flex items-center justify-center`}>
              <Users size={18} />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{s.value}</div>
              <div className="text-slate-400 text-xs">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search clients…"
            className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white"
          />
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/20">
          <Plus size={16} /> Add Client
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Client', 'Email', 'Phone', 'Country', 'Shipments', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-slate-400 text-sm">No clients found</td></tr>
              )}
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 text-xs font-black shrink-0">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{c.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{c.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">{c.email}</td>
                  <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">{c.phone}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{c.country}</td>
                  <td className="px-5 py-4 text-sm font-bold text-slate-900 text-center">{c.shipments}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => toggleStatus(c.id)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${c.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                      {c.status}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-400">{c.joined}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(c)}
                        className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors px-2.5 py-1 rounded-lg hover:bg-orange-50">Edit</button>
                      <button onClick={() => deleteClient(c.id)}
                        className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors px-2.5 py-1 rounded-lg hover:bg-red-50">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-50 text-xs text-slate-400">
          {filtered.length} of {clients.length} clients
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 text-lg">{editingId ? 'Edit Client' : 'New Client'}</h3>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Full Name', key: 'name', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Phone', key: 'phone', type: 'tel' },
                { label: 'Country', key: 'country', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{f.label}</label>
                  <input type={f.type} value={(form as Record<string, string>)[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as Client['status'] }))}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={saveForm} className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold shadow-lg shadow-orange-500/20">
                {editingId ? 'Save Changes' : 'Add Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
