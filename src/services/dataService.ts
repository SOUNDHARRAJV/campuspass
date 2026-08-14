import {
  LeaveRequest,
  ParentConsent,
  DigitalPass,
  GateLog,
  AuditLog,
  NotificationItem,
  UserProfile,
  UserRole,
  RequestType,
  SystemAnalytics,
  GateVerificationResult
} from '../types';
import {
  DEMO_USERS,
  MOCK_REQUESTS,
  MOCK_PASSES,
  MOCK_PARENT_CONSENTS,
  MOCK_GATE_LOGS,
  MOCK_AUDIT_LOGS,
  MOCK_NOTIFICATIONS
} from '../constants/mockData';

type Listener = () => void;

class DataService {
  private requests: LeaveRequest[] = [...MOCK_REQUESTS];
  private passes: DigitalPass[] = [...MOCK_PASSES];
  private parentConsents: ParentConsent[] = [...MOCK_PARENT_CONSENTS];
  private gateLogs: GateLog[] = [...MOCK_GATE_LOGS];
  private auditLogs: AuditLog[] = [...MOCK_AUDIT_LOGS];
  private notifications: NotificationItem[] = [...MOCK_NOTIFICATIONS];
  private listeners: Listener[] = [];
  // Emergency OTP approvals waiting for second approver: studentId -> approverIds
  private emergencyOtpApprovals: Record<string, string[]> = {};
  // Active emergency OTPs
  private emergencyOtps: any[] = [];

  constructor() {
    // Load local storage if available
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const savedRequests = localStorage.getItem('bit_outpass_requests');
      const savedPasses = localStorage.getItem('bit_outpass_passes');
      const savedGateLogs = localStorage.getItem('bit_outpass_gatelogs');
      const savedAudit = localStorage.getItem('bit_outpass_audit');
      const savedConsents = localStorage.getItem('bit_outpass_consents');
      const savedNotifications = localStorage.getItem('bit_outpass_notifications');
      const savedEotps = localStorage.getItem('bit_outpass_eotps');
      const savedEotpApprovals = localStorage.getItem('bit_outpass_eotp_approvals');

      if (savedRequests) this.requests = JSON.parse(savedRequests);
      if (savedPasses) this.passes = JSON.parse(savedPasses);
      if (savedGateLogs) this.gateLogs = JSON.parse(savedGateLogs);
      if (savedAudit) this.auditLogs = JSON.parse(savedAudit);
      if (savedConsents) this.parentConsents = JSON.parse(savedConsents);
      if (savedNotifications) this.notifications = JSON.parse(savedNotifications);
      if (savedEotps) this.emergencyOtps = JSON.parse(savedEotps);
      if (savedEotpApprovals) this.emergencyOtpApprovals = JSON.parse(savedEotpApprovals);
    } catch (e) {
      console.warn('Could not load stored data', e);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('bit_outpass_requests', JSON.stringify(this.requests));
      localStorage.setItem('bit_outpass_passes', JSON.stringify(this.passes));
      localStorage.setItem('bit_outpass_gatelogs', JSON.stringify(this.gateLogs));
      localStorage.setItem('bit_outpass_audit', JSON.stringify(this.auditLogs));
      localStorage.setItem('bit_outpass_consents', JSON.stringify(this.parentConsents));
      localStorage.setItem('bit_outpass_notifications', JSON.stringify(this.notifications));
      localStorage.setItem('bit_outpass_eotps', JSON.stringify(this.emergencyOtps));
      localStorage.setItem('bit_outpass_eotp_approvals', JSON.stringify(this.emergencyOtpApprovals));
    } catch (e) {
      console.warn('Could not save data to localStorage', e);
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach(l => l());
  }

  // --- AUDIT TRAIL LOGGING ---
  private addAudit(
    actorId: string,
    actorName: string,
    actorRole: UserRole,
    action: string,
    entityType: string,
    entityId: string,
    previousState?: string,
    newState?: string,
    metadata?: Record<string, any>
  ) {
    const log: AuditLog = {
      id: `adt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actorId,
      actorName,
      actorRole,
      action,
      entityType,
      entityId,
      previousState,
      newState,
      metadata
    };
    this.auditLogs.unshift(log);
  }

  // --- NOTIFICATION PUSH ---
  private addNotification(
    userId: string,
    title: string,
    message: string,
    type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ACTION_REQUIRED' = 'INFO',
    linkRequestId?: string,
    deliveryChannel: 'IN_APP' | 'EMAIL' | 'SMS' = 'IN_APP'
  ) {
    const item: NotificationItem = {
      id: `ntf-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      title,
      message,
      type,
      read: false,
      linkRequestId,
      deliveryChannel,
      deliveryStatus: deliveryChannel === 'IN_APP' ? 'DELIVERED' : 'DEVELOPMENT_SIMULATED',
      createdAt: new Date().toISOString()
    };
    this.notifications.unshift(item);
  }

  // --- GETTERS ---
  public getRequests(): LeaveRequest[] {
    // Sort by nearest upcoming start date first (nearby exit dates prioritized)
    return [...this.requests].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }

  public getRequestById(id: string): LeaveRequest | undefined {
    return this.requests.find(r => r.id === id);
  }

  public getPasses(): DigitalPass[] {
    return [...this.passes];
  }

  public getActivePasses(): DigitalPass[] {
    return this.passes.filter(p => p.status === 'ACTIVE' && !p.entryRecordedAt);
  }

  public getPassByRequestId(requestId: string): DigitalPass | undefined {
    return this.passes.find(p => p.requestId === requestId);
  }

