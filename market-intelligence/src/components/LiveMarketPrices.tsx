'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { MarketObservation } from '@/lib/types';

export const LiveMarketPrices: React.FC = () => {
  const [records, setRecords] = useState<MarketObservation[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [commodityId, setCommodityId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [marketId, setMarketId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const fetchPrices = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (commodityId) params.set('commodityId', commodityId);
      if (districtId) params.set('districtId', districtId);
      if (marketId) params.set('marketId', marketId);
      params.set('limit', pageSize.toString());
      params.set('offset', (page * pageSize).toString());

      const res = await fetch(`/api/prices/latest?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.records || []);
        setTotal(data.total || 0);
      } else {
        setError(data.error || 'Failed to fetch prices');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [commodityId, districtId, marketId, page]);

  // Client-side text search filter
  const filteredRecords = records.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.commodityName.toLowerCase().includes(q) ||
      r.marketName.toLowerCase().includes(q) ||
      (r.districtName && r.districtName.toLowerCase().includes(q)) ||
      r.variety.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Description */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Live & Historical Mandi Price Directory</h2>
          <p className="text-xs text-slate-500">
            Official daily wholesale auction records from Telangana APMC yards (State Scope: 10 Districts)
          </p>
        </div>
        <button
          onClick={fetchPrices}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-sm transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search crop, mandi, district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Commodity Dropdown */}
          <select
            value={commodityId}
            onChange={(e) => { setCommodityId(e.target.value); setPage(0); }}
            className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Tracked Commodities</option>
            <option value="PADDY_COMMON">Paddy(Dhan)(Common)</option>
            <option value="PADDY_GRADE_A">Paddy(Dhan)(Grade A)</option>
            <option value="COTTON">Cotton(Kapas)</option>
            <option value="TURMERIC">Turmeric(Raw/Finger)</option>
            <option value="CHILLI_RED">Chilli Red(Dry)</option>
            <option value="MAIZE">Maize(Makka)</option>
            <option value="BENGAL_GRAM">Bengal Gram(Gram)(Whole)</option>
            <option value="RED_GRAM">Red Gram(Arhar/Tur)</option>
            <option value="SOYABEAN">Soyabean</option>
          </select>

          {/* District Dropdown */}
          <select
            value={districtId}
            onChange={(e) => { setDistrictId(e.target.value); setPage(0); }}
            className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Telangana Districts</option>
            <option value="TG_WARANGAL">Warangal</option>
            <option value="TG_NIZAMABAD">Nizamabad</option>
            <option value="TG_RANGAREDDY">Rangareddy</option>
            <option value="TG_KHAMMAM">Khammam</option>
            <option value="TG_KARIMNAGAR">Karimnagar</option>
            <option value="TG_SURYAPET">Suryapet</option>
            <option value="TG_MAHABUBNAGAR">Mahabubnagar</option>
          </select>

          {/* Market Dropdown */}
          <select
            value={marketId}
            onChange={(e) => { setMarketId(e.target.value); setPage(0); }}
            className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All APMC Mandis</option>
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

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-800 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>Error loading price data: {error}</span>
        </div>
      )}

      {/* Price Observations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <th className="py-3 px-4">Commodity & Variety</th>
                <th className="py-3 px-4">Market & District</th>
                <th className="py-3 px-4">Observation Date</th>
                <th className="py-3 px-4">Modal Price (Benchmark)</th>
                <th className="py-3 px-4">Auction Range (Min - Max)</th>
                <th className="py-3 px-4">Arrivals</th>
                <th className="py-3 px-4">Source & Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                    <span>Loading verified observations...</span>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                    <span className="font-semibold">No price records found for this query</span>
                    <p className="text-xs text-slate-400 mt-1">Try resetting the commodity or market filter</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, i) => (
                  <tr key={r.id || i} className="hover:bg-slate-50/80 transition-colors">
                    {/* Commodity */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{r.commodityName}</div>
                      <div className="text-[11px] text-slate-500">{r.variety} &bull; {r.grade}</div>
                    </td>

                    {/* Market & District */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{r.marketName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">{r.districtName}, Telangana</div>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{r.observationDate}</span>
                      </div>
                    </td>

                    {/* Modal Price */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-900">₹{r.modalPrice.toLocaleString('en-IN')}</span>
                      <span className="text-[11px] text-slate-500 ml-1">/ Qtl</span>
                      <div className="text-[11px] font-medium text-emerald-700">₹{r.modalPricePerKg}/Kg</div>
                    </td>

                    {/* Range */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      <span>₹{r.minPrice.toLocaleString('en-IN')} &mdash; ₹{r.maxPrice.toLocaleString('en-IN')}</span>
                    </td>

                    {/* Arrivals */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      {r.arrivalsQuantity > 0 ? `${r.arrivalsQuantity.toLocaleString('en-IN')} ${r.arrivalsUnit}` : 'N/A'}
                    </td>

                    {/* Source */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>{r.sourceId}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing <span className="font-semibold">{Math.min(total, page * pageSize + 1)}</span> to{' '}
            <span className="font-semibold">{Math.min(total, (page + 1) * pageSize)}</span> of{' '}
            <span className="font-semibold">{total}</span> observations
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs disabled:opacity-50 hover:bg-slate-100"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={(page + 1) * pageSize >= total}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs disabled:opacity-50 hover:bg-slate-100"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
