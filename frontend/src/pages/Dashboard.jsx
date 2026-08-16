import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { 
  UploadCloud, FileText, Settings, CreditCard, Check, AlertTriangle, 
  RefreshCw, X, Play, ShieldAlert, ArrowRight, ShoppingBag, Clock, 
  CheckCircle, Wallet, ArrowUpRight, Eye, Download, ChevronRight, HelpCircle, MapPin
} from 'lucide-react';
import { FaReact } from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'overview' | 'upload'
  const [viewMode, setViewMode] = useState('overview');

  // Wizard steps: 'upload' | 'configure' | 'confirm'
  const [wizardStep, setWizardStep] = useState('upload');
  
  // File upload states
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [document, setDocument] = useState(null); 
  const [uploadError, setUploadError] = useState('');
  
  // Order configuration states
  const [printType, setPrintType] = useState('bw'); 
  const [copies, setCopies] = useState(1);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Orders lists
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState(false);

  const fileInputRef = useRef(null);
  const uploadingDocIdRef = useRef(null);
  const PRICES = { bw: 3, color: 5 };

  const fetchOrders = async () => {
    try {
      const res = await axiosClient.get('/orders/my-orders');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (error) {
      console.error('Failed to load user orders', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Listen to URL search param toggles
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'upload') {
      setViewMode('upload');
      setWizardStep('upload');
      setDocument(null);
      setUploadError('');
    } else {
      setViewMode('overview');
    }
  }, [location.search]);

  // Recalculate estimated cost dynamically
  useEffect(() => {
    if (document && document.pageCount) {
      const rate = printType === 'bw' ? PRICES.bw : PRICES.color;
      setEstimatedCost(document.pageCount * copies * rate);
    }
  }, [printType, copies, document]);

  // WebSocket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('document_processed', (data) => {
      if (uploadingDocIdRef.current && data.documentId === uploadingDocIdRef.current) {
        if (data.status === 'processed') {
          setDocument(prev => {
            if (prev && prev._id === data.documentId) {
              return { 
                ...prev, 
                processingStatus: 'processed', 
                pageCount: data.pageCount 
              };
            }
            return prev;
          });
          setWizardStep('configure');
        } else {
          setDocument(prev => {
            if (prev && prev._id === data.documentId) {
              return { ...prev, processingStatus: 'failed' };
            }
            return prev;
          });
          setUploadError('Document parsing failed. Please upload a valid printable file.');
          setUploading(false);
        }
      }
    });

    socket.on('order_status_updated', (data) => {
      // Refresh list to trigger status state shifts
      fetchOrders();
    });

    return () => {
      socket.off('document_processed');
      socket.off('order_status_updated');
    };
  }, [socket]);

  // File drag & drop triggers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file) => {
    // 100MB size limit check
    const MAX_SIZE_BYTES = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      setUploadError('File size exceeds the 100MB limit. Please upload a smaller file.');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axiosClient.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      if (res.data.success) {
        uploadingDocIdRef.current = res.data.document._id;
        setDocument(res.data.document);
        // Wait for WebSockets to process page count in backend
      } else {
        setUploadError(res.data.message || 'Failed to upload document.');
        setUploading(false);
      }
    } catch (error) {
      setUploadError(error.response?.data?.message || 'Error occurred during file upload.');
      setUploading(false);
    }
  };

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    setOrderError('');

    try {
      let res;
      try {
        res = await axiosClient.post('/orders/create', {
          documentId: document._id,
          printType,
          copies
        });
      } catch (err) {
        if (err.response?.status === 404) {
          res = await axiosClient.post('/orders', {
            documentId: document._id,
            printType,
            copies
          });
        } else {
          throw err;
        }
      }

      if (res.data?.success) {
        setWizardStep('confirm');
        fetchOrders();
      } else {
        setOrderError(res.data?.message || 'Failed to place print order.');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to connect. Try again.';
      setOrderError(errorMsg);
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleDownloadDocument = async (docId, originalName) => {
    try {
      if (!docId) {
        alert('Document is not available for download.');
        return;
      }
      const res = await axiosClient.get(`/documents/${docId}/download`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: res.headers['content-type'] || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalName || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download document:', err);
      let errMsg = 'Failed to download document. Please try again.';
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          if (json.message) errMsg = json.message;
        } catch (_) {}
      } else if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      }
      alert(errMsg);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this printing order?')) return;
    setCancellingOrder(true);
    try {
      const res = await axiosClient.put(`/orders/${orderId}/cancel`);
      if (res.data.success) {
        fetchOrders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancellingOrder(false);
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
        return 'bg-[#FEF2F2] text-[#EF4444] border border-[#EF4444]/20';
      default:
        return 'bg-slate-50 text-slate-500 border border-slate-100';
    }
  };

  const getFileBadge = (filename) => {
    if (!filename) return 'bg-slate-50 text-slate-500';
    const parts = filename.split('.');
    const ext = parts.length > 1 ? parts.pop().toLowerCase() : '';
    switch (ext) {
      case 'pdf':
        return 'bg-red-50 text-red-500';
      case 'docx':
      case 'doc':
        return 'bg-blue-50 text-blue-500';
      case 'xlsx':
      case 'xls':
        return 'bg-emerald-50 text-emerald-600';
      case 'png':
      case 'jpg':
      case 'jpeg':
        return 'bg-purple-50 text-purple-500';
      default:
        return 'bg-slate-50 text-slate-500';
    }
  };

  // Metrics calculations from live orders list
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => ['Order Received', 'Processing'].includes(o.status)).length;
  const completedOrders = orders.filter(o => o.status === 'Completed').length;
  const totalSpent = orders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + (o.totalCost || 0), 0);


  if (loadingOrders) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // --- RENDERING OVERVIEW VIEW MODE ---
  if (viewMode === 'overview') {
    return (
      <div className="space-y-6">
        {/* 1. Welcome Banner */}
        <div className="relative hero-gradient border border-slate-150 dark:border-dark-800 rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
          <div className="space-y-3 text-left max-w-lg relative z-10">
            <h1 className="text-3xl font-bold text-[#0F172A] dark:text-white leading-tight">
              Welcome back, <span className="text-[#2563EB] dark:text-blue-400">{user?.name?.split(' ')[0] || 'Student'}</span>! 👋
            </h1>
            <p className="text-sm text-[#64748B] dark:text-dark-300 font-medium leading-relaxed">
              Upload your documents and get high quality prints delivered to your doorstep.
            </p>
          </div>
          
          {/* Visual Illustrator */}
          <div className="relative h-32 w-52 overflow-visible hidden md:flex items-center justify-center shrink-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-emerald-500/5 rounded-full blur-xl"></div>
            <FaReact className="h-20 w-20 text-blue-600 dark:text-blue-400 animate-spin-slow opacity-25" />
          </div>
        </div>

        {/* 2. Four Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Orders */}
          <div className="glass rounded-3xl p-5 border border-slate-150 dark:border-dark-800 shadow-sm flex items-center justify-between bg-white dark:bg-dark-950">
            <div className="space-y-2 text-left">
              <span className="text-[10px] font-bold text-slate-500 dark:text-dark-400 uppercase tracking-widest block">Total Orders</span>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-none">{totalOrders}</h3>
              <span className="text-[10px] text-slate-400 dark:text-dark-550 block mt-1 font-bold">All time orders</span>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <ShoppingBag className="h-6 w-6" />
            </div>
          </div>

          {/* Card 2: Pending Orders */}
          <div className="glass rounded-3xl p-5 border border-slate-150 dark:border-dark-800 shadow-sm flex items-center justify-between bg-white dark:bg-dark-950">
            <div className="space-y-2 text-left">
              <span className="text-[10px] font-bold text-slate-500 dark:text-dark-400 uppercase tracking-widest block">Pending Orders</span>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-none">{pendingOrders}</h3>
              <span className="text-[10px] text-amber-500 dark:text-amber-450 block mt-1 font-bold">Awaiting processing</span>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/45 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="h-6 w-6" />
            </div>
          </div>

          {/* Card 3: Completed Orders */}
          <div className="glass rounded-3xl p-5 border border-slate-150 dark:border-dark-800 shadow-sm flex items-center justify-between bg-white dark:bg-dark-950">
            <div className="space-y-2 text-left">
              <span className="text-[10px] font-bold text-slate-500 dark:text-dark-400 uppercase tracking-widest block">Completed Orders</span>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-none">{completedOrders}</h3>
              <span className="text-[10px] text-emerald-500 dark:text-emerald-450 block mt-1 font-bold">Successfully delivered</span>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/45 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>

          {/* Card 4: Total Spent */}
          <div className="glass rounded-3xl p-5 border border-slate-150 dark:border-dark-800 shadow-sm flex items-center justify-between bg-white dark:bg-dark-950">
            <div className="space-y-2 text-left">
              <span className="text-[10px] font-bold text-slate-500 dark:text-dark-400 uppercase tracking-widest block">Total Spent</span>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-none">{totalSpent.toFixed(2)} BDT</h3>
              <span className="text-[10px] text-purple-500 dark:text-purple-450 block mt-1 font-bold">All time spent</span>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-950/45 text-purple-500 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
        </div>
        {/* 3. Center Dashboard Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Main Left column: Recent Orders Table */}
          <div className="lg:col-span-8 glass rounded-3xl bg-white dark:bg-dark-950 border border-slate-150 dark:border-dark-800 p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Recent Orders</h3>
              <Link 
                to="/my-orders"
                className="text-[10px] font-bold border border-slate-200 dark:border-dark-800 px-3.5 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-900 transition-colors text-slate-700 dark:text-dark-300"
              >
                View All Orders
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-dark-900 border-y border-slate-200 dark:border-dark-800 text-[10px] font-bold text-slate-600 dark:text-dark-400 uppercase tracking-widest">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">File Name</th>
                    <th className="py-3 px-4 text-center">Pages</th>
                    <th className="py-3 px-4 text-center">Copies</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4">Order Date</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-800 text-xs font-semibold text-slate-700 dark:text-dark-300">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-slate-400 dark:text-dark-500 text-xs font-medium">
                        No orders recorded yet. Let's upload a document!
                      </td>
                    </tr>
                  ) : (
                    orders.slice(0, 5).map((order) => (
                      <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-dark-900 transition-colors">
                        <td className="py-4 px-4 text-slate-900 dark:text-white font-extrabold">#{order.orderId}</td>
                        <td className="py-4 px-4 max-w-[160px] truncate">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase shrink-0 ${getFileBadge(order.documentId?.originalName)}`}>
                              {order.documentId?.extension?.slice(1) || 'file'}
                            </span>
                            <span className="truncate text-slate-800 dark:text-white font-bold">{order.documentId?.originalName || 'Deleted File'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center font-extrabold text-slate-900 dark:text-white">{order.pages}</td>
                        <td className="py-4 px-4 text-center font-bold text-slate-500 dark:text-dark-400">×{order.copies}</td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase inline-block ${getStatusBadge(order.status)}`}>
                            {order.status === 'Order Received' ? 'Received' : order.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right font-black text-slate-900 dark:text-white">{order.totalCost} BDT</td>
                        <td className="py-4 px-4 text-[10px] text-slate-500 dark:text-dark-400">
                          {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: '2-digit' })}{' '}
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <Link 
                              to={`/orders/${order._id}`} 
                              className="p-1.5 hover:bg-[#EFF6FF] dark:hover:bg-blue-950/40 rounded-lg text-slate-500 dark:text-dark-400 hover:text-[#2563EB] dark:hover:text-blue-400 transition-all"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            {order.documentId && (
                              <div 
                                onClick={() => handleDownloadDocument(order.documentId?._id || order.documentId, order.documentId?.originalName)}
                                className="p-1.5 hover:bg-[#EFF6FF] dark:hover:bg-blue-950/40 rounded-lg text-slate-500 dark:text-dark-400 hover:text-[#2563EB] dark:hover:text-blue-400 transition-all cursor-pointer"
                                title="Download file"
                              >
                                <Download className="h-4 w-4" />
                              </div>
                            )}
                            {order.status === 'Order Received' && (
                              <div 
                                onClick={() => handleCancelOrder(order._id)}
                                className={`p-1.5 hover:bg-[#FEF2F2] dark:hover:bg-red-950/40 rounded-lg text-slate-500 dark:text-dark-400 hover:text-[#EF4444] dark:hover:text-red-400 transition-all cursor-pointer ${cancellingOrder ? 'opacity-50 pointer-events-none' : ''}`}
                                title="Cancel order"
                              >
                                <X className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right column sidebar widgets */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Widget 1: Quick Actions */}
            <div className="glass rounded-3xl bg-white dark:bg-dark-950 border border-slate-150 dark:border-dark-800 p-5 shadow-sm space-y-4 text-left">
              <h4 className="text-xs font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-dark-800 pb-2 uppercase tracking-wide">
                Quick Actions
              </h4>
              <div className="space-y-2.5">
                <button 
                  onClick={() => navigate('/dashboard?action=upload')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white py-3 transition-colors shadow-md shadow-blue-600/10"
                >
                  <UploadCloud className="h-4.5 w-4.5 text-white" />
                  Upload New File
                </button>
                <Link 
                  to="/my-orders"
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-dark-800 text-xs font-bold text-slate-700 dark:text-dark-300 py-3 hover:bg-slate-50 dark:hover:bg-dark-900 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <FileText className="h-4.5 w-4.5 text-slate-500 dark:text-dark-400" />
                  My Orders
                </Link>
                <Link 
                  to="/profile"
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-dark-800 text-xs font-bold text-slate-700 dark:text-dark-300 py-3 hover:bg-slate-50 dark:hover:bg-dark-900 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <MapPin className="h-4.5 w-4.5 text-slate-500 dark:text-dark-400" />
                  Address Book
                </Link>
                <Link 
                  to="/profile"
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-dark-800 text-xs font-bold text-slate-700 dark:text-dark-300 py-3 hover:bg-slate-50 dark:hover:bg-dark-900 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <CreditCard className="h-4.5 w-4.5 text-slate-500 dark:text-dark-400" />
                  Payment Methods
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>
    );
  }

  // --- RENDERING GUIDED PRINT placement WIZARD ---
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Wizard Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-md">
            <UploadCloud className="h-6 w-6" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Upload print document</h1>
            <p className="text-xs text-slate-500 dark:text-dark-400 font-medium">Guided order placement workflow</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-xs font-bold text-slate-500 dark:text-dark-400 hover:text-slate-700 dark:hover:text-white flex items-center gap-1 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 px-3.5 py-1.5 rounded-xl transition-all"
        >
          Cancel
        </button>
      </div>

      <div className="glass rounded-3xl p-6 shadow-xl space-y-6 bg-white dark:bg-dark-950 border border-slate-150 dark:border-dark-800">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-dark-800 pb-3">
          <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <UploadCloud className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
            Print Placement Setup
          </h2>
          {/* Step indicators */}
          <div className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${wizardStep === 'upload' ? 'bg-blue-600' : 'bg-slate-200'}`}></span>
            <span className={`h-2.5 w-2.5 rounded-full ${wizardStep === 'configure' ? 'bg-blue-600' : 'bg-slate-200'}`}></span>
            <span className={`h-2.5 w-2.5 rounded-full ${wizardStep === 'confirm' ? 'bg-blue-600' : 'bg-slate-200'}`}></span>
          </div>
        </div>

        {/* STEP 1: UPLOAD FILE */}
        {wizardStep === 'upload' && (
          <div className="space-y-4">
            {uploadError && (
              <div className="flex items-start gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-4 text-xs text-rose-600 dark:text-rose-455 text-left">
                <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-rose-500" />
                <span>{uploadError}</span>
              </div>
            )}

            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${
                dragActive 
                  ? 'border-blue-600 bg-blue-50/20 shadow-inner' 
                  : 'border-slate-200 dark:border-dark-800 hover:border-slate-350 dark:hover:border-dark-700 hover:bg-slate-50/30 dark:hover:bg-dark-900/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.webp"
              />

              <UploadCloud className="h-10 w-10 text-slate-400 mb-3 animate-pulse" />
              {uploading ? (
                <div className="space-y-2 text-center">
                  <p className="text-xs font-bold text-slate-700 dark:text-white">Uploading your document...</p>
                  <div className="w-48 h-1.5 bg-slate-100 dark:bg-dark-800 rounded-full overflow-hidden mx-auto">
                    <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-dark-400 font-bold">{uploadProgress}% uploaded</span>
                </div>
              ) : (
                <div className="text-center space-y-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-white">Drag and drop file here, or click to browse</p>
                  <span className="text-[10px] text-slate-400 dark:text-dark-400 block pt-0.5">Supports PDF, DOCX, XLSX, Images (PNG, JPG, JPEG, WEBP) — Max 100MB</span>
                </div>
              )}
            </div>

            {/* Waiting loader for document parsing */}
            {uploading && uploadProgress === 100 && (
              <div className="p-4 rounded-xl bg-blue-50/30 border border-blue-100 flex items-center gap-3 justify-center">
                <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                <span className="text-xs font-bold text-slate-700 animate-pulse">Parsing document page counts...</span>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: CONFIGURE SETTINGS */}
        {wizardStep === 'configure' && document && (
          <div className="space-y-6 text-left">
            {orderError && (
              <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-4 text-xs font-semibold text-rose-700 dark:text-rose-300">
                <ShieldAlert className="h-5 w-5 shrink-0 text-rose-500 dark:text-rose-400 mt-0.5" />
                <span className="leading-snug">{orderError}</span>
              </div>
            )}

            <div className="p-4 bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <div className="leading-none text-left">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">{document.originalName}</h4>
                <span className="text-[10px] text-slate-500 dark:text-dark-400 block mt-1 uppercase font-black">{document.pageCount || 1} Pages • {document.extension ? document.extension.slice(1).toUpperCase() : 'DOCX'}</span>
              </div>
            </div>

            {/* Select B&W or Color */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider text-left">Print profile</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPrintType('bw')}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                    printType === 'bw'
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/25 ring-2 ring-blue-500/20 shadow-sm'
                      : 'border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 hover:bg-slate-50 dark:hover:bg-dark-850'
                  }`}
                >
                  <span className="text-2xl mb-1.5">⚫</span>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">Black & White</span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-300 mt-1">{PRICES.bw} BDT / page</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintType('color')}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                    printType === 'color'
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/25 ring-2 ring-blue-500/20 shadow-sm'
                      : 'border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 hover:bg-slate-50 dark:hover:bg-dark-850'
                  }`}
                >
                  <span className="text-2xl mb-1.5">🌈</span>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">Color Print</span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-300 mt-1">{PRICES.color} BDT / page</span>
                </button>
              </div>
            </div>

            {/* Select copies */}
            <div className="space-y-2 text-left">
              <label htmlFor="copies" className="block text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">Number of Copies</label>
              <input
                id="copies"
                type="number"
                min="1"
                value={copies}
                onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl bg-white dark:bg-dark-900 text-slate-900 dark:text-white outline-none focus:border-blue-500 text-xs font-bold"
              />
            </div>

            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl flex justify-between items-center text-left">
              <div className="leading-none">
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider block">Total Price Estimation</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1 font-medium">({document.pageCount} pages × {copies} copies)</span>
              </div>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{estimatedCost} BDT</span>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => setWizardStep('upload')}
                className="flex-1 py-3 text-xs font-bold border border-slate-200 dark:border-dark-800 rounded-xl bg-white dark:bg-dark-900 hover:bg-slate-50 dark:hover:bg-dark-850 text-slate-800 dark:text-white transition-colors"
              >
                Back to Upload
              </button>
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                className="flex-1 py-3 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-colors disabled:opacity-50"
              >
                {placingOrder ? 'Submitting print order...' : 'Confirm Printing Order'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {wizardStep === 'confirm' && (
          <div className="py-8 text-center space-y-6 max-w-sm mx-auto">
            <div className="h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-500/20 dark:border-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto shadow-inner">
              <Check className="h-8 w-8 text-emerald-500" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Order Placed Successfully!</h3>
              <p className="text-xs text-slate-400 dark:text-dark-400 font-medium leading-relaxed">
                Your document has been sent to the university printing queue. You will receive real-time notifications on status changes.
              </p>
            </div>

            <button
              onClick={() => {
                setViewMode('overview');
                navigate('/dashboard');
              }}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md"
            >
              Go to Dashboard Overview
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
