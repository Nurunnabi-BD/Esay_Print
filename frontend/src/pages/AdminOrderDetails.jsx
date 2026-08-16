import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { 
  Printer, ArrowLeft, Download, FileText, User, 
  MapPin, Clock, Edit3, MessageSquare, AlertCircle, Play, CheckCircle
} from 'lucide-react';

const AdminOrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [status, setStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  const navigate = useNavigate();

  const fetchDetails = async () => {
    try {
      const res = await axiosClient.get(`/admin/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.order);
        setHistory(res.data.history);
        setStatus(res.data.order.status);
        setAdminNote(res.data.order.adminNote || '');
      }
    } catch (err) {
      setError('Failed to load order details from server.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setSavingStatus(true);
    try {
      const res = await axiosClient.put(`/admin/orders/${order._id}/status`, {
        status,
        adminNote
      });
      if (res.data.success) {
        fetchDetails();
        alert('Order updated successfully.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order.');
    } finally {
      setSavingStatus(false);
    }
  };

  const handlePrintTrigger = () => {
    if (!order) return;
    window.open(`/admin/print/${order._id}`, '_blank');
  };

  const handleDownload = async (docId, originalName) => {
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

  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (s) => {
    switch (s) {
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
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Error loading details</h2>
        <p className="text-xs text-slate-500 dark:text-dark-400">{error || 'Order could not be found.'}</p>
        <Link to="/admin/orders" className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 px-4 py-2.5 text-xs text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Queue
        </Link>
      </div>
    );
  }

  const printableFileUrl = order.documentId?.convertedFileUrl || order.documentId?.fileUrl;
  const isOfficeFile = ['.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt'].includes(order.documentId?.extension);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Back link */}
      <Link to="/admin/orders" className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-dark-400 hover:text-slate-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Print Queue
      </Link>

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
            <Printer className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Order Details</h1>
            <p className="text-xs text-slate-500 dark:text-dark-400">ID: #{order.orderId} Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${getStatusBadge(order.status)}`}>
            {order.status}
          </span>
          <button
            onClick={handlePrintTrigger}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-md"
          >
            <Printer className="h-4.5 w-4.5" />
            Print Document
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Order parameters & user details */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Customer Credentials */}
          <div className="bg-white dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-dark-800 pb-2.5 flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
              Student Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 dark:text-dark-400 text-xs font-medium block">Name</span>
                <span className="font-bold text-slate-900 dark:text-white block mt-0.5">{order.userId?.name}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-dark-400 text-xs font-medium block">Student ID</span>
                <span className="font-bold text-slate-900 dark:text-white block mt-0.5">{order.userId?.studentId}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-dark-400 text-xs font-medium block">Department</span>
                <span className="font-bold text-slate-900 dark:text-white block mt-0.5 uppercase">{order.userId?.department}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-dark-400 text-xs font-medium block">Semester</span>
                <span className="font-bold text-slate-900 dark:text-white block mt-0.5">{order.userId?.semester}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 dark:text-dark-400 text-xs font-medium block">Email Address</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 block mt-0.5">{order.userId?.email}</span>
              </div>
            </div>
          </div>

          {/* Document details & action buttons */}
          <div className="bg-white dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-dark-800 pb-2.5 flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
              Document Properties
            </h3>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400 shrink-0" />
                <div className="truncate">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{order.documentId?.originalName}</h4>
                  <p className="text-xs text-slate-500 dark:text-dark-400 uppercase font-medium">
                    {order.documentId?.extension?.slice(1)} • {formatBytes(order.documentId?.fileSize)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDownload(order.documentId?._id || order.documentId, order.documentId?.originalName)}
                className="flex items-center gap-2 rounded-xl bg-white dark:bg-dark-950 hover:bg-slate-100 dark:hover:bg-dark-800 border border-slate-200 dark:border-dark-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-dark-300 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
              >
                <Download className="h-4 w-4" />
                Download Original
              </button>
            </div>

            {/* Print Settings table */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="bg-slate-50 dark:bg-dark-900 p-3 rounded-xl border border-slate-200 dark:border-dark-800">
                <span className="text-slate-500 dark:text-dark-400 text-xs font-medium block">Pages</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">{order.pages}</span>
              </div>
              <div className="bg-slate-50 dark:bg-dark-900 p-3 rounded-xl border border-slate-200 dark:border-dark-800">
                <span className="text-slate-500 dark:text-dark-400 text-xs font-medium block">Copies</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">× {order.copies}</span>
              </div>
              <div className="bg-slate-50 dark:bg-dark-900 p-3 rounded-xl border border-slate-200 dark:border-dark-800">
                <span className="text-slate-500 dark:text-dark-400 text-xs font-medium block">Total cost</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">{order.totalCost} BDT</span>
              </div>
            </div>

            <div className="flex justify-between text-xs py-2 px-1 border-t border-slate-200 dark:border-dark-850">
              <span className="text-slate-500 dark:text-dark-400 font-medium">Print Profile:</span>
              <span className="font-bold text-slate-900 dark:text-white capitalize">{order.printType === 'bw' ? '⚫ Black & White' : '🌈 Color print'}</span>
            </div>
            
            {isOfficeFile && order.documentId?.convertedFileUrl && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/10 border border-blue-200 dark:border-blue-900/30 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-dark-400 font-medium">Word/Slides file converted automatically.</span>
                <a 
                  href={order.documentId.convertedFileUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                >
                  View Converted PDF
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Status changer & timelines */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status modification form */}
          <div className="bg-white dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-dark-800 pb-2.5 flex items-center gap-2">
              <Edit3 className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
              Manage Print State
            </h3>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-dark-400 mb-2">Order Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="block w-full rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                >
                  <option value="Order Received">Order Received</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-dark-400 mb-2">Admin Note</label>
                <textarea
                  placeholder="E.g. Printed at counter 2. Please pick up."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="block w-full rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-dark-500 focus:border-blue-600 focus:outline-none h-20 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={savingStatus}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
              >
                {savingStatus ? 'Saving...' : 'Update Order'}
              </button>
            </form>
          </div>

          {/* Timeline */}
          <div className="bg-white dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-dark-800 pb-2.5 flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
              Status Log
            </h3>
            <div className="relative border-l border-slate-200 dark:border-dark-800 ml-2.5 space-y-5 pt-2">
              {history.map((log, index) => (
                <div key={log._id || index} className="relative pl-6">
                  <div className={`absolute -left-1.5 top-1 h-3 w-3 rounded-full border-2 border-white dark:border-dark-950 ${
                    log.newStatus === 'Completed'
                      ? 'bg-emerald-500'
                      : log.newStatus === 'Cancelled' || log.newStatus === 'Failed'
                      ? 'bg-rose-500'
                      : 'bg-blue-600'
                  }`}></div>
                  <div className="text-[11px] leading-none">
                    <h4 className="font-bold text-slate-900 dark:text-white">{log.newStatus}</h4>
                    <span className="text-xs text-slate-500 dark:text-dark-400 block mt-1.5 font-medium">
                      {new Date(log.timestamp).toLocaleDateString()} at {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-dark-500 block mt-1 font-medium">
                      By {log.changedBy?.name} ({log.changedBy?.role})
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

export default AdminOrderDetails;