  public getPassByQrToken(qrPayload: string): DigitalPass | undefined {
    const clean = qrPayload.trim().toLowerCase();
    return this.passes.find(p =>
      p.qrPayload.toLowerCase() === clean ||
      (p.otpCode && p.otpCode.toLowerCase() === clean) ||
      p.id.toLowerCase() === clean ||
      p.passNumber.toLowerCase() === clean ||
      p.requestId.toLowerCase() === clean ||
      (p.registerNumber && p.registerNumber.toLowerCase() === clean)
    );
  }

  public getParentConsents(): ParentConsent[] {
    return [...this.parentConsents];
  }

  public getGateLogs(): GateLog[] {
    return [...this.gateLogs];
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  public getNotificationsForUser(userId: string): NotificationItem[] {
    return this.notifications.filter(n => n.userId === userId || userId === 'usr-admin-701');
  }

  public markNotificationAsRead(id: string) {
    const n = this.notifications.find(item => item.id === id);
    if (n) {
      n.read = true;
      this.notify();
    }
  }

  // --- WORKFLOW 1: SUBMIT LEAVE / OD / EXCEPTION REQUEST ---
  public submitRequest(
    studentProfile: UserProfile,
    data: {
      type: RequestType;
      reason: string;
      destination: string;
      emergencyContact: string;
      startDate: string;
      endDate: string;
      isException?: boolean;
      isEmergency?: boolean;
      exceptionReason?: string;
    },
    emergencyOtp?: string
  ) : LeaveRequest {
    
    const reqId = `req-${Date.now()}`;
    const seq = Math.floor(Math.random() * 9000 + 1000);
    const requestNumber = data.type === 'EXCEPTION' ? `EXP-2026-${seq}` : `OUT-2026-${seq}`;

    // --- VALIDATION: dates, required fields, overlaps ---
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid start or end date');
    }

    if (end.getTime() < start.getTime()) {
      throw new Error('End date must be the same or after start date');
    }

    // Do not allow past start dates (allow same-day)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    if (start.getTime() < today) {
      throw new Error('Start date cannot be in the past');
    }

    // Overlap check: any existing non-finalised request for this student overlapping the requested window
    const overlapping = this.requests.find(r =>
      r.studentId === studentProfile.id &&
      !['REJECTED', 'COMPLETED', 'CANCELLED'].includes(r.status) &&
      !(new Date(r.endDate).getTime() < start.getTime() || new Date(r.startDate).getTime() > end.getTime())
    );

    if (overlapping) {
      throw new Error('You have an overlapping request in the selected period');
    }

    let initialStatus: LeaveRequest['status'] = 'SUBMITTED';
    let currentStage = 'Request Submitted';

    if (data.type === 'EXCEPTION') {
      initialStatus = 'APPROVAL_PENDING';
      currentStage = 'Pending Mentor E-Attestation';
    } else {
      initialStatus = 'PARENT_PENDING';
      currentStage = 'Waiting for Parent Consent';
    }

    const consentId = `cns-${Date.now()}`;
    const consentToken = `parent-tok-${Math.random().toString(36).substring(2, 9)}`;

    const hostelStr = studentProfile.hostelBlock || 'Emerald Block - A';
    const isDayScholar = hostelStr.toLowerCase().includes('day');

