'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar, 
  MapPin, 
  ShieldCheck,
  Activity
} from 'lucide-react';
import { PriceTrendResult } from '@/lib/types';

export const HistoricalTrends: React.FC = () => {
  const [commodityId, setCommodityId] = useState('PADDY_COMMON');
  const [marketId, setMarketId] = useState('TG_MKT_ENUMAMULA');
  const [trendData, setTrendData] = useState<PriceTrendResult | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTrend = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/prices/history?commodityId=${commodityId}&marketId=${marketId}`);
      const data = await res.json();
      if (data.success) {
        setTrendData(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrend();
  }, [commodityId, marketId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Historical Price Trends & Movement</h2>
        <p className="text-xs text-slate-500">
          Verified historical observations across Telangana yards. Deliberately unpolluted by speculative AI forecasting.
        </p>
      </div>

      {/* Selectors */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Select Crop:</label>
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
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Select Mandi Yard:</label>
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
      </div>

      {/* Trend Summary Cards */}
      {trendData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Trend Direction */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 mb-1">7-Day Trajectory</div>
            <div className="flex items-center space-x-2">
              {trendData.trendDirection === 'UP' ? (
                <>
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span className="text-lg font-bold text-emerald-700">Upward ({trendData.change7dPercent}%)</span>
                </>
              ) : trendData.trendDirection === 'DOWN' ? (
                <>
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <span className="text-lg font-bold text-red-700">Downward ({trendData.change7dPercent}%)</span>
                </>
              ) : (
                <>
                  <Minus className="w-5 h-5 text-slate-600" />
                  <span className="text-lg font-bold text-slate-700">Stable ({trendData.change7dPercent || 0}%)</span>
                </>
              )}
            </div>
          </div>

          {/* Average Modal Rate */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 mb-1">Average Modal Price</div>
            <div className="text-xl font-bold text-slate-900">
              ₹{trendData.averageModalPrice.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-normal text-slate-500">/ Qtl</span>
            </div>
          </div>

          {/* Period High */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 mb-1">Period Highest</div>
            <div className="text-xl font-bold text-emerald-700">
              ₹{trendData.highestPriceInPeriod.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-normal text-slate-500">/ Qtl</span>
            </div>
          </div>

          {/* Period Low */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 mb-1">Period Lowest</div>
            <div className="text-xl font-bold text-slate-700">
              ₹{trendData.lowestPriceInPeriod.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-normal text-slate-500">/ Qtl</span>
            </div>
          </div>
        </div>
      )}

      {/* Visual Timeline Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900">
            Observed Price Trajectory: {trendData?.commodityName} at {trendData?.marketName}
          </h3>
          <span className="text-xs text-slate-500">
            Data Points: {trendData?.dataPointsCount || 0} Records
          </span>
        </div>

        {/* Lightweight SVG Timeline Visualizer */}
        {trendData && trendData.observations.length > 0 ? (
          <div className="space-y-4">
            <div className="h-44 flex items-end space-x-4 pt-6 px-4 bg-slate-50 rounded-xl border border-slate-100">
              {trendData.observations.map((obs, idx) => {
                const maxInSet = trendData.highestPriceInPeriod * 1.05;
                const minInSet = trendData.lowestPriceInPeriod * 0.95;
                const range = maxInSet - minInSet || 1;
                const heightPercent = Math.max(20, Math.min(95, ((obs.modalPrice - minInSet) / range) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <span className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                      ₹{obs.modalPrice}
                    </span>
                    <div 
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[48px] bg-emerald-600 rounded-t-md hover:bg-emerald-500 transition-all cursor-pointer relative shadow-sm"
                    ></div>
                    <span className="text-[10px] text-slate-500 mt-2 whitespace-nowrap">
                      {obs.date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Observations Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 uppercase font-semibold">
                    <th className="py-2.5 px-4">Observation Date</th>
                    <th className="py-2.5 px-4">Modal Price</th>
                    <th className="py-2.5 px-4">Per Kg Equivalent</th>
                    <th className="py-2.5 px-4">Min Price</th>
                    <th className="py-2.5 px-4">Max Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {trendData.observations.map((obs, i) => (
                    <tr key={i} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-4 font-medium text-slate-800">{obs.date}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">₹{obs.modalPrice}/Qtl</td>
                      <td className="py-2.5 px-4 text-emerald-700 font-semibold">₹{(obs.modalPrice / 100).toFixed(2)}/Kg</td>
                      <td className="py-2.5 px-4 text-slate-600">₹{obs.minPrice}</td>
                      <td className="py-2.5 px-4 text-slate-600">₹{obs.maxPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500">
            No historical trend records found for this selection.
          </div>
        )}
      </div>
    </div>
  );
};
