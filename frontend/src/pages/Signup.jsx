import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Hash, GraduationCap, School, Mail, Lock, AlertCircle } from 'lucide-react';
import { FaReact } from 'react-icons/fa';
import Header from '../components/Header';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    semester: '',
    department: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setSubmitting(true);

    try {
      const result = await register(
        formData.name,
        formData.studentId,
        formData.semester,
        formData.department,
        formData.email,
        formData.password
      );

      if (result.success) {
        navigate('/dashboard');
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
        <div className="w-full max-w-xl space-y-8">
          {/* Branding header */}
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-500 shadow-lg shadow-blue-500/25">
              <FaReact className="h-8 w-8 text-white animate-spin-slow" />
            </div>
          <h2 className="mt-6 text-center text-4xl font-extrabold tracking-tight text-white font-sans">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-dark-400">
            Register your student profile for online document printing
          </p>
        </div>

        {/* Signup Box */}
        <div className="glass rounded-3xl p-8 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-brand-400" />
            Register Student Profile
          </h3>

          {error && (
            <div className="mb-6 flex items-start gap-2 rounded-xl bg-rose-500/10 border border-rose-500/35 p-4 text-sm text-rose-200">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                    <User className="h-5 w-5" />
                  </span>
                  <input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Karim Rahman"
                    className="block w-full rounded-xl bg-dark-900 border border-dark-800 py-3 pl-10 pr-3 text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm transition-colors"
                  />
                </div>
              </div>

              {/* Student ID */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Student ID</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                    <Hash className="h-5 w-5" />
                  </span>
                  <input
                    name="studentId"
                    type="text"
                    required
                    value={formData.studentId}
                    onChange={handleChange}
                    placeholder="2021-1-60-032"
                    className="block w-full rounded-xl bg-dark-900 border border-dark-800 py-3 pl-10 pr-3 text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm transition-colors"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Department</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                    <School className="h-5 w-5" />
                  </span>
                  <input
                    name="department"
                    type="text"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="CSE / BBA / EEE"
                    className="block w-full rounded-xl bg-dark-900 border border-dark-800 py-3 pl-10 pr-3 text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm transition-colors"
                  />
                </div>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Semester</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                    <GraduationCap className="h-5 w-5" />
                  </span>
                  <input
                    name="semester"
                    type="text"
                    required
                    value={formData.semester}
                    onChange={handleChange}
                    placeholder="Fall 2026 / Spring 2026"
                    className="block w-full rounded-xl bg-dark-900 border border-dark-800 py-3 pl-10 pr-3 text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm transition-colors"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-dark-300 mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@university.edu"
                    className="block w-full rounded-xl bg-dark-900 border border-dark-800 py-3 pl-10 pr-3 text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="block w-full rounded-xl bg-dark-900 border border-dark-800 py-3 pl-10 pr-3 text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm transition-colors"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Confirm Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="block w-full rounded-xl bg-dark-900 border border-dark-800 py-3 pl-10 pr-3 text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm transition-colors"
                  />
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
                  <UserPlus className="h-4 w-4" />
                  Create Student Account
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-dark-400">Already registered? </span>
            <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300 transition-colors">
              Sign in instead
            </Link>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
