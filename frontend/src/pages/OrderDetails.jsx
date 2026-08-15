import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useSocket } from '../context/SocketContext';
import { 
  FileText, ArrowLeft, Printer, Clock, FileDown, 
  AlertTriangle, ShieldCheck, HelpCircle, MapPin
} from 'lucide-react';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  
  const { socket } = useSocket();
  const navigate = useNavigate();

  const fetchOrderDetails = async () => {
    try {
      const res = await axiosClient.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.order);
        setHistory(res.data.history);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  // Handle live WebSocket status changes
  useEffect(() => {
    if (!socket) return;

    socket.on('order_status_updated', (data) => {
      if (order && data.orderId === order._id) {
        fetchOrderDetails();
      }
    });

    return () => {
      socket.off('order_status_updated');
    };
  }, [socket, order]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const res = await axiosClient.put(`/orders/${order._id}/cancel`);
      if (res.data.success) {
        fetchOrderDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
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
        return 'bg-slate-50 text-slate-500 border border-slate-200 dark:border-dark-800';
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-dark-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Access Error</h2>
        <p className="text-xs text-slate-500 dark:text-dark-400">{error || 'Order could not be found.'}</p>
        <Link to="/my-orders" className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 px-4 py-2.5 text-xs text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Back button */}
      <Link to="/my-orders" className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-dark-400 hover:text-slate-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to History
      </Link>

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
            <Printer className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Order Details</h1>
            <p className="text-xs text-slate-500 dark:text-dark-400">ID: #{order.orderId} placed on {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${getStatusBadge(order.status)}`}>
            {order.status}
          </span>
          {order.status === 'Order Received' && (
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Hand: Invoice details */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Order Details & Pricing Cards */}
          <div className="bg-white dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-dark-800 pb-3 flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
              File & Print Setup
            </h3>

            {/* Document Info */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400 shrink-0" />
                <div className="truncate">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{order.documentId?.originalName}</h4>
                  <p className="text-xs text-slate-500 dark:text-dark-400 capitalize font-medium">
                    {order.documentId?.extension?.slice(1)} • {formatBytes(order.documentId?.fileSize)}
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                <span className="text-[10px] font-bold bg-slate-200 dark:bg-dark-800 border border-slate-300 dark:border-dark-700 px-2.5 py-1 rounded-full text-slate-700 dark:text-white">
                  {order.pages} Pages
                </span>
              </div>
            </div>

            {/* Config parameters */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-dark-900/40 border border-slate-200 dark:border-dark-800 rounded-xl">
                <span className="text-slate-500 dark:text-dark-400 text-xs font-medium block">Print Profile</span>
                <span className="font-bold text-slate-900 dark:text-white block mt-0.5 capitalize">
                  {order.printType === 'bw' ? 'Black & White' : 'Color Print'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-dark-900/40 border border-slate-200 dark:border-dark-800 rounded-xl">
                <span className="text-slate-500 dark:text-dark-400 text-xs font-medium block">Copies</span>
                <span className="font-bold text-slate-900 dark:text-white block mt-0.5">× {order.copies} sets</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-dark-900/40 border border-slate-200 dark:border-dark-800 rounded-xl">
                <span className="text-slate-500 dark:text-dark-400 text-xs font-medium block">Lock Price Rate</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 block mt-0.5">{order.pricePerPage} BDT / page</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-dark-900/40 border border-slate-200 dark:border-dark-800 rounded-xl">
                <span className="text-slate-500 dark:text-dark-400 text-xs font-medium block">Total Printed Pages</span>
                <span className="font-bold text-slate-900 dark:text-white block mt-0.5">{order.totalPages} Pages</span>
              </div>
            </div>

            {/* Total invoice block */}
            <div className="pt-5 border-t border-slate-200 dark:border-dark-850 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Amount Due</span>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{order.totalCost} BDT</span>
            </div>
          </div>

          {/* Admin notes panel */}
          {order.adminNote && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/25 space-y-2">
              <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300">Admin Response Notes</h4>
              <p className="text-xs text-slate-700 dark:text-dark-300 leading-relaxed font-medium">{order.adminNote}</p>
            </div>
          )}

          {/* Physical Pick Up Info */}
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/10 border border-blue-200 dark:border-blue-900/30 flex gap-3">
            <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 dark:text-dark-400 leading-relaxed font-medium">
              <strong className="text-slate-900 dark:text-dark-200">Where do I collect my print?</strong><br />
              Please visit the campus central library printing counter. Show your Order ID <strong className="text-slate-900 dark:text-white">#{order.orderId}</strong>, inspect the printed pages, and pay the total amount of <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{order.totalCost} BDT</strong> physically.
            </div>
          </div>
        </div>

        {/* Right Hand: Log timelines */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-dark-800 pb-3 flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
              Status Timeline
            </h3>

            {/* Timeline lists */}
            <div className="relative border-l border-slate-200 dark:border-dark-800 ml-3 space-y-6 pt-2">
              {history.map((log, index) => (
                <div key={log._id || index} className="relative pl-6">
                  {/* Timeline dot */}
                  <div className={`absolute -left-1.5 top-1 h-3 w-3 rounded-full border-2 border-white dark:border-dark-950 ${
                    log.newStatus === 'Completed'
                      ? 'bg-emerald-500'
                      : log.newStatus === 'Cancelled' || log.newStatus === 'Failed'
                      ? 'bg-rose-500'
                      : 'bg-blue-600'
                  }`}></div>
                  
                  <div className="text-xs leading-none">
                    <h4 className="font-bold text-slate-900 dark:text-white">{log.newStatus}</h4>
                    <span className="text-xs text-slate-500 dark:text-dark-400 block mt-1.5 font-medium">
                      {new Date(log.timestamp).toLocaleDateString()} at {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-dark-500 block mt-1 capitalize font-medium">
                      Updated by {log.changedBy?.role || 'system'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderDetails;
