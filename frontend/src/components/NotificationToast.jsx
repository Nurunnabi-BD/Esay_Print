import React from 'react';
import { useSocket } from '../context/SocketContext';
import { X, CheckCircle, AlertCircle, Info, Bell } from 'lucide-react';

const NotificationToast = () => {
  const { notifications, removeNotification } = useSocket();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 w-full max-w-sm">
      {notifications.map((notif) => {
        let bgColor = 'bg-dark-900 border-dark-800 text-white';
        let Icon = Info;
        let iconColor = 'text-brand-400';

        if (notif.type === 'success') {
          bgColor = 'bg-emerald-950/90 border-emerald-500/30 text-emerald-100';
          Icon = CheckCircle;
          iconColor = 'text-emerald-400';
        } else if (notif.type === 'warning') {
          bgColor = 'bg-amber-950/90 border-amber-500/30 text-amber-100';
          Icon = Bell;
          iconColor = 'text-amber-400';
        } else if (notif.type === 'error') {
          bgColor = 'bg-rose-950/90 border-rose-500/30 text-rose-100';
          Icon = AlertCircle;
          iconColor = 'text-rose-400';
        }

        return (
          <div
            key={notif.id}
            className={`flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-300 animate-slide-in ${bgColor}`}
          >
            <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 space-y-1">
              <h4 className="text-sm font-bold leading-none">{notif.title}</h4>
              <p className="text-xs text-dark-300 leading-relaxed">{notif.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notif.id)}
              className="text-dark-400 hover:text-white transition-colors p-0.5 hover:bg-dark-800 rounded-lg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationToast;
