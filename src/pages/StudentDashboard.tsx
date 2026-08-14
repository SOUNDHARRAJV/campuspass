import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { LeaveRequest, DigitalPass } from '../types';
import { GlassModal } from '../components/ui/GlassModal';
import { DigitalPassCard } from '../components/common/DigitalPassCard';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmergencyOtpInputModal } from '../components/common/EmergencyOtpInputModal';
import {
  Filter,
  ChevronRight,
  Search,
  CheckCircle2,
  FileText,
  Activity,
  QrCode,
  Plus,
  KeyRound
} from 'lucide-react';

interface StudentDashboardProps {
  activeTab?: string;
  onApplyLeave?: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ activeTab, onApplyLeave }) => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [passes, setPasses] = useState<DigitalPass[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'active_pending' | 'past' | 'all'>('active_pending');
  const [selectedReq, setSelectedReq] = useState<LeaveRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  useEffect(() => {
    if (activeTab === 'history') {
      setSelectedReq(null);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!currentUser) return;

    if (currentUser.role === 'STUDENT' && !localStorage.getItem('student_history_cleared')) {
      try {
        dataService.clearHistoricalData();
        localStorage.setItem('student_history_cleared', '1');
      } catch (e) {
        console.warn('Failed to clear historical data', e);
      }
    }

    const loadData = () => {
      const allReqs = dataService.getRequests().filter(r => r.studentId === currentUser.id);
      allReqs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setRequests(allReqs);
      const allPasses = dataService.getPasses().filter(p => p.studentId === currentUser.id);
      setPasses(allPasses);
    };

    loadData();
    const unsubscribe = dataService.subscribe(loadData);
    return () => unsubscribe();
  }, [currentUser]);

  const handleRowClick = (req: LeaveRequest) => {
    setSelectedReq(req);
    setShowDetailModal(true);
  };

  const activePass = passes.find(p => p.status === 'ACTIVE' && !p.exitRecordedAt && !p.entryRecordedAt);
  const approvedCount = requests.filter(r => r.status === 'APPROVED' || r.status === 'COMPLETED').length;

  const displayedList = requests.filter(r => {
    // Category filter logic
    if (categoryFilter === 'active_pending') {
      const activeOrPendingStatus = ['SUBMITTED', 'PARENT_PENDING', 'PARENT_APPROVED', 'APPROVAL_PENDING', 'APPROVED'];
      if (!activeOrPendingStatus.includes(r.status)) return false;
    } else if (categoryFilter === 'past') {
      const pastStatus = ['COMPLETED', 'REJECTED', 'EXPIRED', 'CANCELLED', 'USED'];
      if (!pastStatus.includes(r.status)) return false;
    }

    const term = searchTerm.toLowerCase();
    const title = (r.leaveTitle || r.type).toLowerCase();
    const remarks = r.reason.toLowerCase();
    const dest = r.destination.toLowerCase();
    return title.includes(term) || remarks.includes(term) || dest.includes(term) || r.requestNumber.toLowerCase().includes(term);
  });

  const modalPass = selectedReq ? passes.find(p => p.requestId === selectedReq.id) || activePass : null;

  return (
    <div className="space-y-6 text-[#172033] font-sans pb-12">
      {/* Page Title & Hierarchy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#172033] tracking-tight">
            Student Leave & Outpass Portal
          </h1>
          <p className="text-sm sm:text-base text-[#5b6472] mt-1">
            Track active outpasses, pending approvals, and previous records.
          </p>
        </div>

        {/* Action Buttons: Apply New Leave & Enter Emergency OTP */}
        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <button
            onClick={onApplyLeave}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-800 hover:to-indigo-800 text-white px-7 py-3 rounded-xl font-bold text-base shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 border border-blue-600/30 flex items-center justify-center shrink-0 min-h-[46px] cursor-pointer"
          >
            <span>Apply New Leave</span>
          </button>

          <button
            onClick={() => setShowOtpModal(true)}
            className="w-full sm:w-auto bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-6 py-3 rounded-xl font-bold text-base shadow-xs hover:shadow-sm transition-all flex items-center justify-center space-x-2 shrink-0 min-h-[46px] cursor-pointer"
          >
            <KeyRound className="w-5 h-5 text-amber-700" />
            <span>Enter Emergency OTP</span>
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <MetricCard
          title="Submitted Requests"
          value={requests.length}
          subtitle="Total leaves & ODs applied"
          icon={FileText}
          accentColor="blue"
        />
        <MetricCard
          title="Approved Requests"
          value={approvedCount}
          subtitle="Passes signed-off"
          icon={CheckCircle2}
          accentColor="emerald"
        />
        <MetricCard
          title="Campus Pass Status"
          value={activePass ? 'ACTIVE' : 'NONE'}
          subtitle={activePass ? `${activePass.passNumber} ready` : 'No active pass'}
          icon={QrCode}
          accentColor="purple"
        />
      </div>

      {/* Active Digital Pass Feature Box if active */}
      {activePass && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-[#172033]">Active Campus Pass</h2>
          <DigitalPassCard pass={activePass} />
        </div>
      )}

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-slate-200">
        {/* Filter Category Pills */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-fit">
          <button
            onClick={() => setCategoryFilter('active_pending')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              categoryFilter === 'active_pending'
                ? 'bg-white text-[#1e40af] shadow-2xs'
                : 'text-[#5b6472] hover:text-[#172033]'
            }`}
          >
            Active & Pending ({requests.filter(r => ['SUBMITTED', 'PARENT_PENDING', 'PARENT_APPROVED', 'APPROVAL_PENDING', 'APPROVED'].includes(r.status)).length})
          </button>
          <button
            onClick={() => setCategoryFilter('past')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              categoryFilter === 'past'
                ? 'bg-white text-[#1e40af] shadow-2xs'
                : 'text-[#5b6472] hover:text-[#172033]'
            }`}
          >
            Previous Records ({requests.filter(r => ['COMPLETED', 'REJECTED', 'EXPIRED', 'CANCELLED', 'USED'].includes(r.status)).length})
          </button>
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              categoryFilter === 'all'
                ? 'bg-white text-[#1e40af] shadow-2xs'
                : 'text-[#5b6472] hover:text-[#172033]'
            }`}
          >
            All Requests ({requests.length})
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search destination, reason..."
            className="w-full h-11 bg-white border border-slate-300 rounded-lg pl-10 pr-4 text-sm sm:text-base text-[#172033] placeholder-slate-400 focus:outline-none focus:border-blue-600 font-medium"
          />
        </div>
      </div>

      {/* Data Table (Section 10) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="responsive-table custom-scrollbar">
          <table className="w-full text-left text-sm text-[#172033]">
            <thead className="bg-slate-100 text-[#475569] uppercase text-xs tracking-wider border-b border-slate-300 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Leave Title</th>
                <th className="py-3.5 px-3">Type</th>
                <th className="py-3.5 px-3">From Date</th>
                <th className="py-3.5 px-3">To Date</th>
                <th className="py-3.5 px-3">Duration</th>
                <th className="py-3.5 px-4">Reason / Destination</th>
                <th className="py-3.5 px-3">Parent Consent</th>
                <th className="py-3.5 px-4">Status & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {displayedList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#5b6472] font-semibold text-base">
                    No matching leave or OD requests found.
                  </td>
                </tr>
              ) : (
                displayedList.map(req => {
                  const displayTitle = (req as any).isEmergency || req.leaveTitle === 'Emergency Leave'
                    ? 'Emergency Leave'
                    : (req.leaveTitle || (req.type === 'OD' ? 'On-Duty Leave' : 'Regular Leave'));
                  const durationText = req.durationDays || '1 day';

                  const formatDateStr = (isoStr: string) => {
                    const date = new Date(isoStr);
                    if (isNaN(date.getTime())) return isoStr;
                    return date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                  };

                  return (
                    <tr
                      key={req.id}
                      onClick={() => handleRowClick(req)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors group"
                    >
                      <td className="py-4 px-4 font-bold text-[#172033]">
                        <div className="flex items-center space-x-2">
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1e40af] transition-colors shrink-0" />
                          <span className="group-hover:text-[#1e40af] transition-colors text-base">{displayTitle}</span>
                        </div>
                      </td>

                      <td className="py-4 px-3">
                        <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-blue-50 text-[#1e40af] border border-blue-200 uppercase">
                          {req.type}
                        </span>
                      </td>

                      <td className="py-4 px-3 font-medium text-[#172033] whitespace-nowrap">
                        {formatDateStr(req.startDate)}
                      </td>

                      <td className="py-4 px-3 font-medium text-[#172033] whitespace-nowrap">
                        {formatDateStr(req.endDate)}
                      </td>

                      <td className="py-4 px-3 font-medium text-[#172033] whitespace-nowrap">
                        {durationText}
                      </td>

                      <td className="py-4 px-4 font-medium text-[#5b6472] max-w-xs truncate">
                        <span className="text-[#172033] font-semibold">{req.destination}: </span>
                        <span>{req.reason}</span>
                      </td>

                      <td className="py-4 px-3">
                        <StatusBadge status={req.parentStatus || 'PENDING'} size="sm" />
                      </td>

                      <td className="py-4 px-4">
                        <StatusBadge status={req.status} size="md" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details & Gate QR Modal */}
      {selectedReq && (
        <GlassModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={`Request Details — ${selectedReq.requestNumber}`}
          subtitle="Review authorization status and digital pass information"
          maxWidth="xl"
        >
          <div className="space-y-6 text-[#172033]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#5b6472]">Reason & Purpose</p>
                  <p className="mt-1 text-base font-bold text-[#172033]">{selectedReq.reason}</p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#5b6472]">Destination</p>
                  <p className="mt-1 text-base font-semibold text-[#172033]">{selectedReq.destination}</p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#5b6472]">Validity Window</p>
                  <p className="mt-1 font-mono text-sm font-semibold text-[#172033]">
                    {new Date(selectedReq.startDate).toLocaleDateString()} → {new Date(selectedReq.endDate).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#5b6472]">Current Status</p>
                  <div className="mt-1.5">
                    <StatusBadge status={selectedReq.status} size="lg" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-5">
                {(modalPass && (selectedReq.status === 'APPROVED' || selectedReq.status === 'COMPLETED')) ? (
                  <>
                    <div className="rounded-lg bg-white p-3 shadow-xs border border-blue-200">
                      <QRCodeSVG value={modalPass.qrPayload} size={160} level="H" />
                    </div>
                    <div className="mt-4 w-full rounded-lg border border-blue-200 bg-blue-50 p-3 text-center">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#1e40af]">Gate Verification OTP</p>
                      <div className="mt-1 text-3xl font-bold tracking-widest text-[#1e40af] font-mono">
                        {modalPass.otpCode || '4829'}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-sm text-[#5b6472]">
                    <QrCode className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    {selectedReq && (selectedReq.status === 'APPROVAL_PENDING' || selectedReq.status === 'PARENT_PENDING') ? (
                      <div className="font-semibold text-base text-[#172033]">{selectedReq.currentStage || 'Awaiting approvals'}</div>
                    ) : (
                      <div>QR pass will be generated automatically once request is approved.</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-3 rounded-lg bg-slate-100 border border-slate-300 text-[#172033] font-semibold text-base hover:bg-slate-200 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </GlassModal>
      )}

      {/* Emergency OTP Input Modal */}
      <EmergencyOtpInputModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
      />
    </div>
  );
};
