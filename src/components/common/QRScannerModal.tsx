import React, { useState } from 'react';
import { dataService } from '../../services/dataService';
import { DigitalPass, GateVerificationResult } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { QrCode, ShieldCheck, CheckCircle2, XCircle, Camera } from 'lucide-react';

interface QRScannerModalProps {
  onClose?: () => void;
  id?: string;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ onClose, id }) => {
  const { currentUser } = useAuth();
  const [manualInput, setManualInput] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<{
    result: GateVerificationResult;
    pass?: DigitalPass;
    message: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [otpError, setOtpError] = useState<string | null>(null);

  const activePasses = dataService.getActivePasses();

  const handleVerify = (token: string) => {
    if (!token.trim()) return;
    setIsProcessing(true);
    setActionSuccess(null);
    setEnteredOtp('');
    setOtpError(null);
    setTimeout(() => {
      const res = dataService.verifyQrToken(token);
      setVerificationResult(res);
      setIsProcessing(false);
    }, 300);
  };

  const handleExecuteGateMovement = (eventType: 'EXIT' | 'ENTRY') => {
    if (!verificationResult?.pass) return;

    const expectedOtp = verificationResult.pass.otpCode || '4829';
    if (!enteredOtp || enteredOtp.trim() !== expectedOtp) {
      setOtpError('Invalid OTP! Please enter the 4-digit Security OTP provided by the student.');
      return;
    }

    dataService.recordGateMovement(
      verificationResult.pass.id,
      eventType,
      currentUser || undefined,
      `Verified by Gate Security officer ${currentUser?.name || 'Gate Officer'} with OTP check`
    );

    setActionSuccess(`Gate ${eventType} logged & OTP verified successfully for ${verificationResult.pass.studentName}`);
    setEnteredOtp('');
    setOtpError(null);
    setTimeout(() => {
      setVerificationResult(null);
      setActionSuccess(null);
      setManualInput('');
    }, 2000);
  };

  return (
    <div id={id} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-md space-y-6 text-[#172033]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2.5 rounded-lg bg-blue-50 text-[#1e40af] border border-blue-200 shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#172033]">Security Gate QR Verification Console</h3>
            <p className="text-sm text-[#5b6472]">Scan student digital pass or enter token for instant gate authorization</p>
          </div>
        </div>

        {onClose && (
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-100 border border-slate-300 text-[#172033] text-sm font-semibold hover:bg-slate-200">
            Close
          </button>
        )}
      </div>

      {/* Action Success Alert */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-base font-semibold flex items-center space-x-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Verification Result Display */}
      {verificationResult ? (
        <div className="space-y-5">
          <div
            className={`p-6 rounded-2xl border ${
              verificationResult.result === 'VALID_EXIT' || verificationResult.result === 'VALID_ENTRY'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                {verificationResult.result === 'VALID_EXIT' || verificationResult.result === 'VALID_ENTRY' ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-700 shrink-0" />
                ) : (
                  <XCircle className="w-8 h-8 text-rose-700 shrink-0" />
                )}
                <div>
                  <h4 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-[#172033]">
                    {verificationResult.result === 'VALID_EXIT'
                      ? 'PASS VERIFIED — READY FOR EXIT'
                      : verificationResult.result === 'VALID_ENTRY'
                      ? 'PASS VERIFIED — READY FOR ENTRY'
                      : 'PASS VERIFICATION FAILED'}
                  </h4>
                  <p className="text-sm font-medium text-[#5b6472] mt-0.5">{verificationResult.message}</p>
                </div>
              </div>
            </div>

            {/* Pass details */}
            {verificationResult.pass && (
              <div className="mt-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-white p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-xs font-semibold text-[#5b6472] uppercase">Student Name</span>
                    <p className="font-bold text-[#172033] text-base">{verificationResult.pass.studentName}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#5b6472] uppercase">Register No</span>
                    <p className="font-semibold text-[#172033] text-base">{verificationResult.pass.registerNumber}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#5b6472] uppercase">Department</span>
                    <p className="font-semibold text-[#172033]">{verificationResult.pass.department}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#5b6472] uppercase">Destination</span>
                    <p className="font-semibold text-[#172033]">{verificationResult.pass.destination}</p>
                  </div>
                </div>

                {/* Security OTP Input Box */}
                {(verificationResult.result === 'VALID_EXIT' || verificationResult.result === 'VALID_ENTRY') && (
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm">
                    <label className="block text-sm font-bold text-[#1e40af] uppercase tracking-wider mb-1">
                      Enter Student Security OTP:
                    </label>
                    <p className="text-xs text-[#5b6472] mb-3">
                      Ask student for their 4-digit Security OTP displayed on their digital pass to authorize movement.
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="••••"
                        value={enteredOtp}
                        onChange={e => {
                          setEnteredOtp(e.target.value);
                          setOtpError(null);
                        }}
                        className="w-full sm:w-44 h-12 bg-white border border-blue-300 rounded-lg px-4 text-center font-mono text-xl font-bold text-[#1e40af] tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {enteredOtp.trim() === (verificationResult.pass.otpCode || '4829') && (
                        <span className="text-sm font-bold text-emerald-800 bg-emerald-100 px-3 py-2 rounded-lg border border-emerald-300 flex items-center space-x-1.5">
                          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                          <span>OTP VERIFIED</span>
                        </span>
                      )}
                    </div>
                    {otpError && (
                      <p className="text-sm font-semibold text-rose-700 mt-2 flex items-center space-x-1.5">
                        <XCircle className="w-5 h-5 shrink-0 text-rose-600" />
                        <span>{otpError}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Actions for Security Officer */}
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setVerificationResult(null)}
                className="w-full sm:w-auto px-5 py-3 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[#172033] text-sm sm:text-base font-semibold"
              >
                Scan Another Pass
              </button>

              {verificationResult.result === 'VALID_EXIT' && (
                <button
                  onClick={() => handleExecuteGateMovement('EXIT')}
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-base font-semibold shadow-xs flex items-center justify-center space-x-2 min-h-[44px]"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>ALLOW EXIT &amp; LOG</span>
                </button>
              )}

              {verificationResult.result === 'VALID_ENTRY' && (
                <button
                  onClick={() => handleExecuteGateMovement('ENTRY')}
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#1e40af] hover:bg-blue-800 text-white text-base font-semibold shadow-xs flex items-center justify-center space-x-2 min-h-[44px]"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>ALLOW RE-ENTRY &amp; COMPLETE</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Camera Frame / Manual Code Input */
        <div className="space-y-6">
          <div className="relative flex flex-col items-center justify-center p-8 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 text-center space-y-4">
            <div className="relative w-48 h-48 rounded-xl border-2 border-[#1e40af] bg-blue-50 flex items-center justify-center overflow-hidden shadow-inner">
              <Camera className="w-12 h-12 text-[#1e40af] animate-pulse" />
            </div>

            <div>
              <p className="text-base text-[#172033] font-bold">Position QR code inside optical scanner frame</p>
              <p className="text-xs text-[#5b6472] mt-1">Live camera optical verification stream ready</p>
            </div>

            {activePasses.length > 0 && (
              <button
                type="button"
                onClick={() => handleVerify(activePasses[0].qrPayload || activePasses[0].passNumber)}
                className="px-5 py-2.5 rounded-lg bg-[#1e40af] hover:bg-blue-800 text-white font-bold text-sm shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Simulate Optical Camera QR Scan ({activePasses[0].studentName})</span>
              </button>
            )}
          </div>

          {/* Quick Select active passes */}
          {activePasses.length > 0 && (
            <div>
              <p className="text-xs font-bold text-[#5b6472] uppercase tracking-wider mb-3">
                Active Digital Passes in System (Click to Scan):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activePasses.map(pass => (
                  <button
                    key={pass.id}
                    onClick={() => handleVerify(pass.qrPayload || pass.passNumber)}
                    className="p-4 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#1e40af]">{pass.passNumber}</span>
                      <span className="text-xs text-emerald-800 font-mono font-bold">PASS ACTIVE</span>
                    </div>
                    <p className="text-base font-bold text-[#172033] mt-1">{pass.studentName}</p>
                    <p className="text-xs text-[#5b6472]">{pass.destination}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Manual Input Fallback */}
          <div className="pt-4 border-t border-slate-200">
            <p className="text-xs font-bold text-[#5b6472] uppercase tracking-wider mb-2">
              OR ENTER PASS NUMBER / TOKEN MANUALLY:
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                type="text"
                placeholder="Enter Pass Number (e.g. PASS-9921-X)..."
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && manualInput.trim()) {
                    handleVerify(manualInput);
                  }
                }}
                className="flex-1 h-12 bg-white border border-slate-300 rounded-lg px-4 text-base text-[#172033] placeholder-slate-400 focus:outline-none focus:border-blue-600 font-medium"
              />
              <button
                onClick={() => handleVerify(manualInput)}
                disabled={!manualInput.trim() || isProcessing}
                className="w-full sm:w-auto h-12 px-6 rounded-lg bg-[#1e40af] hover:bg-blue-800 text-white font-semibold text-base transition-all disabled:opacity-50 shadow-xs cursor-pointer"
              >
                {isProcessing ? 'Verifying...' : 'Verify Pass'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