    const newRequest: LeaveRequest = {
      id: reqId,
      requestNumber,
      studentId: studentProfile.id,
      studentName: studentProfile.name,
      registerNumber: studentProfile.registerNumber || '7376221CS108',
      department: studentProfile.department || 'Computer Science & Engineering',
      hostelBlock: hostelStr,
      roomNumber: studentProfile.roomNumber || '304',
      type: data.type,
      reason: data.reason,
      destination: data.destination,
      emergencyContact: data.emergencyContact,
      startDate: data.startDate,
      endDate: data.endDate,
      status: initialStatus,
      currentStage,
      parentConsentId: consentId,
      parentStatus: data.type === 'EXCEPTION' ? 'APPROVED' : 'PENDING',
      advisorStatus: 'PENDING',
      wardenStatus: isDayScholar ? 'NOT_APPLICABLE' as any : 'PENDING',
      hodStatus: 'PENDING',
      isException: data.isException || data.type === 'EXCEPTION',
      exceptionReason: data.exceptionReason,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    // assign initial action owner: exceptions go to Mentor, others start with Parent
    (newRequest as any).assignedToRole = data.type === 'EXCEPTION' ? 'ADVISOR' : 'PARENT';
    (newRequest as any).assignedToId = data.type === 'EXCEPTION' ? DEMO_USERS.mentor.id : DEMO_USERS.parent.id;

    // compute inclusive duration in days
    try {
      const s = new Date(data.startDate);
      const e = new Date(data.endDate);
      const sMid = new Date(s.getFullYear(), s.getMonth(), s.getDate()).getTime();
      const eMid = new Date(e.getFullYear(), e.getMonth(), e.getDate()).getTime();
      const days = Math.ceil((eMid - sMid) / (24 * 3600 * 1000)) + 1;
      (newRequest as any).durationDays = `${days} day${days > 1 ? 's' : ''}`;
    } catch (err) {}

    this.requests.unshift(newRequest);

    // If this is marked emergency or has emergency OTP, handle direct Mentor/Warden emergency flow
    if ((data as any).isEmergency || (emergencyOtp && typeof emergencyOtp === 'string')) {
      let isVerifiedOtp = false;
      if (emergencyOtp) {
        isVerifiedOtp = this.verifyEmergencyOtp(studentProfile.id, emergencyOtp, data.startDate, data.endDate);
        if (!isVerifiedOtp) {
          throw new Error('Invalid or expired Emergency OTP.');
        }
      }

      newRequest.leaveTitle = 'Emergency Leave';
      newRequest.parentStatus = 'SKIPPED';
      (newRequest as any).isEmergency = true;

      if (isDayScholar) {
        newRequest.advisorStatus = 'APPROVED';
        newRequest.wardenStatus = 'NOT_APPLICABLE' as any;
        newRequest.currentStage = isVerifiedOtp
          ? 'Mentor Emergency OTP Verified • Digital Pass Issued'
          : 'Emergency Auto-Approved by Mentor • Digital Pass Issued';
        (newRequest as any).assignedToRole = 'ADVISOR';
        (newRequest as any).assignedToId = DEMO_USERS.mentor.id;
      } else {
        newRequest.advisorStatus = 'NOT_APPLICABLE' as any;
        newRequest.wardenStatus = 'APPROVED';
        newRequest.currentStage = isVerifiedOtp
          ? 'Warden Emergency OTP Verified • Digital Pass Issued'
          : 'Emergency Auto-Approved by Warden • Digital Pass Issued';
        (newRequest as any).assignedToRole = 'WARDEN';
        (newRequest as any).assignedToId = DEMO_USERS.warden.id;
      }

      newRequest.status = 'APPROVED';
      const pass = this.issueDigitalPass(newRequest, `Emergency ${isVerifiedOtp ? 'OTP' : 'Auto-Approved'}`);

      // Notify responsible authority (Mentor or Warden)
      const authorityId = isDayScholar ? DEMO_USERS.mentor.id : DEMO_USERS.warden.id;
      const authorityTitle = isDayScholar ? 'Mentor' : 'Warden';
      this.addNotification(
        authorityId,
        'Emergency Leave Active',
        `Emergency leave pass ${pass.passNumber} issued for ${studentProfile.name} (${studentProfile.registerNumber}).`,
        'INFO',
        newRequest.id
      );

      this.addNotification(
        newRequest.studentId,
        'Emergency Leave Pass Issued',
        `Your Emergency Leave pass ${pass.passNumber} is active (bypassed parent consent via ${authorityTitle} emergency flow).`,
        'SUCCESS',
        newRequest.id
      );

      // Notify Parent in Real-time (even for Emergency Leave)
      const parentPhoneStr = studentProfile.parentPhone || '+91 98123 45678';
      this.addNotification(
        DEMO_USERS.parent.id,
        'REALTIME ALERT: Ward Emergency Leave Issued',
        `EMERGENCY ALERT: Emergency leave pass ${pass.passNumber} issued for your ward ${studentProfile.name}. Realtime SMS dispatched to ${parentPhoneStr}.`,
        'WARNING',
        newRequest.id
      );

      this.addAudit(
        studentProfile.id,
        studentProfile.name,
        'STUDENT',
        'EMERGENCY_LEAVE_APPROVED',
        'LEAVE_REQUEST',
        newRequest.id,
        undefined,
        'APPROVED',
        { mappedAuthority: authorityTitle, isDayScholar }
      );

      this.notify();
      return newRequest;
    }

    // Create Parent Consent object if standard leave/OD
    if (data.type !== 'EXCEPTION') {
      const parentConsent: ParentConsent = {
        id: consentId,
        requestId: reqId,
        studentId: studentProfile.id,
        parentEmail: studentProfile.parentEmail || 'parent@gmail.com',
        parentPhone: studentProfile.parentPhone || '+91 98123 45678',
        token: consentToken,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };
      this.parentConsents.unshift(parentConsent);

      // Notify parent
      this.addNotification(
        DEMO_USERS.parent.id,
        'Parent Consent Required',
        `Your child ${studentProfile.name} requested ${data.type} pass to ${data.destination}. Approval needed.`,
        'ACTION_REQUIRED',
        reqId,
        'SMS'
      );
    } else {
      // Notify Mentor directly for Exception
      this.addNotification(
        DEMO_USERS.mentor.id,
        'URGENT: Exception Exit Requested',
        `Exception request raised by ${studentProfile.name} for ${data.reason}. Requires Mentor e-attestation.`,
        'WARNING',
        reqId,
        'IN_APP'
      );
    }

    // Add Audit Log
    this.addAudit(
      studentProfile.id,
      studentProfile.name,
      'STUDENT',
      'REQUEST_CREATED',
      'LEAVE_REQUEST',
      reqId,
      undefined,
      initialStatus,
      { requestNumber, type: data.type, destination: data.destination }
    );

    this.notify();
    return newRequest;
  }

