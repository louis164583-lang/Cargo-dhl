import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout, getAdminUser } from '@/lib/auth';
import {
  LayoutDashboard, Package, DollarSign, LogOut, Menu, X, Truck, ChevronRight, Settings,
} from 'lucide-react';

const nav = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Shipments', href: '/admin/shipments', icon: Package },
  { label: 'Charges', href: '/admin/charges', icon: DollarSign },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  const Sidebar = ({ mobile = false }) => (
    <aside className={`
      ${mobile ? 'flex' : 'hidden lg:flex'} flex-col w-64 bg-slate-900 min-h-screen
    `}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow">
          <Truck size={18} className="text-white" />
        </div>
        <div className="leading-none">
          <span className="text-white font-black text-base tracking-tight">CARGO</span>
          <span className="text-orange-400 font-black text-base tracking-tight"> DHL</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = location.pathname === href;
          return (
            <Link
              key={href}
              to={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={17} />
              {label}
              {active && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400 text-xs font-black uppercase">
            {getAdminUser().slice(0, 2)}
          </div>
          <div>
            <div className="text-white text-sm font-semibold capitalize">{getAdminUser()}</div>
            <div className="text-white/35 text-[11px]">Administrator</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-slate-500 hover:text-slate-900"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-slate-900 font-bold text-lg leading-none">{title}</h1>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="hidden lg:flex items-center gap-2 text-sm text-slate-500 hover:text-red-500 transition-colors"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
