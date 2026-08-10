import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { FaReact } from 'react-icons/fa';
import Header from '../components/Header';

const Login = () => {
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
        // Redirect to dashboard (if admin, redirect to admin dashboard, else user dashboard)
        const savedUser = JSON.parse(localStorage.getItem('user'));
        if (savedUser && savedUser.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Branding header */}
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-500 shadow-lg shadow-blue-600/25">
              <FaReact className="h-8 w-8 text-white animate-spin-slow" />
            </div>
          <h2 className="mt-6 text-center text-4xl font-extrabold tracking-tight text-white font-sans">
            Smart-<span className="text-blue-600">Print</span>
          </h2>
          <p className="mt-2 text-center text-sm text-dark-400">
            Online Document Printing & Management
          </p>
        </div>

        {/* Login Box */}
        <div className="glass rounded-3xl p-8 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <LogIn className="h-5 w-5 text-brand-400" />
            Sign in to your account
          </h3>

          {error && (
            <div className="mb-6 flex items-start gap-2 rounded-xl bg-rose-500/10 border border-rose-500/35 p-4 text-sm text-rose-200">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="block w-full rounded-xl bg-dark-900 border border-dark-800 py-3 pl-10 pr-3 text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm transition-colors"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-300 mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl bg-dark-900 border border-dark-800 py-3 pl-10 pr-10 text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm transition-colors"
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
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 py-3 text-sm font-semibold text-white-force hover:from-brand-500 hover:to-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-dark-950 disabled:opacity-50 transition-all shadow-lg shadow-brand-600/20"
            >
              {submitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-8 space-y-3 text-center text-sm border-t border-dark-850/40 pt-5">
            <div>
              <span className="text-dark-400">New student? </span>
              <Link to="/signup" className="font-semibold text-brand-400 hover:text-brand-300 transition-colors">
                Create an account
              </Link>
            </div>
            <div className="text-xs pt-1">
              <span className="text-dark-500">System administrator? </span>
              <Link to="/admin/login" className="font-bold text-rose-400 hover:text-rose-300 transition-colors">
                Admin Console
              </Link>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