  // --- WORKFLOW 2: PARENT CONSENT ---
  public submitParentConsent(
    requestId: string,
    action: 'APPROVE' | 'REJECT',
    remarks?: string,
    actorName: string = 'Suresh Sharma (Parent)'
  ) {
    const req = this.requests.find(r => r.id === requestId);
    if (!req) return;

    const consent = this.parentConsents.find(c => c.requestId === requestId);
    const prevStatus = req.status;

    if (action === 'APPROVE') {
      req.parentStatus = 'APPROVED';
      req.status = 'APPROVAL_PENDING';
      const isDayScholar = (req.hostelBlock || '').toLowerCase().includes('day') || req.wardenStatus === ('NOT_APPLICABLE' as any);
      req.currentStage = isDayScholar
        ? 'Parent Approved • Pending Mentor Approval'
        : 'Parent Approved • Pending Mentor & Warden Approval';

      // Assign to appropriate institutional approver(s)
      if (isDayScholar) {
        (req as any).assignedToRole = 'ADVISOR';
        (req as any).assignedToId = DEMO_USERS.mentor.id;
      } else {
        (req as any).assignedToRole = 'ADVISOR|WARDEN';
        (req as any).assignedToId = `${DEMO_USERS.mentor.id}|${DEMO_USERS.warden.id}`;
      }

      if (consent) {
        consent.status = 'APPROVED';
        consent.remarks = remarks;
        consent.respondedAt = new Date().toISOString();
      }

      // Notify Mentor (Advisor) & Warden
      this.addNotification(
        DEMO_USERS.mentor.id,
        'Pending Mentor Approval',
        `Leave request ${req.requestNumber} for ${req.studentName} approved by parent.`,
        'ACTION_REQUIRED',
        req.id
      );

      if (!isDayScholar) {
        this.addNotification(
          DEMO_USERS.warden.id,
          'Pending Warden Approval',
          `Leave request ${req.requestNumber} for ${req.studentName} approved by parent.`,
          'ACTION_REQUIRED',
          req.id
        );
      }

      this.addNotification(
        req.studentId,
        'Parent Approved Your Request',
        `Your parent has approved request ${req.requestNumber}. Now pending institutional review.`,
        'SUCCESS',
        req.id
      );

      this.addAudit(
        DEMO_USERS.parent.id,
        actorName,
        'PARENT',
        'PARENT_CONSENT_APPROVED',
        'PARENT_CONSENT',
        consent?.id || req.id,
        prevStatus,
        'APPROVAL_PENDING',
        { remarks }
      );
    } else {
      req.parentStatus = 'REJECTED';
      req.status = 'PARENT_REJECTED';
      req.currentStage = 'Rejected by Parent';
      if (consent) {
        consent.status = 'REJECTED';
        consent.remarks = remarks;
        consent.respondedAt = new Date().toISOString();
      }

      this.addNotification(
        req.studentId,
        'Request Declined by Parent',
        `Your request ${req.requestNumber} was declined by parent. Reason: ${remarks || 'No remarks provided'}`,
        'WARNING',
        req.id
      );

      this.addAudit(
        DEMO_USERS.parent.id,
        actorName,
        'PARENT',
        'PARENT_CONSENT_REJECTED',
        'PARENT_CONSENT',
        consent?.id || req.id,
        prevStatus,
        'PARENT_REJECTED',
        { remarks }
      );
    }

    req.updatedAt = new Date().toISOString();
    this.notify();
  }

  // --- EMERGENCY OTP WORKFLOW ---
  public requestEmergencyOtpForStudent(studentId: string, issuerProfile: UserProfile) {
    // Only Mentor (ADVISOR) or Warden can issue — but mapping differs by student type
    if (!['ADVISOR', 'WARDEN'].includes(issuerProfile.role)) {
      throw new Error('Only Mentor or Warden can request emergency OTPs');
    }

    // Determine student record (hostelBlock) to map issuer role
    const req = this.requests.find(r => r.studentId === studentId) as LeaveRequest | undefined;
    let hostelBlock = req ? req.hostelBlock || '' : '';
    // Fallback: try demo user lookup
    const demoStudent = Object.values(DEMO_USERS).find(u => u.id === studentId);
    if (!hostelBlock && demoStudent) hostelBlock = (demoStudent as UserProfile).hostelBlock || '';

    const isDayScholar = (hostelBlock || '').toLowerCase().includes('day');
    // Day-scholars: Mentor (ADVISOR) only. Hostellers: Warden only.
    const allowedRole: UserRole = isDayScholar ? 'ADVISOR' : 'WARDEN';
    if (issuerProfile.role !== allowedRole) {
      throw new Error(
        isDayScholar
          ? 'Only Mentor can issue Emergency OTPs for day-scholars'
          : 'Only Warden can issue Emergency OTPs for hostel students'
      );
    }

    // If an active OTP already exists for this student, return it
    const existing = this.emergencyOtps.find(o => o.studentId === studentId && !o.used && new Date(o.validUntil).getTime() > Date.now());
    if (existing) {
      return { status: 'EXISTS', otp: existing };
    }

    // Generate single-approver OTP immediately
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    // Compute college closing time (today at 17:00 local)
    const now = new Date();
    const closing = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0, 0);
    const validUntilIso = closing.toISOString();

    const otp = {
      id: `eotp-${Date.now()}`,
      studentId,
      code,
      issuedBy: [issuerProfile.id],
      issuedAt: new Date().toISOString(),
      validUntil: validUntilIso,
      used: false
    };
    this.emergencyOtps.push(otp);

    // Notify student with OTP (demo simulated channel)
    const student = demoStudent as UserProfile || DEMO_USERS.student;
    this.addNotification(
      student.id,
      'Emergency OTP Issued',
      `Emergency OTP for quick approval: ${code} (valid until ${new Date(validUntilIso).toLocaleTimeString()}). Click to Apply Leave quickly.`,
      'INFO',
      'APPLY_EMERGENCY',
      'IN_APP'
    );

    this.addAudit(
      issuerProfile.id,
      issuerProfile.name,
      issuerProfile.role,
      'EMERGENCY_OTP_ISSUED',
      'EMERGENCY_OTP',
      studentId,
      undefined,
      'ISSUED',
      { otpId: otp.id, issuedBy: otp.issuedBy }
    );

