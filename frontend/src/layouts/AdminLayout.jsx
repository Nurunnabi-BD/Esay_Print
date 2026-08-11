import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { 
  LayoutDashboard, FileText, Clock, Settings, Users, 
  CheckCircle2, XCircle, LogOut, Menu, X, UserCircle, HelpCircle 
} from 'lucide-react';
import { FaReact } from 'react-icons/fa';
import NotificationToast from '../components/NotificationToast';
import Header from '../components/Header';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [counts, setCounts] = useState({ new: 0, processing: 0, completed: 0, cancelled: 0 });
  const { user, logout } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const fetchLiveCounts = async () => {
    try {
      const res = await axiosClient.get('/admin/statistics');
      if (res.data.success) {
        setCounts(res.data.counts);
      }
    } catch (error) {
      console.error('Failed to load live status counts for sidebar', error);
    }
  };

  useEffect(() => {
    fetchLiveCounts();
    // Poll counts every 30 seconds for live updates
    const interval = setInterval(fetchLiveCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const sections = [
    {
      title: 'ORDERS',
      items: [
        { name: 'All Orders', path: '/admin/orders', icon: FileText },
        { name: 'Pending Orders', path: '/admin/orders?status=Order Received', icon: Clock, count: counts.new, color: 'bg-amber-500/10 text-amber-500' },
        { name: 'In Progress', path: '/admin/orders?status=Processing', icon: Settings, count: counts.processing, color: 'bg-blue-600/10 text-blue-500' },
        { name: 'Completed', path: '/admin/orders?status=Completed', icon: CheckCircle2, count: counts.completed, color: 'bg-emerald-500/10 text-emerald-500' },
        { name: 'Cancelled', path: '/admin/orders?status=Cancelled', icon: XCircle, count: counts.cancelled, color: 'bg-rose-500/10 text-rose-500' },
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
        { name: 'Admin Profile', path: '/admin/dashboard', icon: UserCircle },
      ]
    }
  ];
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-900 flex flex-col text-slate-900 dark:text-white font-sans transition-colors duration-300">
      {/* Shared Global Brand Header */}
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
          <div className="space-y-6 overflow-y-auto max-h-[85vh] scrollbar-none pr-1">
            {/* Logo Branding */}
            <Link to="/admin/dashboard" className="flex items-center gap-3 font-extrabold text-white text-lg border-b border-slate-800 pb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/15">
                <FaReact className="h-5 w-5 animate-spin-slow text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-black tracking-tight text-white">PrintFlow</span>
                <span className="text-[9px] text-slate-300 font-medium tracking-wide mt-0.5">Online Printing System</span>
              </div>
            </Link>

            {/* Active Dashboard Button */}
            <Link
              to="/admin/dashboard"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                location.pathname === '/admin/dashboard'
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

          {/* Sidebar Footer Support Help Desk */}
          <div className="space-y-4 pt-4 border-t border-slate-800 mt-4">
            <div className="p-3 bg-blue-950/20 border border-blue-900/30 rounded-2xl flex items-start gap-2.5 text-left">
              <HelpCircle className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h5 className="text-[10px] font-extrabold text-white">Need Help?</h5>
                <Link to="/admin/dashboard" className="text-[9px] font-bold text-blue-400 hover:text-blue-300 transition-colors block">Contact Support</Link>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-danger hover:bg-danger/10 hover:text-danger transition-colors"
            >
              <LogOut className="h-4.5 w-4.5 shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </aside>
        {/* Main Content Pane */}
        <main className="flex-1 p-6 md:p-8 bg-slate-50 dark:bg-dark-900 overflow-y-auto relative transition-colors duration-300">
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

export default AdminLayout;
