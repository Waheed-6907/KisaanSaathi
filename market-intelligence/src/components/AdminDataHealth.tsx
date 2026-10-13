'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  Layers,
  Terminal
} from 'lucide-react';
import { IngestionJobResult, DataQualityIssue } from '@/lib/types';

export const AdminDataHealth: React.FC = () => {
  const [jobs, setJobs] = useState<IngestionJobResult[]>([]);
  const [issues, setIssues] = useState<DataQualityIssue[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<IngestionJobResult | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/data-quality/issues');
      const data = await res.json();
      if (data.success) {
        setJobs(data.recentJobs || []);
        setIssues(data.issues || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const triggerSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/ingestion/trigger', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncResult(data.job);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Trigger Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            <span>Admin Data Health & Ingestion Pipeline</span>
          </h2>
          <p className="text-xs text-slate-500">
            Pipeline observability, idempotent sync execution logs, and automated data quality audits.
          </p>
        </div>

        <button
          onClick={triggerSync}
          disabled={syncing}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm transition"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Running Ingestion Pipeline...' : 'Trigger Ingestion Sync Now'}</span>
        </button>
      </div>

      {/* Sync Execution Summary Alert */}
      {syncResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs space-y-2">
          <div className="flex items-center space-x-2 font-bold text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Ingestion Pipeline Completed Successfully!</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700">
            <div>Job ID: <span className="font-mono">{syncResult.jobId}</span></div>
            <div>Retrieved: <span className="font-bold">{syncResult.recordsRetrieved}</span></div>
            <div>Upserted: <span className="font-bold text-emerald-700">{syncResult.recordsUpserted}</span></div>
            <div>Execution Time: <span className="font-bold">{syncResult.durationMs}ms</span></div>
          </div>
        </div>
      )}

      {/* Recent Ingestion Jobs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 text-sm">Ingestion Execution History</h3>
          <span className="text-xs text-slate-500">Idempotent Pipeline Runs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Job ID</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Retrieved</th>
                <th className="py-3 px-4">Upserted</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Completed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-400">No jobs recorded yet</td>
                </tr>
              ) : (
                jobs.map((j) => (
                  <tr key={j.jobId} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">{j.jobId}</td>
                    <td className="py-3 px-4">{j.sourceId}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        j.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {j.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">{j.recordsRetrieved}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">{j.recordsUpserted}</td>
                    <td className="py-3 px-4">{j.durationMs}ms</td>
                    <td className="py-3 px-4 text-slate-500">{new Date(j.completedAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Quality Issues Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Data Quality Anomaly Audit Logs</span>
          </h3>
          <span className="text-xs text-slate-500">
            {issues.length} Issues Flagged by Automated Auditor
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Issue Type</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Audit Details</th>
                <th className="py-3 px-4">Detected Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {issues.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-slate-400">
                    ✔ Clean audit: Zero data quality anomalies detected in current active set
                  </td>
                </tr>
              ) : (
                issues.map((iss) => (
                  <tr key={iss.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">{iss.issueType}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        iss.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        iss.severity === 'error' ? 'bg-orange-100 text-orange-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {iss.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {JSON.stringify(iss.details)}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{new Date(iss.detectedAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
