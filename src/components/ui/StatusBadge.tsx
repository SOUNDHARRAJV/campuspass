import React from 'react';
import { RequestStatus, PassStatus } from '../../types';

interface StatusBadgeProps {
  status: RequestStatus | PassStatus | string;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', id }) => {
  let colorClasses = 'bg-slate-100 text-[#172033] border-slate-300';
  let dotColor = 'bg-slate-600';
  let label = status.replace(/_/g, ' ');

  switch (status) {
    case 'APPROVED':
    case 'PARENT_APPROVED':
    case 'ACTIVE':
    case 'VALID_EXIT':
    case 'VALID_ENTRY':
    case 'SUCCESS':
      colorClasses = 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold';
      dotColor = 'bg-emerald-600';
      break;

    case 'SUBMITTED':
    case 'PARENT_PENDING':
    case 'APPROVAL_PENDING':
    case 'REQUESTED':
    case 'UNDER_REVIEW':
    case 'PENDING':
      colorClasses = 'bg-amber-50 text-amber-900 border-amber-300 font-semibold';
      dotColor = 'bg-amber-600';
      break;

    case 'REJECTED':
    case 'PARENT_REJECTED':
    case 'REVOKED':
    case 'EXPIRED':
    case 'INVALID_TOKEN':
      colorClasses = 'bg-rose-50 text-rose-900 border-rose-300 font-semibold';
      dotColor = 'bg-rose-600';
      break;

    case 'COMPLETED':
    case 'USED':
      colorClasses = 'bg-blue-50 text-blue-900 border-blue-300 font-semibold';
      dotColor = 'bg-blue-600';
      break;

    case 'EXCEPTION':
      colorClasses = 'bg-purple-50 text-purple-900 border-purple-300 font-semibold';
      dotColor = 'bg-purple-600';
      break;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 space-x-1.5',
    md: 'text-xs sm:text-sm px-2.5 py-1 space-x-2 font-semibold',
    lg: 'text-sm sm:text-base px-3 py-1.5 space-x-2 font-bold'
  }[size];

  return (
    <span
      id={id}
      className={`inline-flex items-center rounded-md border whitespace-nowrap uppercase tracking-wider ${colorClasses} ${sizeClasses}`}
    >
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      <span>{label}</span>
    </span>
  );
};
