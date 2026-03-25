export type AgentRole = 'read-only' | 'order-placement';

export interface AgentRecord {
  agentId: string;
  email: string;
  passwordHash: string;
  role: AgentRole;
  name: string;
  active: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export type AuditOutcome = 'success' | 'failure';

export interface AuditEntry {
  agentId: string;
  agentEmail: string;
  agentName: string;
  customerId: string | null;
  sessionId: string;
  actionType: string;
  actionDetail: Record<string, unknown>;
  timestamp: string;
  outcome: AuditOutcome;
  failureReason?: string;
}
