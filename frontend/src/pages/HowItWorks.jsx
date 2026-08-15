import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  UploadCloud, Sliders, Printer, CheckCircle2, ShieldCheck, 
  Clock, Zap, FileText, ArrowRight, HelpCircle, ChevronDown, ChevronUp, Sparkles, AlertCircle 
} from 'lucide-react';
import Header from '../components/Header';

const HowItWorks = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const steps = [
    {
      num: '01',
      title: 'Upload Your Document',
      desc: 'Drag & drop or select your document. We support PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PowerPoint (.ppt, .pptx), Text, and Images.',
      icon: UploadCloud,
      badge: 'Step 1',
      color: 'from-blue-600 to-blue-400',
      details: [
        'Automatic page count detection',
        'Multi-format support with instant conversion',
        'Secure file buffer with automatic privacy cleanup'
      ]
    },
    {
      num: '02',
      title: 'Customize Print Settings',
      desc: 'Choose print type (Black & White at 3 BDT/page or Full Color at 5 BDT/page) and set your desired copy count with live cost calculation.',
      icon: Sliders,
      badge: 'Step 2',
      color: 'from-purple-600 to-purple-400',
      details: [
        'Live cost estimation in BDT',
        'Black & White (3 BDT) vs Color (5 BDT) toggles',
        'Adjust copies and page configurations instantly'
      ]
    },
    {
      num: '03',
      title: 'Print & Collect',
      desc: 'Submit your order. Our campus print hub processes your job immediately. You get real-time WebSocket notifications when it is ready.',
      icon: Printer,
      badge: 'Step 3',
      color: 'from-emerald-600 to-emerald-400',
      details: [
        'Real-time status tracking (Received ➔ Processing ➔ Completed)',
        'Instant web notification alert when ready for pickup',
        'Quick pickup at the central campus counter'
      ]
    }
  ];

  const faqs = [
    {
      q: 'What file formats are supported?',
      a: 'We support PDF, Word documents (.doc, .docx), Excel spreadsheets (.xls, .xlsx), PowerPoint presentations (.ppt, .pptx), Plain text (.txt), and high-resolution images (.jpg, .jpeg, .png, .webp).'
    },
    {
      q: 'How is the total cost calculated?',
      a: 'Pricing is calculated transparently per page: Black & White prints are 3 BDT per page, and Color prints are 5 BDT per page. The total cost is (Pages × Copies × Rate).'
    },
    {
      q: 'How do I track my print order status?',
      a: 'You can monitor your order in real time from your Dashboard or My Orders page. Our system uses real-time WebSockets to update status from "Order Received" to "Processing" and "Completed".'
    },
    {
      q: 'Can I upload files as an Admin?',
      a: 'Admin accounts oversee the print queue, update order statuses, and manage student requests. Student users submit print orders directly from their dashboard.'
    },
    {
      q: 'What happens if my file conversion fails?',
      a: 'Our server automatically attempts background conversion for Word/Slides documents. If a file is corrupted or protected by password, you will receive an error prompt to upload a clean PDF.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-900 text-slate-900 dark:text-white font-sans transition-colors duration-300">
      {/* Navigation Bar */}
      <Header />

      <main className="w-full max-w-7xl mx-auto px-6 py-12 md:py-16 space-y-16">
        
        {/* 1. Hero Title Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Simple, Fast & Reliable Campus Printing
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            How PrintFlow Works
          </h1>

          <p className="text-sm md:text-base text-slate-500 dark:text-dark-400 font-medium leading-relaxed">
            Get your academic assignments, lab reports, and documents printed in 3 frictionless steps without waiting in long counter queues.
          </p>
        </div>

        {/* 2. 3-Step Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx} 
                className="glass rounded-3xl p-8 border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-950 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-left space-y-6 group"
              >
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <div className={`h-14 w-14 rounded-2xl bg-gradient-to-tr ${step.color} text-white flex items-center justify-center shadow-md shadow-blue-500/10`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <span className="text-2xl font-black text-slate-300 dark:text-dark-700 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {step.num}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-1">
                      {step.badge}
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-dark-400 font-medium leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {/* Feature details list */}
                <div className="pt-4 border-t border-slate-100 dark:border-dark-850 space-y-2">
                  {step.details.map((detail, dIdx) => (
                    <div key={dIdx} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-dark-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Feature Highlights Section */}
        <div className="bg-white dark:bg-dark-950 rounded-3xl border border-slate-200 dark:border-dark-800 p-8 md:p-12 shadow-sm space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Why Use PrintFlow?</h2>
            <p className="text-xs text-slate-500 dark:text-dark-400">Designed specifically for university students and print administrators.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-dark-900 border border-slate-150 dark:border-dark-850 text-left space-y-2">
              <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Instant Upload</h4>
              <p className="text-xs text-slate-500 dark:text-dark-400">Fast file parsing with automatic page count detection.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-dark-900 border border-slate-150 dark:border-dark-850 text-left space-y-2">
              <Clock className="h-6 w-6 text-amber-500" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Live Tracking</h4>
              <p className="text-xs text-slate-500 dark:text-dark-400">Get WebSocket notifications as status changes in real time.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-dark-900 border border-slate-150 dark:border-dark-850 text-left space-y-2">
              <ShieldCheck className="h-6 w-6 text-emerald-500" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Secure Storage</h4>
              <p className="text-xs text-slate-500 dark:text-dark-400">Files are encrypted and restricted to your account access.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-dark-900 border border-slate-150 dark:border-dark-850 text-left space-y-2">
              <FileText className="h-6 w-6 text-purple-500" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Transparent Pricing</h4>
              <p className="text-xs text-slate-500 dark:text-dark-400">3 BDT (B&W) & 5 BDT (Color) per page with zero hidden fees.</p>
            </div>
          </div>
        </div>

        {/* 4. Frequently Asked Questions (FAQ) */}
        <div className="max-w-3xl mx-auto space-y-6 text-left">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-500 dark:text-dark-400">Everything you need to know about the printing process.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index} 
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen 
                      ? 'border-blue-500/40 dark:border-blue-500/40 bg-white dark:bg-dark-950 shadow-md ring-1 ring-blue-500/20' 
                      : 'border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-950 shadow-sm'
                  }`}
                >
                  <div
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full p-5 flex justify-between items-center text-left cursor-pointer transition-colors select-none"
                  >
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white pr-4 leading-snug">{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4.5 w-4.5 text-slate-400 dark:text-dark-500 shrink-0" />
                    )}
                  </div>
                  {isOpen && (
                    <div className="p-5 pt-3 text-xs text-slate-600 dark:text-dark-300 font-medium leading-relaxed border-t border-slate-150 dark:border-dark-850 bg-slate-50/80 dark:bg-dark-900/60 text-left">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Bottom Call to Action Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 md:p-12 text-white text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="space-y-2 max-w-xl mx-auto relative z-10">
            <h3 className="text-2xl md:text-3xl font-black text-white">Ready to Print Your Document?</h3>
            <p className="text-xs md:text-sm text-blue-100 font-medium">Upload your file now and experience seamless campus printing.</p>
          </div>
          
          <div className="pt-2 relative z-10 flex justify-center">
            <Link
              to="/dashboard?action=upload"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-blue-600 hover:bg-blue-50 text-xs font-black shadow-lg hover:shadow-xl transition-all"
            >
              <span>Upload Document Now</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
};

export default HowItWorks;
