import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  History,
  LogOut
} from 'lucide-react';

interface AppNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const AppNavigation: React.FC<AppNavigationProps> = ({
  activeTab,
  setActiveTab
}) => {
  const { currentRole, logout } = useAuth();

  const getNavLabel = (role: string) => {
    switch (role) {
      case 'PARENT':
        return 'Parent Consent Portal';
      case 'ADVISOR':
      case 'HOD':
        return 'Department Approvals';
      case 'WARDEN':
        return 'Hostel Approvals';
      case 'SECURITY':
        return 'Gate Verification';
      case 'MANAGEMENT':
        return 'Executive Analytics';
      case 'ADMIN':
        return 'Admin Dashboard';
      default:
        return 'My Leaves & Passes';
    }
  };

  const mainNavItems = [
    { id: 'dashboard', label: getNavLabel(currentRole), icon: LayoutDashboard },
    ...(currentRole === 'ADMIN' ? [{ id: 'audit', label: 'System Audit Logs', icon: History }] : [])
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col justify-between w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-61px)] p-4 shrink-0 shadow-xs">
        <div className="space-y-6">
          {/* Sidebar Section Title / Brand */}
          <div className="px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs font-bold uppercase tracking-wider text-[#1e40af]">
              Campus Management
            </p>
            <p className="text-base font-bold text-[#172033] mt-0.5 capitalize">
              {currentRole.toLowerCase()} Portal
            </p>
          </div>

          {/* Main Navigation Group */}
          <div>
            <p className="px-3 text-xs font-semibold text-[#5b6472] uppercase tracking-wider mb-2">
              Navigation
            </p>
            <nav className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id || (item.id === 'dashboard' && (activeTab === '' || activeTab === 'requests' || activeTab === 'passes'));
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-50 text-[#1e40af] border-l-4 border-[#1e40af] shadow-2xs font-bold'
                        : 'text-[#5b6472] hover:text-[#172033] hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#1e40af]' : 'text-slate-500'}`} />
                    <span className="text-base">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Sign Out Control */}
        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-rose-700 hover:bg-rose-50 font-semibold text-sm transition-colors border border-transparent hover:border-rose-200"
          >
            <LogOut className="w-5 h-5 text-rose-600" />
            <span className="text-base font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Navigation Header Bar */}
      <nav className="lg:hidden bg-white border-b border-slate-200 px-3 py-2 flex items-center space-x-2 overflow-x-auto custom-scrollbar">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'dashboard' && (activeTab === '' || activeTab === 'requests' || activeTab === 'passes'));
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#1e40af] text-white shadow-xs'
                  : 'bg-slate-100 text-[#5b6472] hover:bg-slate-200 hover:text-[#172033]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
