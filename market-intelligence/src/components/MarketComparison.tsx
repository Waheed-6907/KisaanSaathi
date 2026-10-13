'use client';

import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck,
  Award,
  ArrowRight
} from 'lucide-react';
import { MarketComparisonResult } from '@/lib/types';

export const MarketComparison: React.FC = () => {
  const [commodityId, setCommodityId] = useState('PADDY_COMMON');
  const [comparison, setComparison] = useState<MarketComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/prices/compare?commodityId=${commodityId}`);
      const data = await res.json();
      if (data.success) {
        setComparison(data.comparison);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, [commodityId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Inter-Mandi Market Arbitrage & Comparison</h2>
        <p className="text-xs text-slate-500">
          Compare wholesale rates across Telangana APMC yards to evaluate real price spreads before booking transport.
        </p>
      </div>

      {/* Commodity Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">Select Crop:</label>
          <select
            value={commodityId}
            onChange={(e) => setCommodityId(e.target.value)}
            className="w-full sm:w-64 py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="PADDY_COMMON">Telangana Sona Paddy (Common)</option>
            <option value="COTTON">Cotton (Kapas)</option>
            <option value="TURMERIC">Turmeric (Raw/Finger)</option>
            <option value="CHILLI_RED">Chilli Red (Dry)</option>
            <option value="MAIZE">Maize (Makka)</option>
          </select>
        </div>

        {comparison && (
          <div className="text-xs text-slate-500">
            Observation Benchmark: <span className="font-semibold text-slate-800">{comparison.date}</span>
          </div>
        )}
      </div>

      {/* Analysis Callout Card */}
      {comparison && comparison.markets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Highest Modal Rate */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-100/60 p-5 rounded-xl border border-emerald-200 shadow-sm">
            <div className="flex items-center space-x-2 text-emerald-800 mb-2">
              <Award className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold uppercase tracking-wider">Top Benchmark Yard</span>
            </div>
            <div className="text-lg font-bold text-slate-900">
              {comparison.bestModalMarket?.marketName}
            </div>
            <div className="text-2xl font-extrabold text-emerald-800 mt-1">
              ₹{comparison.bestModalMarket?.modalPrice.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-normal text-emerald-700">/ Quintal</span>
            </div>
          </div>

          {/* Inter-Mandi Price Spread */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100/60 p-5 rounded-xl border border-blue-200 shadow-sm">
            <div className="flex items-center space-x-2 text-blue-800 mb-2">
              <Scale className="w-4 h-4 text-blue-700" />
              <span className="text-xs font-bold uppercase tracking-wider">Price Spread</span>
            </div>
            <div className="text-2xl font-extrabold text-blue-900">
              ₹{comparison.priceSpreadInr.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-normal text-blue-700">/ Quintal</span>
            </div>
            <div className="text-xs text-blue-700 mt-1">
              {comparison.priceSpreadPercent}% variation between highest and lowest mandis
            </div>
          </div>

          {/* Haulage Caution Alert */}
          <div className="bg-amber-50 p-5 rounded-xl border border-amber-200 shadow-sm">
            <div className="flex items-center space-x-2 text-amber-800 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold uppercase tracking-wider">Logistics Threshold</span>
            </div>
            <div className="text-xs text-amber-900 leading-relaxed">
              If transport cost to a distant mandi exceeds{' '}
              <span className="font-bold">₹{comparison.priceSpreadInr}/Qtl</span>, selling at your nearest APMC yard yields higher net profit.
            </div>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 text-sm">
            Mandi Price Comparison for {comparison?.commodityName || 'Selected Crop'}
          </h3>
          <span className="text-xs text-slate-500">Sorted by Modal Rate (Highest First)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-600 uppercase font-semibold">
                <th className="py-3 px-4">Rank & Mandi</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Modal Price (Benchmark)</th>
                <th className="py-3 px-4">Per Kg Equivalent</th>
                <th className="py-3 px-4">Auction Range (Min - Max)</th>
                <th className="py-3 px-4">Recorded Arrivals</th>
                <th className="py-3 px-4">Diff from Highest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">Loading comparison...</td>
                </tr>
              ) : !comparison || comparison.markets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">No comparison records found</td>
                </tr>
              ) : (
                comparison.markets.map((m, idx) => {
                  const highest = comparison.bestModalMarket?.modalPrice || m.modalPrice;
                  const diff = highest - m.modalPrice;
                  return (
                    <tr key={m.marketId} className={idx === 0 ? 'bg-emerald-50/40' : 'hover:bg-slate-50/60'}>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center space-x-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          idx === 0 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {idx + 1}
                        </span>
                        <span>{m.marketName}</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">{m.districtName}</td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                        ₹{m.modalPrice.toLocaleString('en-IN')} <span className="text-[11px] font-normal text-slate-500">/ Qtl</span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-emerald-700">
                        ₹{m.modalPricePerKg}/Kg
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        ₹{m.minPrice} &mdash; ₹{m.maxPrice}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {m.arrivals} Qtl
                      </td>

                      <td className="py-3.5 px-4">
                        {idx === 0 ? (
                          <span className="font-bold text-emerald-700 text-xs">Highest Rate</span>
                        ) : (
                          <span className="text-red-600 font-medium">-₹{diff}/Qtl</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
