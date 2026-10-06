import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { formatFee, FEE_TYPE_LABELS, type ChargeableStatus, type FeeType } from '@/lib/charges';
import { chargeApi } from '@/lib/api';
import { Plus, X, Edit2, Trash2, ToggleLeft, ToggleRight, DollarSign, AlertCircle } from 'lucide-react';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'NGN'];

const BLANK: ChargeableStatus = {
  id: '', name: '', description: '', feeType: 'flat', amount: 0,
  currency: 'USD', customerMessage: '', active: true,
  createdAt: new Date().toISOString().split('T')[0],
};

export default function AdminCharges() {
  const [charges, setCharges] = useState<ChargeableStatus[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<ChargeableStatus>(BLANK);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => { chargeApi.list().then(setCharges); }, []);

  function openNew() {
    setForm({ ...BLANK, id: `cs-${Date.now()}`, createdAt: new Date().toISOString().split('T')[0] });
    setIsEdit(false);
    setModal(true);
  }

  function openEdit(c: ChargeableStatus) { setForm({ ...c }); setIsEdit(true); setModal(true); }

  async function handleSave() {
    if (!form.name.trim() || form.amount < 0) return;
    if (isEdit) {
      const updated = await chargeApi.update(form);
      setCharges(prev => prev.map(c => c.id === form.id ? updated : c));
    } else {
      const created = await chargeApi.create(form);
      setCharges(prev => [...prev, created]);
    }
    setModal(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this chargeable status? Shipments with this charge will still show it until cleared.')) return;
    await chargeApi.remove(id);
    setCharges(prev => prev.filter(c => c.id !== id));
  }

  async function toggleActive(c: ChargeableStatus) {
    const updated = await chargeApi.update({ ...c, active: !c.active });
    setCharges(prev => prev.map(x => x.id === c.id ? updated : x));
  }

  function set<K extends keyof ChargeableStatus>(key: K, val: ChargeableStatus[K]) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  const activeCount = charges.filter(c => c.active).length;

  return (
    <AdminLayout title="Chargeable Statuses">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl px-5 py-3 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
              <DollarSign size={17} className="text-orange-500" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900">{charges.length}</div>
              <div className="text-slate-400 text-xs">{activeCount} active</div>
            </div>
          </div>
          <div className="text-slate-400 text-sm max-w-sm hidden lg:block">
            Assign these to any shipment. The client is instructed to contact customer service to pay.
          </div>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/20">
          <Plus size={16} /> New Charge
        </button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {charges.map(c => (
          <div key={c.id} className={`bg-white border rounded-2xl p-6 shadow-sm transition-all ${c.active ? 'border-slate-100' : 'border-slate-100 opacity-60'}`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">{c.name}</h3>
                <p className="text-slate-400 text-xs mt-1 line-clamp-2">{c.description}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => openEdit(c)} className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-orange-50 flex items-center justify-center text-slate-400 hover:text-orange-500 transition-colors"><Edit2 size={13} /></button>
                <button onClick={() => handleDelete(c.id)} className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-orange-50 text-orange-600 border border-orange-100 text-xs font-bold px-3 py-1 rounded-full">{formatFee(c)}</span>
              <span className="text-slate-300 text-xs font-mono">{c.id}</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 mb-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Customer sees:</div>
              <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">{c.customerMessage}</p>
            </div>
            <button onClick={() => toggleActive(c)}
              className={`flex items-center gap-2 text-xs font-semibold transition-colors ${c.active ? 'text-green-600 hover:text-green-700' : 'text-slate-400 hover:text-slate-600'}`}>
              {c.active ? <><ToggleRight size={18} className="text-green-500" /> Active</> : <><ToggleLeft size={18} /> Inactive</>}
            </button>
          </div>
        ))}
      </div>

      {charges.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <DollarSign size={32} className="mx-auto mb-3 text-slate-200" />
          <p className="text-sm">Loading…</p>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg my-4">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">{isEdit ? 'Edit Chargeable Status' : 'New Chargeable Status'}</h3>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Status Name *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Awaiting Customs Duty"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Internal Description</label>
                <input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief note for admin reference"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Amount *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                    <input type="number" min="0" step="0.01" value={form.amount}
                      onChange={e => set('amount', parseFloat(e.target.value) || 0)}
                      className="w-full border border-slate-200 rounded-xl pl-7 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Fee Type</label>
                  <select value={form.feeType} onChange={e => set('feeType', e.target.value as FeeType)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30">
                    {(Object.keys(FEE_TYPE_LABELS) as FeeType[]).map(k => <option key={k} value={k}>{FEE_TYPE_LABELS[k]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Currency</label>
                  <select value={form.currency} onChange={e => set('currency', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30">
                    {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Customer-Facing Message *</label>
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 mb-2">
                  <AlertCircle size={13} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-amber-700 text-xs">This is shown to the shipment recipient on the tracking page, along with a prompt to contact customer service.</p>
                </div>
                <textarea value={form.customerMessage} onChange={e => set('customerMessage', e.target.value)}
                  rows={4} placeholder="Explain why this charge applies and what happens next…"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="active" checked={form.active} onChange={e => set('active', e.target.checked)}
                  className="w-4 h-4 accent-orange-500 rounded" />
                <label htmlFor="active" className="text-sm font-medium text-slate-700 cursor-pointer">Active — can be assigned to shipments</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <button onClick={() => setModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={handleSave} disabled={!form.name.trim()}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-orange-500/20">
                {isEdit ? 'Save Changes' : 'Create Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
