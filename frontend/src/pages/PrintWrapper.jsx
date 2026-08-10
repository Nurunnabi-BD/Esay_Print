import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Printer, ArrowLeft, RefreshCw, AlertCircle, FileText, Download } from 'lucide-react';

const PrintWrapper = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Loading document metadata...');
  const [error, setError] = useState('');
  
  const [blobUrl, setBlobUrl] = useState('');
  const [isImage, setIsImage] = useState(false);

  const fetchAndPrepareFile = async () => {
    try {
      setStatusMessage('Fetching order details from server...');
      const res = await axiosClient.get(`/admin/orders/${id}`);
      
      if (!res.data.success) {
        throw new Error('Failed to retrieve order details.');
      }
      
      const orderData = res.data.order;
      setOrder(orderData);

      // Auto-transition status to Processing (Printing) on load
      if (orderData.status === 'Order Received') {
        try {
          await axiosClient.put(`/admin/orders/${id}/status`, {
            status: 'Processing',
            adminNote: 'Print console loaded.'
          });
          orderData.status = 'Processing';
        } catch (statusErr) {
          console.error('Failed to auto-update order status:', statusErr);
        }
      }

      // Determine print target URL (use server-generated PDF if available)
      const fileUrl = orderData.documentId.convertedFileUrl || orderData.documentId.fileUrl;
      const extension = orderData.documentId.extension.toLowerCase();
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
      
      // Check if it's an image or PDF
      const isImg = imageExtensions.includes(extension) && !orderData.documentId.convertedFileUrl;
      setIsImage(isImg);

      setStatusMessage('Downloading secure file stream for printing...');
      
      // Fetch original or converted file as a BLOB
      // This is crucial to bypass cross-origin browser print security blocks!
      const fileResponse = await fetch(fileUrl);
      if (!fileResponse.ok) {
        throw new Error('Failed to fetch file stream from storage provider.');
      }
      
      const fileBlob = await fileResponse.blob();
      
      // Create same-origin local Blob Object URL
      const localBlobUrl = URL.createObjectURL(fileBlob);
      setBlobUrl(localBlobUrl);
      
      setStatusMessage('Document ready. Generating print layout...');
    } catch (err) {
      setError(err.message || 'Failed to prepare print file.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndPrepareFile();
    
    // Cleanup blob url on unmount to free memory
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [id]);

  const triggerPrint = () => {
    if (!blobUrl) return;

    if (isImage) {
      // For images, we can print the current window containing the full-bleed image
      window.focus();
      window.print();
    } else {
      // For PDFs, print the same-origin blob iframe
      const frame = document.getElementById('pdf-print-frame');
      if (frame) {
        try {
          frame.contentWindow.focus();
          frame.contentWindow.print();
        } catch (err) {
          console.warn('Iframe print failed, falling back to direct tab printing:', err.message);
          window.open(blobUrl, '_blank');
        }
      }
    }
  };

  // Auto trigger printing once layout renders
  useEffect(() => {
    if (blobUrl && !loading) {
      const timer = setTimeout(() => {
        triggerPrint();
      }, 800); // 800ms delay to ensure print container is painted
      return () => clearTimeout(timer);
    }
  }, [blobUrl, loading]);

  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-dark-950 text-dark-100 font-sans space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-brand-500" />
        <p className="text-xs text-dark-400 font-medium">{statusMessage}</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-dark-950 text-dark-100 font-sans p-6 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500" />
        <h2 className="text-lg font-bold text-white">Printing Pipeline Error</h2>
        <p className="text-xs text-dark-400 max-w-md">{error || 'Unable to load print data.'}</p>
        <Link to="/admin/orders" className="inline-flex items-center gap-2 rounded-xl bg-dark-900 border border-dark-800 px-4 py-2.5 text-xs text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to Queue
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 text-dark-100 font-sans flex flex-col">
      
      {/* Top Banner (Visible only on screen, hidden on physical print) */}
      <div className="no-print w-full bg-dark-900 border-b border-dark-850 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Link to={`/admin/orders/${order._id}`} className="p-2 hover:bg-dark-800 rounded-xl text-dark-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4.5 w-4.5" />
          </Link>
          <div>
            <h1 className="text-sm font-extrabold text-white">Print Console: Order #{order.orderId}</h1>
            <p className="text-[10px] text-dark-500">
              {order.printType === 'bw' ? '⚫ Black & White' : '🌈 Color Print'} • {order.pages} Pages • × {order.copies} Copies
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={triggerPrint}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-500 transition-colors shadow-lg"
          >
            <Printer className="h-4 w-4" />
            Open Print Dialog
          </button>
        </div>
      </div>

      {/* Main Print Container */}
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden bg-dark-900">
        
        {isImage ? (
          /* Render full-page high-quality Image print template */
          <div className="print-image-container flex items-center justify-center w-full h-full max-w-3xl max-h-[85vh]">
            <img
              src={blobUrl}
              alt="Print Target content"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-dark-800"
            />
          </div>
        ) : (
          /* Render local same-origin blob iframe for vector PDFs */
          <iframe
            id="pdf-print-frame"
            src={blobUrl}
            title="Document PDF viewer"
            className="w-full h-full max-w-4xl max-h-[85vh] rounded-xl bg-dark-950 border border-dark-800 shadow-2xl"
          ></iframe>
        )}

      </div>

      {/* Global Print-specific CSS styles */}
      <style>{`
        @media print {
          /* Hide all screen components */
          .no-print, 
          header, 
          footer, 
          button {
            display: none !important;
          }
          
          /* Page reset */
          html, body {
            background-color: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
          }
          
          /* Image Print Layout */
          .print-image-container {
            width: 100% !important;
            height: 100% !important;
            max-width: none !important;
            max-h-none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          .print-image-container img {
            max-width: 100% !important;
            max-height: 100% !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            page-break-inside: avoid;
          }

          /* PDF Iframe full bleed */
          #pdf-print-frame {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            max-width: none !important;
            max-height: none !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

    </div>
  );
};

export default PrintWrapper;
