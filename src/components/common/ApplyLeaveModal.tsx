import React, { useState } from 'react';
import { GlassModal } from '../ui/GlassModal';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { FileText, Calendar, MapPin, AlertCircle } from 'lucide-react';
import { AppleGlassDateTimePicker } from './AppleGlassDateTimePicker';

type RequestModalType = 'LEAVE' | 'OD' | 'OTHER';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  id?: string;
  emergencyOtpPrefill?: string | undefined;
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({ isOpen, onClose, id, emergencyOtpPrefill }) => {
  const { currentUser } = useAuth();
  const [requestType, setRequestType] = useState<RequestModalType>('LEAVE');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [destination, setDestination] = useState('');
  const [details, setDetails] = useState('');
  const [isEmergencyFlag, setIsEmergencyFlag] = useState(false);
  const [bipId, setBipId] = useState('');
  const [emergencyOtp, setEmergencyOtp] = useState('');
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setRequestType('LEAVE');
    setFromDate('');
    setToDate('');
    setReason('');
    setDestination('');
    setDetails('');
    setBipId('');
    setError(null);
    setEmergencyOtp('');
  };

  React.useEffect(() => {
    if (emergencyOtpPrefill) {
      setEmergencyOtp(emergencyOtpPrefill);
      const now = new Date();
      const iso = now.toISOString().slice(0, 10);
      setFromDate(iso);
      setToDate(iso);
      setRequestType('LEAVE');
    }
  }, [emergencyOtpPrefill]);

  const handleSubmit = () => {
    if (!currentUser) return;

    if (!fromDate || !toDate) {
      setError('Please select both start and end dates.');
      return;
    }

    if (requestType === 'LEAVE' && !reason.trim()) {
      setError('Please enter the reason for leave.');
      return;
    }

    if ((requestType === 'OD' || requestType === 'OTHER') && (!destination.trim() || !bipId.trim())) {
      setError(requestType === 'OD' ? 'Please enter the event name and BIP ID.' : 'Please enter the name and BIP ID.');
      return;
    }

    const normalizedType = requestType === 'OTHER' ? 'LEAVE' : requestType;
    const finalDestination = requestType === 'LEAVE' ? (destination.trim() || 'Home') : destination.trim();
    const finalReason = requestType === 'LEAVE' ? reason.trim() : `${destination.trim()} — ${details.trim() || 'Official request'}`;

    try {
      dataService.submitRequest(
        currentUser,
        {
          type: normalizedType,
          reason: finalReason,
          destination: finalDestination,
          emergencyContact: currentUser.parentPhone || '+91 98123 45678',
          startDate: fromDate.includes('T') ? fromDate : `${fromDate}T09:00`,
          endDate: toDate.includes('T') ? toDate : `${toDate}T18:00`,
          isException: false,
          isEmergency: isEmergencyFlag,
          exceptionReason: details.trim() || undefined
        },
        emergencyOtp?.trim() || undefined
      );

      resetForm();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Unable to submit request. Please review the form.');
    }
  };

  return (
    <GlassModal
      id={id}
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Apply Leave"
      subtitle="Submit a leave request for approval."
      maxWidth="xl"
    >
      <div className="space-y-6 py-2 text-[#172033]">
        {/* Request Category Selector */}
        <div>
          <label className="block text-sm sm:text-base font-semibold text-[#172033] mb-2">
            Request Type
          </label>
          <select
            value={requestType}
            onChange={e => setRequestType(e.target.value as RequestModalType)}
            className="w-full h-12 rounded-lg border border-slate-300 bg-white px-4 text-base font-medium text-[#172033] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="LEAVE">Leave Request</option>
            <option value="OD">On-Duty (OD) Pass</option>
            <option value="OTHER">Other Special Outpass</option>
          </select>
        </div>

        {/* Apple Glassmorphic Date & Time Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <AppleGlassDateTimePicker
            label="From Date & Time"
            value={fromDate}
            onChange={val => setFromDate(val)}
            align="left"
          />

          <AppleGlassDateTimePicker
            label="To Date & Time"
            value={toDate}
            onChange={val => setToDate(val)}
            align="right"
          />
        </div>

        {/* Reason / Details Controls */}
        {requestType === 'LEAVE' ? (
          <div>
            <label className="block text-sm sm:text-base font-semibold text-[#172033] mb-2">
              Reason
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="State your reason for leave in detail"
              className="w-full rounded-lg border border-slate-300 bg-white p-3.5 text-base text-[#172033] placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm sm:text-base font-semibold text-[#172033] mb-2">
                {requestType === 'OD' ? 'Event / Activity Name' : 'Request Name'}
              </label>
              <input
                type="text"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder={requestType === 'OD' ? 'e.g. Technical Symposium, Hackathon' : 'Enter request title'}
                className="w-full h-12 rounded-lg border border-slate-300 bg-white px-4 text-base text-[#172033] placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base font-semibold text-[#172033] mb-2">
                BIP ID / Registration Reference
              </label>
              <input
                type="text"
                value={bipId}
                onChange={e => setBipId(e.target.value)}
                placeholder="Enter BIP ID or registration number"
                className="w-full h-12 rounded-lg border border-slate-300 bg-white px-4 text-base text-[#172033] placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base font-semibold text-[#172033] mb-2">
                Additional Note
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="Provide additional details or official authorization reference"
                className="w-full rounded-lg border border-slate-300 bg-white p-3.5 text-base text-[#172033] placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </>
        )}

        {error && (
          <div className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm font-semibold text-rose-800 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Action Controls (Section 9) */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-lg bg-slate-100 border border-slate-300 text-[#172033] font-semibold text-base hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-base shadow-sm hover:shadow-md transition-all border border-blue-600/30 cursor-pointer"
          >
            {requestType === 'OD' ? 'Submit OD Request' : requestType === 'OTHER' ? 'Submit Request' : 'Submit Leave Request'}
          </button>
        </div>
      </div>
    </GlassModal>
  );
};