    this.notify();
    return { status: 'CREATED', otp };
  }

  public verifyEmergencyOtp(studentId: string, code: string, startDateIso?: string, endDateIso?: string) {
    const otp = this.emergencyOtps.find(o => o.studentId === studentId && o.code === code && !o.used);
    if (!otp) return false;
    if (new Date(otp.validUntil).getTime() < Date.now()) return false;

    // If request dates are provided, ensure it's a same-day leave for today
    if (startDateIso && endDateIso) {
      const s = new Date(startDateIso);
      const e = new Date(endDateIso);
      const now = new Date();
      const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const sMid = new Date(s.getFullYear(), s.getMonth(), s.getDate()).getTime();
      const eMid = new Date(e.getFullYear(), e.getMonth(), e.getDate()).getTime();
      // ensure start and end are same calendar day and equal to today
      if (sMid !== eMid) return false;
      if (sMid !== todayMid) return false;
    }

    otp.used = true;
    this.addAudit(studentId, studentId, 'STUDENT', 'EMERGENCY_OTP_CONSUMED', 'EMERGENCY_OTP', otp.id, undefined, 'USED');
    this.notify();
    return true;
  }

  public getEmergencyOtps(): any[] {
    return [...this.emergencyOtps];
  }

  // --- ADMIN / STUDENT: Clear historical demo records prior to now (keeps demo users)
  public clearHistoricalData(cutoffIso?: string) {
    const cutoff = cutoffIso ? new Date(cutoffIso) : new Date();
    // remove all requests created before cutoff
    this.requests = this.requests.filter(r => new Date(r.createdAt).getTime() >= cutoff.getTime());
    this.passes = this.passes.filter(p => new Date(p.createdAt).getTime() >= cutoff.getTime());
    this.parentConsents = this.parentConsents.filter(c => new Date(c.createdAt).getTime() >= cutoff.getTime());
    this.gateLogs = this.gateLogs.filter(g => new Date(g.timestamp).getTime() >= cutoff.getTime());
    this.auditLogs = this.auditLogs.filter(a => new Date(a.timestamp).getTime() >= cutoff.getTime());
    this.notifications = this.notifications.filter(n => new Date(n.createdAt).getTime() >= cutoff.getTime());
    // also clear emergency otp approvals and otps created before cutoff
    this.emergencyOtps = this.emergencyOtps.filter((o: any) => new Date(o.issuedAt).getTime() >= cutoff.getTime());
    Object.keys(this.emergencyOtpApprovals).forEach(k => {
      // if there are approvals but no recent otp, drop
      if (!this.emergencyOtps.find((o: any) => o.studentId === k)) {
        delete this.emergencyOtpApprovals[k];
      }
    });

    this.notify();
  }

  // --- WORKFLOW 3: INSTITUTIONAL APPROVAL (ADVISOR / WARDEN / HOD) ---
  public approveRequestByAuthority(
    requestId: string,
    approverProfile: UserProfile,
    action: 'APPROVE' | 'REJECT',
    remarks?: string
  ) {
    const req = this.requests.find(r => r.id === requestId);
    if (!req) return;

    const prevStatus = req.status;

    if (action === 'APPROVE') {
      if (approverProfile.role === 'ADVISOR' || approverProfile.role === 'HOD') {
        req.advisorStatus = 'APPROVED';
      }
      if (approverProfile.role === 'WARDEN') {
        req.wardenStatus = 'APPROVED';
      }

      const isDayScholar = (req.hostelBlock || '').toLowerCase().includes('day') || req.wardenStatus === ('NOT_APPLICABLE' as any);
      const isHosteller = !isDayScholar;

      // For Hostellers, advisorStatus is NOT_APPLICABLE so only Warden + Parent approval is required.
      // For Dayscholars, wardenStatus is NOT_APPLICABLE so only Advisor/Mentor + Parent approval is required.
      const isHodApproved = isHosteller || req.advisorStatus === 'APPROVED' || req.advisorStatus === ('NOT_APPLICABLE' as any);
      const isWardenApproved = isDayScholar || req.wardenStatus === 'APPROVED' || req.wardenStatus === ('NOT_APPLICABLE' as any);
      const isParentApproved = req.parentStatus === 'APPROVED' || req.parentStatus === 'SKIPPED' || req.type === 'EXCEPTION';

      if (isParentApproved && isHodApproved && isWardenApproved) {
        req.status = 'APPROVED';
        req.currentStage = 'Fully Approved • Digital Pass Issued';

        // Auto Generate Digital Pass
        const pass = this.issueDigitalPass(req, `${approverProfile.name} (${approverProfile.role})`);

        this.addNotification(
          req.studentId,
          'Leave Request Fully Approved!',
          `Your ${req.type} request ${req.requestNumber} has been approved. Digital Pass #${pass.passNumber} generated!`,
          'SUCCESS',
          req.id
        );

        // Notify Gate Security
        this.addNotification(
          DEMO_USERS.security.id,
          'New Approved Pass Active',
          `Pass #${pass.passNumber} active for ${req.studentName} (${req.department}).`,
          'INFO',
          req.id
        );
      } else {
        req.status = 'APPROVAL_PENDING';
        if (isHodApproved && !isWardenApproved) {
          req.currentStage = 'Approved by Mentor • Pending Warden Approval';
        } else if (isWardenApproved && !isHodApproved) {
          req.currentStage = 'Approved by Warden • Pending Mentor Approval';
        }
      }

      this.addAudit(
        approverProfile.id,
        approverProfile.name,
        approverProfile.role,
        `${approverProfile.role}_APPROVED`,
        'LEAVE_REQUEST',
        req.id,
        prevStatus,
        req.status,
        { remarks }
      );
    } else {
      req.status = 'REJECTED';
      req.currentStage = `Rejected by ${approverProfile.role}`;
      if (approverProfile.role === 'ADVISOR') req.advisorStatus = 'REJECTED';
      if (approverProfile.role === 'WARDEN') req.wardenStatus = 'REJECTED';

      this.addNotification(
        req.studentId,
        'Request Declined',
        `Your request ${req.requestNumber} was rejected by ${approverProfile.name}. Remarks: ${remarks || 'None'}`,
        'WARNING',
        req.id
      );

      this.addAudit(
        approverProfile.id,
        approverProfile.name,
        approverProfile.role,
        `${approverProfile.role}_REJECTED`,
        'LEAVE_REQUEST',
        req.id,
        prevStatus,
        'REJECTED',
        { remarks }
      );
    }

    req.updatedAt = new Date().toISOString();
    this.notify();
  }

  // --- ADMIN ACTION: Override / Skip Parent Consent (requires mandatory comment)
  public overrideParentConsent(requestId: string, adminProfile: UserProfile, comment: string) {
    const req = this.requests.find(r => r.id === requestId);
    if (!req) return;

    if (!comment || comment.trim().length === 0) {
      throw new Error('Admin override requires a non-empty comment');
    }

    const prevStatus = req.status;
    req.parentStatus = 'SKIPPED' as any;
    req.status = 'APPROVAL_PENDING';
    req.currentStage = `Parent Consent Skipped by Admin • ${adminProfile.name}`;
    req.adminOverrideComment = comment;
    req.adminOverrideBy = adminProfile.id;
    req.adminOverrideAt = new Date().toISOString();

    // Notify student
    this.addNotification(
      req.studentId,
      'Parent Consent Overridden',
      `An administrator has overridden parent consent for ${req.requestNumber}.`,
      'INFO',
      req.id
    );

    // Audit record (comment visible in audit metadata only)
    this.addAudit(
      adminProfile.id,
      adminProfile.name,
      'ADMIN',
      'PARENT_CONSENT_OVERRIDDEN',
      'LEAVE_REQUEST',
      req.id,
      prevStatus,
      'APPROVAL_PENDING',
      { adminOverrideComment: comment }
    );

    req.updatedAt = new Date().toISOString();
    this.notify();
  }

  // --- WORKFLOW 4: Mentor Electronic Attestation (Exception Pass) ---
  public attestExceptionRequest(
    requestId: string,
    mentorProfile: UserProfile,
    action: 'ATTEST' | 'REJECT',
    customValidUntil?: string,
    remarks?: string
  ) {
    const req = this.requests.find(r => r.id === requestId);
    if (!req) return;

    const prevStatus = req.status;

    if (action === 'ATTEST') {
      req.advisorStatus = 'APPROVED';
      req.status = 'APPROVED';
      req.currentStage = 'E-Attested by Mentor • Time-Bound Pass Issued';

      const signatureHash = `E-SIG-MENTOR-${mentorProfile.id.substring(0, 6)}-${Date.now().toString(36).toUpperCase()}`;
      const validUntil = customValidUntil || new Date(Date.now() + 4 * 3600 * 1000).toISOString();
      const pass = this.issueDigitalPass(req, `${mentorProfile.name} (Mentor E-Attestation)`, validUntil);

      this.addNotification(
        req.studentId,
        'Exception Pass Issued!',
        `Your exception request has been electronically attested by Mentor ${mentorProfile.name}. Valid until ${new Date(validUntil).toLocaleTimeString()}.`,
        'SUCCESS',
        req.id
      );

      this.addAudit(
        mentorProfile.id,
        mentorProfile.name,
        'ADVISOR',
        'EXCEPTION_E_ATTESTED',
        'EXCEPTION_LETTER',
        req.id,
        prevStatus,
        'APPROVED',
        { signatureHash, validUntil, remarks }
      );
    } else {
      req.advisorStatus = 'REJECTED';
      req.status = 'REJECTED';
      req.currentStage = 'Exception Request Rejected by Mentor';

      this.addNotification(
        req.studentId,
        'Exception Request Declined',
        `Your exception request was declined by Mentor. Remarks: ${remarks || 'None'}`,
        'WARNING',
        req.id
      );

      this.addAudit(
        mentorProfile.id,
        mentorProfile.name,
        'ADVISOR',
        'EXCEPTION_REJECTED',
        'EXCEPTION_LETTER',
        req.id,
        prevStatus,
        'REJECTED',
        { remarks }
      );
    }

    req.updatedAt = new Date().toISOString();
    this.notify();
  }

  // --- ISSUE DIGITAL PASS ENGINE ---
  private issueDigitalPass(req: LeaveRequest, issuedBy: string, overrideValidUntil?: string): DigitalPass {
    const passId = `pass-${Date.now()}`;
    const passNum = `PASS-${Math.floor(Math.random() * 9000 + 1000)}-${req.type.charAt(0)}`;
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const qrPayload = otpCode;

    const pass: DigitalPass = {
      id: passId,
      passNumber: passNum,
      requestId: req.id,
      studentId: req.studentId,
      studentName: req.studentName,
      registerNumber: req.registerNumber,
      department: req.department,
      type: req.type,
      reason: req.reason,
      destination: req.destination,
      validFrom: new Date().toISOString(),
      validUntil: overrideValidUntil || req.endDate || new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
      status: 'ACTIVE',
      issuedBy,
      qrPayload,
      otpCode,
      createdAt: new Date().toISOString()
    };

    this.passes.unshift(pass);

    this.addAudit(
      DEMO_USERS.admin.id,
      issuedBy,
      'ADMIN',
      'PASS_ISSUED',
      'DIGITAL_PASS',
      passId,
      undefined,
      'ACTIVE',
      { passNumber: passNum, studentName: req.studentName }
    );

    return pass;
  }

  // --- WORKFLOW 5: SECURITY QR VERIFICATION & GATE ENTRY/EXIT LOGIC ---
  public verifyQrToken(qrPayload: string): {
    result: GateVerificationResult;
    pass?: DigitalPass;
    message: string;
  } {
    const pass = this.getPassByQrToken(qrPayload);

    if (!pass) {
      return {
        result: 'INVALID_TOKEN',
        message: 'QR Token unrecognized or fake. Not issued by BIT SmartOutpass.'
      };
    }

    if (pass.status === 'REVOKED') {
      return {
        result: 'REVOKED',
        pass,
        message: 'Pass has been REVOKED by Campus Security/Administration.'
      };
    }

    const nowTime = new Date().getTime();
    const untilTime = new Date(pass.validUntil).getTime();
    const fromTime = new Date(pass.validFrom).getTime();

    if (nowTime > untilTime) {
      return {
        result: 'EXPIRED',
        pass,
        message: `Pass EXPIRED on ${new Date(pass.validUntil).toLocaleTimeString()}. Exit denied.`
      };
    }



    if (pass.exitRecordedAt && pass.entryRecordedAt) {
      return {
        result: 'ALREADY_USED',
        pass,
        message: 'Pass has ALREADY BEEN COMPLETED (Exit & Return recorded).'
      };
    }

    if (!pass.exitRecordedAt) {
      return {
        result: 'VALID_EXIT',
        pass,
        message: 'Pass VERIFIED FOR EXIT. Press Allow Exit to log movement.'
      };
    } else {
      return {
        result: 'VALID_ENTRY',
        pass,
        message: 'Pass VERIFIED FOR RE-ENTRY. Press Allow Re-entry to record campus return.'
      };
    }
  }

  public recordGateMovement(
    passId: string,
    eventType: 'EXIT' | 'ENTRY',
    securityProfile: UserProfile = DEMO_USERS.security,
    notes?: string
  ): GateLog {
    const pass = this.passes.find(p => p.id === passId);
    if (!pass) throw new Error('Pass not found');

    const req = this.requests.find(r => r.id === pass.requestId);

    if (eventType === 'EXIT') {
      pass.exitRecordedAt = new Date().toISOString();
      pass.status = 'USED';
      if (req) {
        req.status = 'COMPLETED';
        req.currentStage = 'Completed • Gate Exit Verified & Disposed';
      }
    } else {
      pass.entryRecordedAt = new Date().toISOString();
      pass.status = 'USED';
      if (req) {
        req.status = 'COMPLETED';
        req.currentStage = 'Completed • Safe Campus Return Verified';
      }
    }

    const gateLog: GateLog = {
      id: `gate-${Date.now()}`,
      passId: pass.id,
      requestId: pass.requestId,
      studentId: pass.studentId,
      studentName: pass.studentName,
      registerNumber: pass.registerNumber,
      department: pass.department,
      gateName: securityProfile.department || 'Main Gate 1',
      securityId: securityProfile.id,
      securityName: securityProfile.name,
      eventType,
      timestamp: new Date().toISOString(),
      verificationStatus: 'SUCCESS',
      notes: notes || `Verified via QR Scanner at ${eventType === 'EXIT' ? 'Exit Gate' : 'Entry Gate'}`
    };

    this.gateLogs.unshift(gateLog);

    // Notify Student
    this.addNotification(
      pass.studentId,
      eventType === 'EXIT' ? 'Campus Exit Recorded' : 'Campus Return Recorded',
      `Gate ${eventType} verified at ${securityProfile.department || 'Main Gate 1'} at ${new Date().toLocaleTimeString()}.`,
      'INFO',
      pass.requestId
    );

    // Notify Parent in Real-time regarding Ward Gate Movement & SMS alert
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const parentPhoneStr = DEMO_USERS.student.parentPhone || '+91 98123 45678';
    this.addNotification(
      DEMO_USERS.parent.id,
      eventType === 'EXIT' ? 'REALTIME ALERT: Ward Exited Campus' : 'REALTIME ALERT: Ward Returned to Campus',
      `GATE MOVEMENT ALERT: Your ward ${pass.studentName} has ${eventType === 'EXIT' ? 'EXITED' : 'RETURNED TO'} campus via ${securityProfile.department || 'Main Gate 1'} at ${timeStr}. Realtime SMS alert sent to ${parentPhoneStr}.`,
      eventType === 'EXIT' ? 'WARNING' : 'SUCCESS',
      pass.requestId
    );

    // Audit Log
    this.addAudit(
      securityProfile.id,
      securityProfile.name,
      'SECURITY',
      eventType === 'EXIT' ? 'GATE_EXIT' : 'GATE_REENTRY',
      'GATE_LOG',
      gateLog.id,
      eventType === 'EXIT' ? 'ACTIVE' : 'USED',
      eventType === 'EXIT' ? 'EXITED' : 'COMPLETED',
      { passNumber: pass.passNumber, studentName: pass.studentName }
    );

    this.notify();
    return gateLog;
  }

  // --- ANALYTICS ENGINE ---
  public getAnalytics(): SystemAnalytics {
    const totalStudents = 1420;
    const requestsToday = this.requests.filter(
      r => new Date(r.createdAt).toDateString() === new Date().toDateString()
    ).length + 18;

    const approvedCount = this.requests.filter(r => r.status === 'APPROVED' || r.status === 'COMPLETED').length;
    const totalDecided = this.requests.filter(r => r.status !== 'SUBMITTED' && r.status !== 'PARENT_PENDING').length || 1;
    const approvalRate = Math.round((approvedCount / totalDecided) * 100) || 92;

    const activeOutside = this.passes.filter(p => p.exitRecordedAt && !p.entryRecordedAt).length + 3;
    const exceptionRequestsCount = this.requests.filter(r => r.type === 'EXCEPTION' || r.isException).length;
    const gateEventsToday = this.gateLogs.length + 24;

    const pendingActionsCount = this.requests.filter(
      r => r.status === 'APPROVAL_PENDING' || r.status === 'PARENT_PENDING'
    ).length;

    return {
      totalStudents,
      requestsToday,
      approvalRate,
      avgApprovalTimeMinutes: 14,
      activeOutsideCampus: activeOutside,
      exceptionRequestsCount,
      gateEventsToday,
      pendingActionsCount,
      requestsByDay: [
        { date: 'Mon', leave: 24, od: 12, exception: 2 },
        { date: 'Tue', leave: 18, od: 15, exception: 1 },
        { date: 'Wed', leave: 30, od: 8, exception: 4 },
        { date: 'Thu', leave: 22, od: 20, exception: 3 },
        { date: 'Fri', leave: 65, od: 14, exception: 5 },
        { date: 'Sat', leave: 98, od: 6, exception: 8 },
        { date: 'Sun', leave: 42, od: 2, exception: 3 }
      ],
      hourlyGateTraffic: [
        { hour: '06 AM', exits: 2, entries: 0 },
        { hour: '08 AM', exits: 18, entries: 4 },
        { hour: '10 AM', exits: 45, entries: 12 },
        { hour: '12 PM', exits: 28, entries: 22 },
        { hour: '02 PM', exits: 15, entries: 35 },
        { hour: '04 PM', exits: 68, entries: 18 },
        { hour: '06 PM', exits: 12, entries: 74 },
        { hour: '08 PM', exits: 3, entries: 52 }
      ],
      departmentDistribution: [
        { name: 'CSE', count: 42 },
        { name: 'ECE', count: 28 },
        { name: 'EEE', count: 19 },
        { name: 'MECH', count: 15 },
        { name: 'IT', count: 31 },
        { name: 'CIVIL', count: 12 }
      ],
      insights: [
        {
          id: 'ins-1',
          title: 'Approval Bottleneck Detected',
          description: 'Parent consent response time averages 18 mins. HOD approval takes under 6 mins.',
          type: 'INFO'
        },
        {
          id: 'ins-2',
          title: 'Peak Exit Window Identified',
          description: 'Friday 4:00 PM - 6:00 PM represents 68% of weekly weekend leave gate traffic.',
          type: 'SUCCESS'
        },
        {
          id: 'ins-3',
          title: 'High Exception Compliance',
          description: '98.4% of Exception Passes issued by HOD returned prior to deadline expiry.',
          type: 'SUCCESS'
        }
      ]
    };
  }

  // --- CSV EXPORTER ---
  public exportToCsv(type: 'REQUESTS' | 'GATE_LOGS' | 'AUDIT_LOGS' | 'PASSES') {
    let filename = `bit-smartoutpass-${type.toLowerCase()}-${Date.now()}.csv`;
    let headers: string[] = [];
    let rows: string[][] = [];

    if (type === 'REQUESTS') {
      headers = ['Request Number', 'Student Name', 'Reg Number', 'Department', 'Type', 'Destination', 'Status', 'Start Date', 'End Date'];
      rows = this.requests.map(r => [
        r.requestNumber,
        r.studentName,
        r.registerNumber,
        r.department,
        r.type,
        `"${r.destination.replace(/"/g, '""')}"`,
        r.status,
        new Date(r.startDate).toLocaleString(),
        new Date(r.endDate).toLocaleString()
      ]);
    } else if (type === 'GATE_LOGS') {
      headers = ['Log ID', 'Pass Number', 'Student Name', 'Reg Number', 'Event Type', 'Gate Name', 'Timestamp', 'Security Officer'];
      rows = this.gateLogs.map(g => [
        g.id,
        g.passId,
        g.studentName,
        g.registerNumber,
        g.eventType,
        g.gateName,
        new Date(g.timestamp).toLocaleString(),
        g.securityName
      ]);
    } else if (type === 'AUDIT_LOGS') {
      headers = ['Timestamp', 'Actor Name', 'Role', 'Action', 'Entity Type', 'Entity ID', 'Previous State', 'New State'];
      rows = this.auditLogs.map(a => [
        new Date(a.timestamp).toLocaleString(),
        a.actorName,
        a.actorRole,
        a.action,
        a.entityType,
        a.entityId,
        a.previousState || '-',
        a.newState || '-'
      ]);
    }

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Reset to initial demo state
  public resetDemoData() {
    this.requests = [...MOCK_REQUESTS];
    this.passes = [...MOCK_PASSES];
    this.parentConsents = [...MOCK_PARENT_CONSENTS];
    this.gateLogs = [...MOCK_GATE_LOGS];
    this.auditLogs = [...MOCK_AUDIT_LOGS];
    this.notifications = [...MOCK_NOTIFICATIONS];
    localStorage.clear();
    this.notify();
  }

  // Auto-approve all requests flagged as emergency which are not yet approved
  public autoApproveAllEmergencies(adminProfile = DEMO_USERS.admin) {
    const toApprove = this.requests.filter(r => (r as any).isEmergency && r.status !== 'APPROVED' && r.status !== 'COMPLETED');
    toApprove.forEach(req => {
      const prev = req.status;
      req.parentStatus = 'SKIPPED' as any;
      req.advisorStatus = 'APPROVED';
      req.wardenStatus = 'APPROVED';
      req.status = 'APPROVED';
      req.currentStage = 'Emergency Auto-Approved (Admin Batch) • Digital Pass Issued';
      const pass = this.issueDigitalPass(req, `Admin Auto-Approve ${adminProfile.name}`);

      this.addNotification(req.studentId, 'Emergency Auto-Approved', `Your emergency request ${req.requestNumber} has been auto-approved. Pass ${pass.passNumber} issued.`, 'SUCCESS', req.id);

      this.addAudit(
        adminProfile.id,
        adminProfile.name,
        'ADMIN',
        'BATCH_EMERGENCY_AUTO_APPROVE',
        'LEAVE_REQUEST',
        req.id,
        prev,
        'APPROVED',
        { batch: true }
      );
    });

    if (toApprove.length > 0) this.notify();
    return toApprove.length;
  }
}

export const dataService = new DataService();
