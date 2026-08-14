import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { LeaveRequest } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { CheckCircle2, Search } from 'lucide-react';

export const AdvisorDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadRequests = () => {
      setRequests(dataService.getRequests());
    };

    loadRequests();
    const unsubscribe = dataService.subscribe(loadRequests);
    return () => unsubscribe();
  }, []);

  const handleAction = (requestId: string, action: 'APPROVE' | 'REJECT') => {
    if (!currentUser) return;
    dataService.approveRequestByAuthority(
      requestId,
      currentUser,
      action,
      action === 'APPROVE' ? 'Approved by Faculty Advisor.' : 'Declined by Faculty Advisor.'
    );
  };

  const pendingRequests = requests.filter(r => {
    const isDayScholar = (r.hostelBlock || '').toLowerCase().includes('day') || r.wardenStatus === ('NOT_APPLICABLE' as any);
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.registerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.requestNumber.toLowerCase().includes(searchTerm.toLowerCase());

    return isDayScholar && (r.status === 'APPROVAL_PENDING' || r.advisorStatus === 'PENDING') && matchesSearch;
  });

  return (
    <div className="space-y-6 text-[#172033] font-sans pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#172033]">Faculty Advisor Approval Queue</h1>
          <p className="text-sm sm:text-base text-[#5b6472] mt-1">Review student leave & OD requests under your mentorship batch.</p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by student name or register number..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-11 bg-white border border-slate-300 rounded-lg pl-10 pr-4 text-sm sm:text-base text-[#172033] placeholder-slate-400 focus:outline-none focus:border-blue-600 font-medium"
          />
        </div>
      </div>

      {pendingRequests.length === 0 ? (
        <div className="p-10 text-center text-sm text-[#5b6472] bg-white border border-slate-200 rounded-xl shadow-xs">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <p className="font-bold text-[#172033] text-base">No pending faculty advisor requests.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="responsive-table custom-scrollbar">
            <table className="w-full text-left text-sm text-[#172033]">
              <thead className="bg-slate-100 text-[#475569] text-xs font-semibold uppercase tracking-wider border-b border-slate-300">
                <tr>
                  <th className="py-3.5 px-4">Register No</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Request Type</th>
                  <th className="py-3.5 px-4">Date Range</th>
                  <th className="py-3.5 px-4">Destination & Reason</th>
                  <th className="py-3.5 px-4">Parent Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pendingRequests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors align-top">
                    <td className="py-4 px-4 font-mono font-bold text-[#1e40af]">{req.registerNumber}</td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-[#172033] text-base">{req.studentName}</div>
                      <div className="text-xs text-[#5b6472]">{req.department}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-block rounded px-2.5 py-1 text-xs font-mono font-bold bg-blue-50 text-[#1e40af] border border-blue-200 uppercase">{req.type}</span>
                      <div className="mt-1 font-semibold text-xs text-[#5b6472]">{req.requestNumber}</div>
                    </td>
                    <td className="py-4 px-4 text-[#172033]">
                      <div className="font-semibold">{new Date(req.startDate).toLocaleDateString()}</div>
                      <div className="text-xs text-[#5b6472]">to {new Date(req.endDate).toLocaleDateString()}</div>
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <div className="font-bold text-[#172033]">{req.destination}</div>
                      <div className="text-xs text-[#5b6472] line-clamp-2">{req.reason}</div>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={req.parentStatus || 'PENDING'} size="sm" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          onClick={() => handleAction(req.id, 'REJECT')}
                          className="rounded-lg bg-rose-600 hover:bg-rose-700 px-3.5 py-2 text-sm font-semibold text-white transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleAction(req.id, 'APPROVE')}
                          className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-sm font-semibold text-white transition-colors"
                        >
                          Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
