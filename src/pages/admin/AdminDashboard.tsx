import AdminLayout from '@/components/admin/AdminLayout';
import { shipments, clients, STATUS_LABELS, STATUS_COLORS } from '@/lib/shipments';
import { Package, Users, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const total = shipments.length;
  const inTransit = shipments.filter(s => s.status === 'in_transit').length;
  const delivered = shipments.filter(s => s.status === 'delivered').length;
  const exceptions = shipments.filter(s => s.status === 'exception').length;

  const stats = [
    { label: 'Total Shipments', value: total, icon: Package, color: 'bg-orange-50 text-orange-500', change: '+3 this week' },
    { label: 'In Transit', value: inTransit, icon: TrendingUp, color: 'bg-blue-50 text-blue-500', change: 'Active now' },
    { label: 'Delivered', value: delivered, icon: TrendingUp, color: 'bg-green-50 text-green-600', change: 'This month' },
    { label: 'Active Clients', value: clients.filter(c => c.status === 'active').length, icon: Users, color: 'bg-purple-50 text-purple-600', change: `${clients.length} total` },
  ];

  const recent = shipments.slice(0, 5);

  return (
    <AdminLayout title="Dashboard">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{s.label}</span>
              <div className={`w-9 h-9 ${s.color} rounded-xl flex items-center justify-center`}>
                <s.icon size={17} />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900">{s.value}</div>
            <div className="text-slate-400 text-xs mt-1">{s.change}</div>
          </div>
        ))}
      </div>

      {/* Exception alert */}
      {exceptions > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
            <Clock size={15} className="text-red-500" />
          </div>
          <div className="flex-1">
            <span className="text-red-700 font-semibold text-sm">{exceptions} shipment{exceptions > 1 ? 's' : ''} need attention</span>
            <p className="text-red-500/70 text-xs mt-0.5">Exception status detected — review required.</p>
          </div>
          <Link to="/admin/shipments" className="text-red-500 text-xs font-semibold hover:text-red-600 flex items-center gap-1">
            View <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* Recent shipments */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Recent Shipments</h2>
          <Link to="/admin/shipments" className="text-orange-500 text-sm font-semibold hover:text-orange-600 flex items-center gap-1">
            View all <ArrowRight size={13} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                {['Tracking ID', 'Client', 'Route', 'Service', 'Status'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recent.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-900">{s.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{s.client}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{s.origin} → {s.destination}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{s.service}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[s.status]}`}>
                      {STATUS_LABELS[s.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick client list */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Top Clients</h2>
          <Link to="/admin/clients" className="text-orange-500 text-sm font-semibold hover:text-orange-600 flex items-center gap-1">
            View all <ArrowRight size={13} />
          </Link>
        </div>
        <div className="divide-y divide-slate-50">
          {clients.slice(0, 4).map(c => (
            <div key={c.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 text-xs font-black">
                  {c.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{c.name}</div>
                  <div className="text-xs text-slate-400">{c.country}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-slate-900">{c.shipments} shipments</div>
                <span className={`text-xs font-semibold ${c.status === 'active' ? 'text-green-600' : 'text-slate-400'}`}>
                  {c.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
