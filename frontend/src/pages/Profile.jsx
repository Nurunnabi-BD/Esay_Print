import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, Mail, Hash, School, GraduationCap, Lock, CheckCircle, ShieldAlert,
  MapPin, CreditCard, Settings, HelpCircle, Headphones, Plus, Trash2, 
  Bell, Check, ShieldCheck
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'profile';

  // --- Profile state ---
  const [formData, setFormData] = useState({
    name: user?.name || '',
    department: user?.department || '',
    semester: user?.semester || '',
    password: '',
    confirmPassword: ''
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (formData.password) {
      if (formData.password !== formData.confirmPassword) {
        return setError('Passwords do not match.');
      }
      if (formData.password.length < 6) {
        return setError('Password must be at least 6 characters.');
      }
    }

    setSaving(true);
    const updateData = {
      name: formData.name,
      department: formData.department,
      semester: formData.semester
    };

    if (formData.password) {
      updateData.password = formData.password;
    }

    try {
      const result = await updateProfile(updateData);
      if (result.success) {
        setSuccess('Profile updated successfully.');
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  // --- Address Book state ---
  const [addresses, setAddresses] = useState([
    { id: 1, label: 'Main Library Locker', details: 'Campus Central Library, Ground Floor Locker #B4', isDefault: true },
    { id: 2, label: 'Sher-e-Bangla Hall', details: 'Room 302, Student Residence Hall', isDefault: false },
  ]);
  const [addressLabel, setAddressLabel] = useState('');
  const [addressDetails, setAddressDetails] = useState('');

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!addressLabel || !addressDetails) return;
    const newAddr = {
      id: Date.now(),
      label: addressLabel,
      details: addressDetails,
      isDefault: false
    };
    setAddresses([...addresses, newAddr]);
    setAddressLabel('');
    setAddressDetails('');
  };

  const handleDeleteAddress = (id) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  const handleSetDefaultAddress = (id) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  // --- Payment Methods state ---
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: 'BKash', account: '017XXXXXX89', isDefault: true },
    { id: 2, type: 'Visa Card', account: '•••• •••• •••• 4242', isDefault: false },
  ]);
  const [payType, setPayType] = useState('BKash');
  const [payAccount, setPayAccount] = useState('');

  const handleAddPayment = (e) => {
    e.preventDefault();
    if (!payAccount) return;
    const newPay = {
      id: Date.now(),
      type: payType,
      account: payAccount,
      isDefault: false
    };
    setPaymentMethods([...paymentMethods, newPay]);
    setPayAccount('');
  };

  const handleDeletePayment = (id) => {
    setPaymentMethods(paymentMethods.filter(pay => pay.id !== id));
  };

  // --- Settings state ---
  const [settings, setSettings] = useState({
    emailNotif: true,
    smsNotif: false,
    orderUpdates: true,
    highQualityOnly: true,
  });

  const handleToggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // --- Contact Support state ---
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSuccess, setSupportSuccess] = useState('');

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (!supportSubject || !supportMessage) return;
    setSupportSuccess('Your message has been sent to our support team. We will contact you shortly!');
    setSupportSubject('');
    setSupportMessage('');
  };

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // --- Header Helpers ---
  const getHeaderDetails = () => {
    switch (activeTab) {
      case 'password':
        return { title: 'Change Password', desc: 'Update your account security password.', icon: <Lock className="h-6 w-6" /> };
      case 'address':
        return { title: 'Address Book', desc: 'Manage your saved delivery and pickup locations.', icon: <MapPin className="h-6 w-6" /> };
      case 'payment':
        return { title: 'Payment Methods', desc: 'Configure BKash, Nagad, and debit/credit card accounts.', icon: <CreditCard className="h-6 w-6" /> };
      case 'settings':
        return { title: 'Account Settings', desc: 'Configure system notifications and preferences.', icon: <Settings className="h-6 w-6" /> };
      case 'help':
        return { title: 'Help Center', desc: 'Find answers to frequently asked questions.', icon: <HelpCircle className="h-6 w-6" /> };
      case 'support':
        return { title: 'Contact Support', desc: 'Send a message directly to our campus helpline.', icon: <Headphones className="h-6 w-6" /> };
      case 'profile':
      default:
        return { 
          title: user?.role === 'admin' ? 'Admin Profile' : 'Student Profile', 
          desc: user?.role === 'admin' ? 'View and update your admin account credentials.' : 'View and update your student account settings.', 
          icon: <User className="h-6 w-6" /> 
        };
    }
  };

  const header = getHeaderDetails();

  // --- Tab Renderers ---
  const renderTabContent = () => {
    switch (activeTab) {
      case 'password':
        return (
          <form onSubmit={handleProfileSubmit} className="space-y-6 text-left">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-dark-800 pb-3">Update Account Password</h3>
            
            {success && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/35 p-4 text-xs text-emerald-600 dark:text-emerald-300">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-rose-500/10 border border-rose-500/35 p-4 text-xs text-rose-600 dark:text-rose-200">
                <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-dark-300 mb-2">New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-dark-400">
                    <Lock className="h-4.5 w-4.5" />
                  </span>
                  <input
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter new password (min 6 characters)"
                    className="block w-full rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 py-3 pl-10 pr-3 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none text-sm transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-dark-300 mb-2">Confirm New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-dark-400">
                    <Lock className="h-4.5 w-4.5" />
                  </span>
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter new password"
                    className="block w-full rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 py-3 pl-10 pr-3 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none text-sm transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-dark-850">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white hover:bg-blue-700 transition-all shadow-md disabled:opacity-50"
              >
                {saving ? 'Updating password...' : 'Update Password'}
              </button>
            </div>
          </form>
        );

      case 'address':
        return (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white border-b border-dark-800 pb-3 text-left">Address Book & Lockers</h3>
            
            <div className="space-y-4">
              {addresses.map(addr => (
                <div key={addr.id} className="p-4 rounded-xl bg-dark-900 border border-dark-850 flex justify-between items-center">
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{addr.label}</span>
                      {addr.isDefault && (
                        <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">Default</span>
                      )}
                    </div>
                    <p className="text-10px text-dark-500 leading-normal">{addr.details}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!addr.isDefault && (
                      <div 
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] font-bold text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-all cursor-pointer"
                      >
                        Set Default
                      </div>
                    )}
                    <div 
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="p-1.5 hover:bg-rose-50 rounded-lg text-[#64748B] hover:text-rose-600 transition-all cursor-pointer"
                      title="Delete address"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddAddress} className="pt-4 border-t border-dark-850 space-y-4">
              <h4 className="text-xs font-bold text-white text-left">Add New Location</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <input
                    type="text"
                    placeholder="Location Label (e.g. Hall Room)"
                    required
                    value={addressLabel}
                    onChange={(e) => setAddressLabel(e.target.value)}
                    className="w-full px-4 py-2.5 bg-dark-900 border border-dark-800 rounded-xl outline-none focus:border-brand-500 text-xs font-bold text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <input
                    type="text"
                    placeholder="Full Address / Pickup Counter Details"
                    required
                    value={addressDetails}
                    onChange={(e) => setAddressDetails(e.target.value)}
                    className="w-full px-4 py-2.5 bg-dark-900 border border-dark-800 rounded-xl outline-none focus:border-brand-500 text-xs font-bold text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-500 transition-colors shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  Add Address
                </button>
              </div>
            </form>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white border-b border-dark-800 pb-3 text-left">Payment Accounts</h3>
            
            <div className="space-y-4">
              {paymentMethods.map(pay => (
                <div key={pay.id} className="p-4 rounded-xl bg-dark-900 border border-dark-850 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">💳</span>
                    <div className="text-left space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{pay.type}</span>
                        {pay.isDefault && (
                          <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">Primary</span>
                        )}
                      </div>
                      <p className="text-10px text-dark-500">{pay.account}</p>
                    </div>
                  </div>
                  <div 
                    onClick={() => handleDeletePayment(pay.id)}
                    className="p-1.5 hover:bg-rose-50 rounded-lg text-[#64748B] hover:text-rose-600 transition-all cursor-pointer"
                    title="Delete payment method"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddPayment} className="pt-4 border-t border-dark-850 space-y-4">
              <h4 className="text-xs font-bold text-white text-left">Link Mobile Wallet / Card</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <select
                    value={payType}
                    onChange={(e) => setPayType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-dark-900 border border-dark-800 rounded-xl outline-none focus:border-brand-500 text-xs font-bold text-white"
                  >
                    <option value="BKash">BKash Wallet</option>
                    <option value="Nagad">Nagad Wallet</option>
                    <option value="Rocket">Rocket Wallet</option>
                    <option value="Visa Card">Visa / Mastercard</option>
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Account Number or Wallet Phone Number"
                    required
                    value={payAccount}
                    onChange={(e) => setPayAccount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-dark-900 border border-dark-800 rounded-xl outline-none focus:border-brand-500 text-xs font-bold text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-500 transition-colors shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  Link Account
                </button>
              </div>
            </form>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6 text-left">
            <h3 className="text-sm font-bold text-white border-b border-dark-800 pb-3">Account Preferences</h3>
            
            <div className="divide-y divide-dark-850 space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Bell className="h-4 w-4 text-brand-500" />
                    Email Notifications
                  </span>
                  <p className="text-10px text-dark-500">Receive order invoices and receipts on your student email.</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => handleToggleSetting('emailNotif')}
                  className="text-brand-500 hover:text-brand-400 text-xl transition-all"
                >
                  {settings.emailNotif ? '🟢 On' : '⚪ Off'}
                </button>
              </div>

              <div className="flex items-center justify-between py-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Mail className="h-4 w-4 text-brand-500" />
                    SMS Notifications
                  </span>
                  <p className="text-10px text-dark-500">Receive instant queue and pickup alerts on your phone.</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => handleToggleSetting('smsNotif')}
                  className="text-brand-500 hover:text-brand-400 text-xl transition-all"
                >
                  {settings.smsNotif ? '🟢 On' : '⚪ Off'}
                </button>
              </div>

              <div className="flex items-center justify-between py-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    Real-time Order Updates
                  </span>
                  <p className="text-10px text-dark-500">Enable WebSockets for live status updates on your dashboard.</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => handleToggleSetting('orderUpdates')}
                  className="text-brand-500 hover:text-brand-400 text-xl transition-all"
                >
                  {settings.orderUpdates ? '🟢 On' : '⚪ Off'}
                </button>
              </div>

              <div className="flex items-center justify-between py-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-brand-500" />
                    High Resolution Only
                  </span>
                  <p className="text-10px text-dark-500">Auto-reject low-DPI document uploads to prevent blurry prints.</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => handleToggleSetting('highQualityOnly')}
                  className="text-brand-500 hover:text-brand-400 text-xl transition-all"
                >
                  {settings.highQualityOnly ? '🟢 On' : '⚪ Off'}
                </button>
              </div>
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="space-y-6 text-left">
            <h3 className="text-sm font-bold text-white border-b border-dark-800 pb-3">Frequently Asked Questions</h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-dark-900 border border-dark-850 space-y-2">
                <h4 className="text-xs font-bold text-white">How do I pay for my printed orders?</h4>
                <p className="text-10px text-dark-400 leading-relaxed">
                  You can pay physically with cash at the Campus Central Library printing counter when collecting your document, or pre-link a BKash/Nagad account in your Payment tab for seamless checkout.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-dark-900 border border-dark-850 space-y-2">
                <h4 className="text-xs font-bold text-white">What file formats can I upload for printing?</h4>
                <p className="text-10px text-dark-400 leading-relaxed">
                  We support PDF files, Word Documents (.doc, .docx), Excel Sheets (.xls, .xlsx), and major image files (.png, .jpg, .jpeg) up to 10MB in size.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-dark-900 border border-dark-850 space-y-2">
                <h4 className="text-xs font-bold text-white">How long does my printed document stay at the counter?</h4>
                <p className="text-10px text-dark-400 leading-relaxed">
                  Printed documents are kept securely at the central campus library counter for up to 48 hours. If not picked up within this window, the print order status will be flagged.
                </p>
              </div>
            </div>
          </div>
        );

      case 'support':
        return (
          <div className="space-y-6 text-left">
            <h3 className="text-sm font-bold text-white border-b border-dark-800 pb-3">Send Support Message</h3>
            
            {supportSuccess && (
              <div className="flex items-start gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/35 p-4 text-xs text-emerald-200">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{supportSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSupportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dark-355 mb-2">Subject</label>
                <input
                  type="text"
                  placeholder="Order ID query, printing error, etc."
                  required
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-800 rounded-xl outline-none focus:border-brand-500 text-xs font-bold text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-355 mb-2">Describe the Problem</label>
                <textarea
                  rows="4"
                  placeholder="Detail your issue here. Please mention the specific Order ID if applicable."
                  required
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-800 rounded-xl outline-none focus:border-brand-500 text-xs font-bold text-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-6 py-3 text-xs font-bold text-white hover:bg-brand-500 transition-all shadow-lg"
                >
                  Send Support Request
                </button>
              </div>
            </form>
          </div>
        );

      case 'profile':
      default:
        return (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <h3 className="text-sm font-bold text-white border-b border-dark-800 pb-3 flex items-center gap-2">
              Update Student Information
            </h3>

            {success && (
              <div className="flex items-start gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/35 p-4 text-xs text-emerald-200">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-rose-500/10 border border-rose-500/35 p-4 text-xs text-rose-200">
                <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Immutable Fields */}
              <div>
                <label className="block text-xs font-semibold text-dark-400 mb-2">Student ID (Immutable)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-600">
                    <Hash className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    disabled
                    value={user?.studentId || ''}
                    className="block w-full rounded-xl bg-dark-950/80 border border-dark-900 py-3 pl-10 pr-3 text-dark-500 text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-400 mb-2">Email Address (Immutable)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-600">
                    <Mail className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    disabled
                    value={user?.email || ''}
                    className="block w-full rounded-xl bg-dark-950/80 border border-dark-900 py-3 pl-10 pr-3 text-dark-500 text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Editable Fields */}
              <div>
                <label className="block text-xs font-semibold text-dark-300 mb-2">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                    <User className="h-4.5 w-4.5" />
                  </span>
                  <input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full rounded-xl bg-dark-900 border border-dark-800 py-3 pl-10 pr-3 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-300 mb-2">Department</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                    <School className="h-4.5 w-4.5" />
                  </span>
                  <input
                    name="department"
                    type="text"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    className="block w-full rounded-xl bg-dark-900 border border-dark-800 py-3 pl-10 pr-3 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-300 mb-2">Semester</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                    <GraduationCap className="h-4.5 w-4.5" />
                  </span>
                  <input
                    name="semester"
                    type="text"
                    required
                    value={formData.semester}
                    onChange={handleChange}
                    className="block w-full rounded-xl bg-dark-900 border border-dark-800 py-3 pl-10 pr-3 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm transition-colors"
                  />
                </div>
              </div>

              <div className="hidden md:block"></div>

              {/* Password Fields */}
              <div className="col-span-1 md:col-span-2 pt-3 border-t border-dark-850 my-1">
                <h4 className="text-xs font-bold text-white mb-4">Change Password (Optional)</h4>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-300 mb-2">New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                    <Lock className="h-4.5 w-4.5" />
                  </span>
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="block w-full rounded-xl bg-dark-900 border border-dark-800 py-3 pl-10 pr-3 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-300 mb-2">Confirm New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                    <Lock className="h-4.5 w-4.5" />
                  </span>
                  <input
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="block w-full rounded-xl bg-dark-900 border border-dark-800 py-3 pl-10 pr-3 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm transition-colors"
                  />
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-4 border-t border-dark-850">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-brand-600 px-6 py-3 text-xs font-bold text-white hover:bg-brand-500 transition-all shadow-lg shadow-brand-600/15 disabled:opacity-50"
              >
                {saving ? 'Saving changes...' : 'Save Settings'}
              </button>
            </div>
          </form>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-md shadow-brand-600/10">
          {header.icon}
        </div>
        <div className="text-left">
          <h1 className="text-3xl font-extrabold text-white">{header.title}</h1>
          <p className="text-sm text-dark-400">{header.desc}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side Info Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass rounded-3xl p-6 shadow-xl text-center space-y-4">
            <div className="h-20 w-20 mx-auto rounded-full bg-brand-900 border-2 border-brand-500/40 flex items-center justify-center text-brand-300 font-bold text-3xl shadow-lg shadow-brand-500/10">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'SP'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-none">{user?.name}</h2>
              <span className="text-xs text-dark-500 block mt-1.5">{user?.email}</span>
            </div>

            <div className="pt-4 border-t border-dark-850 text-left text-xs space-y-2.5 text-dark-400">
              <div className="flex justify-between">
                <span>Account Created</span>
                <span className="text-white font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Access Level</span>
                <span className="text-brand-400 font-bold capitalize">{user?.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Tab container */}
        <div className="lg:col-span-8">
          <div className="glass rounded-3xl p-6 shadow-xl">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
