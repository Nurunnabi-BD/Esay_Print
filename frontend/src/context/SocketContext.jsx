import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      // Disconnect socket if user logs out
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const token = localStorage.getItem('token');

    // Create new socket connection with auth handshake payload
    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('Realtime Connected: Sockets active.');
      setConnected(true);

      // Join personal room
      newSocket.emit('join_room', { roomId: `user-${user._id}` });

      // Join admin room if user has admin privileges
      if (user.role === 'admin') {
        newSocket.emit('join_room', { roomId: 'admin-room' });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Realtime Disconnected: Sockets inactive.');
      setConnected(false);
    });

    // Register generic listeners for in-app alert banners
    newSocket.on('order_status_updated', (data) => {
      addNotification({
        id: Date.now(),
        type: 'info',
        title: 'Order Status Updated',
        message: data.message,
        orderId: data.orderId,
        orderNumber: data.orderNumber
      });
    });

    newSocket.on('document_processed', (data) => {
      addNotification({
        id: Date.now(),
        type: data.status === 'processed' ? 'success' : 'error',
        title: data.status === 'processed' ? 'File Processed' : 'Processing Failed',
        message: data.message,
        documentId: data.documentId
      });
    });

    newSocket.on('new_order', (data) => {
      if (user.role === 'admin') {
        addNotification({
          id: Date.now(),
          type: 'success',
          title: 'New Print Order',
          message: `Order ${data.order.orderId} received from ${data.order.userId.name}.`,
          orderId: data.order._id
        });
      }
    });

    newSocket.on('order_cancelled', (data) => {
      if (user.role === 'admin') {
        addNotification({
          id: Date.now(),
          type: 'warning',
          title: 'Order Cancelled',
          message: data.message,
          orderId: data.orderId
        });
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Tone 1
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gain1.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc1.start(audioCtx.currentTime);
      osc1.stop(audioCtx.currentTime + 0.15);
      
      // Tone 2
      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        gain2.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc2.start(audioCtx.currentTime);
        osc2.stop(audioCtx.currentTime + 0.25);
      }, 100);
    } catch (e) {
      // Browser audio context blocked or unsupported
    }
  };

  const addNotification = (notif) => {
    setNotifications((prev) => [notif, ...prev].slice(0, 20)); // Limit to last 20 notifications
    playNotificationSound();
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        notifications,
        removeNotification,
        clearAllNotifications
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
