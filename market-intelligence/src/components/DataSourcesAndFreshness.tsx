'use client';

import React from 'react';
import { 
  Database, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Activity,
  Layers,
  Key
} from 'lucide-react';

export const DataSourcesAndFreshness: React.FC = () => {
  const sources = [
    {
      id: 'AGMARKNET',
      name: 'Agricultural Marketing Information Network (AGMARKNET)',
      authority: 'Directorate of Marketing & Inspection (DMI), Ministry of Agriculture & Farmers Welfare, GoI',
      portalUrl: 'https://agmarknet.gov.in',
      cadence: 'Daily (Every 24 Hours)',
      authType: 'Official APMC Mandi Daily Bulletins',
      status: 'Active (Primary)',
      latency: '240ms',
      description: 'The national backbone of agricultural marketing intelligence in India, linking over 3,000 regulated markets.'
    },
    {
      id: 'DATA_GOV_IN',
      name: 'Open Government Data Platform India (data.gov.in)',
      authority: 'National Informatics Centre (NIC) / Ministry of Electronics & IT (MeitY), GoI',
      portalUrl: 'https://data.gov.in',
      cadence: 'Daily (Every 24 Hours)',
      authType: 'OGD REST API (API-Key Configured)',
      status: 'Active (API Gateway)',
      latency: '310ms',
      description: 'Open data API portal exposing variety-wise daily market prices and arrivals reported by state APMC committees.'
    },
    {
      id: 'ENAM',
      name: 'National Agriculture Market (e-NAM)',
      authority: 'Small Farmers Agribusiness Consortium (SFAC), Ministry of Agriculture, GoI',
      portalUrl: 'https://www.enam.gov.in',
      cadence: 'Real-time & Daily Aggregates',
      authType: 'Integrated Electronic Mandi Auction Records',
      status: 'Active (Auxiliary)',
      latency: '280ms',
      description: 'Pan-India electronic trading portal networking existing APMC mandis to create a unified national market.'
    },
    {
      id: 'TG_MARKETING',
      name: 'Telangana State Agricultural Marketing Department',
      authority: 'Department of Agriculture & Cooperation, Government of Telangana',
      portalUrl: 'https://tgmarketing.gov.in',
      cadence: 'Daily State Bulletins',
      authType: 'Public State APMC Yard Reports',
      status: 'Active (State Primary)',
      latency: '190ms',
      description: 'Direct state authority regulating the 10 agricultural market committees across Telangana.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Official Government Data Sources & Provenance</h2>
        <p className="text-xs text-slate-500">
          Strict traceability. Every price observation in our platform maps directly to one of these authorized authorities.
        </p>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((s) => (
          <div key={s.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded border border-emerald-200">
                  {s.id}
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-1.5">{s.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{s.authority}</p>
              </div>
              <span className="flex items-center space-x-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{s.status}</span>
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
              {s.description}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1 border-t border-slate-100">
              <div className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Cadence: {s.cadence}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                <span>{s.authType}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs">
              <span className="text-slate-500 flex items-center space-x-1">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>Upstream Latency: {s.latency}</span>
              </span>
              <a
                href={s.portalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 font-semibold hover:text-emerald-800 flex items-center space-x-1"
              >
                <span>Visit Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Freshness Policy Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Clock className="w-4 h-4 text-emerald-600" />
          <span>Ingestion & Freshness Policy</span>
        </h3>
        <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
          <p>
            • <strong>Observation Time vs. Ingestion Time</strong>: We strictly distinguish between the actual date an agricultural lot traded at an APMC yard and the timestamp when our crawler ingested the record. We never treat the ingestion time as the observation date.
          </p>
          <p>
            • <strong>Non-Destructive Historical Preservation</strong>: Overwrites never delete valid historical records. If an official bulletin publishes an updated correction, provenance is updated while preserving the historical audit trail.
          </p>
          <p>
            • <strong>Staleness Threshold</strong>: Records older than 48 hours are automatically badged as stale, warning farmers to exercise caution before transacting.
          </p>
        </div>
      </div>
    </div>
  );
};
