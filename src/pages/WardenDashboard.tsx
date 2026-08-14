import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { LeaveRequest, DigitalPass } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Building, Clock, CheckCircle2, Shield, Activity, Search } from 'lucide-react';
import EmergencyOtpModal from '../components/common/EmergencyOtpModal';
import { DEMO_USERS } from '../constants/mockData';

export const WardenDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [passes, setPasses] = useState<DigitalPass[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [remarks, setRemarks] = useState<{ [key: string]: string }>({});
  const [selectedStudentForOtp, setSelectedStudentForOtp] = useState<string>('');
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpData, setOtpData] = useState<any | null>(null);
  const [otpStudentName, setOtpStudentName] = useState<string>('');

  useEffect(() => {
    const loadData = () => {
      setRequests(dataService.getRequests());
      setPasses(dataService.getPasses());
    };

    loadData();
    const unsubscribe = dataService.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  const [tabFilter, setTabFilter] = useState<'pending' | 'approved' | 'all'>('pending');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleAction = (requestId: string, action: 'APPROVE' | 'REJECT') => {
    if (!currentUser) return;
    const targetReq = requests.find(r => r.id === requestId);
    dataService.approveRequestByAuthority(
      requestId,
      currentUser,
      action,
      remarks[requestId] || (action === 'APPROVE' ? 'Approved by Hostel Warden.' : 'Declined by Warden.')
    );
    if (action === 'APPROVE') {
      setActionSuccess(`Request for ${targetReq?.studentName || 'Student'} approved successfully! Digital Pass issued.`);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  const allHostelRequests = requests.filter(r => {
    const isDayScholar = (r.hostelBlock || '').toLowerCase().includes('day') || r.wardenStatus === ('NOT_APPLICABLE' as any);
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.registerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.requestNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return !isDayScholar && matchesSearch;
  });

  const pendingQueue = allHostelRequests.filter(r => r.status !== 'APPROVED' && r.status !== 'COMPLETED' && r.status !== 'REJECTED' && r.wardenStatus === 'PENDING');
  const approvedList = allHostelRequests.filter(r => r.status === 'APPROVED' || r.wardenStatus === 'APPROVED' || r.status === 'COMPLETED');

  const displayedList = tabFilter === 'pending' ? pendingQueue : tabFilter === 'approved' ? approvedList : allHostelRequests;

  return (
    <div className="space-y-6 text-[#172033] font-sans pb-12">
      {/* Emergency OTP Control Box */}
      {currentUser?.role === 'WARDEN' && (
        <div className="p-5 rounded-xl bg-blue-50 border border-blue-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h4 className="font-bold text-base text-[#1e40af]">Emergency OTP — Warden Direct Action</h4>
              <p className="text-sm text-[#5b6472] mt-0.5">Generate an emergency single-use OTP for a hostel resident.</p>
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

      {/* Success Toast Banner */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-base font-semibold flex items-center space-x-3 shadow-xs">
          <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-1 p-1 bg-slate-200/70 rounded-xl max-w-md">
          <button
            onClick={() => setTabFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              tabFilter === 'pending'
                ? 'bg-white text-[#1e40af] shadow-2xs'
                : 'text-[#5b6472] hover:text-[#172033]'
            }`}
          >
            Pending Approvals ({pendingQueue.length})
          </button>
          <button
            onClick={() => setTabFilter('approved')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              tabFilter === 'approved'
                ? 'bg-white text-[#1e40af] shadow-2xs'
                : 'text-[#5b6472] hover:text-[#172033]'
            }`}
          >
            Approved Passes ({approvedList.length})
          </button>
          <button
            onClick={() => setTabFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              tabFilter === 'all'
                ? 'bg-white text-[#1e40af] shadow-2xs'
                : 'text-[#5b6472] hover:text-[#172033]'
            }`}
          >
            All Records ({allHostelRequests.length})
          </button>
        </div>
      </div>

      {displayedList.length === 0 ? (
        <div className="p-10 text-center text-sm text-[#5b6472] bg-white border border-slate-200 rounded-xl shadow-xs">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <p className="font-bold text-[#172033] text-base">
            {tabFilter === 'pending' ? 'No pending hostel approval requests.' : 'No requests found.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="responsive-table custom-scrollbar">
            <table className="w-full text-left text-sm text-[#172033]">
              <thead className="bg-slate-100 text-[#475569] text-xs font-semibold uppercase tracking-wider border-b border-slate-300">
                <tr>
                  <th className="py-3.5 px-4">Register No</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Hostel / Room</th>
                  <th className="py-3.5 px-4">Date Range</th>
                  <th className="py-3.5 px-4">Destination & Reason</th>
                  <th className="py-3.5 px-4">Pass / Consent Status</th>
                  <th className="py-3.5 px-4 text-right">Actions / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {displayedList.map(req => {
                  const passObj = passes.find(p => p.requestId === req.id);
                  return (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors align-top">
                      <td className="py-4 px-4 font-mono font-bold text-[#1e40af]">{req.registerNumber}</td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-[#172033] text-base">{req.studentName}</div>
                        <div className="text-xs text-[#5b6472]">{req.department}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-[#172033]">{req.hostelBlock}</div>
                        <div className="text-xs text-[#5b6472]">Room {req.roomNumber}</div>
                      </td>
                      <td className="py-4 px-4 text-[#172033]">
                        <div className="font-semibold">{new Date(req.startDate).toLocaleDateString()}</div>
                        <div className="text-xs text-[#5b6472]">to {new Date(req.endDate).toLocaleDateString()}</div>
                      </td>
                      <td className="py-4 px-4 max-w-xs">
                        <div className="font-bold text-[#172033]">{req.destination}</div>
                        <div className="text-xs text-[#5b6472]">{req.reason}</div>
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={req.parentStatus || 'PENDING'} size="sm" />
                      </td>
                      <td className="py-4 px-4">
                        {req.wardenStatus === 'PENDING' && req.status !== 'APPROVED' ? (
                          <div className="flex flex-wrap justify-end gap-2">
                            <button
                              onClick={() => handleAction(req.id, 'REJECT')}
                              className="rounded-lg bg-rose-600 hover:bg-rose-700 px-3.5 py-2 text-sm font-semibold text-white transition-colors cursor-pointer"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => handleAction(req.id, 'APPROVE')}
                              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-sm font-semibold text-white transition-colors cursor-pointer"
                            >
                              Approve
                            </button>
                          </div>
                        ) : (
                          <div className="text-right">
                            <span className="inline-block px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold text-xs">
                              ✓ {req.status === 'APPROVED' ? 'APPROVED & PASS ISSUED' : req.status}
                            </span>
                            {passObj && (
                              <p className="text-xs font-mono text-[#1e40af] mt-1 font-semibold">{passObj.passNumber}</p>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
