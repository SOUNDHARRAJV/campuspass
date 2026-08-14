-- ====================================================================
-- BIT SmartOutpass - Unified Student Leave & Campus Exit Database Schema
-- Target Database: PostgreSQL / Supabase
-- ====================================================================

-- 1. ENUM TYPES
CREATE TYPE user_role AS ENUM (
  'STUDENT',
  'PARENT',
  'ADVISOR',
  'WARDEN',
  'HOD',
  'SECURITY',
  'ADMIN'
);

CREATE TYPE request_type AS ENUM ('LEAVE', 'OD', 'EXCEPTION');

CREATE TYPE request_status AS ENUM (
  'DRAFT',
  'SUBMITTED',
  'PARENT_PENDING',
  'PARENT_APPROVED',
  'PARENT_REJECTED',
  'APPROVAL_PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
  'EXPIRED',
  'COMPLETED'
);

CREATE TYPE pass_status AS ENUM ('ACTIVE', 'USED', 'EXPIRED', 'REVOKED');
CREATE TYPE gate_event_type AS ENUM ('EXIT', 'ENTRY');

-- 2. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'STUDENT',
  avatar_url TEXT,
  phone VARCHAR(20),
  department VARCHAR(100),
  register_number VARCHAR(50) UNIQUE,
  hostel_block VARCHAR(50),
  room_number VARCHAR(20),
  year_of_study INT,
  parent_name VARCHAR(255),
  parent_phone VARCHAR(20),
  parent_email VARCHAR(255),
  advisor_name VARCHAR(255),
  warden_name VARCHAR(255),
  hod_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. LEAVE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number VARCHAR(50) UNIQUE NOT NULL,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type request_type NOT NULL,
  reason TEXT NOT NULL,
  destination VARCHAR(255) NOT NULL,
  emergency_contact VARCHAR(20) NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status request_status NOT NULL DEFAULT 'SUBMITTED',
  current_stage VARCHAR(255) NOT NULL,
  parent_status VARCHAR(20) DEFAULT 'PENDING',
  advisor_status VARCHAR(20) DEFAULT 'PENDING',
  warden_status VARCHAR(20) DEFAULT 'PENDING',
  hod_status VARCHAR(20) DEFAULT 'PENDING',
  is_exception BOOLEAN DEFAULT FALSE,
  exception_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PARENT CONSENTS TABLE
CREATE TABLE IF NOT EXISTS parent_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES leave_requests(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id),
  parent_email VARCHAR(255) NOT NULL,
  parent_phone VARCHAR(20) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  remarks TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. APPROVAL ACTIONS TABLE
CREATE TABLE IF NOT EXISTS approval_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES leave_requests(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES profiles(id),
  approver_role user_role NOT NULL,
  action VARCHAR(50) NOT NULL,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. EXCEPTION LETTERS & E-ATTESTATIONS TABLE
CREATE TABLE IF NOT EXISTS exception_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES leave_requests(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id),
  hod_id UUID NOT NULL REFERENCES profiles(id),
  attested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  destination VARCHAR(255) NOT NULL,
  digital_signature_hash VARCHAR(255) NOT NULL,
  electronic_attestation_notice TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. DIGITAL PASSES TABLE
CREATE TABLE IF NOT EXISTS digital_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pass_number VARCHAR(50) UNIQUE NOT NULL,
  request_id UUID NOT NULL REFERENCES leave_requests(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id),
  type request_type NOT NULL,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  status pass_status NOT NULL DEFAULT 'ACTIVE',
  issued_by VARCHAR(255) NOT NULL,
  qr_payload TEXT NOT NULL,
  exit_recorded_at TIMESTAMPTZ,
  entry_recorded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. GATE LOGS TABLE
CREATE TABLE IF NOT EXISTS gate_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pass_id UUID REFERENCES digital_passes(id),
  request_id UUID REFERENCES leave_requests(id),
  student_id UUID REFERENCES profiles(id),
  gate_name VARCHAR(100) NOT NULL DEFAULT 'Main Gate 1',
  security_id UUID REFERENCES profiles(id),
  event_type gate_event_type NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  verification_status VARCHAR(50) NOT NULL DEFAULT 'SUCCESS',
  notes TEXT
);

-- 9. AUDIT LOGS TABLE (IMMUTABLE EVENT TRAIL)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  actor_id UUID REFERENCES profiles(id),
  actor_name VARCHAR(255) NOT NULL,
  actor_role user_role NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  previous_state VARCHAR(100),
  new_state VARCHAR(100),
  metadata JSONB
);

-- 10. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'INFO',
  read BOOLEAN DEFAULT FALSE,
  link_request_id UUID REFERENCES leave_requests(id),
  delivery_channel VARCHAR(50) DEFAULT 'IN_APP',
  delivery_status VARCHAR(50) DEFAULT 'DELIVERED',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. INDEXES FOR HIGH-PERFORMANCE QUERYING
CREATE INDEX IF NOT EXISTS idx_requests_student ON leave_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_passes_token ON digital_passes(qr_payload);
CREATE INDEX IF NOT EXISTS idx_gate_logs_pass ON gate_logs(pass_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_id);

-- 12. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exception_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gate_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Student RLS: Access own records
CREATE POLICY "Students view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Students view own requests" ON leave_requests FOR SELECT USING (student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Students create requests" ON leave_requests FOR INSERT WITH CHECK (student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Security RLS: Gate operations
CREATE POLICY "Security view active passes" ON digital_passes FOR SELECT USING (TRUE);
CREATE POLICY "Security log gate events" ON gate_logs FOR INSERT WITH CHECK (TRUE);

-- Admin & HOD RLS: Full visibility for authority roles
CREATE POLICY "Admins full access" ON audit_logs FOR ALL USING (TRUE);
