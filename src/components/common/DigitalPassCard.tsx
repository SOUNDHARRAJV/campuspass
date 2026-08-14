import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { DigitalPass } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { StatusBadge } from '../ui/StatusBadge';
import { ShieldCheck, Clock, Calendar, MapPin, Building, User } from 'lucide-react';

interface DigitalPassCardProps {
  pass: DigitalPass;
  id?: string;
}

export const DigitalPassCard: React.FC<DigitalPassCardProps> = ({ pass, id }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const until = new Date(pass.validUntil).getTime();
      const diff = until - now;

      if (diff <= 0) {
        setTimeLeft('Pass Expired');
        setIsExpired(true);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${mins}m ${secs}s`);
        setIsExpired(false);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [pass.validUntil]);

  const passOtp = pass.otpCode || '4829';

  return (
    <GlassCard id={id} className="p-6 relative overflow-hidden border-slate-300 shadow-md bg-white text-[#172033]">
      {/* Top accent bar */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-[#1e40af]" />

      {/* Pass Header */}
      <div className="flex items-start justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-[#1e40af] bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
              {pass.passNumber}
            </span>
            <span className="text-xs font-bold text-[#5b6472] uppercase tracking-wider">{pass.type} PASS</span>
          </div>
          <h3 className="text-xl font-bold text-[#172033] mt-1.5">BIT Verified Digital Pass</h3>
        </div>
        <StatusBadge status={isExpired ? 'EXPIRED' : pass.status} size="lg" />
      </div>

      {/* Main Content: Info & QR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 items-center">
        {/* Info Column */}
        <div className="md:col-span-2 space-y-4 text-sm text-[#172033]">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start space-x-2.5">
              <User className="w-5 h-5 text-[#1e40af] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold uppercase text-[#5b6472]">Student Name</p>
                <p className="font-bold text-[#172033] text-base">{pass.studentName}</p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5">
              <Building className="w-5 h-5 text-[#1e40af] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold uppercase text-[#5b6472]">Register No / Dept</p>
                <p className="font-semibold text-[#172033] text-base">{pass.registerNumber} ({pass.department.split(' ')[0]})</p>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 pt-3 border-t border-slate-200">
            <MapPin className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold uppercase text-[#5b6472]">Destination & Purpose</p>
              <p className="font-semibold text-[#172033] text-base">{pass.destination} — <span className="text-[#5b6472] font-normal">{pass.reason}</span></p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200">
            <div className="flex items-start space-x-2.5">
              <Calendar className="w-5 h-5 text-[#1e40af] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold uppercase text-[#5b6472]">Valid From</p>
                <p className="font-mono text-[#172033] font-semibold text-sm">{new Date(pass.validFrom).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5">
              <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold uppercase text-[#5b6472]">Valid Until</p>
                <p className="font-mono text-[#172033] font-semibold text-sm">{new Date(pass.validUntil).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
              </div>
            </div>
          </div>

          {/* Prominent Security Gate OTP Box */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-[#1e40af] uppercase tracking-wider block">
                Security Gate Verification OTP
              </span>
              <p className="text-xs text-[#5b6472] mt-0.5">Provide this 4-digit code to Security Officer at gate</p>
            </div>
            <div className="px-4 py-2 rounded-lg bg-white border border-blue-300 shadow-xs font-mono text-2xl font-bold text-[#1e40af] tracking-widest shrink-0">
              {passOtp}
            </div>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-5 bg-slate-50 rounded-xl border border-slate-200 text-center">
          <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-300">
            <QRCodeSVG value={pass.qrPayload} size={140} level="H" />
          </div>

          <div className="mt-3 flex items-center space-x-2 text-sm font-mono font-bold text-[#1e40af]">
            <Clock className="w-4 h-4" />
            <span>{timeLeft}</span>
          </div>
          <p className="text-xs text-[#5b6472] mt-1">Scan or Enter OTP at Gate</p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-[#5b6472]">
        <div>
          <span>Issued by: </span>
          <span className="text-[#172033] font-semibold">{pass.issuedBy}</span>
        </div>
        <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Verified Digital Pass</span>
        </div>
      </div>
    </GlassCard>
  );
};
