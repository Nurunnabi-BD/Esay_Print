import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import {
  Bell,
  User,
  LogIn,
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  LogOut,
  ChevronDown,
  MapPin,
  CreditCard,
  Lock,
  HelpCircle,
  Contact,
  Sun,
  Moon,
  Menu,
  X,
  LayoutDashboard,
  Printer,
  Users
} from "lucide-react";
import { FaReact } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import axiosClient from "../api/axiosClient";

const Header = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeHash, setActiveHash] = useState(location.hash);
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    setActiveHash(location.hash);
  }, [location]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await axiosClient.get("/notifications");
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await axiosClient.put("/notifications/read-all");
      if (res.data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await axiosClient.put(`/notifications/${notif._id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n)),
        );
      }
      setShowNotifications(false);
      if (notif.orderId) {
        if (user?.role === "admin") {
          navigate(`/admin/orders/${notif.orderId}`);
        } else {
          navigate(`/orders/${notif.orderId}`);
        }
      }
    } catch (err) {
      console.error("Failed to handle notification click:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  useEffect(() => {
    if (socket && user) {
      socket.on("new_notification", (data) => {
        const newNotif = data.notification || data;
        setNotifications((prev) => [newNotif, ...prev]);
      });
      return () => {
        socket.off("new_notification");
      };
    }
  }, [socket, user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="w-full bg-white dark:bg-dark-950 border-b border-slate-100 dark:border-dark-850 sticky top-0 z-50 shadow-sm font-tech">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/25 group-hover:bg-blue-500 transition-colors">
            <FaReact className="h-5.5 w-5.5 animate-spin-slow text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none">
              PrintFlow
            </span>
            <span className="text-[10px] text-slate-500 dark:text-dark-400 font-medium mt-0.5">
              Print. Easy. Anywhere.
            </span>
          </div>
        </Link>

        {/* Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-650 dark:text-dark-300 h-full pt-1.5">
          <Link
            to="/"
            className={`pb-1.5 transition-all border-b-2 ${
              location.pathname === '/' && !activeHash
                ? 'text-blue-600 border-blue-600 font-black'
                : 'text-slate-600 dark:text-dark-350 border-transparent hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            Home
          </Link>
          {user && (
            <Link
              to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
              className={`pb-1.5 transition-all border-b-2 ${
                location.pathname !== '/' && location.pathname !== '/services' && !['/login', '/signup', '/admin/login'].includes(location.pathname)
                  ? 'text-blue-600 border-blue-600 font-black'
                  : 'text-slate-600 dark:text-dark-350 border-transparent hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              Dashboard
            </Link>
          )}
          <Link
            to="/services"
            className={`pb-1.5 transition-all border-b-2 ${
              location.pathname === '/services'
                ? 'text-blue-600 border-blue-600 font-black'
                : 'text-slate-600 dark:text-dark-350 border-transparent hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            Services
          </Link>
          <a
            href="/#how-it-works"
            className={`pb-1.5 transition-all border-b-2 ${
              activeHash === '#how-it-works'
                ? 'text-blue-600 border-blue-600 font-black'
                : 'text-slate-600 dark:text-dark-350 border-transparent hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            How It Works
          </a>

        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <div
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-slate-500 dark:text-dark-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-dark-800 transition-all cursor-pointer flex items-center justify-center shrink-0"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-slate-500" />
            )}
          </div>
          {user ? (
            <>
              {/* Notification Bell Badge */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all text-white"
                >
                  <Bell className="h-5 w-5 text-white" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-[#2563EB] rounded-full border-2 border-white text-[8px] font-extrabold text-white flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown Panel */}
                {showNotifications && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowNotifications(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-85 bg-white dark:bg-dark-950 border border-slate-150 dark:border-dark-800 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[420px]">
                      <div className="px-4 py-3 bg-slate-50 dark:bg-dark-900 border-b border-slate-100 dark:border-dark-800 flex justify-between items-center shrink-0">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-[9px] font-bold text-blue-600 hover:text-blue-500 transition-colors"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-dark-850 max-h-[320px] scrollbar-none">
                        {notifications.length === 0 ? (
                          <div className="py-12 text-center text-slate-400 dark:text-dark-500 text-xs flex flex-col items-center justify-center gap-2">
                            <Bell className="h-8 w-8 text-slate-200 dark:text-dark-800" />
                            <span>No alerts or updates yet</span>
                          </div>
                        ) : (
                          notifications.map((notif) => {
                            let notifIcon = (
                              <Bell className="h-4 w-4 text-blue-500" />
                            );
                            let notifBg = "bg-blue-50 dark:bg-blue-950/40";
                            if (notif.type === "success") {
                              notifIcon = (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              );
                              notifBg = "bg-emerald-50 dark:bg-emerald-950/40";
                            } else if (
                              notif.type === "error" ||
                              notif.type === "warning"
                            ) {
                              notifIcon = (
                                <ShieldAlert className="h-4 w-4 text-rose-500" />
                              );
                              notifBg = "bg-rose-50 dark:bg-rose-950/40";
                            }

                            return (
                              <div
                                key={notif._id}
                                onClick={() => handleNotificationClick(notif)}
                                className={`p-4 flex gap-3 text-left cursor-pointer transition-colors hover:bg-slate-50/50 dark:hover:bg-dark-900/50 ${
                                  !notif.isRead
                                    ? "bg-blue-50/10 dark:bg-blue-950/10 border-l-2 border-blue-600"
                                    : ""
                                }`}
                              >
                                <div
                                  className={`h-8 w-8 rounded-xl ${notifBg} flex items-center justify-center shrink-0`}
                                >
                                  {notifIcon}
                                </div>
                                <div className="space-y-0.5 min-w-0 flex-1">
                                  <div className="flex justify-between items-start gap-1.5">
                                    <h4
                                      className={`text-11px truncate ${!notif.isRead ? "font-black text-slate-950 dark:text-white" : "font-bold text-slate-700 dark:text-dark-300"}`}
                                    >
                                      {notif.title}
                                    </h4>
                                    {!notif.isRead && (
                                      <span className="h-1.5 w-1.5 bg-blue-600 rounded-full shrink-0 mt-1"></span>
                                    )}
                                  </div>
                                  <p className="text-10px text-slate-500 dark:text-dark-400 leading-normal line-clamp-2">
                                    {notif.message}
                                  </p>
                                  <span className="text-[9px] text-slate-400 dark:text-dark-500 block pt-0.5">
                                    {new Date(notif.createdAt).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    })}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <div
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100 transition-all outline-none pl-1 pr-3 cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-full bg-[#93B4F4] flex items-center justify-center text-white font-extrabold text-sm shadow-inner shrink-0">
                    {user?.name ? user.name[0].toUpperCase() : 'N'}
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-[#64748B]" />
                </div>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />

                    <div className="absolute right-0 mt-3 w-[460px] max-w-[calc(100vw-2rem)] bg-white dark:bg-dark-950 border border-[#E2E8F0] dark:border-dark-800 rounded-[24px] shadow-[0_10px_30px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] z-[100] overflow-hidden dropdown-animation">
                      {/* 1. Header Area */}
                      <div className="p-6 border-b border-[#E2E8F0] dark:border-dark-800 flex items-center gap-5 text-left">
                        <div className="h-[72px] w-[72px] rounded-full bg-[#93B4F4] flex items-center justify-center text-white font-extrabold text-3xl shadow-sm shrink-0">
                          {user?.name ? user.name[0].toUpperCase() : 'N'}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-lg font-bold text-[#0F172A] dark:text-white leading-none">
                            {user?.name || "Nurunnabi"}
                          </h4>
                          <p className="text-sm text-[#64748B] dark:text-dark-400 font-medium leading-none mt-1.5">
                            {user?.email || "nurunnabi@gmail.com"}
                          </p>
                          <div className="pt-1.5">
                            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#EFF6FF] dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400">
                              {user?.role === "admin" ? "Admin" : "User"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 2. Menu Options list */}
                      <div className="p-3 text-left max-h-[380px] overflow-y-auto scrollbar-none">
                        {user?.role === 'admin' ? (
                          /* ADMIN DROPDOWN OPTIONS */
                          <div className="space-y-0.5 pb-2">
                            {/* Option: Admin Dashboard */}
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[#F8FAFC] dark:hover:bg-dark-900 transition-colors group"
                            >
                              <div className="h-10 w-10 rounded-xl bg-[#F8FAFC] dark:bg-dark-900 flex items-center justify-center text-[#64748B] dark:text-dark-400 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 group-hover:bg-[#EFF6FF] dark:group-hover:bg-blue-950/40 transition-all shrink-0">
                                <LayoutDashboard className="h-5 w-5" />
                              </div>
                              <div className="leading-tight text-left">
                                <h5 className="text-sm font-bold text-[#0F172A] dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">Admin Dashboard</h5>
                                <p className="text-xs text-[#64748B] dark:text-dark-400 font-medium mt-0.5">Overview & system statistics</p>
                              </div>
                            </Link>

                            {/* Option: Print Queue */}
                            <Link
                              to="/admin/orders"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[#F8FAFC] dark:hover:bg-dark-900 transition-colors group"
                            >
                              <div className="h-10 w-10 rounded-xl bg-[#F8FAFC] dark:bg-dark-900 flex items-center justify-center text-[#64748B] dark:text-dark-400 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 group-hover:bg-[#EFF6FF] dark:group-hover:bg-blue-950/40 transition-all shrink-0">
                                <Printer className="h-5 w-5" />
                              </div>
                              <div className="leading-tight text-left">
                                <h5 className="text-sm font-bold text-[#0F172A] dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">Print Queue</h5>
                                <p className="text-xs text-[#64748B] dark:text-dark-400 font-medium mt-0.5">Manage student print orders</p>
                              </div>
                            </Link>

                            {/* Option: Registered Students */}
                            <Link
                              to="/admin/users"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[#F8FAFC] dark:hover:bg-dark-900 transition-colors group"
                            >
                              <div className="h-10 w-10 rounded-xl bg-[#F8FAFC] dark:bg-dark-900 flex items-center justify-center text-[#64748B] dark:text-dark-400 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 group-hover:bg-[#EFF6FF] dark:group-hover:bg-blue-950/40 transition-all shrink-0">
                                <Users className="h-5 w-5" />
                              </div>
                              <div className="leading-tight text-left">
                                <h5 className="text-sm font-bold text-[#0F172A] dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">Registered Students</h5>
                                <p className="text-xs text-[#64748B] dark:text-dark-400 font-medium mt-0.5">View & manage student accounts</p>
                              </div>
                            </Link>

                            {/* Option: Change Password */}
                            <Link
                              to="/profile?tab=profile"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[#F8FAFC] dark:hover:bg-dark-900 transition-colors group"
                            >
                              <div className="h-10 w-10 rounded-xl bg-[#F8FAFC] dark:bg-dark-900 flex items-center justify-center text-[#64748B] dark:text-dark-400 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 group-hover:bg-[#EFF6FF] dark:group-hover:bg-blue-950/40 transition-all shrink-0">
                                <Lock className="h-5 w-5" />
                              </div>
                              <div className="leading-tight text-left">
                                <h5 className="text-sm font-bold text-[#0F172A] dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">Change Password</h5>
                                <p className="text-xs text-[#64748B] dark:text-dark-400 font-medium mt-0.5">Update admin account password</p>
                              </div>
                            </Link>
                          </div>
                        ) : (
                          /* STUDENT DROPDOWN OPTIONS */
                          <div className="space-y-0.5 pb-2">
                            {/* Option: My Profile */}
                            <Link
                              to="/profile?tab=profile"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[#F8FAFC] dark:hover:bg-dark-900 transition-colors group"
                            >
                              <div className="h-10 w-10 rounded-xl bg-[#F8FAFC] dark:bg-dark-900 flex items-center justify-center text-[#64748B] dark:text-dark-400 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 group-hover:bg-[#EFF6FF] dark:group-hover:bg-blue-950/40 transition-all shrink-0">
                                <User className="h-5 w-5" />
                              </div>
                              <div className="leading-tight text-left">
                                <h5 className="text-sm font-bold text-[#0F172A] dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">My Profile</h5>
                                <p className="text-xs text-[#64748B] dark:text-dark-400 font-medium mt-0.5">View and edit your profile</p>
                              </div>
                            </Link>

                            {/* Option: Address Book */}
                            <Link
                              to="/profile?tab=address"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[#F8FAFC] dark:hover:bg-dark-900 transition-colors group"
                            >
                              <div className="h-10 w-10 rounded-xl bg-[#F8FAFC] dark:bg-dark-900 flex items-center justify-center text-[#64748B] dark:text-dark-400 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 group-hover:bg-[#EFF6FF] dark:group-hover:bg-blue-950/40 transition-all shrink-0">
                                <Contact className="h-5 w-5" />
                              </div>
                              <div className="leading-tight text-left">
                                <h5 className="text-sm font-bold text-[#0F172A] dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">Address Book</h5>
                                <p className="text-xs text-[#64748B] dark:text-dark-400 font-medium mt-0.5">Manage your addresses</p>
                              </div>
                            </Link>

                            {/* Option: Payment Methods */}
                            <Link
                              to="/profile?tab=payment"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[#F8FAFC] dark:hover:bg-dark-900 transition-colors group"
                            >
                              <div className="h-10 w-10 rounded-xl bg-[#F8FAFC] dark:bg-dark-900 flex items-center justify-center text-[#64748B] dark:text-dark-400 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 group-hover:bg-[#EFF6FF] dark:group-hover:bg-blue-950/40 transition-all shrink-0">
                                <CreditCard className="h-5 w-5" />
                              </div>
                              <div className="leading-tight text-left">
                                <h5 className="text-sm font-bold text-[#0F172A] dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">Payment Methods</h5>
                                <p className="text-xs text-[#64748B] dark:text-dark-400 font-medium mt-0.5">Manage your payment options</p>
                              </div>
                            </Link>

                            {/* Option: Notification Settings */}
                            <Link
                              to="/profile?tab=settings"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[#F8FAFC] dark:hover:bg-dark-900 transition-colors group"
                            >
                              <div className="h-10 w-10 rounded-xl bg-[#F8FAFC] dark:bg-dark-900 flex items-center justify-center text-[#64748B] dark:text-dark-400 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 group-hover:bg-[#EFF6FF] dark:group-hover:bg-blue-950/40 transition-all shrink-0">
                                <Bell className="h-5 w-5" />
                              </div>
                              <div className="leading-tight text-left">
                                <h5 className="text-sm font-bold text-[#0F172A] dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">Notification Settings</h5>
                                <p className="text-xs text-[#64748B] dark:text-dark-400 font-medium mt-0.5">Manage your notifications</p>
                              </div>
                            </Link>

                            {/* Option: Change Password */}
                            <Link
                              to="/profile?tab=profile"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[#F8FAFC] dark:hover:bg-dark-900 transition-colors group"
                            >
                              <div className="h-10 w-10 rounded-xl bg-[#F8FAFC] dark:bg-dark-900 flex items-center justify-center text-[#64748B] dark:text-dark-400 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 group-hover:bg-[#EFF6FF] dark:group-hover:bg-blue-950/40 transition-all shrink-0">
                                <Lock className="h-5 w-5" />
                              </div>
                              <div className="leading-tight text-left">
                                <h5 className="text-sm font-bold text-[#0F172A] dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">Change Password</h5>
                                <p className="text-xs text-[#64748B] dark:text-dark-400 font-medium mt-0.5">Update your account password</p>
                              </div>
                            </Link>
                          </div>
                        )}

                        <div className="space-y-0.5 py-2 border-t border-[#E2E8F0] dark:border-dark-800">
                          {/* Option: Help & Support */}
                          <Link
                            to="/profile?tab=help"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[#F8FAFC] dark:hover:bg-dark-900 transition-colors group"
                          >
                            <div className="h-10 w-10 rounded-xl bg-[#F8FAFC] dark:bg-dark-900 flex items-center justify-center text-[#64748B] dark:text-dark-400 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 group-hover:bg-[#EFF6FF] dark:group-hover:bg-blue-950/40 transition-all shrink-0">
                              <HelpCircle className="h-5 w-5" />
                            </div>
                            <div className="leading-tight text-left">
                              <h5 className="text-sm font-bold text-[#0F172A] dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">Help & Support</h5>
                              <p className="text-xs text-[#64748B] dark:text-dark-400 font-medium mt-0.5">Get help and support</p>
                            </div>
                          </Link>
                        </div>

                        <div className="pt-2 border-t border-[#E2E8F0] dark:border-dark-800">
                          {/* Option: Logout */}
                          <div
                            onClick={() => {
                              setShowUserMenu(false);
                              handleLogout();
                            }}
                            className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-[#FEF2F2] dark:hover:bg-red-950/30 transition-colors group text-left cursor-pointer"
                          >
                            <div className="h-10 w-10 rounded-xl bg-[#FEF2F2] dark:bg-red-950/50 flex items-center justify-center text-[#EF4444] group-hover:text-[#DC2626] transition-all shrink-0">
                              <LogOut className="h-5 w-5" />
                            </div>
                            <div className="flex-1 text-left leading-tight">
                              <h5 className="text-sm font-bold text-[#EF4444] group-hover:text-[#DC2626] transition-colors">Logout</h5>
                              <p className="text-xs text-[#94A3B8] dark:text-dark-500 font-medium mt-0.5">Sign out from your account</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              </div>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-dark-800 px-5 py-3 text-xs font-bold text-slate-700 dark:text-dark-300 hover:bg-slate-50 dark:hover:bg-dark-800 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 transition-all"
              >
                <User className="h-4 w-4" />
                Login
              </Link>
              <Link
                to="/signup"
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white px-5 py-3 transition-colors shadow-md shadow-blue-600/20"
              >
                <LogIn className="h-4 w-4" />
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-slate-500 dark:text-dark-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-dark-800 transition-all cursor-pointer flex items-center justify-center shrink-0"
            title="Toggle Menu"
          >
            {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-slate-100 dark:border-dark-800 bg-white dark:bg-dark-950 px-6 py-5 space-y-5 shadow-inner dropdown-animation">
          <nav className="flex flex-col gap-4 text-sm font-bold text-left">
            <Link
              to="/"
              onClick={() => setShowMobileMenu(false)}
              className={`py-2.5 border-b border-slate-50 dark:border-dark-900 flex items-center justify-between ${
                location.pathname === '/' && !activeHash
                  ? 'text-blue-600 font-black'
                  : 'text-slate-600 dark:text-dark-350 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <span>Home</span>
              <span className="text-slate-300 text-xs">→</span>
            </Link>
            {user && (
              <Link
                to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                onClick={() => setShowMobileMenu(false)}
                className={`py-2.5 border-b border-slate-50 dark:border-dark-900 flex items-center justify-between ${
                  location.pathname !== '/' && location.pathname !== '/services' && !['/login', '/signup', '/admin/login'].includes(location.pathname)
                    ? 'text-blue-600 font-black'
                    : 'text-slate-600 dark:text-dark-350 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <span>Dashboard</span>
                <span className="text-slate-300 text-xs">→</span>
              </Link>
            )}
            <Link
              to="/services"
              onClick={() => setShowMobileMenu(false)}
              className={`py-2.5 border-b border-slate-50 dark:border-dark-900 flex items-center justify-between ${
                location.pathname === '/services'
                  ? 'text-blue-600 font-black'
                  : 'text-slate-600 dark:text-dark-350 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <span>Services</span>
              <span className="text-slate-300 text-xs">→</span>
            </Link>
            <a
              href="/#how-it-works"
              onClick={() => setShowMobileMenu(false)}
              className={`py-2.5 border-b border-slate-50 dark:border-dark-900 flex items-center justify-between ${
                activeHash === '#how-it-works'
                  ? 'text-blue-600 font-black'
                  : 'text-slate-600 dark:text-dark-350 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <span>How It Works</span>
              <span className="text-slate-300 text-xs">→</span>
            </a>
          </nav>

          {!user && (
            <div className="flex flex-col gap-3 pt-3 border-t border-slate-100 dark:border-dark-800">
              <Link
                to="/login"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-dark-800 px-5 py-3.5 text-xs font-bold text-slate-700 dark:text-dark-300 hover:bg-slate-50 dark:hover:bg-dark-800 hover:text-blue-600 transition-all w-full"
              >
                <User className="h-4 w-4" />
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white px-5 py-3.5 transition-colors shadow-md shadow-blue-600/20 w-full"
              >
                <LogIn className="h-4 w-4" />
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
