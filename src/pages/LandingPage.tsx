import React from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import {
  Shield,
  ArrowRight,
  BarChart3,
  Lock
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  id?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, id }) => {
  return (
    <div id={id} className="min-h-screen bg-[#f4f6f8] text-[#172033] flex flex-col justify-between relative font-sans">
      {/* Header Bar */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between relative z-10 border-b border-slate-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#1e40af] flex items-center justify-center shadow-xs">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#172033]">
              Campus Pass
            </h1>
            <p className="text-xs text-[#5b6472]">Unified Campus Leave, OD & Exit Management System</p>
          </div>
        </div>

        <button
          onClick={onGetStarted}
          className="px-6 py-3 rounded-lg bg-[#1e40af] hover:bg-blue-800 text-white font-semibold text-sm shadow-xs transition-colors flex items-center space-x-2 min-h-[44px]"
        >
          <span>Launch Platform</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10 space-y-12 w-full">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#1e40af] text-xs sm:text-sm font-semibold">
            <Shield className="w-4 h-4" />
            <span>Enterprise Campus Security & Governance Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#172033] leading-tight">
            One Request. One Approval Flow.{' '}
            <span className="text-[#1e40af]">
              One Source of Truth.
            </span>
          </h1>

          <p className="text-[#5b6472] text-base sm:text-lg leading-relaxed">
            Digitizing parent consent, institutional approvals, digital exception attestation, and time-bound QR gate verification into one continuous audit ledger.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="px-8 py-3.5 rounded-lg bg-[#1e40af] hover:bg-blue-800 text-white font-semibold text-base shadow-xs transition-colors flex items-center space-x-2.5 min-h-[48px]"
            >
              <span>Explore Demo Environment</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workflow Visualizer */}
        <GlassCard className="p-8 border-slate-200 bg-white shadow-xs">
          <h2 className="text-center text-xs font-bold uppercase tracking-widest text-[#1e40af] mb-8">
            Unified Campus Exit Lifecycle Architecture
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {/* Step 1 */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-[#1e40af] mx-auto flex items-center justify-center font-bold text-base">
                1
              </div>
              <h3 className="font-bold text-sm text-[#172033]">Student Submission</h3>
              <p className="text-xs text-[#5b6472]">Multi-step form with timing & purpose validation</p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 mx-auto flex items-center justify-center font-bold text-base">
                2
              </div>
              <h3 className="font-bold text-sm text-[#172033]">Parent Consent</h3>
              <p className="text-xs text-[#5b6472]">Tokenized secure portal & notification link</p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-[#1e40af] mx-auto flex items-center justify-center font-bold text-base">
                3
              </div>
              <h3 className="font-bold text-sm text-[#172033]">Institutional Review</h3>
              <p className="text-xs text-[#5b6472]">Advisor, Warden or Mentor E-Attestation</p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-900 mx-auto flex items-center justify-center font-bold text-base">
                4
              </div>
              <h3 className="font-bold text-sm text-[#172033]">Time-Bound Pass</h3>
              <p className="text-xs text-[#5b6472]">Cryptographically signed active QR pass</p>
            </div>

            {/* Step 5 */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-900 mx-auto flex items-center justify-center font-bold text-base">
                5
              </div>
              <h3 className="font-bold text-sm text-[#172033]">Gate Verification</h3>
              <p className="text-xs text-[#5b6472]">Instant scan, movement log & audit trail</p>
            </div>
          </div>
        </GlassCard>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-6 space-y-3 bg-white border-slate-200 shadow-xs">
            <div className="p-3 rounded-lg bg-blue-50 text-[#1e40af] w-fit border border-blue-200">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#172033]">Digital Exception Passes</h3>
            <p className="text-sm text-[#5b6472] leading-relaxed">
              Replaces manual paper leave letters with Mentor electronic attestations and time-bound QR passes.
            </p>
          </GlassCard>

          <GlassCard className="p-6 space-y-3 bg-white border-slate-200 shadow-xs">
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 w-fit border border-emerald-200">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#172033]">Immutable Audit Trail</h3>
            <p className="text-sm text-[#5b6472] leading-relaxed">
              Every request state change, parent consent, approval, and gate event is recorded in a cryptographically verifiable log.
            </p>
          </GlassCard>

          <GlassCard className="p-6 space-y-3 bg-white border-slate-200 shadow-xs">
            <div className="p-3 rounded-lg bg-purple-50 text-purple-900 w-fit border border-purple-200">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#172033]">Executive Campus Analytics</h3>
            <p className="text-sm text-[#5b6472] leading-relaxed">
              Rule-based analytics identify approval bottlenecks, peak gate traffic, and exception request trends.
            </p>
          </GlassCard>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-[#5b6472] relative z-10">
        <p>© 2026 Bannari Amman Institute of Technology (BIT) • Campus Pass Platform</p>
      </footer>
    </div>
  );
};
