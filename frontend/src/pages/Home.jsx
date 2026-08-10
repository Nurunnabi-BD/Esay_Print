import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Printer, UploadCloud, ShieldCheck, Award, Clock, 
  Headphones, Sliders, ArrowRight, User, LogIn, FileText, CheckCircle2 
} from 'lucide-react';
import { FaReact } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900 text-slate-900 dark:text-white font-sans flex flex-col justify-between transition-colors duration-300">
      
      {/* 1. Global Header Navigation */}
      <Header />

      {/* 2. Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden">
        
        {/* Left Side Copywriting */}
        <div className="flex-1 space-y-6 text-left max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-600 dark:text-blue-400 font-bold tracking-wider uppercase">
            ONLINE PRINTING MADE SIMPLE
          </div>

          <h2 className="text-4xl md:text-5.5xl font-black text-slate-900 dark:text-white leading-tight">
            Upload. Print. <br />
            We Handle the <span className="text-blue-600 dark:text-blue-400">Rest.</span>
          </h2>
          
          <p className="text-slate-500 dark:text-dark-400 text-sm md:text-base leading-relaxed max-w-lg">
            Upload your documents, choose your preferences, and leave the printing to us. Fast, secure and hassle-free printing at your fingertips.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link
              to="/signup"
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3.5 px-7 text-xs font-bold text-white transition-all shadow-lg shadow-blue-600/20"
            >
              <UploadCloud className="h-4.5 w-4.5" />
              Upload Your File
            </Link>
            <a
              href="#services"
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 hover:bg-slate-50 dark:hover:bg-dark-800 py-3.5 px-7 text-xs font-bold text-slate-700 dark:text-dark-300 transition-colors"
            >
              <FileText className="h-4.5 w-4.5 text-blue-600" />
              View Services
            </a>
          </div>

          {/* Checklist footer */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-6 text-xs text-slate-600 dark:text-dark-400 font-semibold border-t border-slate-100 dark:border-dark-800">
            <span className="flex items-center gap-1 text-slate-900 dark:text-white">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              Secure Upload
            </span>
            <span className="text-slate-300 dark:text-dark-700">•</span>
            <span className="flex items-center gap-1 text-slate-900 dark:text-white">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              High Quality Prints
            </span>
            <span className="text-slate-300 dark:text-dark-700">•</span>
            <span className="flex items-center gap-1 text-slate-900 dark:text-white">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              On-time Delivery
            </span>
          </div>
        </div>

        {/* Right Side Visual Graphics */}
        <div className="flex-1 w-full max-w-lg relative flex items-center justify-center">
          {/* Subtle background circular light glow */}
          <div className="absolute h-96 w-96 rounded-full bg-blue-50/70 dark:bg-blue-900/10 blur-3xl -z-10 animate-pulse-slow"></div>

          {/* Printer Hero Image Graphic */}
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-visible">
            <img
              src="/printer_hero.jpg"
              alt="3D printer illustration ejection sheet"
              className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
            />
            
            {/* Floating File Badges */}
            <div className="absolute top-1/4 -left-4 bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-2xl p-2.5 shadow-xl shadow-slate-900/5 flex items-center gap-2 animate-bounce-slow">
              <span className="text-10px font-extrabold text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/20 px-2 py-0.5 rounded-lg">PDF</span>
            </div>

            <div className="absolute top-12 right-2 bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-2xl p-2.5 shadow-xl shadow-slate-900/5 flex items-center gap-2">
              <span className="text-10px font-extrabold text-blue-600 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/20 px-2 py-0.5 rounded-lg">W</span>
            </div>

            <div className="absolute bottom-12 -right-4 bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-2xl p-2.5 shadow-xl shadow-slate-900/5 flex items-center gap-2">
              <span className="text-10px font-extrabold text-green-600 bg-green-50 dark:bg-green-950/40 border border-green-100 dark:border-green-900/20 px-2 py-0.5 rounded-lg">X</span>
            </div>

            <div className="absolute bottom-6 left-12 bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-2xl p-2.5 shadow-xl shadow-slate-900/5 flex items-center gap-2">
              <span className="text-10px font-extrabold text-purple-600 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-lg">JPG</span>
            </div>
          </div>
        </div>
      </main>
      {/* 3. Features Banner Row */}
      <section id="services" className="w-full max-w-7xl mx-auto px-6 py-6">
        <div className="glass rounded-3xl p-6 border border-slate-150 dark:border-dark-800 shadow-lg shadow-slate-900/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-white dark:bg-dark-950 divide-y sm:divide-y-0 lg:divide-x divide-slate-100 dark:divide-dark-850 transition-colors duration-300">
          
          {/* Feature 1 */}
          <div className="flex items-start gap-4 p-2">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-slate-950 dark:text-white">Secure & Private</h4>
              <p className="text-11px text-slate-500 dark:text-dark-400 leading-relaxed">Your files are safe with us. We never share your data.</p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-start gap-4 p-2 lg:pl-6">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Award className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-slate-950 dark:text-white">High Quality Prints</h4>
              <p className="text-11px text-slate-500 dark:text-dark-400 leading-relaxed">We use top-quality printers for the best results.</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-start gap-4 p-2 lg:pl-6">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Clock className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-slate-950 dark:text-white">Fast Processing</h4>
              <p className="text-11px text-slate-500 dark:text-dark-400 leading-relaxed">Quick turnaround and on-time pickup delivery.</p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex items-start gap-4 p-2 lg:pl-6">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Headphones className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-slate-950 dark:text-white">24/7 Support</h4>
              <p className="text-11px text-slate-500 dark:text-dark-400 leading-relaxed">We're here to help you anytime, anywhere.</p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. How It Works Section */}
      <section id="how-it-works" className="w-full max-w-7xl mx-auto px-6 py-16 md:py-24 text-center space-y-12">
        <div className="space-y-3">
          <h3 className="text-3xl font-black text-slate-950 dark:text-white">How It Works</h3>
          <p className="text-sm text-slate-500 dark:text-dark-400">Get your documents printed in 3 easy steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Step 1 */}
          <div className="glass rounded-3xl p-8 border border-slate-150 dark:border-dark-800 hover:border-blue-200 dark:hover:border-blue-800 transition-all flex flex-col items-center text-center space-y-4 shadow-sm bg-white dark:bg-dark-950">
            <div className="h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
              <UploadCloud className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center">1</span>
                <h4 className="text-sm font-black text-slate-950 dark:text-white">Upload Your File</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-dark-400 leading-relaxed">
                Upload your document or image in any format (PDF, Word, Slides, Image).
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="glass rounded-3xl p-8 border border-slate-150 dark:border-dark-800 hover:border-blue-200 dark:hover:border-blue-800 transition-all flex flex-col items-center text-center space-y-4 shadow-sm bg-white dark:bg-dark-950">
            <div className="h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
              <Sliders className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center">2</span>
                <h4 className="text-sm font-black text-slate-950 dark:text-white">Choose Preferences</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-dark-400 leading-relaxed">
                Select print options like pages, copies, paper size, and color profiles.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="glass rounded-3xl p-8 border border-slate-150 dark:border-dark-800 hover:border-blue-200 dark:hover:border-blue-800 transition-all flex flex-col items-center text-center space-y-4 shadow-sm bg-white dark:bg-dark-950">
            <div className="h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
              <Printer className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center">3</span>
                <h4 className="text-sm font-black text-slate-950 dark:text-white">We Print & Deliver</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-dark-400 leading-relaxed">
                We print your document at the counter and notify you for quick pickup.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Footer */}
      <footer className="w-full bg-slate-50 dark:bg-dark-950 border-t border-slate-200 dark:border-dark-850 py-8 px-6 text-center text-xs text-slate-500 dark:text-dark-400 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-white">
            <Printer className="h-4.5 w-4.5 text-blue-600" />
            <span>PrintFlow System</span>
          </div>
          <p>&copy; {new Date().getFullYear()} PrintFlow. All rights reserved. Campus Document Printing Hub.</p>
        </div>
      </footer>

    </div>
  );
};

export default Home;
