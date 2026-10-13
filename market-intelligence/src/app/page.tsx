'use client';

import React, { useState } from 'react';
import { Navbar, NavTab } from '@/components/Navbar';
import { OverviewDashboard } from '@/components/OverviewDashboard';
import { LiveMarketPrices } from '@/components/LiveMarketPrices';
import { MarketComparison } from '@/components/MarketComparison';
import { HistoricalTrends } from '@/components/HistoricalTrends';
import { CropInventoryValuation } from '@/components/CropInventoryValuation';
import { AskKisanSathiAgent } from '@/components/AskKisanSathiAgent';
import { DataSourcesAndFreshness } from '@/components/DataSourcesAndFreshness';
import { AdminDataHealth } from '@/components/AdminDataHealth';
import { Sprout, ShieldCheck, Heart } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'overview' && <OverviewDashboard onNavigate={setActiveTab} />}
        {activeTab === 'prices' && <LiveMarketPrices />}
        {activeTab === 'compare' && <MarketComparison />}
        {activeTab === 'trends' && <HistoricalTrends />}
        {activeTab === 'calculator' && <CropInventoryValuation />}
        {activeTab === 'agent' && <AskKisanSathiAgent />}
        {activeTab === 'sources' && <DataSourcesAndFreshness />}
        {activeTab === 'admin' && <AdminDataHealth />}
      </main>

      {/* Official Governance Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                KS
              </div>
              <span className="font-bold text-slate-800 text-sm">Kisan Sathi Market Intelligence</span>
            </div>
            <div className="flex items-center space-x-4 text-slate-600">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero Hallucination Guaranteed</span>
              </span>
              <span>&bull;</span>
              <span>Telangana State Mandi Network</span>
              <span>&bull;</span>
              <span>Kisan Call Center: 1800-180-1551</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-slate-400">
            <p>
              Data Sourced from Agricultural Marketing Information Network (AGMARKNET), Directorate of Marketing & Inspection (DMI), Ministry of Agriculture & Farmers Welfare, Govt of India.
            </p>
            <p className="whitespace-nowrap">
              Built with precision for Indian Farmers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
