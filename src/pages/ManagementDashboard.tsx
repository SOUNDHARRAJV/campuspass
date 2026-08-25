import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { SystemAnalytics, LeaveRequest, GateLog } from '../types';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  ShieldCheck,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  Calendar,
  Filter
} from 'lucide-react';

export const ManagementDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<SystemAnalytics>(dataService.getAnalytics());
  const [requests, setRequests] = useState<LeaveRequest[]>(dataService.getRequests());
  const [gateLogs, setGateLogs] = useState<GateLog[]>(dataService.getGateLogs());
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'LEAVE' | 'OD' | 'EXCEPTION'>('ALL');

  useEffect(() => {
    const handleUpdate = () => {
      setAnalytics(dataService.getAnalytics());
      setRequests(dataService.getRequests());
      setGateLogs(dataService.getGateLogs());
    };

    handleUpdate();
    const unsubscribe = dataService.subscribe(handleUpdate);
    return () => unsubscribe();
  }, []);

  const filteredRequests = requests.filter(r => {
    if (selectedFilter === 'ALL') return true;
    return r.type === selectedFilter;
  });

  const totalDecided = requests.filter(r => r.status !== 'SUBMITTED' && r.status !== 'PARENT_PENDING').length || 1;
  const approvedCount = requests.filter(r => r.status === 'APPROVED' || r.status === 'COMPLETED' || r.status === 'ACTIVE' || r.status === 'EXITED').length;
  const rejectedCount = requests.filter(r => r.status === 'REJECTED' || r.status === 'PARENT_REJECTED').length;
  const calculatedApprovalRate = Math.round((approvedCount / (approvedCount + rejectedCount || 1)) * 100);
  const calculatedRejectionRate = Math.round((rejectedCount / (approvedCount + rejectedCount || 1)) * 100);

  // Approval aging calculation
  const pendingRequests = requests.filter(r => ['SUBMITTED', 'PARENT_PENDING', 'HOD_PENDING', 'WARDEN_PENDING', 'APPROVAL_PENDING'].includes(r.status));
  const normalAging = pendingRequests.filter(r => {
    const hours = (Date.now() - new Date(r.createdAt).getTime()) / 3600000;
    return hours < 12;
  }).length;
  const attentionAging = pendingRequests.filter(r => {
    const hours = (Date.now() - new Date(r.createdAt).getTime()) / 3600000;
    return hours >= 12 && hours < 24;
  }).length;
  const delayedAging = pendingRequests.filter(r => {
    const hours = (Date.now() - new Date(r.createdAt).getTime()) / 3600000;
    return hours >= 24;
  }).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
            Institutional Operational Analytics
          </h1>
          <p className="text-sm font-medium text-[#5b6472] mt-1">
            Realtime campus leave, outpass, approval pipeline, and security metrics for executive management oversight.
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => dataService.exportToCsv('REQUESTS')}
            className="h-10 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-[#172033] text-sm font-bold flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Primary Key Performance Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Requests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5b6472] uppercase tracking-wider">Total Requests</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#172033]">{requests.length}</div>
          <p className="text-xs text-[#5b6472] font-medium">Submitted across all departments</p>
        </div>

        {/* Approval Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5b6472] uppercase tracking-wider">Approval Rate</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#172033]">{calculatedApprovalRate}%</div>
          <p className="text-xs text-[#5b6472] font-medium">{approvedCount} approved out of {approvedCount + rejectedCount}</p>
        </div>

        {/* Rejection Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5b6472] uppercase tracking-wider">Rejection Rate</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#172033]">{calculatedRejectionRate}%</div>
          <p className="text-xs text-[#5b6472] font-medium">{rejectedCount} declined by parent/mentor/warden</p>
        </div>

        {/* Students Currently Outside */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5b6472] uppercase tracking-wider">Currently Outside</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#172033]">{analytics.activeOutsideCampus}</div>
          <p className="text-xs text-[#5b6472] font-medium">Exited campus & pending return</p>
        </div>
      </div>

      {/* Approval Aging & Bottleneck Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#172033]">Approval Pipeline Aging</h2>
              <p className="text-xs font-medium text-[#5b6472]">Categorized by response latency for active pending tasks</p>
            </div>
            <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-[#172033]">
              {pendingRequests.length} Pending
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1">
              <div className="flex items-center space-x-2 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Normal (&lt; 12 hrs)</span>
              </div>
              <div className="text-2xl font-bold text-emerald-900">{normalAging}</div>
              <p className="text-[11px] text-emerald-700 font-medium">On track for prompt processing</p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
              <div className="flex items-center space-x-2 text-amber-800 text-xs font-bold">
                <Clock className="w-4 h-4" />
                <span>Attention (12–24 hrs)</span>
              </div>
              <div className="text-2xl font-bold text-amber-900">{attentionAging}</div>
              <p className="text-[11px] text-amber-700 font-medium">Requires approver nudge</p>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-1">
              <div className="flex items-center space-x-2 text-rose-800 text-xs font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Delayed (&gt; 24 hrs)</span>
              </div>
              <div className="text-2xl font-bold text-rose-900">{delayedAging}</div>
              <p className="text-[11px] text-rose-700 font-medium">Critical approval bottleneck</p>
            </div>
          </div>
        </div>

        {/* Requests by Category */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-[#172033]">Request Distribution</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold text-[#172033] mb-1">
                <span>Standard Outpass & Leave</span>
                <span>{requests.filter(r => r.type === 'LEAVE').length}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (requests.filter(r => r.type === 'LEAVE').length / (requests.length || 1)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-[#172033] mb-1">
                <span>Official Duty (OD)</span>
                <span>{requests.filter(r => r.type === 'OD').length}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (requests.filter(r => r.type === 'OD').length / (requests.length || 1)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-[#172033] mb-1">
                <span>Exception & Emergency</span>
                <span>{requests.filter(r => r.type === 'EXCEPTION' || r.isException).length}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-amber-600 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (requests.filter(r => r.type === 'EXCEPTION' || r.isException).length / (requests.length || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-[#172033]">Live Request Audit Stream</h2>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedFilter}
              onChange={e => setSelectedFilter(e.target.value as any)}
              className="h-9 bg-white border border-slate-300 rounded-lg px-3 text-xs font-bold text-[#172033] focus:outline-none focus:border-blue-600"
            >
              <option value="ALL">All Request Types</option>
              <option value="LEAVE">Leave Requests</option>
              <option value="OD">Official Duty (OD)</option>
              <option value="EXCEPTION">Exceptions</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#172033]">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-[#5b6472] border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Request Ref</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Date Window</th>
                <th className="py-3 px-4">Current Stage</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 font-medium">
                    No requests found matching current filter.
                  </td>
                </tr>
              ) : (
                filteredRequests.slice(0, 10).map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-xs text-blue-700">{req.requestNumber}</td>
                    <td className="py-3 px-4 font-bold">
                      <div>{req.studentName}</div>
                      <div className="text-xs text-slate-400 font-normal">{req.registerNumber} • {req.department}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-800">
                        {req.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-[150px] truncate">{req.destination}</td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {new Date(req.startDate).toLocaleDateString()} – {new Date(req.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-600">{req.currentStage}</td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
                          req.status === 'APPROVED' || req.status === 'COMPLETED' || req.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'REJECTED' || req.status === 'PARENT_REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
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
