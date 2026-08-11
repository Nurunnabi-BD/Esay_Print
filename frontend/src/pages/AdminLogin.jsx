import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import Header from '../components/Header';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        // Double check user role
        const savedUser = JSON.parse(localStorage.getItem('user'));
        if (savedUser && savedUser.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          setError('Access denied. This profile is not authorized as an administrator.');
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-900 flex flex-col font-sans transition-colors duration-300">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Admin Header */}
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 shadow-lg shadow-rose-500/25">
            <ShieldAlert className="h-8 w-8 text-white animate-pulse-slow" />
          </div>
          <h2 className="mt-6 text-center text-4xl font-extrabold tracking-tight text-white font-sans">
            Smart-<span className=" text-red-500">Admin</span>
          </h2>
          <p className="mt-2 text-center text-sm text-dark-400">
            Administrative Console Login
          </p>
        </div>

        {/* Login Box */}
        <div className="glass rounded-3xl p-8 shadow-2xl border border-rose-500/10">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <LogIn className="h-5 w-5 text-rose-400" />
            Administrator Access
          </h3>

          {error && (
            <div className="mb-6 flex items-start gap-2 rounded-xl bg-rose-500/10 border border-rose-500/35 p-4 text-sm text-rose-200">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-dark-300 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@university.edu"
                  className="block w-full rounded-xl bg-dark-900 border border-dark-800 py-3 pl-10 pr-3 text-white placeholder-dark-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 text-sm transition-colors"
                />
              </div>
            </div>
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-dark-300 mb-2">
                Security Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl bg-dark-900 border border-dark-800 py-3 pl-10 pr-10 text-white placeholder-dark-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 text-sm transition-colors"
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-dark-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 py-3 text-sm font-semibold text-white-force hover:from-rose-500 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-dark-950 disabled:opacity-50 transition-all shadow-lg shadow-rose-600/20"
            >
              {submitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In to Console
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs">
            <span className="text-dark-500">Student access? </span>
            <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300 transition-colors">
              Go to Student Login
            </Link>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
