import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { 
  ShoppingBag, Clock, Printer, Users, TrendingUp, 
  HelpCircle, Eye, MoreVertical, FileText, ChevronRight, UploadCloud 
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      const statsRes = await axiosClient.get('/admin/statistics');
      const ordersRes = await axiosClient.get('/admin/orders', { params: { limit: 5 } });
      
      if (statsRes.data.success) {
        setStats(statsRes.data);
      }
      if (ordersRes.data.success) {
        setRecentOrders(ordersRes.data.orders);
      }
    } catch (err) {
      setError('Failed to fetch dashboard data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const { counts, metrics, charts } = stats || {
    counts: { total: 0, new: 0, processing: 0, completed: 0, cancelled: 0, failed: 0, users: 0 },
    metrics: { totalRevenue: 0, estimatedRevenue: 0, totalPrintedPages: 0, estimatedTotalPages: 0, totalCopies: 0 },
    charts: { dailyVolume: [], typeDistribution: [] }
  };

  // Helper: custom SVG line chart
  const renderLineChart = () => {
    const data = charts.dailyVolume || [];
    if (data.length === 0) {
      return (
        <div className="flex h-44 items-center justify-center text-xs text-slate-400">
          No printing traffic recorded in the past 30 days.
        </div>
      );
    }

    const padding = 35;
    const width = 600;
    const height = 180;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxCount = Math.max(...data.map(d => d.count), 5);
    
    const points = data.map((d, index) => {
      const x = padding + (index / Math.max(1, data.length - 1)) * chartWidth;
      const y = height - padding - (d.count / maxCount) * chartHeight;
      return { x, y, label: d._id.slice(8), count: d.count }; // e.g. "31" from "2024-05-31"
    });

    const pathD = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    const areaD = points.length > 0 
      ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
      : '';

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full text-blue-600 font-sans">
        <defs>
          <linearGradient id="line-chart-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(37, 99, 235)" stopOpacity="0.15"/>
            <stop offset="100%" stopColor="rgb(37, 99, 235)" stopOpacity="0.0"/>
          </linearGradient>
        </defs>
        
        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((ratio, i) => {
          const y = padding + ratio * chartHeight;
          const val = Math.round(maxCount - ratio * maxCount);
          return (
            <g key={i} className="opacity-40">
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3,3" />
              <text x={padding - 10} y={y + 4} textAnchor="end" fill="#64748B" className="text-[9px] font-bold">{val}</text>
            </g>
          );
        })}
        
        {/* Area fill under line */}
        {areaD && <path d={areaD} fill="url(#line-chart-grad)" />}
        
        {/* Stroke line path */}
        {pathD && <path d={pathD} fill="none" stroke="#2563EB" strokeWidth="2.5" className="drop-shadow-[0_2px_6px_rgba(37,99,235,0.15)]" />}
        
        {/* Interactive nodes */}
        {points.map((p, i) => (
          <g key={i} className="group cursor-pointer">
            <circle cx={p.x} cy={p.y} r="3" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" className="hover:r-4.5 transition-all" />
            <text x={p.x} y={p.y - 8} textAnchor="middle" fill="#0F172A" className="text-[8px] font-extrabold opacity-0 group-hover:opacity-100 transition-opacity">
              {p.count}
            </text>
          </g>
        ))}

        {/* X axis labels (Dates) */}
        {points.filter((_, i) => i % Math.max(1, Math.floor(points.length / 7)) === 0).map((p, i) => (
          <text key={i} x={p.x} y={height - padding + 15} textAnchor="middle" fill="#64748B" className="text-[8px] font-bold">
            May {p.label}
          </text>
        ))}
      </svg>
    );
  };

  // Helper: custom SVG donut chart
  const renderDonutChart = () => {
    const total = counts.total || 1;
    
    // Status metrics mapping
    const slices = [
      { name: 'Pending', count: counts.new || 0, color: 'stroke-blue-600', fillClass: 'bg-blue-600' },
      { name: 'In Progress', count: counts.processing || 0, color: 'stroke-amber-500', fillClass: 'bg-amber-500' },
      { name: 'Completed', count: counts.completed || 0, color: 'stroke-emerald-500', fillClass: 'bg-emerald-500' },
      { name: 'Cancelled', count: (counts.cancelled || 0) + (counts.failed || 0), color: 'stroke-rose-500', fillClass: 'bg-rose-500' }
    ];

    const r = 50;
    const c = 2 * Math.PI * r; // 314.159
    let accumulatedCircumference = 0;

    return (
      <div className="flex flex-row items-center justify-center gap-8 py-2 w-full">
        
        {/* SVG Circle Frame */}
        <div className="relative h-36 w-36 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
            {/* Background ring */}
            <circle cx="60" cy="60" r={r} fill="transparent" stroke="currentColor" className="text-slate-100 dark:text-dark-850" strokeWidth="11" />
            
            {/* Segment slices */}
            {slices.map((slice, i) => {
              if (slice.count === 0) return null;
              const percentage = slice.count / total;
              const dashArray = `${percentage * c} ${c}`;
              const dashOffset = -accumulatedCircumference;
              accumulatedCircumference += percentage * c;

              return (
                <circle
                  key={i}
                  cx="60"
                  cy="60"
                  r={r}
                  fill="transparent"
                  className={slice.color}
                  strokeWidth="11"
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
          
          {/* Inner circle text stats */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">{counts.total}</span>
            <span className="text-[9px] font-bold text-slate-400 dark:text-dark-500 uppercase tracking-widest mt-1">Total</span>
          </div>
        </div>

        {/* Legend listing */}
        <div className="space-y-3.5 text-xs font-bold text-slate-700 dark:text-dark-300 w-full max-w-[180px]">
          {slices.map((slice, i) => {
            const percentage = counts.total > 0 ? ((slice.count / counts.total) * 100).toFixed(1) : 0;
            return (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${slice.fillClass} shrink-0`}></span>
                  <span className="text-slate-600 dark:text-dark-300 font-semibold">{slice.name}</span>
                </div>
                <div className="text-right text-slate-900 dark:text-white font-extrabold">
                  {slice.count} <span className="text-slate-400 dark:text-dark-550 font-medium text-[10px]">({percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Order Received':
        return 'bg-amber-50 text-amber-600 border border-amber-100';
      case 'Processing':
        return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'Cancelled':
      case 'Failed':
        return 'bg-rose-50 text-rose-600 border border-rose-100';
      default:
        return 'bg-slate-50 text-slate-600 border border-slate-100';
    }
  };

  const getStatusLabel = (status) => {
    if (status === 'Order Received') return 'Pending';
    if (status === 'Processing') return 'In Progress';
    return status;
  };

  const getFileBadge = (extension) => {
    const ext = extension.toLowerCase();
    if (ext === '.pdf') {
      return 'bg-red-50 text-red-500 border border-red-150';
    } else if (ext === '.docx' || ext === '.doc') {
      return 'bg-blue-50 text-blue-500 border border-blue-150';
    } else if (ext === '.xlsx' || ext === '.xls') {
      return 'bg-green-50 text-green-600 border border-green-150';
    } else {
      return 'bg-purple-50 text-purple-500 border border-purple-150';
    }
  };

  const formatFileExt = (ext) => {
    return ext.replace('.', '').toUpperCase();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-dark-950 p-6 rounded-3xl border border-slate-150 dark:border-dark-850 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Admin Control Panel</h1>
          <p className="text-xs text-slate-500 dark:text-dark-400 mt-1">Oversee all student print orders, manage print queue status, and track automatic revenue calculations.</p>
        </div>
        <Link
          to="/admin/orders"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md hover:shadow-lg shrink-0"
        >
          <FileText className="h-4.5 w-4.5" />
          View Print Queue
        </Link>
      </div>

      {/* 1. Four-Column Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Orders */}
        <div className="glass rounded-3xl p-5 border border-slate-150 dark:border-dark-850 shadow-sm flex items-center justify-between bg-white dark:bg-dark-950 transition-colors duration-300">
          <div className="space-y-2 text-left">
            <span className="text-[10px] font-bold text-slate-500 dark:text-dark-400 uppercase tracking-widest block">Total Orders</span>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-none">{counts.total}</h3>
            <span className="text-10px text-blue-600 dark:text-blue-400 font-bold block">↗ 12% from last month</span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <ShoppingBag className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: Pending Orders */}
        <div className="glass rounded-3xl p-5 border border-slate-150 dark:border-dark-850 shadow-sm flex items-center justify-between bg-white dark:bg-dark-950 transition-colors duration-300">
          <div className="space-y-2 text-left">
            <span className="text-[10px] font-bold text-slate-500 dark:text-dark-400 uppercase tracking-widest block">Pending Orders</span>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-none">{counts.new}</h3>
            <span className="text-10px text-amber-500 dark:text-amber-400 font-bold block">↗ 8% from last month</span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400 flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: Completed Orders */}
        <div className="glass rounded-3xl p-5 border border-slate-150 dark:border-dark-850 shadow-sm flex items-center justify-between bg-white dark:bg-dark-950 transition-colors duration-300">
          <div className="space-y-2 text-left">
            <span className="text-[10px] font-bold text-slate-500 dark:text-dark-400 uppercase tracking-widest block">Completed Orders</span>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-none">{counts.completed}</h3>
            <span className="text-10px text-emerald-500 dark:text-emerald-400 font-bold block">↗ 18% from last month</span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-400 flex items-center justify-center">
            <Printer className="h-6 w-6" />
          </div>
        </div>

        {/* Card 4: Total Revenue (Calculated Automatically) */}
        <div className="glass rounded-3xl p-5 border border-slate-150 dark:border-dark-850 shadow-sm flex items-center justify-between bg-white dark:bg-dark-950 transition-colors duration-300">
          <div className="space-y-2 text-left">
            <span className="text-[10px] font-bold text-slate-500 dark:text-dark-400 uppercase tracking-widest block">Total Revenue</span>
            <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 leading-none">{metrics.totalRevenue} BDT</h3>
            <span className="text-10px text-slate-400 dark:text-dark-500 font-bold block">Auto calculated from print jobs</span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
      </div>
      {/* 2. Middle Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Card: Orders Overview line chart */}
        <div className="lg:col-span-8 glass rounded-3xl p-6 border border-slate-150 dark:border-dark-850 shadow-sm bg-white dark:bg-dark-950 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Orders Overview</h3>
            <select className="bg-slate-50 dark:bg-dark-900 border border-slate-150 dark:border-dark-800 rounded-xl px-3 py-1.5 text-[10px] font-bold text-slate-600 dark:text-dark-300 outline-none focus:border-blue-500">
              <option className="bg-white dark:bg-dark-950 text-slate-900 dark:text-white">This Month</option>
              <option className="bg-white dark:bg-dark-950 text-slate-900 dark:text-white">This Week</option>
              <option className="bg-white dark:bg-dark-950 text-slate-900 dark:text-white">This Year</option>
            </select>
          </div>
          <div className="h-48 w-full pr-2">
            {renderLineChart()}
          </div>
        </div>

        {/* Right Card: Order Status donut chart */}
        <div className="lg:col-span-4 glass rounded-3xl p-6 border border-slate-150 dark:border-dark-850 shadow-sm bg-white dark:bg-dark-950 flex flex-col justify-between">
          <h3 className="text-sm font-black text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-dark-850">Order Status</h3>
          <div className="flex-1 flex items-center">
            {renderDonutChart()}
          </div>
        </div>

      </div>

      {/* 3. Recent Orders Table */}
      <div className="glass rounded-3xl border border-slate-150 dark:border-dark-850 shadow-sm bg-white dark:bg-dark-950 overflow-hidden space-y-4">
        
        {/* Table Title and Actions */}
        <div className="px-6 pt-5 pb-2 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Recent Orders</h3>
          <Link 
            to="/admin/orders" 
            className="flex items-center gap-1.5 rounded-xl border border-blue-200 dark:border-blue-800 px-4 py-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
          >
            View All Orders
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Core Table Viewport */}
        {recentOrders.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 dark:text-dark-500">
            No printing jobs registered in the queue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-dark-900 border-y border-slate-100 dark:border-dark-850 text-[10px] font-bold text-slate-500 dark:text-dark-400 uppercase tracking-widest">
                  <th className="py-3 px-6">Order ID</th>
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">File Name</th>
                  <th className="py-3 px-6 text-center">Pages</th>
                  <th className="py-3 px-6 text-center">Copies</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6">Upload Date</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-850 text-xs font-semibold text-slate-700 dark:text-dark-300">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/40 dark:hover:bg-dark-900/40 transition-colors">                    
                    {/* Order ID */}
                    <td className="py-4 px-6 text-blue-600 font-bold">#{order.orderId}</td>
                    {/* Customer Info */}
                    <td className="py-4 px-6">
                      <div className="font-extrabold text-slate-900 dark:text-white leading-tight">{order.userId?.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-dark-400 font-medium mt-0.5">{order.userId?.email}</div>
                    </td>

                    {/* File extension badge + filename */}
                    <td className="py-4 px-6 max-w-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black shrink-0 ${getFileBadge(order.documentId?.extension)}`}>
                          {formatFileExt(order.documentId?.extension)}
                        </span>
                        <span className="truncate text-slate-800 dark:text-white font-bold">{order.documentId?.originalName}</span>
                      </div>
                    </td>

                    {/* Pages */}
                    <td className="py-4 px-6 text-center font-bold text-slate-900 dark:text-white">{order.pages}</td>

                    {/* Copies */}
                    <td className="py-4 px-6 text-center font-bold text-slate-900 dark:text-white">{order.copies}</td>

                    {/* Status badge pill */}
                    <td className="py-4 px-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black inline-block ${getStatusStyle(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>

                    {/* Upload date formatted */}
                    <td className="py-4 px-6 text-slate-500 dark:text-dark-400 text-10px">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })} {new Date(order.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </td>

                    {/* Actions panel */}
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-lg text-slate-400 dark:text-dark-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        
                        <button
                          onClick={() => window.open(`/admin/print/${order._id}`, '_blank')}
                          className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-blue-500 hover:text-blue-700 rounded-lg transition-colors"
                          title="Quick Print"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                        
                        <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-lg text-slate-400 dark:text-dark-450 hover:text-slate-700 dark:hover:text-white transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};

export default AdminDashboard;
