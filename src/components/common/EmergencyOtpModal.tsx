import React from 'react';
import { GlassModal } from '../ui/GlassModal';

interface OtpData {
  id: string;
  studentId: string;
  code: string;
  issuedBy: string[];
  issuedAt: string;
  validUntil: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  otp?: OtpData | null;
  studentName?: string;
}

export const EmergencyOtpModal: React.FC<Props> = ({ isOpen, onClose, otp, studentName }) => {
  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title="Emergency Security OTP" subtitle={studentName ? `Issued for ${studentName}` : ''} maxWidth="md">
      <div className="space-y-6 text-[#172033] font-sans">
        {otp ? (
          <div className="text-center space-y-5">
            <div className="inline-block p-6 rounded-2xl bg-blue-50 border border-blue-200 shadow-xs w-full">
              <div className="text-sm text-[#1e40af] font-semibold uppercase tracking-wider">One-Time Emergency Gate OTP</div>
              <div className="text-4xl sm:text-5xl font-mono font-bold tracking-widest text-[#1e40af] my-3">{otp.code}</div>
              <div className="text-xs text-[#5b6472]">Valid until {new Date(otp.validUntil).toLocaleString()}</div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => { navigator.clipboard.writeText(otp.code); alert('OTP copied to clipboard!'); }}
                className="px-5 py-3 rounded-lg bg-[#1e40af] hover:bg-blue-800 text-white font-semibold text-base shadow-xs min-h-[44px]"
              >
                Copy Code
              </button>
              <button
                onClick={onClose}
                className="px-5 py-3 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 text-[#172033] font-semibold text-base min-h-[44px]"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-[#5b6472] text-base py-6 font-semibold">No active OTP available for this student.</div>
        )}
      </div>
    </GlassModal>
  );
};

export default EmergencyOtpModal;
