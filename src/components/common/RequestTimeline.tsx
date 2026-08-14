import React from 'react';
import { LeaveRequest } from '../../types';
import { CheckCircle2, Clock, AlertCircle, ShieldAlert, UserCheck, QrCode, DoorOpen, Home } from 'lucide-react';

interface RequestTimelineProps {
  request: LeaveRequest;
  id?: string;
}

export const RequestTimeline: React.FC<RequestTimelineProps> = ({ request, id }) => {
  const steps = [
    {
      key: 'SUBMITTED',
      title: 'Request Submitted',
      actor: request.studentName,
      status: 'DONE',
      timestamp: new Date(request.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      icon: Clock
    },
    {
      key: 'PARENT',
      title: 'Parent Consent',
      actor: `${request.studentName}'s Parent`,
      status: request.parentStatus === 'APPROVED' ? 'DONE' : request.parentStatus === 'REJECTED' ? 'REJECTED' : 'PENDING',
      timestamp: request.parentStatus === 'APPROVED' ? 'Consent Recorded' : 'Waiting for parent',
      icon: UserCheck
    },
    {
      key: 'AUTHORITY',
      title: request.isException ? 'Mentor E-Attestation' : 'Advisor / Warden Review',
      actor: request.isException ? 'Mentor (e-Attestation)' : 'Prof. M. Ramesh (Warden)',
      status: request.status === 'APPROVED' || request.status === 'COMPLETED' ? 'DONE' : request.status === 'REJECTED' ? 'REJECTED' : 'PENDING',
      timestamp: request.status === 'APPROVED' || request.status === 'COMPLETED' ? 'Approved & Signed' : 'Under Review',
      icon: AlertCircle
    },
    {
      key: 'PASS',
      title: 'Digital Pass Issued',
      actor: 'System Engine',
      status: request.status === 'APPROVED' || request.status === 'COMPLETED' ? 'DONE' : 'LOCKED',
      timestamp: request.status === 'APPROVED' || request.status === 'COMPLETED' ? 'Active QR Ready' : 'Awaiting Approval',
      icon: QrCode
    },
    {
      key: 'EXIT',
      title: 'Campus Gate Exit',
      actor: 'Security Officer',
      status: request.currentStage.includes('Outside Campus') || request.status === 'COMPLETED' ? 'DONE' : 'LOCKED',
      timestamp: request.currentStage.includes('Outside Campus') ? 'Student Outside Campus' : 'Gate Scan Required',
      icon: DoorOpen
    },
    {
      key: 'RETURN',
      title: 'Campus Re-entry',
      actor: 'Security Officer',
      status: request.status === 'COMPLETED' ? 'DONE' : 'LOCKED',
      timestamp: request.status === 'COMPLETED' ? 'Completed & Verified' : 'Return Pending',
      icon: Home
    }
  ];

  return (
    <div id={id} className="py-3">
      <div className="relative border-l-2 border-slate-200 ml-4 space-y-5">
        {steps.map((step, idx) => {
          let dotColor = 'bg-slate-100 border-slate-300 text-slate-400';
          let textColor = 'text-slate-500';

          if (step.status === 'DONE') {
            dotColor = 'bg-emerald-600 border-emerald-500 text-white shadow-sm';
            textColor = 'text-slate-900';
          } else if (step.status === 'PENDING') {
            dotColor = 'bg-amber-100 border-amber-400 text-amber-700 animate-pulse';
            textColor = 'text-amber-900';
          } else if (step.status === 'REJECTED') {
            dotColor = 'bg-rose-600 border-rose-500 text-white';
            textColor = 'text-rose-700';
          }

          const Icon = step.icon;

          return (
            <div key={idx} className="relative pl-6">
              {/* Dot Icon */}
              <div
                className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${dotColor} transition-all`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Step Content */}
              <div>
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${textColor}`}>{step.title}</h4>
                  <span className="text-[10px] text-slate-500 font-mono font-semibold">{step.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">{step.actor}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
