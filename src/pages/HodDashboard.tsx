import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { LeaveRequest } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EAttestationModal } from '../components/common/EAttestationModal';
import { CheckCircle2, Search } from 'lucide-react';

export const HodDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [selectedExceptionReq, setSelectedExceptionReq] = useState<LeaveRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'PENDING' | 'EXCEPTION' | 'ALL'>('PENDING');

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
      action === 'APPROVE' ? 'Approved by Mentor / HOD.' : 'Declined by Mentor / HOD.'
    );
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.registerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'PENDING') {
      return r.status === 'APPROVAL_PENDING' || r.hodStatus === 'PENDING';
    }
    if (activeTab === 'EXCEPTION') {
      return (r.type === 'EXCEPTION' || r.isException) && r.status === 'APPROVAL_PENDING';
    }
    return true;
  });

  const pendingCount = requests.filter(r => r.status === 'APPROVAL_PENDING' || r.hodStatus === 'PENDING').length;
  const exceptionCount = requests.filter(r => (r.type === 'EXCEPTION' || r.isException) && r.status === 'APPROVAL_PENDING').length;

  return (
    <div className="space-y-6 text-[#172033] font-sans pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#172033]">Department Mentor & HOD Approval Queue</h1>
          <p className="text-sm sm:text-base text-[#5b6472] mt-1">Review leave applications, OD submissions, and exception attestations.</p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-lg border border-slate-300 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-4 py-2 rounded-md transition-all ${activeTab === 'PENDING' ? 'bg-white text-[#1e40af] shadow-xs font-bold' : 'text-[#5b6472]'}`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab('EXCEPTION')}
            className={`px-4 py-2 rounded-md transition-all ${activeTab === 'EXCEPTION' ? 'bg-white text-[#1e40af] shadow-xs font-bold' : 'text-[#5b6472]'}`}
          >
            Exceptions ({exceptionCount})
          </button>
        </div>
      </div>

      <div className="relative w-full sm:w-96">
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search by student name, ID or reason..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full h-11 bg-white border border-slate-300 rounded-lg pl-10 pr-4 text-sm sm:text-base text-[#172033] placeholder-slate-400 focus:outline-none focus:border-blue-600 font-medium"
        />
      </div>

      {filteredRequests.length === 0 ? (
        <div className="p-10 text-center text-sm text-[#5b6472] bg-white border border-slate-200 rounded-xl shadow-xs">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <p className="font-bold text-[#172033] text-base">No matching department requests found.</p>
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
                  <th className="py-3.5 px-4">Purpose & Reason</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRequests.map(req => (
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
                      <StatusBadge status={req.status} size="sm" />
                    </td>
                    <td className="py-4 px-4">
                      {(req.type === 'EXCEPTION' || req.isException) && req.status === 'APPROVAL_PENDING' ? (
                        <div className="flex justify-end">
                          <button
                            onClick={() => setSelectedExceptionReq(req)}
                            className="rounded-lg bg-[#1e40af] hover:bg-blue-800 px-4 py-2 text-sm font-semibold text-white transition-colors"
                          >
                            Review
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
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
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedExceptionReq && (
        <EAttestationModal
          isOpen={Boolean(selectedExceptionReq)}
          onClose={() => setSelectedExceptionReq(null)}
          request={selectedExceptionReq}
        />
      )}
    </div>
  );
};
