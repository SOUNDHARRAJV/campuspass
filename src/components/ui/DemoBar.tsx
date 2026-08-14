import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { DEMO_USERS } from '../../constants/mockData';
import { UserCheck, RefreshCw, Sparkles, Play, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const DemoBar: React.FC = () => {
  const { currentUser, switchUserRole } = useAuth();
  const [scenarioRunning, setScenarioRunning] = useState(false);
  const [scenarioStep, setScenarioStep] = useState<string | null>(null);

  const roles = [
    { key: 'student', name: 'Student', role: 'STUDENT', badge: 'Rahul' },
    { key: 'parent', name: 'Parent', role: 'PARENT', badge: 'Suresh' },
    { key: 'warden', name: 'Warden', role: 'WARDEN', badge: 'Prof. Ramesh' },
    { key: 'mentor', name: 'Mentor', role: 'ADVISOR', badge: 'Dr. Priya' },
    { key: 'security', name: 'Security', role: 'SECURITY', badge: 'Gate 1' },
    { key: 'admin', name: 'Admin', role: 'ADMIN', badge: 'Dean' }
  ];

  const handleResetData = () => {
    dataService.resetDemoData();
  };

  const handleRunFullScenario = async () => {
    setScenarioRunning(true);

    // Step 1: Switch to Student & Submit Leave
    setScenarioStep('1. Submitting Leave Request as Rahul Sharma...');
    switchUserRole('student');
    await new Promise(r => setTimeout(r, 1200));

    const req = dataService.submitRequest(DEMO_USERS.student, {
      type: 'LEAVE',
      reason: 'Demo Presentation - Town Visit',
      destination: 'Coimbatore Market',
      emergencyContact: '+91 98123 45678',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 8 * 3600 * 1000).toISOString()
    });

    // Step 2: Parent Approve
    setScenarioStep('2. Switching to Parent & Giving Consent...');
    switchUserRole('parent');
    await new Promise(r => setTimeout(r, 1200));
    dataService.submitParentConsent(req.id, 'APPROVE', 'Approved for demo presentation');

    // Step 3: Warden Approve
    setScenarioStep('3. Warden approving leave request...');
    switchUserRole('warden');
    await new Promise(r => setTimeout(r, 1200));
    dataService.approveRequestByAuthority(req.id, DEMO_USERS.warden, 'APPROVE', 'Hostel permission granted');

    // Step 4: Security Verification
    setScenarioStep('4. Pass Issued! Security scanning QR at gate...');
    switchUserRole('security');
    await new Promise(r => setTimeout(r, 1200));
    const pass = dataService.getPassByRequestId(req.id);
    if (pass) {
      dataService.recordGateMovement(pass.id, 'EXIT', DEMO_USERS.security, 'Automated Demo Gate Exit Scan');
    }

    setScenarioStep('✓ Demo Scenario Completed! Request tracked in Audit Trail.');
    await new Promise(r => setTimeout(r, 1800));
    setScenarioRunning(false);
    setScenarioStep(null);
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-3 py-2 text-xs text-slate-100">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left: Role Switcher */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5 custom-scrollbar">
          <span className="flex items-center space-x-1 font-bold text-indigo-400 mr-2 uppercase tracking-wider text-[11px]">
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Role Switcher:</span>
          </span>

          {roles.map(r => {
            const isActive = currentUser?.role === r.role;
            return (
              <button
                key={r.key}
                onClick={() => switchUserRole(r.key)}
                className={`
                  flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition-all font-medium whitespace-nowrap text-xs
                  ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm font-bold'
                      : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700/60'
                  }
                `}
              >
                <span>{r.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-950 text-slate-400'}`}>
                  {r.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2">
          {scenarioStep && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="font-medium text-[11px]">{scenarioStep}</span>
            </div>
          )}

          <button
            onClick={handleRunFullScenario}
            disabled={scenarioRunning}
            className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-sm"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Run Demo Flow</span>
          </button>

          <button
            onClick={handleResetData}
            title="Reset Mock Data"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
