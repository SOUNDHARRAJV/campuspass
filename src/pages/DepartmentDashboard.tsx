import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { LeaveRequest } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EAttestationModal } from '../components/common/EAttestationModal';
import { DEMO_USERS } from '../constants/mockData';
import {
  Building,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  FileText,
  AlertTriangle,
  Users,
  Check
} from 'lucide-react';
import EmergencyOtpModal from '../components/common/EmergencyOtpModal';

export const DepartmentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'MENTOR' | 'EXCEPTIONS' | 'ROSTER'>('MENTOR');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExceptionReq, setSelectedExceptionReq] = useState<LeaveRequest | null>(null);
  const [selectedStudentForOtp, setSelectedStudentForOtp] = useState<string>('');
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpData, setOtpData] = useState<any | null>(null);
  const [otpStudentName, setOtpStudentName] = useState<string>('');

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
    const roleTitle = currentUser.role === 'HOD' ? 'Head of Department (HOD)' : 'Faculty Mentor / Advisor';
    dataService.approveRequestByAuthority(
      requestId,
      currentUser,
      action,
      action === 'APPROVE' ? `Approved by ${roleTitle}.` : `Declined by ${roleTitle}.`
    );
  };

  const mentorPendingRequests = requests.filter(r => {
    const isDayScholar = (r.hostelBlock || '').toLowerCase().includes('day') || r.wardenStatus === ('NOT_APPLICABLE' as any);
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.registerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.requestNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const isPending = r.status !== 'APPROVED' && r.status !== 'COMPLETED' && r.status !== 'REJECTED' && r.advisorStatus === 'PENDING';
    return isDayScholar && isPending && matchesSearch;
  });

  const hodExceptionQueue = requests.filter(r => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.registerNumber.toLowerCase().includes(searchTerm.toLowerCase());

    return (r.type === 'EXCEPTION' || r.isException) && r.status === 'APPROVAL_PENDING' && matchesSearch;
  });

  return (
    <div className="space-y-6 text-[#172033] font-sans pb-12">
      {/* Emergency OTP Control Box */}
      {currentUser?.role === 'ADVISOR' && (
        <div className="p-5 rounded-xl bg-blue-50 border border-blue-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h4 className="font-bold text-base text-[#1e40af]">Emergency OTP — Mentor Direct Action</h4>
              <p className="text-sm text-[#5b6472] mt-0.5">Generate an emergency single-use OTP for a student in an urgent scenario.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <select
                className="w-full sm:w-64 h-11 bg-white border border-slate-300 rounded-lg px-3 text-sm text-[#172033] font-semibold"
                onChange={e => setSelectedStudentForOtp(e.target.value)}
                value={selectedStudentForOtp}
              >
                <option value="">Select student...</option>
                {Object.values(DEMO_USERS).filter(u => u.role === 'STUDENT').map(s => (
                  <option key={s.id} value={s.id}>{s.name} • {s.registerNumber}</option>
                ))}
              </select>

              <button
                onClick={() => {
                  if (!currentUser) return;
                  if (!selectedStudentForOtp) {
                    alert('Select a student first');
                    return;
                  }
                  try {
                    const res = dataService.requestEmergencyOtpForStudent(selectedStudentForOtp, currentUser);
                    if (res.status === 'CREATED' || res.status === 'EXISTS') {
                      setOtpData(res.otp);
                      setOtpStudentName(requests.find(r => r.studentId === selectedStudentForOtp)?.studentName || '');
                      setOtpModalOpen(true);
                    }
                  } catch (err: any) {
                    alert(err.message || 'Failed to request emergency OTP');
                  }
                }}
                className="w-full sm:w-auto h-11 rounded-lg bg-[#1e40af] hover:bg-blue-800 text-white px-4 text-sm font-semibold shadow-xs shrink-0"
              >
                Request Emergency OTP
              </button>
            </div>
          </div>
        </div>
      )}

      <EmergencyOtpModal isOpen={otpModalOpen} onClose={() => setOtpModalOpen(false)} otp={otpData} studentName={otpStudentName} />

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#172033]">Department Approval Queue</h1>
          <p className="text-sm sm:text-base text-[#5b6472] mt-1">Review student leave, OD applications and exception approvals.</p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-lg border border-slate-300 text-sm font-semibold w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('MENTOR')}
            className={`px-4 py-2 rounded-md transition-all ${activeTab === 'MENTOR' ? 'bg-white text-[#1e40af] shadow-xs font-bold' : 'text-[#5b6472]'}`}
          >
            Pending Requests ({mentorPendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('EXCEPTIONS')}
            className={`px-4 py-2 rounded-md transition-all ${activeTab === 'EXCEPTIONS' ? 'bg-white text-[#1e40af] shadow-xs font-bold' : 'text-[#5b6472]'}`}
          >
            Exceptions ({hodExceptionQueue.length})
          </button>
        </div>
      </div>

      {activeTab === 'MENTOR' && (
        <div className="space-y-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by student name, ID or request number..."
              className="w-full h-11 bg-white border border-slate-300 rounded-lg pl-10 pr-4 text-sm sm:text-base text-[#172033] placeholder-slate-400 focus:outline-none focus:border-blue-600 font-medium"
            />
          </div>

          {mentorPendingRequests.length === 0 ? (
            <div className="p-10 text-center text-sm text-[#5b6472] bg-white border border-slate-200 rounded-xl shadow-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="font-bold text-[#172033] text-base">No pending department requests.</p>
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
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {mentorPendingRequests.map(req => (
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
                          <div className="text-xs text-[#5b6472] line-clamp-2 mt-0.5">{req.reason}</div>
                          {req.parentStatus === 'PENDING' && (
                            <div className="mt-1 text-xs text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">Parent Consent Pending</div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {/* Section 8 Buttons */}
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
      )}

      {activeTab === 'EXCEPTIONS' && (
        <div className="space-y-4">
          {hodExceptionQueue.length === 0 ? (
            <div className="p-10 text-center text-sm text-[#5b6472] bg-white border border-slate-200 rounded-xl shadow-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="font-bold text-[#172033] text-base">No exception requests pending approval.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
              <div className="responsive-table custom-scrollbar">
                <table className="w-full text-left text-sm text-[#172033]">
                  <thead className="bg-slate-100 text-[#475569] text-xs font-semibold uppercase tracking-wider border-b border-slate-300">
                    <tr>
                      <th className="py-3.5 px-4">Register No</th>
                      <th className="py-3.5 px-4">Student Name</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">Reason / Destination</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {hodExceptionQueue.map(req => (
                      <tr key={req.id} className="hover:bg-slate-50 transition-colors align-top">
                        <td className="py-4 px-4 font-mono font-bold text-[#1e40af]">{req.registerNumber}</td>
                        <td className="py-4 px-4 font-bold text-[#172033]">{req.studentName}</td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-purple-50 text-purple-900 border border-purple-200 uppercase">{req.type}</span>
                        </td>
                        <td className="py-4 px-4 max-w-xs">
                          <div className="font-bold text-[#172033]">{req.destination}</div>
                          <div className="text-xs text-[#5b6472]">{req.reason}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-end">
                            <button
                              onClick={() => setSelectedExceptionReq(req)}
                              className="rounded-lg bg-[#1e40af] hover:bg-blue-800 px-4 py-2 text-sm font-semibold text-white transition-colors"
                            >
                              Review & Attest
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
