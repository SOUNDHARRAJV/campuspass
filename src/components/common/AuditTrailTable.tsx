import React, { useState } from 'react';
import { AuditLog } from '../../types';
import { dataService } from '../../services/dataService';
import { DEMO_USERS } from '../../constants/mockData';
import { GlassCard } from '../ui/GlassCard';
import { Search, Download, ShieldCheck, X, FileText, CheckCircle2, LogOut, LogIn, FileCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuditTrailTableProps {
  id?: string;
}

interface StudentAuditSummary {
  studentId: string;
  studentName: string;
  registerNumber: string;
  department: string;
  hostelBlock: string;
  latestPassNumber?: string;
  latestRequestNumber?: string;
  currentStatus: string;
  lastTimestamp: string;
  totalLeavesCount: number;
  totalExitsCount: number;
  totalEntriesCount: number;
  rawLogs: AuditLog[];
}

export const AuditTrailTable: React.FC<AuditTrailTableProps> = ({ id }) => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentSummary, setSelectedStudentSummary] = useState<StudentAuditSummary | null>(null);

  const allRequests = dataService.getRequests();
  const allPasses = dataService.getPasses();
  const allGateLogs = dataService.getGateLogs();
  const allAuditLogs = dataService.getAuditLogs();

  const studentProfiles = Object.values(DEMO_USERS).filter(u => u.role === 'STUDENT');

  const studentSummaries: StudentAuditSummary[] = studentProfiles.map(student => {
    const studentReqs = allRequests.filter(r => r.studentId === student.id || r.registerNumber === student.registerNumber || r.studentName.includes(student.name));
    const latestReq = studentReqs[0];
    const studentPasses = allPasses.filter(p => p.studentId === student.id || p.registerNumber === student.registerNumber);
    const latestPass = studentPasses[0];
    const studentGateLogs = allGateLogs.filter(g => g.studentId === student.id || g.registerNumber === student.registerNumber);

    const studentRawAudits = allAuditLogs.filter(a => {
      const meta = a.metadata || {};
      return (
        a.actorId === student.id ||
        a.entityId === student.id ||
        (meta.studentName && meta.studentName.toLowerCase().includes(student.name.toLowerCase())) ||
        (latestReq && a.entityId === latestReq.id) ||
        (latestPass && a.entityId === latestPass.id)
      );
    });

    const exitCount = studentGateLogs.filter(g => g.eventType === 'EXIT').length;
    const entryCount = studentGateLogs.filter(g => g.eventType === 'ENTRY').length;
    const leaveCount = studentReqs.length;

    const exitLog = studentGateLogs.find(g => g.eventType === 'EXIT');
    const entryLog = studentGateLogs.find(g => g.eventType === 'ENTRY');

    let overallStatus = 'IDLE';
    if (entryLog) overallStatus = 'RETURNED (Inside)';
    else if (exitLog) overallStatus = 'EXITED (Outside)';
    else if (latestPass) overallStatus = 'PASS ACTIVE';
    else if (latestReq) overallStatus = latestReq.status;

    let lastTime = latestReq ? latestReq.createdAt : new Date().toISOString();
    if (exitLog) lastTime = exitLog.timestamp;
    if (entryLog) lastTime = entryLog.timestamp;

    return {
      studentId: student.id,
      studentName: student.name,
      registerNumber: student.registerNumber || 'N/A',
      department: student.department || 'General',
      hostelBlock: student.hostelBlock || 'Hosteller',
      latestPassNumber: latestPass ? latestPass.passNumber : undefined,
      latestRequestNumber: latestReq ? latestReq.requestNumber : undefined,
      currentStatus: overallStatus,
      lastTimestamp: lastTime,
      totalLeavesCount: leaveCount,
      totalExitsCount: exitCount,
      totalEntriesCount: entryCount,
      rawLogs: studentRawAudits
    };
  });

  const filteredSummaries = studentSummaries.filter(s => {
    const term = searchTerm.toLowerCase();
    return (
      s.studentName.toLowerCase().includes(term) ||
      s.registerNumber.toLowerCase().includes(term) ||
      s.department.toLowerCase().includes(term) ||
      (s.latestPassNumber && s.latestPassNumber.toLowerCase().includes(term)) ||
      (s.latestRequestNumber && s.latestRequestNumber.toLowerCase().includes(term))
    );
  });

  const handleExport = () => {
    dataService.exportToCsv('AUDIT_LOGS');
  };

  return (
    <GlassCard id={id} className="p-6 space-y-5 bg-white border-slate-200 shadow-xs">
      {/* Header & Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-6 h-6 text-[#1e40af]" />
            <h3 className="text-xl sm:text-2xl font-bold text-[#172033]">Institutional System Logs Directory</h3>
          </div>
          <p className="text-sm text-[#5b6472] mt-1">
            Student directory system logs. Click &quot;View Student Logs&quot; to inspect full audit event history and timestamps.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[#172033] text-sm font-semibold transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#1e40af]" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search student name, register number, department..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full h-11 bg-white border border-slate-300 rounded-lg pl-10 pr-4 text-sm sm:text-base text-[#172033] placeholder-slate-400 focus:outline-none focus:border-blue-600 font-medium"
        />
      </div>

      {/* Simple Student Details Table */}
      <div className="responsive-table custom-scrollbar border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
        <table className="w-full text-left text-sm text-[#172033]">
          <thead className="bg-slate-100 text-[#475569] uppercase text-xs tracking-wider border-b border-slate-300 font-semibold">
            <tr>
              <th className="py-3.5 px-4">Student &amp; Register No</th>
              <th className="py-3.5 px-4">Department &amp; Hostel</th>
              <th className="py-3.5 px-4">Leave &amp; Gate Activity Summary</th>
              <th className="py-3.5 px-4">Current Campus Status</th>
              <th className="py-3.5 px-4">Last Event</th>
              <th className="py-3.5 px-4 text-right">System Logs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredSummaries.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#5b6472] font-semibold text-base">
                  No matching student records found.
                </td>
              </tr>
            ) : (
              filteredSummaries.map(s => (
                <tr key={s.studentId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-bold text-[#172033] text-base">{s.studentName}</div>
                    <div className="font-mono text-xs text-[#1e40af] font-bold mt-0.5">{s.registerNumber}</div>
                  </td>
                  <td className="py-4 px-4 text-xs text-[#5b6472]">
                    <div className="font-semibold text-[#172033]">{s.department}</div>
                    <div>{s.hostelBlock}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                      <span className="px-2.5 py-1 rounded bg-blue-50 text-[#1e40af] border border-blue-200">
                        {s.totalLeavesCount} {s.totalLeavesCount === 1 ? 'Leave' : 'Leaves'}
                      </span>
                      <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200">
                        {s.totalExitsCount} {s.totalExitsCount === 1 ? 'Exit' : 'Exits'}
                      </span>
                      <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-900 border border-emerald-200">
                        {s.totalEntriesCount} {s.totalEntriesCount === 1 ? 'Return' : 'Returns'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border ${
                      s.currentStatus.includes('EXITED')
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : s.currentStatus.includes('RETURNED')
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-blue-50 text-[#1e40af] border-blue-200'
                    }`}>
                      {s.currentStatus}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs font-mono text-[#5b6472]">
                    {new Date(s.lastTimestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => setSelectedStudentSummary(s)}
                      className="px-3.5 py-2 rounded-lg bg-[#1e40af] hover:bg-blue-800 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer inline-flex items-center space-x-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Student Logs</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* STUDENT AUDIT LOGS MODAL */}
      {selectedStudentSummary && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#172033]">
                  Student System Logs — {selectedStudentSummary.studentName}
                </h3>
                <p className="text-xs font-mono text-[#1e40af] font-bold mt-0.5">
                  {selectedStudentSummary.registerNumber} • {selectedStudentSummary.department} ({selectedStudentSummary.hostelBlock})
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentSummary(null)}
                className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              {/* Metric Counters (Clean & Scalable) */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#5b6472] mb-3">
                  Student Activity Summary Counters:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
                    <FileCheck className="w-5 h-5 text-[#1e40af] mx-auto mb-1" />
                    <p className="text-xs font-bold uppercase text-[#5b6472]">Leaves Applied</p>
                    <p className="text-2xl font-bold text-[#1e40af] mt-1">{selectedStudentSummary.totalLeavesCount}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
                    <LogOut className="w-5 h-5 text-amber-800 mx-auto mb-1" />
                    <p className="text-xs font-bold uppercase text-[#5b6472]">Gate Exits Logged</p>
                    <p className="text-2xl font-bold text-amber-900 mt-1">{selectedStudentSummary.totalExitsCount}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                    <LogIn className="w-5 h-5 text-emerald-800 mx-auto mb-1" />
                    <p className="text-xs font-bold uppercase text-[#5b6472]">Campus Returns Logged</p>
                    <p className="text-2xl font-bold text-emerald-900 mt-1">{selectedStudentSummary.totalEntriesCount}</p>
                  </div>
                </div>
              </div>

              {/* Detailed Cryptographic Event Log Table with Timestamps */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#5b6472] mb-3">
                  Detailed Event Log Entries &amp; Timestamps:
                </h4>
                {selectedStudentSummary.rawLogs.length === 0 ? (
                  <p className="text-sm text-slate-500">No raw event log entries found.</p>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-[#475569] font-bold uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Timestamp</th>
                          <th className="py-2.5 px-3">Actor / Role</th>
                          <th className="py-2.5 px-3">Action Event</th>
                          <th className="py-2.5 px-3">Entity ID</th>
                          <th className="py-2.5 px-3">State</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white font-mono">
                        {selectedStudentSummary.rawLogs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 text-slate-600 font-semibold whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-[#172033] whitespace-nowrap">
                              {log.actorName} <span className="text-[#1e40af]">({log.actorRole})</span>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-emerald-700">{log.action}</td>
                            <td className="py-2.5 px-3 text-slate-500">{log.entityId}</td>
                            <td className="py-2.5 px-3 font-bold text-[#172033]">{log.newState || 'OK'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedStudentSummary(null)}
                className="px-5 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-[#172033] font-bold text-sm transition-colors cursor-pointer"
              >
                Close Logs Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
};
