import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppHeader } from './components/layout/AppHeader';
import { AppNavigation } from './components/layout/AppNavigation';

import { LoginPage } from './pages/LoginPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { ParentDashboard } from './pages/ParentDashboard';
import { DepartmentDashboard } from './pages/DepartmentDashboard';
import { WardenDashboard } from './pages/WardenDashboard';
import { SecurityDashboard } from './pages/SecurityDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ManagementDashboard } from './pages/ManagementDashboard';

import { ApplyLeaveModal } from './components/common/ApplyLeaveModal';
import { AuditTrailTable } from './components/common/AuditTrailTable';

function MainAppContent() {
  const { currentUser, currentRole } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyOtpPrefill, setApplyOtpPrefill] = useState<string | undefined>(undefined);

  // Ensure role-based path routing and protect role-specific paths
  React.useEffect(() => {
    const roleToPath: Record<string, string> = {
      STUDENT: '/student',
      PARENT: '/parent',
      HOD: '/hod',
      ADVISOR: '/hod',
      WARDEN: '/warden',
      SECURITY: '/security',
      MANAGEMENT: '/management',
      ADMIN: '/admin'
    };

    if (!currentUser) {
      // Ensure root path while logged out
      if (window.location.pathname !== '/' && window.location.pathname !== '') {
        window.history.replaceState({}, '', '/');
      }
      return;
    }

    const target = roleToPath[currentRole] || '/student';
    if (window.location.pathname !== target) {
      window.history.replaceState({}, '', target);
    }
  }, [currentUser, currentRole]);

  if (!currentUser) {
    return <LoginPage onSuccess={() => setActiveTab('dashboard')} />;
  }

  const renderRoleDashboard = () => {
    if (activeTab === 'audit' || activeTab === 'history' || activeTab === 'gate_logs') {
      return <AuditTrailTable />;
    }

    switch (currentRole) {
      case 'STUDENT':
        return <StudentDashboard activeTab={activeTab} onApplyLeave={() => setShowApplyModal(true)} />;
      case 'PARENT':
        return <ParentDashboard />;
      case 'HOD':
      case 'ADVISOR':
        return <DepartmentDashboard />;
      case 'WARDEN':
        return <WardenDashboard />;
      case 'SECURITY':
        return <SecurityDashboard />;
      case 'MANAGEMENT':
        return <ManagementDashboard />;
      case 'ADMIN':
        return <AdminDashboard />;
      default:
        return <StudentDashboard activeTab={activeTab} onApplyLeave={() => setShowApplyModal(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#172033] font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      <div className="flex flex-col min-h-screen">
        <AppHeader onOpenApplyModal={(otp?: string) => { setApplyOtpPrefill(otp); setShowApplyModal(true); }} />

        <div className="flex-1 flex flex-col md:flex-row">
          <AppNavigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          <main className="flex-1 px-4 py-6 sm:px-6 lg:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              {renderRoleDashboard()}
            </div>
          </main>
        </div>
      </div>

      <ApplyLeaveModal isOpen={showApplyModal} onClose={() => { setShowApplyModal(false); setApplyOtpPrefill(undefined); }} id={applyOtpPrefill ? 'emergency-apply' : undefined} emergencyOtpPrefill={applyOtpPrefill} />

      <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-6 text-center text-xs sm:text-sm text-[#5b6472] font-medium shrink-0">
        <p>© 2026 Bannari Amman Institute of Technology (BIT) • Campus Pass — BIT Automated Student Leave &amp; Outpass Management System</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
