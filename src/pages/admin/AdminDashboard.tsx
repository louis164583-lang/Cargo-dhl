import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { STATUS_LABELS, STATUS_COLORS, type Shipment } from '@/lib/shipments';
import { type ChargeableStatus } from '@/lib/charges';
import { shipmentApi, chargeApi } from '@/lib/api';
import { Package, TrendingUp, CheckCircle, AlertCircle, DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [charges, setCharges] = useState<ChargeableStatus[]>([]);

  useEffect(() => {
    Promise.all([shipmentApi.list(), chargeApi.list()]).then(([s, c]) => {
      setShipments(s);
      setCharges(c);
    });
  }, []);

  const total      = shipments.length;
  const inTransit  = shipments.filter(s => s.status === 'in_transit').length;
  const delivered  = shipments.filter(s => s.status === 'delivered').length;
  const exceptions = shipments.filter(s => s.status === 'exception').length;
  const pending    = shipments.filter(s => s.status === 'pending').length;
  const atCustoms  = shipments.filter(s => s.status === 'customs').length;

  const unpaidCharges     = shipments.filter(s => s.pendingCharge && !s.pendingCharge.paid).length;
  const paidCharges       = shipments.filter(s => s.pendingCharge?.paid).length;
  const activeChargeTypes = charges.filter(c => c.active).length;

  const recent = [...shipments].slice(0, 6);

  const stats = [
    { label: 'Total Shipments', value: total,     icon: Package,    iconBg: 'bg-orange-50', iconColor: 'text-orange-500', sub: `${pending} pending` },
    { label: 'In Transit',      value: inTransit, icon: TrendingUp, iconBg: 'bg-blue-50',   iconColor: 'text-blue-500',   sub: `${atCustoms} at customs` },
    { label: 'Delivered',       value: delivered, icon: CheckCircle,iconBg: 'bg-green-50',  iconColor: 'text-green-600',  sub: `${Math.round((delivered / (total || 1)) * 100)}% success rate` },
    {
      label: 'Unpaid Charges', value: unpaidCharges, icon: DollarSign,
      iconBg: unpaidCharges > 0 ? 'bg-red-50' : 'bg-slate-50',
      iconColor: unpaidCharges > 0 ? 'text-red-500' : 'text-slate-400',
      sub: `${paidCharges} cleared · ${activeChargeTypes} charge types`,
    },
  ];

  return (
    <AdminLayout title="Dashboard">

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider leading-tight">{s.label}</span>
              <div className={`w-9 h-9 ${s.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
                <s.icon size={17} className={s.iconColor} />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900">{s.value}</div>
            <div className="text-slate-400 text-xs mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3 mb-6">
        {exceptions > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
              <AlertCircle size={15} className="text-red-500" />
            </div>
            <div className="flex-1">
              <span className="text-red-700 font-semibold text-sm">{exceptions} shipment{exceptions > 1 ? 's' : ''} flagged as Exception</span>
              <p className="text-red-400 text-xs mt-0.5">Delivery could not be completed — action required.</p>
            </div>
            <Link to="/admin/shipments" className="text-red-500 text-xs font-bold hover:text-red-600 flex items-center gap-1 shrink-0">Review <ArrowRight size={12} /></Link>
          </div>
        )}
        {unpaidCharges > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <DollarSign size={15} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <span className="text-amber-800 font-semibold text-sm">{unpaidCharges} unpaid charge{unpaidCharges > 1 ? 's' : ''} outstanding</span>
              <p className="text-amber-600 text-xs mt-0.5">Awaiting customer payment via email.</p>
            </div>
            <Link to="/admin/shipments" className="text-amber-600 text-xs font-bold hover:text-amber-700 flex items-center gap-1 shrink-0">Review <ArrowRight size={12} /></Link>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="font-bold text-slate-900 text-sm mb-4">Shipment Status Overview</h2>
        <div className="space-y-3">
          {([
            { label: 'Pending',    count: pending,   color: 'bg-yellow-400' },
            { label: 'In Transit', count: inTransit, color: 'bg-blue-500' },
            { label: 'At Customs', count: atCustoms, color: 'bg-purple-500' },
            { label: 'Delivered',  count: delivered, color: 'bg-green-500' },
            { label: 'Exception',  count: exceptions,color: 'bg-red-500' },
          ] as const).map(({ label, count, color }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-24 text-xs font-semibold text-slate-500 shrink-0">{label}</div>
              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className={`h-2 rounded-full ${color} transition-all duration-500`} style={{ width: total ? `${(count / total) * 100}%` : '0%' }} />
              </div>
              <div className="w-6 text-right text-xs font-black text-slate-700 shrink-0">{count}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Recent Shipments</h2>
          <Link to="/admin/shipments" className="text-orange-500 text-sm font-semibold hover:text-orange-600 flex items-center gap-1">View all <ArrowRight size={13} /></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                {['Tracking ID', 'Customer', 'Route', 'Service', 'Status', 'Charge'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recent.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400 text-sm">Loading…</td></tr>
              )}
              {recent.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-sm font-semibold text-slate-900 whitespace-nowrap">{s.id}</td>
                  <td className="px-5 py-3.5">
                    <div className="text-sm font-semibold text-slate-800">{s.client}</div>
                    <div className="text-xs text-slate-400">{s.clientEmail}</div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500 whitespace-nowrap">{s.origin} → {s.destination}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500 whitespace-nowrap">{s.service}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[s.status]}`}>
                      {STATUS_LABELS[s.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {s.pendingCharge ? (
                      <span className={`text-xs font-bold ${s.pendingCharge.paid ? 'text-green-600' : 'text-orange-500'}`}>
                        {s.pendingCharge.paid ? '✓ Paid' : '⏳ Unpaid'}
                      </span>
                    ) : <span className="text-xs text-slate-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </AdminLayout>
  );
}
