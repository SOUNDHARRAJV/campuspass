export type UserRole = 
  | 'STUDENT'
  | 'PARENT'
  | 'ADVISOR'
  | 'WARDEN'
  | 'HOD'
  | 'SECURITY'
  | 'MANAGEMENT'
  | 'ADMIN';

export type RequestType = 'LEAVE' | 'OD' | 'EXCEPTION';

export type RequestStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PARENT_PENDING'
  | 'PARENT_APPROVED'
  | 'PARENT_REJECTED'
  | 'HOD_PENDING'
  | 'HOD_APPROVED'
  | 'WARDEN_PENDING'
  | 'WARDEN_APPROVED'
  | 'APPROVAL_PENDING'
  | 'APPROVED'
  | 'PASS_GENERATED'
  | 'ACTIVE'
  | 'EXITED'
  | 'REENTERED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'COMPLETED';

export type StudentType = 'DAY_SCHOLAR' | 'HOSTELLER';

export type ExceptionStatus = 
  | 'REQUESTED'
  | 'UNDER_REVIEW'
  | 'ATTESTED'
  | 'REJECTED'
  | 'PASS_ACTIVE'
  | 'PASS_USED'
  | 'PASS_EXPIRED'
  | 'REVOKED';

export type PassStatus = 'ACTIVE' | 'USED' | 'EXPIRED' | 'REVOKED';

export type GateEventType = 'EXIT' | 'ENTRY';

export type GateVerificationResult = 
  | 'VALID_EXIT'
  | 'VALID_ENTRY'
  | 'EXPIRED'
  | 'ALREADY_USED'
  | 'REVOKED'
  | 'NOT_YET_VALID'
  | 'INVALID_TOKEN'
  | 'STUDENT_MISMATCH';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  studentType?: StudentType;
  avatarUrl?: string;
  phone?: string;
  department?: string;
  registerNumber?: string;
  hostelBlock?: string;
  roomNumber?: string;
  yearOfStudy?: number;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  advisorName?: string;
  wardenName?: string;
  hodName?: string;
  parent_id?: string;
  mentor_id?: string;
}

export interface ApprovalTask {
  id: string;
  requestId: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  requestType: RequestType;
  destination: string;
  reason: string;
  startDate: string;
  endDate: string;
  approverId: string;
  approverRole: UserRole;
  approvalType: 'PARENT' | 'MENTOR' | 'WARDEN';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  remarks?: string;
  createdAt: string;
  respondedAt?: string;
  waitingHours?: number;
  agingCategory?: 'NORMAL' | 'ATTENTION' | 'DELAYED';
}

export interface LeaveRequest {
  id: string;
  requestNumber: string; // e.g., OUT-2026-0892
  studentId: string;
  studentName: string;
  registerNumber: string;
  department: string;
  hostelBlock: string;
  roomNumber: string;
  type: RequestType;
  leaveTitle?: string;
  durationDays?: string;
  reason: string;
  destination: string;
  emergencyContact: string;
  startDate: string; // ISO String
  endDate: string;   // ISO String
  status: RequestStatus;
  currentStage: string;
  parentConsentId?: string;
  parentStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED';
  advisorStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  wardenStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  hodStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  isException?: boolean;
  isEmergency?: boolean;
  exceptionReason?: string;
  attestationId?: string;
  adminOverrideComment?: string;
  adminOverrideBy?: string;
  adminOverrideAt?: string;
  assignedToRole?: string; // e.g. 'ADVISOR' or 'ADVISOR|WARDEN' or 'PARENT'
  assignedToId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParentConsent {
  id: string;
  requestId: string;
  studentId: string;
  parentEmail: string;
  parentPhone: string;
  token: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  remarks?: string;
  respondedAt?: string;
  createdAt: string;
}

export interface ApprovalAction {
  id: string;
  requestId: string;
  approverId: string;
  approverName: string;
  approverRole: UserRole;
  action: 'APPROVED' | 'REJECTED' | 'CLARIFICATION_REQUESTED';
  remarks?: string;
  createdAt: string;
}

export interface ExceptionLetter {
  id: string;
  requestId: string;
  studentId: string;
  hodId: string;
  hodName: string;
  attestedAt: string;
  validFrom: string;
  validUntil: string;
  reason: string;
  destination: string;
  digitalSignatureHash: string;
  electronicAttestationNotice: string;
  createdAt: string;
}

export interface DigitalPass {
  id: string;
  passNumber: string; // e.g., PASS-9921-X
  requestId: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  department: string;
  type: RequestType;
  reason: string;
  destination: string;
  validFrom: string;
  validUntil: string;
  status: PassStatus;
  issuedBy: string;
  qrPayload: string; // Token encoded in QR
  otpCode?: string; // Gate security OTP code (e.g., "4829")
  exitRecordedAt?: string;
  entryRecordedAt?: string;
  createdAt: string;
}

export interface EmergencyOtp {
  id: string;
  studentId: string;
  code: string;
  issuedBy: string[]; // approver ids
  issuedAt: string;
  validUntil: string;
  used: boolean;
}

export interface GateLog {
  id: string;
  passId: string;
  requestId: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  department: string;
  gateName: string;
  securityId: string;
  securityName: string;
  eventType: GateEventType;
  timestamp: string;
  verificationStatus: 'SUCCESS' | 'FLAGGED' | 'MANUAL_OVERRIDE';
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  previousState?: string;
  newState?: string;
  metadata?: Record<string, any>;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ACTION_REQUIRED';
  read: boolean;
  linkRequestId?: string;
  deliveryChannel: 'IN_APP' | 'EMAIL' | 'SMS';
  deliveryStatus: 'SENT' | 'DELIVERED' | 'DEVELOPMENT_SIMULATED';
  createdAt: string;
}

export interface SystemAnalytics {
  totalStudents: number;
  requestsToday: number;
  approvalRate: number; // Percentage
  avgApprovalTimeMinutes: number;
  activeOutsideCampus: number;
  exceptionRequestsCount: number;
  gateEventsToday: number;
  pendingActionsCount: number;
  requestsByDay: { date: string; leave: number; od: number; exception: number }[];
  hourlyGateTraffic: { hour: string; exits: number; entries: number }[];
  departmentDistribution: { name: string; count: number }[];
  insights: { id: string; title: string; description: string; type: 'WARNING' | 'INFO' | 'SUCCESS' }[];
}
