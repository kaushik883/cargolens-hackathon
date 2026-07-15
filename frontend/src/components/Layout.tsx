import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Upload,
  BookOpen,
  MapPin,
  MessageSquare,
  Building2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface NavItem {
  to: string;
  label: string;
  Icon: React.ElementType;
}

const SUPER_ADMIN_NAV: NavItem[] = [
  { to: '/app', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/app/companies', label: 'Companies', Icon: Building2 },
];

const CLIENT_NAV: NavItem[] = [
  { to: '/app', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/app/quotes', label: 'Quotes', Icon: FileText },
  { to: '/app/invoices', label: 'Invoices', Icon: Upload },
  { to: '/app/charge-master', label: 'Charge Master', Icon: BookOpen },
  { to: '/app/tracking', label: 'Tracking', Icon: MapPin },
  { to: '/app/copilot', label: 'Copilot', Icon: MessageSquare },
];

const FORWARDER_NAV: NavItem[] = [
  { to: '/app', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/app/quotes', label: 'Quotes', Icon: FileText },
  { to: '/app/invoices', label: 'Invoices', Icon: Upload },
  { to: '/app/tracking', label: 'Tracking', Icon: MapPin },
];

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav =
    user?.role === 'super_admin'
      ? SUPER_ADMIN_NAV
      : user?.role === 'forwarder'
      ? FORWARDER_NAV
      : CLIENT_NAV;

  const roleLabel =
    user?.role === 'super_admin'
      ? 'Super Admin'
      : user?.role === 'forwarder'
      ? 'Forwarder'
      : 'Client';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div
      className={`flex flex-col h-full transition-all duration-200 ${
        mobile ? 'w-64' : collapsed ? 'w-16' : 'w-56'
      }`}
      style={{ background: '#0f1623', borderRight: '1px solid #1e2a3a' }}
    >
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-4 py-5 ${collapsed && !mobile ? 'justify-center' : ''}`}
        style={{ borderBottom: '1px solid #1e2a3a' }}
      >
        <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-gray-900" />
        </div>
        {(!collapsed || mobile) && (
          <div>
            <span className="text-white font-bold text-sm tracking-tight">LogiSight</span>
            <p className="text-xs text-gray-500 leading-none mt-0.5">Freight Audit</p>
          </div>
        )}
        {!mobile && (
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="ml-auto w-5 h-5 rounded flex items-center justify-center text-gray-600 hover:text-gray-300 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Nav section label */}
      {(!collapsed || mobile) && (
        <p className="px-4 pt-5 pb-2 text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
          Navigation
        </p>
      )}

      {/* Nav links */}
      <nav className="flex-1 px-2 overflow-y-auto">
        <ul className="space-y-0.5">
          {nav.map(({ to, label, Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/app'}
                onClick={() => mobile && setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-100 ${
                    collapsed && !mobile ? 'justify-center' : ''
                  } ${
                    isActive
                      ? 'bg-white text-gray-900'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
                  }`
                }
                title={collapsed && !mobile ? label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {(!collapsed || mobile) && <span>{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User footer */}
      <div
        className={`px-2 py-3 ${collapsed && !mobile ? 'items-center flex flex-col gap-2' : 'space-y-1'}`}
        style={{ borderTop: '1px solid #1e2a3a' }}
      >
        {(!collapsed || mobile) && (
          <div className="px-3 py-2.5 mb-1">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate mt-0.5">{user?.company_name}</p>
            <span className="mt-1.5 inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-gray-300 uppercase tracking-wide">
              {roleLabel}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2 px-3 py-2 w-full rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all ${
            collapsed && !mobile ? 'justify-center' : ''
          }`}
          title={collapsed && !mobile ? 'Sign out' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {(!collapsed || mobile) && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden md:flex h-full flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="h-14 border-b border-gray-200 bg-white flex items-center px-6 gap-3 flex-shrink-0"
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden text-gray-500 hover:text-gray-800"
          >
            <Menu className="w-5 h-5" />
          </button>
          {mobileOpen && (
            <button onClick={() => setMobileOpen(false)} className="md:hidden text-gray-500">
              <X className="w-5 h-5" />
            </button>
          )}
          {/* Breadcrumb area — empty for now, pages can render their own */}
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {user?.name?.charAt(0).toUpperCase() ?? 'U'}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
