'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Coins, 
  Truck, 
  Package, 
  Percent, 
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { NetReturnCalculationResult } from '@/lib/types';

export const CropInventoryValuation: React.FC = () => {
  const [commodityId, setCommodityId] = useState('PADDY_COMMON');
  const [marketId, setMarketId] = useState('TG_MKT_ENUMAMULA');
  const [quantity, setQuantity] = useState(50);
  const [quantityUnit, setQuantityUnit] = useState<'Quintal' | 'Kg' | 'Tonne'>('Quintal');
  const [transportCostPerQuintal, setTransportCostPerQuintal] = useState(45);
  const [baggingLaborCostPerQuintal, setBaggingLaborCostPerQuintal] = useState(25);
  const [mandiCessPercent, setMandiCessPercent] = useState(1.0);
  const [customPrice, setCustomPrice] = useState<string>('');

  const [result, setResult] = useState<NetReturnCalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        commodityId,
        marketId,
        quantity: Number(quantity),
        quantityUnit,
        transportCostPerQuintal: Number(transportCostPerQuintal),
        baggingLaborCostPerQuintal: Number(baggingLaborCostPerQuintal),
        mandiCessPercent: Number(mandiCessPercent),
      };

      if (customPrice && Number(customPrice) > 0) {
        payload.customPricePerQuintal = Number(customPrice);
      }

      const res = await fetch('/api/pricing/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.calculation);
      } else {
        setError(data.error || 'Calculation failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculate();
  }, [commodityId, marketId, quantity, quantityUnit, transportCostPerQuintal, baggingLaborCostPerQuintal, mandiCessPercent, customPrice]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Deterministic Farmer Net Return Calculator</h2>
        <p className="text-xs text-slate-500">
          Calculate your true take-home realization by subtracting transport, labor, and mandi fees from wholesale auction benchmarks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters Form (Left Column) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span>Harvest & Selling Parameters</span>
          </h3>

          {/* Commodity */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Crop / Commodity:</label>
            <select
              value={commodityId}
              onChange={(e) => setCommodityId(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="PADDY_COMMON">Telangana Sona Paddy (Common)</option>
              <option value="COTTON">Cotton (Kapas)</option>
              <option value="TURMERIC">Turmeric (Raw/Finger)</option>
              <option value="CHILLI_RED">Chilli Red (Dry)</option>
              <option value="MAIZE">Maize (Makka)</option>
              <option value="BENGAL_GRAM">Bengal Gram (Chana)</option>
            </select>
          </div>

          {/* Market Yard */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Target APMC Yard:</label>
            <select
              value={marketId}
              onChange={(e) => setMarketId(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="TG_MKT_ENUMAMULA">Enumamula (Warangal)</option>
              <option value="TG_MKT_BOWENPALLY">Bowenpally (Secunderabad)</option>
              <option value="TG_MKT_NIZAMABAD">Nizamabad APMC</option>
              <option value="TG_MKT_KHAMMAM">Khammam Mandi</option>
              <option value="TG_MKT_SURYAPET">Suryapet Yard</option>
              <option value="TG_MKT_BADEPALLY">Badepally (Jadcherla)</option>
              <option value="TG_MKT_KARIMNAGAR">Karimnagar APMC</option>
            </select>
          </div>

          {/* Quantity and Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Harvest Quantity:</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Unit:</label>
              <select
                value={quantityUnit}
                onChange={(e) => setQuantityUnit(e.target.value as any)}
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Quintal">Quintals (100 Kg)</option>
                <option value="Kg">Kilograms (Kg)</option>
                <option value="Tonne">Metric Tonnes (1,000 Kg)</option>
              </select>
            </div>
          </div>

          {/* Optional Custom Price */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Custom Selling Price (Optional, Leave blank to use latest mandi modal rate):
            </label>
            <input
              type="number"
              placeholder="e.g. 2750 (Auto-filled from mandi)"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Itemized Deductions */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <span className="text-xs font-bold text-slate-900 block">Standard Deductions & Costs:</span>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Transport / Freight (₹/Quintal):</span>
                <span className="font-semibold text-slate-800">₹{transportCostPerQuintal}/qtl</span>
              </div>
              <input
                type="range"
                min="0"
                max="150"
                step="5"
                value={transportCostPerQuintal}
                onChange={(e) => setTransportCostPerQuintal(parseFloat(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Bagging, Weighing & Labor (₹/Quintal):</span>
                <span className="font-semibold text-slate-800">₹{baggingLaborCostPerQuintal}/qtl</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="5"
                value={baggingLaborCostPerQuintal}
                onChange={(e) => setBaggingLaborCostPerQuintal(parseFloat(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Mandi Market Cess (%):</span>
                <span className="font-semibold text-slate-800">{mandiCessPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="3"
                step="0.25"
                value={mandiCessPercent}
                onChange={(e) => setMandiCessPercent(parseFloat(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Output Financial Summary (Right Column) */}
        <div className="lg:col-span-7 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <>
              {/* Highlight Card: Net Take-Home Payout */}
              <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-2xl p-6 shadow-lg space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                      Estimated Net Realization
                    </span>
                    <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                      ₹{result.netEstimatedReturnInr.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Effective Rate</span>
                    <div className="text-lg font-bold text-emerald-300">
                      ₹{result.effectiveNetPricePerQuintal.toLocaleString('en-IN')}/Qtl
                    </div>
                    <div className="text-xs text-slate-400">(₹{result.effectiveNetPricePerKg}/Kg)</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
                  <span>Gross Valuation: ₹{result.grossEstimatedValueInr.toLocaleString('en-IN')}</span>
                  <span>Total Deductions: -₹{result.totalDeductionsInr.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Cost & Deduction Breakdown Table */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Itemized Revenue & Cost Breakdown
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-700">
                    <span>Gross Estimated Value ({result.totalQuantityQuintals} Qtl &times; ₹{result.pricePerQuintal}/Qtl)</span>
                    <span className="font-bold text-slate-900">₹{result.grossEstimatedValueInr.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600">
                    <span className="flex items-center space-x-1.5">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Transport Haulage ({result.totalQuantityQuintals} Qtl &times; ₹{transportCostPerQuintal}/Qtl)</span>
                    </span>
                    <span className="text-red-600 font-medium">-₹{result.transportCostInr.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600">
                    <span className="flex items-center space-x-1.5">
                      <Package className="w-3.5 h-3.5 text-slate-400" />
                      <span>Bagging, Stitching & Labor ({result.totalQuantityQuintals} Qtl &times; ₹{baggingLaborCostPerQuintal}/Qtl)</span>
                    </span>
                    <span className="text-red-600 font-medium">-₹{result.baggingCostInr.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600">
                    <span className="flex items-center space-x-1.5">
                      <Percent className="w-3.5 h-3.5 text-slate-400" />
                      <span>APMC Mandi Cess ({mandiCessPercent}% of Gross)</span>
                    </span>
                    <span className="text-red-600 font-medium">-₹{result.mandiCessInr.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between py-2 pt-3 font-bold text-sm text-slate-900 border-t border-slate-200">
                    <span>Net Farmer Payout (After Deductions)</span>
                    <span className="text-emerald-700">₹{result.netEstimatedReturnInr.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* MSP Context Callout */}
              {result.mspComparison.mspInrPerQuintal && (
                <div className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
                  result.mspComparison.isAboveMsp 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Official Govt MSP Benchmark: <span className="font-bold">₹{result.mspComparison.mspInrPerQuintal}/Quintal</span>
                    </span>
                  </div>
                  <span className="font-bold">
                    {result.mspComparison.isAboveMsp ? `+${result.mspComparison.diffPercent}% Above MSP` : 'Below MSP'}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
