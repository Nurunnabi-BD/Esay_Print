import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { 
  LayoutDashboard, FileText, UploadCloud, Clock, CheckCircle, XCircle, 
  UserCircle, MapPin, CreditCard, Settings, HelpCircle, Headphones, LogOut, Menu 
} from 'lucide-react';
import { FaReact } from 'react-icons/fa';
import NotificationToast from '../components/NotificationToast';
import Header from '../components/Header';

const UserLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [counts, setCounts] = useState({ pending: 0, completed: 0, cancelled: 0 });
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  const fetchLiveCounts = async () => {
    if (!user) return;
    try {
      if (isAdmin) {
        const res = await axiosClient.get('/admin/statistics');
        if (res.data.success) {
          setCounts({
            pending: res.data.counts.new || 0,
            inProgress: res.data.counts.processing || 0,
            completed: res.data.counts.completed || 0,
            cancelled: (res.data.counts.cancelled || 0) + (res.data.counts.failed || 0)
          });
        }
      } else {
        const res = await axiosClient.get('/orders/my-orders');
        if (res.data.success) {
          const list = res.data.orders;
          setCounts({
            pending: list.filter(o => ['Order Received', 'Processing'].includes(o.status)).length,
            completed: list.filter(o => o.status === 'Completed').length,
            cancelled: list.filter(o => o.status === 'Cancelled').length
          });
        }
      }
    } catch (error) {
      console.error('Failed to load user order counts for sidebar', error);
    }
  };

  useEffect(() => {
    fetchLiveCounts();
    // Poll counts every 30 seconds for live updates
    const interval = setInterval(fetchLiveCounts, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const sections = isAdmin ? [
    {
      title: 'ORDERS',
      items: [
        { name: 'All Orders', path: '/admin/orders', icon: FileText },
        { name: 'Pending Orders', path: '/admin/orders?status=Order Received', icon: Clock, count: counts.pending, color: 'bg-amber-500/10 text-amber-500' },
        { name: 'In Progress', path: '/admin/orders?status=Processing', icon: Settings, count: counts.inProgress, color: 'bg-blue-600/10 text-blue-500' },
        { name: 'Completed Orders', path: '/admin/orders?status=Completed', icon: CheckCircle, count: counts.completed, color: 'bg-emerald-500/10 text-emerald-500' },
        { name: 'Cancelled Orders', path: '/admin/orders?status=Cancelled', icon: XCircle, count: counts.cancelled, color: 'bg-rose-500/10 text-rose-500' },
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { name: 'Customers', path: '/admin/users', icon: Users },
      ]
    },
    {
      title: 'ACCOUNT',
      items: [
        { name: 'Admin Profile', path: '/profile?tab=profile', icon: UserCircle },
        { name: 'Settings', path: '/profile?tab=settings', icon: Settings },
      ]
    },
    {
      title: 'SUPPORT',
      items: [
        { name: 'Help Center', path: '/profile?tab=help', icon: HelpCircle },
        { name: 'Logout', path: 'logout', icon: LogOut, isAction: true }
      ]
    }
  ] : [
    {
      title: 'ORDERS',
      items: [
        { name: 'My Orders', path: '/my-orders', icon: FileText },
        { name: 'Upload New File', path: '/dashboard?action=upload', icon: UploadCloud },
        { name: 'Pending Orders', path: '/my-orders?status=Order Received', icon: Clock, count: counts.pending, color: 'bg-amber-500/10 text-amber-500' },
        { name: 'Completed Orders', path: '/my-orders?status=Completed', icon: CheckCircle, count: counts.completed, color: 'bg-emerald-500/10 text-emerald-500' },
        { name: 'Cancelled Orders', path: '/my-orders?status=Cancelled', icon: XCircle, count: counts.cancelled, color: 'bg-rose-500/10 text-rose-500' },
      ]
    },
    {
      title: 'ACCOUNT',
      items: [
        { name: 'Profile', path: '/profile?tab=profile', icon: UserCircle },
        { name: 'Address Book', path: '/profile?tab=address', icon: MapPin },
        { name: 'Payment Methods', path: '/profile?tab=payment', icon: CreditCard },
        { name: 'Settings', path: '/profile?tab=settings', icon: Settings },
      ]
    },
    {
      title: 'SUPPORT',
      items: [
        { name: 'Help Center', path: '/profile?tab=help', icon: HelpCircle },
        { name: 'Contact Support', path: '/profile?tab=support', icon: Headphones },
        { name: 'Logout', path: 'logout', icon: LogOut, isAction: true }
      ]
    }
  ];

  const dashboardPath = isAdmin ? '/admin/dashboard' : '/dashboard';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-900 flex flex-col text-slate-900 dark:text-white font-sans transition-colors duration-300">
      {/* Global Brand Header */}
      <Header />

      <div className="flex-1 flex flex-row relative min-h-0">
        <NotificationToast />

        {/* Floating Sidebar Toggle Button for Mobile */}
        {!sidebarOpen && (
          <button 
            onClick={() => setSidebarOpen(true)}
            className="md:hidden fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all"
            title="Open Menu"
          >
            <Menu className="h-6 w-6 text-white" />
          </button>
        )}

        {/* Left Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col justify-between p-6 transform transition-transform duration-300 md:relative md:transform-none shrink-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="space-y-6 overflow-y-auto max-h-[80vh] scrollbar-none pr-1">
            {/* Logo Branding */}
            <Link to={dashboardPath} className="flex items-center gap-3 font-extrabold text-white text-lg border-b border-slate-800 pb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                <FaReact className="h-5 w-5 animate-spin-slow text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-black tracking-tight text-white">PrintFlow</span>
                <span className="text-[9px] text-slate-300 font-medium tracking-wide mt-0.5">Online Printing System</span>
              </div>
            </Link>

            {/* Active Dashboard Button */}
            <Link
              to={dashboardPath}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                (location.pathname === '/dashboard' || location.pathname === '/admin/dashboard') && !location.search
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5" />
              <span>Dashboard</span>
            </Link>

            {/* Render Sections */}
            {sections.map((sec) => (
              <div key={sec.title} className="space-y-1.5 pt-3">
                <span className="block text-[9px] font-black text-slate-500 tracking-widest pl-4 uppercase">{sec.title}</span>
                <nav className="space-y-1">
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    if (item.isAction) {
                      return (
                        <div
                          key={item.name}
                          onClick={() => {
                            setSidebarOpen(false);
                            if (item.name === 'Logout') {
                              handleLogout();
                            }
                          }}
                          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-[#EF4444] hover:bg-slate-800 hover:text-[#EF4444] text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4 shrink-0" />
                            <span>{item.name}</span>
                          </div>
                        </div>
                      );
                    }
                    const isActive = location.pathname + location.search === item.path;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{item.name}</span>
                        </div>
                        {item.count !== undefined && item.count > 0 && (
                          <span className={`px-2 py-0.5 rounded-full text-10px font-extrabold ${item.color}`}>
                            {item.count}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* Refer & Earn Promotion Box */}
          <div className="pt-4 border-t border-slate-800 mt-4 space-y-3">
            <div className="p-3 bg-blue-950/20 border border-blue-900/30 rounded-2xl flex flex-col gap-2 text-left">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎁</span>
                <div className="space-y-0.5">
                  <h5 className="text-[10px] font-extrabold text-white">Refer & Earn</h5>
                  <p className="text-[8px] text-slate-400 font-semibold leading-tight">Refer a friend and earn exciting rewards!</p>
                </div>
              </div>
              <button 
                onClick={() => alert('Referral Link Copied!')}
                className="w-full py-1.5 rounded-lg border border-blue-500/20 text-white text-[9px] font-bold hover:bg-blue-600 transition-colors"
                style={{ color: '#ffffff' }}
              >
                Refer Now
              </button>
            </div>
          </div>
        </aside>
        {/* Main Content Pane */}
        <main className="flex-1 overflow-x-hidden p-6 md:p-8 bg-slate-50 dark:bg-dark-900 transition-colors duration-300 relative">
          {sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm"
            ></div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
