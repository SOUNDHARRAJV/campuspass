import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { NotificationItem } from '../../types';
import { Bell, Shield, LogOut, CheckCheck } from 'lucide-react';

interface AppHeaderProps {
  onOpenApplyModal?: (otp?: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenApplyModal }) => {
  const { currentUser, logout } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser) return;
    const updateNotifs = () => {
      const items = dataService.getNotificationsForUser(currentUser.id);
      setNotifications(items);
      setUnreadCount(items.filter(i => !i.read).length);
    };

    updateNotifs();
    const unsubscribe = dataService.subscribe(updateNotifs);
    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  const dropdownRef = React.useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showNotifications]);

  const handleMarkAllRead = () => {
    notifications.forEach(n => dataService.markNotificationAsRead(n.id));
  };

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sticky top-0 z-30 shadow-xs w-full">
      <div className="w-full flex items-center justify-between gap-3">
        {/* Left: Campus Pass Branding */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#1e40af] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-lg sm:text-xl font-bold text-[#172033] tracking-tight truncate">
                Campus Pass
              </span>
              <span className="hidden sm:inline-block text-[11px] font-semibold bg-blue-50 text-[#1e40af] px-2 py-0.5 rounded-md border border-blue-200">
                Official
              </span>
            </div>
            <span className="text-xs text-[#5b6472] hidden sm:block">Campus Management System</span>
          </div>
        </div>

        {/* Right: User Profile & Notification Controls */}
        <div className="flex items-center space-x-3 shrink-0">
          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#172033] transition-colors border border-slate-200 flex items-center justify-center"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5 text-slate-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div ref={dropdownRef} className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:max-w-md rounded-xl bg-white border border-slate-200 shadow-xl z-50 p-4 text-[#172033]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-[#1e40af]" />
                    <h4 className="text-base font-bold text-[#172033]">Notifications</h4>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-[#1e40af] hover:text-blue-800 flex items-center space-x-1 font-semibold"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2 custom-scrollbar">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-[#5b6472] text-center py-6">No notifications</p>
                  ) : (
                    notifications.map(item => (
                      <div
                        key={item.id}
                        onClick={() => {
                          dataService.markNotificationAsRead(item.id);
                          if (item.linkRequestId === 'APPLY_EMERGENCY' && onOpenApplyModal) {
                            const m = item.message.match(/(\d{4})/);
                            const code = m ? m[1] : undefined;
                            onOpenApplyModal(code);
                          }
                        }}
                        className={`p-3 rounded-lg border text-sm transition-colors cursor-pointer ${
                          item.read
                            ? 'bg-slate-50 border-slate-200 text-[#5b6472]'
                            : 'bg-blue-50/50 border-blue-200 text-[#172033]'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold text-[#172033] mb-1">
                          <span>{item.title}</span>
                          <span className="text-xs text-[#5b6472]">
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[#5b6472] text-xs leading-relaxed">{item.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Info */}
          {currentUser && (
            <div className="flex items-center space-x-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                alt={currentUser.name}
                className="w-8 h-8 rounded-md object-cover border border-slate-300"
              />
              <div className="text-left min-w-0 hidden sm:block">
                <p className="text-xs font-semibold text-[#5b6472] uppercase tracking-wider leading-none">
                  {currentUser.registerNumber || currentUser.role}
                </p>
                <p className="text-sm font-bold text-[#172033] leading-tight truncate max-w-[12rem]">
                  {currentUser.name}
                </p>
              </div>

              <button
                onClick={logout}
                title="Sign Out / Switch Role"
                className="p-1.5 rounded-md hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors ml-1 border border-slate-200"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
