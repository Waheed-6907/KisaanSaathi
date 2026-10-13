'use client';

import React from 'react';
import { 
  Sprout, 
  TrendingUp, 
  Scale, 
  Calculator, 
  Bot, 
  Database, 
  Activity, 
  Layers
} from 'lucide-react';

export type NavTab = 
  | 'overview' 
  | 'prices' 
  | 'compare' 
  | 'trends' 
  | 'calculator' 
  | 'agent' 
  | 'sources' 
  | 'admin';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'overview' as NavTab, label: 'Overview', icon: Layers },
    { id: 'prices' as NavTab, label: 'Live Mandi Prices', icon: Sprout },
    { id: 'compare' as NavTab, label: 'Compare Mandis', icon: Scale },
    { id: 'trends' as NavTab, label: 'Historical Trends', icon: TrendingUp },
    { id: 'calculator' as NavTab, label: 'Net Return Calc', icon: Calculator },
    { id: 'agent' as NavTab, label: 'Ask Kisan Sathi AI', icon: Bot, highlight: true },
    { id: 'sources' as NavTab, label: 'Data Sources', icon: Database },
    { id: 'admin' as NavTab, label: 'Data Health & Sync', icon: Activity },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange('overview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">Kisan Sathi</span>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                  Market Intel
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Verified Agricultural Pricing &bull; Telangana & Pan-India
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="hidden lg:flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium">AGMARKNET Live Connected</span>
            </div>
            <div className="text-xs text-slate-500">
              State: <span className="font-semibold text-slate-700">Telangana (10 Mandis)</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? tab.highlight 
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-900 text-white shadow-sm'
                    : tab.highlight
                      ? 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.highlight ? 'text-emerald-600' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
