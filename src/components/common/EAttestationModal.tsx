import React, { useState } from 'react';
import { LeaveRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { GlassModal } from '../ui/GlassModal';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface EAttestationModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: LeaveRequest;
  id?: string;
}

export const EAttestationModal: React.FC<EAttestationModalProps> = ({ isOpen, onClose, request, id }) => {
  const { currentUser } = useAuth();
  const [remarks, setRemarks] = useState('');
  const [customValidityHours, setCustomValidityHours] = useState('4');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAttest = (action: 'ATTEST' | 'REJECT') => {
    if (!currentUser) return;
    setIsSubmitting(true);

    const validUntil = new Date(Date.now() + parseInt(customValidityHours) * 3600 * 1000).toISOString();

    setTimeout(() => {
      dataService.attestExceptionRequest(request.id, currentUser, action, validUntil, remarks);
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  return (
    <GlassModal
      id={id}
      isOpen={isOpen}
      onClose={onClose}
      title="Electronic Attestation Console"
      subtitle="Executive Mentor Authorization for Exception Campus Exit"
      maxWidth="2xl"
    >
      <div className="space-y-6 text-sm text-[#172033] font-sans">
        {/* Exception Notice Banner */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 flex items-start space-x-3 text-amber-950">
          <AlertTriangle className="w-6 h-6 shrink-0 text-amber-700 mt-0.5" />
          <div>
            <h4 className="font-bold text-base text-amber-950">Exception Campus Exit Request</h4>
            <p className="mt-1 leading-relaxed text-sm text-amber-900">
              This request bypasses normal hostel schedule windows. As Mentor, your electronic attestation generates a time-bound digital pass with full audit logging.
            </p>
          </div>
        </div>

        {/* Student & Request Summary */}
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-[#5b6472] uppercase font-semibold">Student Name</span>
              <p className="font-bold text-base text-[#172033]">{request.studentName}</p>
              <p className="text-xs text-[#5b6472]">{request.registerNumber} • {request.department}</p>
            </div>

            <div>
              <span className="text-xs text-[#5b6472] uppercase font-semibold">Hostel & Emergency</span>
              <p className="font-semibold text-[#172033]">{request.hostelBlock} (Rm {request.roomNumber})</p>
              <p className="text-xs text-[#5b6472]">{request.emergencyContact}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200">
            <span className="text-xs text-[#5b6472] uppercase font-semibold">Stated Reason for Exception</span>
            <p className="font-semibold text-[#172033] bg-white p-3 rounded-lg border border-slate-300 mt-1">
              "{request.reason}"
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <span className="text-xs text-[#5b6472] uppercase font-semibold">Destination</span>
              <p className="font-bold text-[#172033]">{request.destination}</p>
            </div>
            <div>
              <span className="text-xs text-[#5b6472] uppercase font-semibold">Parent Status</span>
              <p className="font-bold text-emerald-800">✓ CONSENT VERIFIED</p>
            </div>
          </div>
        </div>

        {/* Custom Validity Duration */}
        <div>
          <label className="block text-sm sm:text-base font-semibold text-[#172033] mb-2">
            Authorize Time-Bound Pass Duration (Hours):
          </label>
          <select
            value={customValidityHours}
            onChange={e => setCustomValidityHours(e.target.value)}
            className="w-full h-12 bg-white border border-slate-300 rounded-lg px-4 text-base text-[#172033] focus:outline-none focus:border-blue-600 font-semibold"
          >
            <option value="2">2 Hours (Urgent Short Exit)</option>
            <option value="4">4 Hours (Standard Medical / Exam Exit)</option>
            <option value="8">8 Hours (Full Day Special Exit)</option>
            <option value="24">24 Hours (Overnight Authorized Exit)</option>
          </select>
        </div>

        {/* Remarks / Notes */}
        <div>
          <label className="block text-sm sm:text-base font-semibold text-[#172033] mb-2">
            Mentor Official Remarks / Attestation Notes:
          </label>
          <textarea
            rows={3}
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder="Add official institutional remarks or guidelines..."
            className="w-full bg-white border border-slate-300 rounded-lg p-3 text-base text-[#172033] placeholder-slate-400 focus:outline-none focus:border-blue-600 font-medium"
          />
        </div>

        {/* Electronic Attestation Statement */}
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs sm:text-sm text-[#172033] space-y-1">
          <div className="flex items-center space-x-2 text-[#1e40af] font-bold">
            <ShieldCheck className="w-5 h-5" />
            <span>Official Institutional Declaration</span>
          </div>
          <p>
            I, <span className="text-[#172033] font-bold">{currentUser?.name || 'Mentor'}</span> (Mentor), hereby electronically attest and authorize this exception exit under institutional regulations.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
          <button
            onClick={() => handleAttest('REJECT')}
            disabled={isSubmitting}
            className="px-5 py-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-base shadow-xs min-h-[44px] transition-colors"
          >
            Decline Exception
          </button>

          <button
            onClick={() => handleAttest('ATTEST')}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base shadow-xs flex items-center space-x-2 min-h-[44px] transition-colors"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>{isSubmitting ? 'Attesting...' : 'E-ATTEST & ISSUE PASS'}</span>
          </button>
        </div>
      </div>
    </GlassModal>
  );
};
