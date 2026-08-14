import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { LeaveRequest, ParentConsent } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { NotificationItem } from '../types';
import { UserCheck, AlertCircle, CheckCircle2, XCircle, Clock, MapPin, Bell, Shield, Smartphone } from 'lucide-react';

export const ParentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [completedConsents, setCompletedConsents] = useState<{ req: LeaveRequest; consent: ParentConsent }[]>([]);
  const [allWardRequests, setAllWardRequests] = useState<LeaveRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [remarks, setRemarks] = useState<{ [key: string]: string }>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const loadParentData = () => {
      const allRequests = dataService.getRequests();
      const allConsents = dataService.getParentConsents();
      const parentNotifs = dataService.getNotificationsForUser(currentUser?.id || 'usr-parent-501');

      setNotifications(parentNotifs);
      setAllWardRequests(allRequests);

      const pending = allRequests.filter(r => r.parentStatus === 'PENDING' && r.type !== 'EXCEPTION');
      setPendingRequests(pending);

      const completed = allConsents
        .filter(c => c.status !== 'PENDING')
        .map(c => {
          const req = allRequests.find(r => r.id === c.requestId);
          return req ? { req, consent: c } : null;
        })
        .filter((item): item is { req: LeaveRequest; consent: ParentConsent } => item !== null);

      setCompletedConsents(completed);
    };

    loadParentData();
    const unsubscribe = dataService.subscribe(loadParentData);
    return () => unsubscribe();
  }, [currentUser]);

  const handleConsentAction = (requestId: string, action: 'APPROVE' | 'REJECT') => {
    setProcessingId(requestId);
    setTimeout(() => {
      dataService.submitParentConsent(
        requestId,
        action,
        remarks[requestId] || (action === 'APPROVE' ? 'Approved by parent.' : 'Declined by parent.')
      );
      setProcessingId(null);
    }, 400);
  };

  return (
    <div className="space-y-6 text-[#172033] font-sans pb-12">
      {/* Header Banner */}
      <GlassCard className="p-6 bg-white border-slate-200 shadow-xs">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-blue-50 text-[#1e40af] border border-blue-200 shrink-0">
            <UserCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#172033]">Parent Consent & Authorization Portal</h1>
            <p className="text-sm sm:text-base text-[#5b6472] mt-1">
              Verify and authorize student campus leave applications safely and securely.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* PENDING CONSENT ACTIONS REQUIRED */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <h2 className="text-xl font-bold text-[#172033]">Pending Authorization Requests ({pendingRequests.length})</h2>
        </div>

        {pendingRequests.length === 0 ? (
          <GlassCard className="p-10 text-center text-sm text-[#5b6472] bg-white border-slate-200 shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="font-bold text-[#172033] text-base">No pending parent consent actions required!</p>
            <p className="mt-1 text-[#5b6472]">All student exit requests have been reviewed and processed.</p>
          </GlassCard>
        ) : (
          pendingRequests.map(req => (
            <GlassCard key={req.id} className="p-6 border-slate-300 shadow-xs bg-white space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-[#1e40af] bg-blue-50 px-2.5 py-1 rounded border border-blue-200">{req.requestNumber}</span>
                    <span className="text-xs px-2.5 py-1 rounded bg-slate-100 text-[#172033] font-bold uppercase border border-slate-200">
                      {req.type} REQUEST
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#172033] mt-2">{req.studentName}</h3>
                  <p className="text-sm text-[#5b6472]">
                    Register No: {req.registerNumber} • Department: {req.department} • Hostel: {req.hostelBlock}
                  </p>
                </div>

                <StatusBadge status="PARENT_PENDING" size="lg" />
              </div>

              {/* Request Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <span className="text-xs uppercase font-bold text-[#5b6472]">Destination</span>
                  <p className="font-bold text-[#172033] flex items-center space-x-1.5 text-base">
                    <MapPin className="w-4 h-4 text-[#1e40af]" />
                    <span>{req.destination}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs uppercase font-bold text-[#5b6472]">Leave Timings</span>
                  <p className="font-mono text-[#172033] font-semibold flex items-center space-x-1.5 text-sm">
                    <Clock className="w-4 h-4 text-amber-700" />
                    <span>
                      {new Date(req.startDate).toLocaleDateString()} → {new Date(req.endDate).toLocaleDateString()}
                    </span>
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs uppercase font-bold text-[#5b6472]">Stated Reason</span>
                  <p className="font-semibold text-[#172033] italic">"{req.reason}"</p>
                </div>
              </div>

              {/* Remarks Input */}
              <div>
                <label className="block text-sm sm:text-base font-semibold text-[#172033] mb-2">
                  Parent Remarks (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Verified and approved over phone..."
                  value={remarks[req.id] || ''}
                  onChange={e => setRemarks({ ...remarks, [req.id]: e.target.value })}
                  className="w-full h-12 bg-white border border-slate-300 rounded-lg px-4 text-base text-[#172033] placeholder-slate-400 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              {/* Action Buttons (Section 8) */}
              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  onClick={() => handleConsentAction(req.id, 'REJECT')}
                  disabled={processingId === req.id}
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-base shadow-xs transition-colors flex items-center justify-center space-x-2 min-h-[44px]"
                >
                  <XCircle className="w-5 h-5" />
                  <span>Decline Leave</span>
                </button>

                <button
                  onClick={() => handleConsentAction(req.id, 'APPROVE')}
                  disabled={processingId === req.id}
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base shadow-xs transition-colors flex items-center justify-center space-x-2 min-h-[44px]"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{processingId === req.id ? 'Processing...' : 'Give Parent Consent'}</span>
                </button>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* REALTIME WARD LEAVE & EMERGENCY TRACKER */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-[#172033]">Realtime Ward Leave & Emergency Tracker</h2>
          </div>
          <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
            <span>Live Campus Link</span>
          </span>
        </div>

        <GlassCard className="p-0 overflow-hidden bg-white border-slate-200 shadow-xs">
          <div className="responsive-table custom-scrollbar">
            <table className="w-full text-left text-sm text-[#172033]">
              <thead className="bg-slate-100 text-[#475569] uppercase text-xs tracking-wider border-b border-slate-300 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Req No</th>
                  <th className="py-3.5 px-4">Leave Category</th>
                  <th className="py-3.5 px-4">Duration / Dates</th>
                  <th className="py-3.5 px-4">Live Gate Movement Status</th>
                  <th className="py-3.5 px-4">Parent Consent / Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {allWardRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#5b6472] font-semibold text-base">
                      No ward leave applications logged yet.
                    </td>
                  </tr>
                ) : (
                  allWardRequests.map(req => {
                    const isEmergency = (req as any).isEmergency || req.leaveTitle === 'Emergency Leave';
                    return (
                      <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#1e40af]">{req.requestNumber}</td>
                        <td className="py-3.5 px-4">
                          {isEmergency ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              ⚡ Emergency Leave
                            </span>
                          ) : (
                            <span className="font-semibold text-[#172033]">{req.leaveTitle || req.type}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono text-[#5b6472]">
                          {new Date(req.startDate).toLocaleDateString()} → {new Date(req.endDate).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-xs">
                          {req.currentStage || 'Inside Campus'}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={req.parentStatus === 'SKIPPED' ? 'APPROVED' : req.status} size="sm" />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* REALTIME LIVE SMS & GATE MOVEMENT ALERTS */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-amber-600" />
          <h2 className="text-xl font-bold text-[#172033]">Live Realtime Notifications &amp; SMS Dispatch Stream</h2>
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <GlassCard className="p-6 text-center text-sm text-[#5b6472] bg-white border-slate-200">
              No recent alerts or SMS notifications recorded.
            </GlassCard>
          ) : (
            notifications.map(notif => (
              <GlassCard key={notif.id} className="p-4 bg-white border-slate-200 shadow-xs flex items-start justify-between gap-4">
                <div className="flex items-start space-x-3 min-w-0">
                  <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${notif.type === 'WARNING' ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-[#1e40af]'}`}>
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#172033] text-base">{notif.title}</h4>
                    <p className="text-sm text-[#5b6472] mt-0.5">{notif.message}</p>
                    <span className="inline-block text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-2">
                      📱 Live SMS Alert Delivered to {currentUser?.parentPhone || '+91 98123 45678'}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400 shrink-0">
                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </GlassCard>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
