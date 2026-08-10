import React, { useState, useEffect } from 'react';
import { Calculator as CalcIcon, FileText, Copy, Palette, CheckCircle, HelpCircle } from 'lucide-react';

const Calculator = () => {
  const [pages, setPages] = useState(1);
  const [copies, setCopies] = useState(1);
  const [printType, setPrintType] = useState('bw'); // 'bw' or 'color'
  const [pricing, setPricing] = useState({ bw: 3, color: 5 });
  const [totalPages, setTotalPages] = useState(1);
  const [totalCost, setTotalCost] = useState(3);

  // Recalculate values instantly when inputs change
  useEffect(() => {
    const pricePerPage = printType === 'bw' ? pricing.bw : pricing.color;
    const computedPages = Math.max(0, parseInt(pages, 10) || 0) * Math.max(0, parseInt(copies, 10) || 0);
    setTotalPages(computedPages);
    setTotalCost(computedPages * pricePerPage);
  }, [pages, copies, printType, pricing]);

  const handlePagesChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setPages(isNaN(val) ? '' : Math.max(1, val));
  };

  const handleCopiesChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setCopies(isNaN(val) ? '' : Math.max(1, val));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-md shadow-brand-600/10">
          <CalcIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">Cost Calculator</h1>
          <p className="text-sm text-dark-400">Estimate your document printing cost instantly before placing an order.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Configuration Panel */}
        <div className="lg:col-span-7 glass rounded-3xl p-6 shadow-xl space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-dark-800 pb-3 flex items-center gap-2">
            <Palette className="h-5 w-5 text-brand-400" />
            Configure Print Job
          </h2>

          {/* Print Type Selection */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-3">Print Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPrintType('bw')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                  printType === 'bw'
                    ? 'bg-brand-950/40 border-brand-500/80 text-white ring-1 ring-brand-500/50 shadow-md shadow-brand-500/10'
                    : 'bg-dark-900 border-dark-800 text-dark-400 hover:border-dark-700 hover:text-dark-200'
                }`}
              >
                <span className="text-2xl mb-1">⚫</span>
                <span className="font-semibold text-sm">Black & White</span>
                <span className="text-xs text-dark-400 mt-1">{pricing.bw} BDT / page</span>
              </button>

              <button
                type="button"
                onClick={() => setPrintType('color')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                  printType === 'color'
                    ? 'bg-brand-950/40 border-brand-500/80 text-white ring-1 ring-brand-500/50 shadow-md shadow-brand-500/10'
                    : 'bg-dark-900 border-dark-800 text-dark-400 hover:border-dark-700 hover:text-dark-200'
                }`}
              >
                <span className="text-2xl mb-1">🌈</span>
                <span className="font-semibold text-sm">Color Print</span>
                <span className="text-xs text-dark-400 mt-1">{pricing.color} BDT / page</span>
              </button>
            </div>
          </div>

          {/* Number of Pages */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="pages" className="text-sm font-medium text-dark-300 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-dark-400" />
                Number of Pages
              </label>
              <span className="text-xs text-dark-400">Total pages in file</span>
            </div>
            <input
              id="pages"
              type="number"
              min="1"
              value={pages}
              onChange={handlePagesChange}
              placeholder="e.g. 10"
              className="block w-full rounded-xl bg-dark-900 border border-dark-800 py-3 px-4 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm transition-colors"
            />
          </div>

          {/* Number of Copies */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="copies" className="text-sm font-medium text-dark-300 flex items-center gap-1.5">
                <Copy className="h-4 w-4 text-dark-400" />
                Number of Copies
              </label>
              <span className="text-xs text-dark-400">Total sets required</span>
            </div>
            <input
              id="copies"
              type="number"
              min="1"
              value={copies}
              onChange={handleCopiesChange}
              placeholder="e.g. 1"
              className="block w-full rounded-xl bg-dark-900 border border-dark-800 py-3 px-4 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm transition-colors"
            />
          </div>
        </div>

        {/* Calculation Invoice Summary */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="glass rounded-3xl p-6 shadow-xl relative overflow-hidden flex-1 flex flex-col justify-between">
            {/* Glossy overlay background lights */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-44 h-44 rounded-full bg-brand-500/10 blur-3xl pointer-events-none"></div>

            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white border-b border-dark-800 pb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                Summary Details
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between text-sm py-1 border-b border-dark-900">
                  <span className="text-dark-400">Pages Count</span>
                  <span className="font-semibold text-white">{pages || 0}</span>
                </div>
                <div className="flex justify-between text-sm py-1 border-b border-dark-900">
                  <span className="text-dark-400">Copies Count</span>
                  <span className="font-semibold text-white">× {copies || 0}</span>
                </div>
                <div className="flex justify-between text-sm py-1 border-b border-dark-900">
                  <span className="text-dark-400">Print Color Type</span>
                  <span className="font-semibold text-white capitalize">{printType === 'bw' ? 'Black & White' : 'Color'}</span>
                </div>
                <div className="flex justify-between text-sm py-1 border-b border-dark-900">
                  <span className="text-dark-400">Rate Per Page</span>
                  <span className="font-semibold text-brand-400">
                    {printType === 'bw' ? pricing.bw : pricing.color} BDT
                  </span>
                </div>
                <div className="flex justify-between text-sm py-1 border-b border-dark-900">
                  <span className="text-dark-400">Total Printed Pages</span>
                  <span className="font-semibold text-white">{totalPages}</span>
                </div>
              </div>
            </div>

            {/* Total display box */}
            <div className="mt-8 pt-6 border-t border-dark-800 flex flex-col">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-white">Estimated Cost</span>
                <span className="text-4xl font-extrabold bg-gradient-to-r from-brand-400 to-emerald-400 bg-clip-text text-transparent">
                  {totalCost} BDT
                </span>
              </div>
              <p className="text-xs text-dark-500 mt-2 text-right">
                * Note: Pricing calculated using campus base printing configurations.
              </p>
            </div>
          </div>

          {/* Pricing Info Card */}
          <div className="mt-4 p-4 rounded-2xl bg-brand-950/20 border border-brand-900/30 flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-brand-400 shrink-0 mt-0.5" />
            <div className="text-xs text-dark-400 leading-relaxed">
              <strong className="text-dark-200">How is this calculated?</strong><br />
              Total Cost = (Pages × Copies) × Rate Per Page. Black & White is charged at {pricing.bw} BDT per page, and Color prints at {pricing.color} BDT per page.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
