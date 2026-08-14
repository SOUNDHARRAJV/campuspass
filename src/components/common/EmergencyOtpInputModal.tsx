import React, { useState, useRef, useEffect } from 'react';
import { GlassModal } from '../ui/GlassModal';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

interface EmergencyOtpInputModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyOtpInputModal: React.FC<EmergencyOtpInputModalProps> = ({
  isOpen,
  onClose
}) => {
  const { currentUser } = useAuth();
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const inputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null)
  ];

  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '']);
      setError(null);
      setSuccessMsg(null);
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleChange = (index: number, value: string) => {
    setError(null);
    const char = value.slice(-1);
    if (char && !/^\d$/.test(char)) return;

    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    if (char && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{4}$/.test(pasted)) {
      const newDigits = pasted.split('');
      setDigits(newDigits);
      inputRefs[3].current?.focus();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUser) return;

    const otpCode = digits.join('');
    if (otpCode.length < 4) {
      setError('Please enter all 4 digits of the Emergency OTP.');
      return;
    }

    try {
      const now = new Date();
      const todayIso = now.toISOString().slice(0, 10);
      const req = dataService.submitRequest(
        currentUser,
        {
          type: 'LEAVE',
          reason: 'Emergency Leave via Mentor/Warden OTP',
          destination: 'Home / Hospital Emergency',
          emergencyContact: currentUser.parentPhone || '+91 98123 45678',
          startDate: `${todayIso}T09:00`,
          endDate: `${todayIso}T18:00`,
          isEmergency: true
        },
        otpCode
      );

      if (req && req.status === 'APPROVED') {
        setSuccessMsg(`Emergency Pass ${req.requestNumber} generated successfully!`);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError('Invalid or expired Emergency OTP. Please check with your Warden or Mentor.');
      }
    } catch (err: any) {
      setError(err?.message || 'Verification failed. Invalid or expired OTP.');
    }
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Enter Emergency OTP"
      subtitle="Input the 4-digit single-use OTP issued by your Mentor or Warden."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6 py-2 text-[#172033]">
        {/* Visual Icon Badge */}
        <div className="flex justify-center pt-2">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shadow-xs">
            <KeyRound className="w-8 h-8" />
          </div>
        </div>

        {/* 4 Singular Digit Input Boxes */}
        <div className="flex justify-center items-center space-x-3 sm:space-x-4 pt-2">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={inputRefs[idx]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(idx, e.target.value)}
              onKeyDown={e => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className="w-12 h-14 sm:w-14 sm:h-16 rounded-xl border border-slate-300 bg-white text-center text-2xl font-extrabold text-[#172033] shadow-xs focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
            />
          ))}
        </div>

        {error && (
          <div className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm font-semibold text-rose-800 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900 flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 rounded-lg bg-slate-100 border border-slate-300 text-[#172033] font-semibold text-base hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#1e40af] hover:bg-blue-800 text-white font-bold text-base shadow-xs transition-colors"
          >
            Verify OTP &amp; Issue Pass
          </button>
        </div>
      </form>
    </GlassModal>
  );
};
