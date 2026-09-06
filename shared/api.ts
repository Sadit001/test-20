export interface DemoResponse {
  message: string;
}

export type DashboardSeverity = "critical" | "warning" | "normal";

export interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "flat";
  detail: string;
}

export interface MaintenanceTicket {
  id: string;
  title: string;
  machine: string;
  location: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Reported" | "Assigned" | "Diagnosis" | "Repair" | "Testing";
  owner: string;
  ownerInitials: string;
  age: string;
  sla: string;
  slaState: DashboardSeverity;
}

export interface ActivityItem {
  id: string;
  actor: string;
  actorInitials: string;
  action: string;
  target: string;
  time: string;
  type: "maintenance" | "approval" | "inventory" | "project";
}

export interface UpcomingItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  kind: "maintenance" | "meeting" | "review";
}

export interface DashboardResponse {
  environment: "development" | "staging" | "production";
  user: {
    name: string;
    role: string;
    initials: string;
    department: string;
  };
  metrics: DashboardMetric[];
  sla: {
    within: number;
    atRisk: number;
    breached: number;
    total: number;
  };
  maintenance: MaintenanceTicket[];
  activity: ActivityItem[];
  upcoming: UpcomingItem[];
}
