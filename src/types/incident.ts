export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type IncidentStatus =
  | "OPEN"
  | "INVESTIGATING"
  | "MITIGATION_IN_PROGRESS"
  | "MONITORING"
  | "RESOLVED";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";

export interface IncidentTask {
  id: string;
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: TaskStatus;
  assignedTeam?: string;
}

export interface TimelineEntry {
  id: string;
  timestamp: string;
  message: string;
  type: "INFO" | "ACTION" | "SUCCESS" | "ERROR" | "APPROVAL";
}

export interface ServiceMetrics {
  errorRate: number;
  latencyMs: number;
  dbPoolUtilization: number;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  service: string;
  metrics: ServiceMetrics;
  recentEvents: string[];
  tasks: IncidentTask[];
  timeline: TimelineEntry[];
}