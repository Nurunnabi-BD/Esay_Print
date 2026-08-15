import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import UserLayout from '../layouts/UserLayout';
import AdminLayout from '../layouts/AdminLayout';

// Protectors
import PrivateRoute from '../components/PrivateRoute';
import AdminRoute from '../components/AdminRoute';
import PublicRoute from '../components/PublicRoute';

// Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';
import Calculator from '../pages/Calculator';
import MyOrders from '../pages/MyOrders';
import OrderDetails from '../pages/OrderDetails';
import Profile from '../pages/Profile';
import Services from '../pages/Services';
import HowItWorks from '../pages/HowItWorks';

// Admin Pages
import AdminLogin from '../pages/AdminLogin';
import AdminDashboard from '../pages/AdminDashboard';
import AdminOrders from '../pages/AdminOrders';
import AdminOrderDetails from '../pages/AdminOrderDetails';
import AdminUsers from '../pages/AdminUsers';
import PrintWrapper from '../pages/PrintWrapper';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/services" element={<Services />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/admin/login" element={<PublicRoute><AdminLogin /></PublicRoute>} />

      {/* Protected Student Pages */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <UserLayout>
              <Dashboard />
            </UserLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/calculator"
        element={
          <PrivateRoute>
            <UserLayout>
              <Calculator />
            </UserLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/my-orders"
        element={
          <PrivateRoute>
            <UserLayout>
              <MyOrders />
            </UserLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <PrivateRoute>
            <UserLayout>
              <OrderDetails />
            </UserLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <UserLayout>
              <Profile />
            </UserLayout>
          </PrivateRoute>
        }
      />

      {/* Protected Admin Pages */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminOrders />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/orders/:id"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminOrderDetails />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          </AdminRoute>
        }
      />

      {/* Special Fullscreen Admin Print View */}
      <Route
        path="/admin/print/:id"
        element={
          <AdminRoute>
            <PrintWrapper />
          </AdminRoute>
        }
      />

      {/* Fallback Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
