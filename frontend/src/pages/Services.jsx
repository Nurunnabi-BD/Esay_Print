import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Image, Layers, BookOpen, FileDigit, Truck, 
  UploadCloud, Play, ShieldCheck, Award, Clock, Headphones, ArrowRight 
} from 'lucide-react';
import { FaReact } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

const Services = () => {
  const { user } = useAuth();

  const services = [
    {
      title: 'Document Printing',
      desc: 'Print your documents in black & white or color with high quality.',
      icon: FileText,
      color: 'text-blue-600 bg-blue-50 border-blue-500',
      accentClass: 'bg-blue-600'
    },
    {
      title: 'Photo Printing',
      desc: 'High-resolution photo printing with vibrant colors and premium finish.',
      icon: Image,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-500',
      accentClass: 'bg-emerald-600'
    },
    {
      title: 'Bulk Printing',
      desc: 'Get bulk prints for your assignments, reports, projects, and more.',
      icon: Layers,
      color: 'text-purple-600 bg-purple-50 border-purple-500',
      accentClass: 'bg-purple-600'
    },
    {
      title: 'Spiral & Binding',
      desc: 'Spiral binding, comb binding, and other binding options available.',
      icon: BookOpen,
      color: 'text-amber-600 bg-amber-50 border-amber-500',
      accentClass: 'bg-amber-500'
    },
    {
      title: 'PDF Printing',
      desc: 'Upload your PDF files and get perfectly formatted prints.',
      icon: FileDigit,
      color: 'text-rose-600 bg-rose-50 border-rose-500',
      accentClass: 'bg-rose-600'
    },
    {
      title: 'Print & Delivery',
      desc: 'We print and deliver your documents safely to your door.',
      icon: Truck,
      color: 'text-teal-600 bg-teal-50 border-teal-500',
      accentClass: 'bg-teal-500'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900 text-slate-900 dark:text-white font-sans flex flex-col justify-between transition-colors duration-300">
      {/* Global Header */}
      <Header />

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 md:py-16 flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden">
        {/* Left column info */}
        <div className="flex-1 space-y-6 text-left max-w-xl">
          <span className="text-xs font-black text-blue-600 dark:text-blue-450 tracking-widest uppercase bg-blue-50 dark:bg-blue-950/40 border border-blue-105 dark:border-blue-900/40 px-3 py-1 rounded-full">
            Our Services
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-950 dark:text-white leading-tight">
            Printing Solutions <br/>
            Made <span className="text-blue-600 bg-blue-50/50 dark:bg-blue-950/40 px-2 py-0.5 rounded-xl border border-blue-100 dark:border-blue-900/40">Simple</span>
          </h1>
          <p className="text-slate-500 dark:text-dark-400 leading-relaxed text-sm">
            We offer a wide range of printing services to meet your personal, academic, and business needs. High fidelity, fast turnaround, and real-time processing directly from your student portal.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to={user ? '/dashboard' : '/login'}
              className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white px-6 py-3.5 transition-all shadow-lg shadow-blue-600/15"
            >
              <UploadCloud className="h-4.5 w-4.5 text-white" />
              Upload Your File
            </Link>
            <a
              href="/#how-it-works"
              className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-dark-800 px-6 py-3.5 text-xs font-bold text-slate-700 dark:text-dark-300 hover:bg-slate-50 dark:hover:bg-dark-800 hover:text-blue-600 hover:border-blue-200 transition-all"
            >
              <Play className="h-4.5 w-4.5 text-blue-600" />
              How It Works
            </a>
          </div>
        </div>

        {/* Right column graphic */}
        <div className="flex-1 w-full flex justify-center lg:justify-end relative">
          <div className="relative w-full max-w-lg aspect-square flex items-center justify-center bg-gradient-to-tr from-blue-50/30 via-slate-50/20 to-emerald-50/10 rounded-full">
            {/* Visual 3D Printer Mockup */}
            <div className="relative bg-white dark:bg-dark-950 border border-slate-100 dark:border-dark-800 p-4 rounded-[40px] shadow-2xl w-[90%] max-w-[420px] transform hover:scale-[1.01] transition-transform">
              <img 
                src="/services_printer.jpg" 
                alt="PrintFlow 3D Smart Printer" 
                className="w-full h-auto rounded-[32px] shadow-sm"
              />

              {/* Floating Ext File Badges */}
              <div className="absolute -top-4 -left-4 bg-rose-600 px-4 py-2 rounded-2xl shadow-lg shadow-rose-600/20 flex items-center gap-2 transform -rotate-6">
                <span className="font-black text-xs font-tech text-white" style={{ color: '#ffffff' }}>.pdf</span>
              </div>
              <div className="absolute top-20 -right-4 bg-blue-600 px-4 py-2 rounded-2xl shadow-lg shadow-blue-600/20 flex items-center gap-2 transform rotate-6">
                <span className="font-black text-xs font-tech text-white" style={{ color: '#ffffff' }}>.docx</span>
              </div>
              <div className="absolute -bottom-4 left-6 bg-emerald-600 px-4 py-2 rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transform -rotate-3">
                <span className="font-black text-xs font-tech text-white" style={{ color: '#ffffff' }}>.xlsx</span>
              </div>
              <div className="absolute bottom-20 -left-6 bg-purple-600 px-4 py-2 rounded-2xl shadow-lg shadow-purple-600/20 flex items-center gap-2 transform rotate-12">
                <span className="font-black text-xs font-tech text-white" style={{ color: '#ffffff' }}>.png</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Our Services Section */}
      <section className="bg-slate-50/50 dark:bg-dark-950/20 py-16 border-t border-slate-100 dark:border-dark-850">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          {/* Header */}
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Our Services</h2>
            <p className="text-sm text-slate-500 dark:text-dark-400 font-medium max-w-md mx-auto">
              High-quality printing services at your fingertips.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {services.map((srv, idx) => {
              const Icon = srv.icon;
              return (
                <div 
                  key={idx} 
                  className="bg-white dark:bg-dark-950 rounded-3xl p-5 border border-slate-150 dark:border-dark-850 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-blue-500/20 transition-all hover:-translate-y-1 group relative overflow-hidden"
                >
                  <div className="space-y-4">
                    {/* Circle Icon */}
                    <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 border ${srv.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {/* Content */}
                    <div className="space-y-2 text-left">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">{srv.title}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-dark-400 font-medium leading-relaxed">
                        {srv.desc}
                      </p>
                    </div>
                  </div>

                  {/* bottom colored border strip */}
                  <div className={`absolute bottom-0 inset-x-0 h-1.5 ${srv.accentClass}`}></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Feature Row */}
      <section className="border-t border-slate-100 dark:border-dark-850 py-10 bg-white dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-center gap-3.5 text-left">
            <div className="h-10 w-10 rounded-full bg-blue-600/10 dark:bg-blue-950/20 border border-blue-500/20 dark:border-blue-900/30 flex items-center justify-center text-blue-650 dark:text-blue-450 shrink-0 shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h5 className="text-xs font-black text-slate-900 dark:text-white leading-none">Secure & Private</h5>
              <p className="text-[9px] text-slate-500 dark:text-dark-400 font-semibold mt-1">Your files are safe with us. We never share data.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 text-left">
            <div className="h-10 w-10 rounded-full bg-blue-600/10 dark:bg-blue-950/20 border border-blue-500/20 dark:border-blue-900/30 flex items-center justify-center text-blue-650 dark:text-blue-450 shrink-0 shadow-sm">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h5 className="text-xs font-black text-slate-900 dark:text-white leading-none">High Quality Prints</h5>
              <p className="text-[9px] text-slate-500 dark:text-dark-400 font-semibold mt-1">We use top-quality printers and premium materials.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 text-left">
            <div className="h-10 w-10 rounded-full bg-blue-600/10 dark:bg-blue-950/20 border border-blue-500/20 dark:border-blue-900/30 flex items-center justify-center text-blue-650 dark:text-blue-450 shrink-0 shadow-sm">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h5 className="text-xs font-black text-slate-900 dark:text-white leading-none">Fast & Reliable</h5>
              <p className="text-[9px] text-slate-500 dark:text-dark-400 font-semibold mt-1">Quick turnaround and on-time delivery.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 text-left">
            <div className="h-10 w-10 rounded-full bg-blue-600/10 dark:bg-blue-950/20 border border-blue-500/20 dark:border-blue-900/30 flex items-center justify-center text-blue-650 dark:text-blue-450 shrink-0 shadow-sm">
              <Headphones className="h-5 w-5" />
            </div>
            <div>
              <h5 className="text-xs font-black text-slate-900 dark:text-white leading-none">24/7 Support</h5>
              <p className="text-[9px] text-slate-500 dark:text-dark-400 font-semibold mt-1">We're here to help you anytime, anywhere.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 dark:border-dark-850 bg-slate-50 dark:bg-dark-950 py-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-500 dark:text-dark-450">
          <div className="flex items-center gap-2">
            <FaReact className="h-4.5 w-4.5 text-blue-600 animate-spin-slow" />
            <span>© {new Date().getFullYear()} PrintFlow. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#privacy" className="hover:text-blue-650 dark:hover:text-blue-400 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-blue-650 dark:hover:text-blue-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Services;
