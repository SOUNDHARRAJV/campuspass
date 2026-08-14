import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import { SystemAnalytics } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { MetricCard } from '../components/ui/MetricCard';
import { AuditTrailTable } from '../components/common/AuditTrailTable';
import {
  Users,
  FileCheck,
  CheckCircle2,
  Activity,
  Download,
  BarChart3,
  TrendingUp,
  Lightbulb
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [analytics, setAnalytics] = useState<SystemAnalytics>(() => dataService.getAnalytics());
  const [pendingParentOverrides, setPendingParentOverrides] = useState(() =>
    dataService.getRequests().filter(r => r.parentStatus === 'PENDING' && r.type !== 'EXCEPTION')
  );
  const [overrideComments, setOverrideComments] = useState<Record<string, string>>({});
  const [processingOverride, setProcessingOverride] = useState<string | null>(null);

  useEffect(() => {
    const updateAnalytics = () => {
      setAnalytics(dataService.getAnalytics());
      setPendingParentOverrides(dataService.getRequests().filter(r => r.parentStatus === 'PENDING' && r.type !== 'EXCEPTION'));
    };
    updateAnalytics();
    const unsubscribe = dataService.subscribe(updateAnalytics);
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6 text-[#172033] font-sans pb-12">
      {/* Title */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#172033]">Institutional Governance & Analytics</h1>
        <p className="text-sm sm:text-base text-[#5b6472] mt-1">Realtime campus metric tracking, gate movements, and administrative controls.</p>
      </div>

      {/* Top Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Total Students"
          value={analytics.totalStudents}
          subtitle="Enrolled Across Departments"
          icon={Users}
          accentColor="blue"
        />
        <MetricCard
          title="Requests Today"
          value={analytics.requestsToday}
          subtitle="Leave & OD Submissions"
          icon={FileCheck}
          accentColor="blue"
        />
        <MetricCard
          title="Approval Rate"
          value={`${analytics.approvalRate}%`}
          subtitle="Avg Time: 14 Mins"
          icon={CheckCircle2}
          accentColor="emerald"
        />
        <MetricCard
          title="Active Outside Campus"
          value={analytics.activeOutsideCampus}
          subtitle="Gate Exit Recorded"
          icon={Activity}
          accentColor="purple"
        />
      </div>

      {/* Institutional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {analytics.insights.map(ins => (
          <GlassCard key={ins.id} className="p-5 border-blue-200 bg-white shadow-xs flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-blue-50 text-[#1e40af] shrink-0 mt-0.5 border border-blue-200">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-base text-[#172033]">{ins.title}</h4>
              <p className="text-xs sm:text-sm text-[#5b6472] mt-1 leading-relaxed">{ins.description}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Data Visualization Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1 */}
        <GlassCard className="p-6 space-y-4 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-[#172033]">Leave & OD Request Volume by Day</h3>
              <p className="text-xs sm:text-sm text-[#5b6472]">Weekly breakdown of student exit applications</p>
            </div>
            <BarChart3 className="w-5 h-5 text-[#1e40af]" />
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.requestsByDay}>
                <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="leave" name="Leave" fill="#1E40AF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="od" name="On Duty (OD)" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="exception" name="Exception" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Chart 2 */}
        <GlassCard className="p-6 space-y-4 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-[#172033]">Hourly Gate Exits vs Entries</h3>
              <p className="text-xs sm:text-sm text-[#5b6472]">Campus security traffic distribution</p>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-700" />
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.hourlyGateTraffic}>
                <XAxis dataKey="hour" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Area type="monotone" dataKey="exits" name="Exits" stroke="#D97706" fill="#D97706" fillOpacity={0.15} />
                <Area type="monotone" dataKey="entries" name="Entries" stroke="#059669" fill="#059669" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Admin Quick Actions */}
      {currentUser?.role === 'ADMIN' && (
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="text-base font-bold text-[#172033]">Admin System Controls</h4>
            <p className="text-sm text-[#5b6472] mt-0.5">Clear historical demo logs or execute bulk emergency actions.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                if (!confirm('Clear previous demo records? This will remove older requests and audit logs.')) return;
                dataService.clearHistoricalData(new Date().toISOString());
                alert('Historical records cleared.');
              }}
              className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#172033] text-sm font-semibold border border-slate-300 transition-colors"
            >
              Clear Previous Records
            </button>

            <button
              onClick={() => {
                if (!confirm('Auto-approve all emergency requests now?')) return;
                const count = dataService.autoApproveAllEmergencies(currentUser);
                alert(`${count} emergency request(s) auto-approved.`);
              }}
              className="px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors"
            >
              Auto-Approve All Emergencies
            </button>
          </div>
        </div>
      )}

      {/* Parent Consent Overrides */}
      {currentUser?.role === 'ADMIN' && (
        <div className="space-y-4 p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h4 className="text-lg font-bold text-[#172033]">Pending Parent Consent Overrides</h4>
              <p className="text-sm text-[#5b6472]">Bypass parent consent by documenting an explicit administrative comment.</p>
            </div>
            <div className="text-xs font-bold text-[#1e40af] bg-blue-50 px-2.5 py-1 rounded border border-blue-200">{pendingParentOverrides.length} PENDING</div>
          </div>

          {pendingParentOverrides.length === 0 ? (
            <p className="text-sm text-[#5b6472]">No pending parent consents to review.</p>
          ) : (
            pendingParentOverrides.map(req => (
              <div key={req.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="font-mono text-xs text-[#1e40af] font-bold">{req.requestNumber}</div>
                    <div className="font-bold text-[#172033] text-base">{req.studentName} • {req.department}</div>
                    <div className="text-xs text-[#5b6472]">Destination: {req.destination}</div>
                  </div>
                  <div className="w-full sm:w-80">
                    <input
                      type="text"
                      placeholder="Admin override comment (required)"
                      value={overrideComments[req.id] || ''}
                      onChange={e => setOverrideComments({ ...overrideComments, [req.id]: e.target.value })}
                      className="w-full h-11 bg-white border border-slate-300 rounded-lg px-3.5 text-sm text-[#172033] placeholder-slate-400 font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    onClick={async () => {
                      const comment = overrideComments[req.id] || '';
                      if (!comment || comment.trim().length === 0) {
                        alert('Please enter a mandatory comment before skipping parent consent.');
                        return;
                      }
                      if (!currentUser) return;
                      setProcessingOverride(req.id);
                      try {
                        dataService.overrideParentConsent(req.id, currentUser, comment);
                        setOverrideComments(prev => ({ ...prev, [req.id]: '' }));
                      } catch (err: any) {
                        alert(err.message || 'Override failed');
                      }
                      setProcessingOverride(null);
                    }}
                    disabled={processingOverride === req.id}
                    className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition-colors"
                  >
                    {processingOverride === req.id ? 'Processing...' : 'Skip Parent Consent'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Export Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div>
          <h4 className="text-base font-bold text-[#172033]">Institutional Data Export</h4>
          <p className="text-sm text-[#5b6472]">Download system audit logs and requests in standard CSV format.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => dataService.exportToCsv('REQUESTS')}
            className="h-11 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#172033] text-sm font-semibold flex items-center space-x-2 border border-slate-300 transition-colors"
          >
            <Download className="w-4 h-4 text-[#1e40af]" />
            <span>Requests CSV</span>
          </button>

          <button
            onClick={() => dataService.exportToCsv('GATE_LOGS')}
            className="h-11 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#172033] text-sm font-semibold flex items-center space-x-2 border border-slate-300 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Gate Logs CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
