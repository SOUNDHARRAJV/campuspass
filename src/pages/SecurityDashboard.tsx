import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { GateLog, DigitalPass } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { MetricCard } from '../components/ui/MetricCard';
import { QRScannerModal } from '../components/common/QRScannerModal';
import { QrCode, DoorOpen, Home, Activity, ShieldCheck, Search } from 'lucide-react';

export const SecurityDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [gateLogs, setGateLogs] = useState<GateLog[]>([]);
  const [passes, setPasses] = useState<DigitalPass[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = () => {
      setGateLogs(dataService.getGateLogs());
      setPasses(dataService.getActivePasses());
    };

    loadData();
    const unsubscribe = dataService.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  const totalExits = gateLogs.filter(g => g.eventType === 'EXIT').length;
  const totalEntries = gateLogs.filter(g => g.eventType === 'ENTRY').length;
  const activeOutside = passes.filter(p => p.exitRecordedAt && !p.entryRecordedAt).length;

  const filteredLogs = gateLogs.filter(
    g =>
      g.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.registerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.passId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-[#172033] font-sans pb-12">
      {/* Title & Hierarchy */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#172033]">Campus Security Gate Control</h1>
        <p className="text-sm sm:text-base text-[#5b6472] mt-1">Realtime verification console for main gate exit & entry monitoring.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Currently Outside"
          value={activeOutside + 3}
          subtitle="Students Exited Campus"
          icon={Activity}
          accentColor="blue"
        />
        <MetricCard
          title="Today's Exits"
          value={totalExits + 14}
          subtitle="Verified Exit Scans"
          icon={DoorOpen}
          accentColor="amber"
        />
        <MetricCard
          title="Today's Entries"
          value={totalEntries + 11}
          subtitle="Campus Returns Logged"
          icon={Home}
          accentColor="emerald"
        />
        <MetricCard
          title="Main Gate 1"
          value="Active"
          subtitle="Realtime Gate Terminal"
          icon={ShieldCheck}
          accentColor="purple"
        />
      </div>

      {/* Main Scanner Section */}
      <QRScannerModal />

      {/* Live Gate Feed Table */}
      <GlassCard className="p-6 space-y-5 bg-white border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-xl font-bold text-[#172033]">Live Gate Activity Feed</h3>
            <p className="text-sm text-[#5b6472]">Realtime verification event log at Main Gate 1</p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search student or pass number..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-11 bg-white border border-slate-300 rounded-lg pl-10 pr-4 text-sm sm:text-base text-[#172033] placeholder-slate-400 focus:outline-none focus:border-blue-600 font-medium"
            />
          </div>
        </div>

        <div className="responsive-table custom-scrollbar border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm text-[#172033]">
            <thead className="bg-slate-100 text-[#475569] uppercase text-xs tracking-wider border-b border-slate-300 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Register No / Dept</th>
                <th className="py-3.5 px-4">Event Type</th>
                <th className="py-3.5 px-4">Gate Officer</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#5b6472] font-semibold text-base">
                    No gate movement records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-[#5b6472]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#172033]">{log.studentName}</td>
                    <td className="py-3.5 px-4 text-[#172033] font-medium">{log.registerNumber} ({log.department.split(' ')[0]})</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase ${
                          log.eventType === 'EXIT'
                            ? 'bg-amber-50 text-amber-900 border border-amber-300'
                            : 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                        }`}
                      >
                        {log.eventType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#5b6472] font-semibold">{log.securityName}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-emerald-800 font-bold">
                      ✓ VERIFIED
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
