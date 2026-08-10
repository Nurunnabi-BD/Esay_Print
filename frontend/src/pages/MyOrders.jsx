import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { History, Eye, ArrowUpRight, Search, FileText } from 'lucide-react';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Watch URL query parameters for filter synchronization
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const statusParam = params.get('status');
    if (statusParam) {
      setFilter(statusParam);
    } else {
      setFilter('All');
    }
  }, [location.search]);

  const fetchOrders = async () => {
    try {
      const res = await axiosClient.get('/orders/my-orders');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (error) {
      console.error('Failed to load orders history', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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

  // Filter and search logic
  const filteredOrders = orders.filter(o => {
    const matchesFilter = filter === 'All' || o.status === filter;
    const documentName = o.documentId?.originalName || '';
    const orderNumber = o.orderId || '';
    const matchesSearch = 
      documentName.toLowerCase().includes(search.toLowerCase()) ||
      orderNumber.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-md shadow-brand-600/10">
          <History className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">Order History</h1>
          <p className="text-sm text-dark-400">Review, track, and details of all your placed document prints.</p>
        </div>
      </div>

      {/* Filters and search block */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-dark-950 border border-dark-800 p-4 rounded-2xl">
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {['All', 'Order Received', 'Processing', 'Completed', 'Cancelled'].map((status) => (
            <div
              key={status}
              onClick={() => {
                if (status === 'All') {
                  navigate('/my-orders');
                } else {
                  navigate(`/my-orders?status=${status}`);
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                filter === status
                  ? 'bg-brand-600 text-white'
                  : 'bg-dark-950 border border-dark-800 text-dark-400 hover:bg-[#EFF6FF] hover:text-[#2563EB] hover:border-[#2563EB]/20'
              }`}
            >
              {status === 'Order Received' ? 'Received' : status}
            </div>
          ))}
        </div>
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search by ID or document..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-xl bg-dark-950 border border-dark-800 py-2.5 pl-9 pr-3 text-xs text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
          />
        </div>
      </div>

      {/* Orders Grid/Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="glass rounded-3xl py-20 flex flex-col items-center justify-center text-center p-6">
          <FileText className="h-12 w-12 text-dark-500 mb-3" />
          <h3 className="text-lg font-bold text-white">No orders found</h3>
          <p className="text-xs text-dark-400 max-w-sm mt-1">
            You haven't placed any printing orders matching this query. Upload a document to start printing!
          </p>
          <Link
            to="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-500 transition-colors"
          >
            Upload File
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <div key={order._id} className="glass rounded-3xl p-5 border border-dark-850 flex flex-col justify-between hover:border-brand-500/20 transition-all group">
              
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-white">#{order.orderId}</h3>
                    <span className="text-10px text-dark-500">
                      {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${getStatusBadge(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-xl bg-dark-900 border border-dark-850">
                  <FileText className="h-5 w-5 text-brand-400 shrink-0" />
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-white truncate">{order.documentId?.originalName || 'Deleted File'}</h4>
                    <p className="text-[10px] text-dark-500 capitalize">{order.printType === 'bw' ? 'Black & White' : 'Color'} print</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-dark-900/40 p-2 rounded-lg border border-dark-850">
                    <span className="text-dark-500 text-[10px] block">Pages</span>
                    <span className="font-bold text-white">{order.pages}</span>
                  </div>
                  <div className="bg-dark-900/40 p-2 rounded-lg border border-dark-850">
                    <span className="text-dark-500 text-[10px] block">Copies</span>
                    <span className="font-bold text-white">× {order.copies}</span>
                  </div>
                  <div className="bg-dark-900/40 p-2 rounded-lg border border-dark-850">
                    <span className="text-dark-500 text-[10px] block">Cost</span>
                    <span className="font-bold text-emerald-400">{order.totalCost} BDT</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-dark-900 flex justify-end">
                <Link
                  to={`/orders/${order._id}`}
                  className="flex items-center gap-1.5 text-xs text-brand-400 font-semibold group-hover:text-brand-300 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
