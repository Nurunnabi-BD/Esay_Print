import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useSocket } from '../context/SocketContext';
import { 
  Search, Printer, Eye, Play, CheckCircle, 
  XCircle, Filter, FileText, AlertCircle, RefreshCw, Download
} from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Watch URL params for filter state synchronization
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const statusParam = params.get('status');
    if (statusParam) {
      setStatusFilter(statusParam);
    } else {
      setStatusFilter('All');
    }
    setPage(1);
  }, [location.search]);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);

  const { socket } = useSocket();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/orders', {
        params: {
          status: statusFilter,
          search: searchQuery,
          page,
          limit: 15
        }
      });
      if (res.data.success) {
        setOrders(res.data.orders);
        setTotalPages(res.data.totalPages);
        setTotalOrdersCount(res.data.totalOrders);
      }
    } catch (error) {
      console.error('Failed to fetch admin orders queue', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch queue on filter/page/search change
  useEffect(() => {
    fetchOrders();
  }, [statusFilter, page]);

  // Debounced search trigger
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1);
      fetchOrders();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleDownload = async (fileUrl, originalName) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalName || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback: open in new tab if CORS or other issues block blob download
      window.open(fileUrl, '_blank');
    }
  };

  // Socket triggers for real-time list synchronization
  useEffect(() => {
    if (!socket) return;

    socket.on('new_order', (data) => {
      // Auto prepended to list if we are on page 1
      if (page === 1) {
        setOrders(prev => [data.order, ...prev].slice(0, 15));
        setTotalOrdersCount(c => c + 1);
      } else {
        // Just trigger refresh or toast alert
        fetchOrders();
      }
    });

    socket.on('order_cancelled', (data) => {
      // Update the cancelled order's status in list in real time
      setOrders(prev => 
        prev.map(o => o._id === data.orderId ? { ...o, status: 'Cancelled' } : o)
      );
    });

    return () => {
      socket.off('new_order');
      socket.off('order_cancelled');
    };
  }, [socket, page]);

  // Modify status action calls
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await axiosClient.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        // Update local list state
        setOrders(prev => 
          prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o)
        );
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update order status.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Order Received':
        return 'bg-[#FFFBEB] text-[#F59E0B] border border-[#F59E0B]/20';
      case 'Processing':
        return 'bg-[#EFF6FF] text-[#3B82F6] border border-[#3B82F6]/20 animate-pulse';
      case 'Completed':
        return 'bg-[#ECFDF5] text-[#10B981] border border-[#10B981]/20';
      case 'Cancelled':
      case 'Failed':
        return 'bg-[#FEF2F2] text-[#EF4444] border border-[#EF4444]/20';
      default:
        return 'bg-slate-50 text-slate-500 border border-slate-100';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-md shadow-brand-600/10">
            <Printer className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Print Queue</h1>
            <p className="text-sm text-dark-400">Total active prints in pipeline: {totalOrdersCount} jobs.</p>
          </div>
        </div>
      </div>

      {/* Filter tabs and search */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-dark-950 border border-dark-800 p-4 rounded-2xl">
        <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {['All', 'Order Received', 'Processing', 'Completed', 'Cancelled', 'Failed'].map((status) => (
            <div
              key={status}
              onClick={() => {
                if (status === 'All') {
                  navigate('/admin/orders');
                } else {
                  navigate(`/admin/orders?status=${status}`);
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-brand-600 text-white'
                  : 'bg-dark-950 border border-dark-850 text-dark-400 hover:bg-[#EFF6FF] hover:text-[#2563EB] hover:border-[#2563EB]/20'
              }`}
            >
              {status === 'Order Received' ? 'Received' : status}
            </div>
          ))}
        </div>

        <div className="relative w-full lg:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search by ID, name, or student ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-xl bg-dark-950 border border-dark-800 py-2.5 pl-9 pr-3 text-xs text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
          />
        </div>
      </div>

      {/* Master Queue Queue Table */}
      <div className="glass rounded-3xl overflow-hidden shadow-xl border border-dark-850">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center p-6">
            <FileText className="h-12 w-12 text-dark-500 mb-3" />
            <h3 className="text-lg font-bold text-white">No print orders</h3>
            <p className="text-xs text-dark-400 max-w-sm mt-1">
              There are currently no orders in this queue filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dark-900 border-b border-dark-800 text-xs font-bold text-dark-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Document</th>
                  <th className="py-4 px-6 text-center">Pages</th>
                  <th className="py-4 px-6">Print Profile</th>
                  <th className="py-4 px-6 text-center">Copies</th>
                  <th className="py-4 px-6 text-right">Cost</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-900 text-xs font-medium">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-dark-900/35 transition-colors">
                    <td className="py-4 px-6 text-white font-bold">#{order.orderId}</td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-white">{order.userId?.name}</div>
                      <div className="text-10px text-dark-500">{order.userId?.studentId}</div>
                    </td>
                    <td className="py-4 px-6 max-w-xs truncate">
                      <div className="truncate text-white">{order.documentId?.originalName}</div>
                      <span className="text-[10px] text-dark-500 uppercase">{order.documentId?.extension?.slice(1)}</span>
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-white">{order.pages}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded-lg text-10px font-bold ${
                        order.printType === 'color' 
                          ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400' 
                          : 'bg-dark-800 text-dark-300'
                      }`}>
                        {order.printType === 'bw' ? 'B&W' : 'Color'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-white">× {order.copies}</td>
                    <td className="py-4 px-6 text-right font-extrabold text-emerald-400">{order.totalCost} BDT</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2 py-1 rounded-lg text-10px font-bold inline-block ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="p-1.5 hover:bg-[#EFF6FF] rounded-lg text-slate-500 hover:text-[#2563EB] transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        <div
                          onClick={() => handleDownload(order.documentId?.fileUrl, order.documentId?.originalName)}
                          className="p-1.5 hover:bg-[#EFF6FF] rounded-lg text-slate-500 hover:text-[#2563EB] transition-colors cursor-pointer"
                          title="Download Original"
                        >
                          <Download className="h-4 w-4" />
                        </div>

                        <div
                          onClick={() => window.open(`/admin/print/${order._id}`, '_blank')}
                          className="p-1.5 hover:bg-[#EFF6FF] rounded-lg text-[#3B82F6] hover:text-[#2563EB] transition-colors cursor-pointer"
                          title="Print Document"
                        >
                          <Printer className="h-4 w-4" />
                        </div>
                        
                        {order.status === 'Order Received' && (
                          <div
                            onClick={() => handleUpdateStatus(order._id, 'Processing')}
                            className="p-1.5 hover:bg-[#FFFBEB] text-[#F59E0B] hover:text-[#D97706] rounded-lg transition-colors cursor-pointer"
                            title="Start Processing"
                          >
                            <Play className="h-4 w-4" />
                          </div>
                        )}

                        {order.status === 'Processing' && (
                          <div
                            onClick={() => handleUpdateStatus(order._id, 'Completed')}
                            className="p-1.5 hover:bg-[#ECFDF5] text-[#10B981] hover:text-[#059669] rounded-lg transition-colors cursor-pointer"
                            title="Complete Order"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center text-xs text-dark-400 bg-dark-950 border border-dark-800 p-4 rounded-2xl">
          <span>Showing page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3.5 py-2 rounded-xl bg-dark-950 hover:bg-dark-800 border border-dark-800 disabled:opacity-50 font-semibold"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3.5 py-2 rounded-xl bg-dark-950 hover:bg-dark-800 border border-dark-800 disabled:opacity-50 font-semibold"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
