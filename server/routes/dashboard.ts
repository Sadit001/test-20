import { RequestHandler } from "express";
import { DashboardResponse } from "@shared/api";

export const handleDashboard: RequestHandler = (_req, res) => {
  const response: DashboardResponse = {
    environment: "development",
    user: {
      name: "Sofia Rahman",
      role: "Operational Manager",
      initials: "SR",
      department: "Operations",
    },
    metrics: [
      { label: "Open maintenance", value: "18", change: "+12.5%", trend: "up", detail: "vs last week" },
      { label: "SLA compliance", value: "94.2%", change: "+3.1%", trend: "up", detail: "vs last month" },
      { label: "Parts on hand", value: "1,284", change: "-2.4%", trend: "down", detail: "vs last month" },
      { label: "Active projects", value: "07", change: "2 due soon", trend: "flat", detail: "next 14 days" },
    ],
    sla: { within: 74, atRisk: 18, breached: 8, total: 100 },
    maintenance: [
      {
        id: "MT-2026-0047",
        title: "Hydraulic pump malfunction",
        machine: "IMM-003",
        location: "Molding · Line 2",
        priority: "Critical",
        status: "Diagnosis",
        owner: "Arif Hasan",
        ownerInitials: "AH",
        age: "22 min ago",
        sla: "08 min left",
        slaState: "critical",
      },
      {
        id: "MT-2026-0046",
        title: "Temperature sensor calibration",
        machine: "PET-001",
        location: "Blow molding · Line 1",
        priority: "High",
        status: "Assigned",
        owner: "Mita Sultana",
        ownerInitials: "MS",
        age: "1 hr ago",
        sla: "42 min left",
        slaState: "warning",
      },
      {
        id: "MT-2026-0042",
        title: "Conveyor belt alignment",
        machine: "BMM-001",
        location: "Packaging · Line 3",
        priority: "Medium",
        status: "Repair",
        owner: "Kabir Ahmed",
        ownerInitials: "KA",
        age: "3 hrs ago",
        sla: "2h 18m left",
        slaState: "normal",
      },
      {
        id: "MT-2026-0038",
        title: "PLC communication fault",
        machine: "EBM-001",
        location: "Extrusion · Line 1",
        priority: "High",
        status: "Testing",
        owner: "Nabil Hossain",
        ownerInitials: "NH",
        age: "Yesterday",
        sla: "Testing now",
        slaState: "normal",
      },
    ],
    activity: [
      { id: "1", actor: "Mita Sultana", actorInitials: "MS", action: "submitted a diagnosis for", target: "MT-2026-0046", time: "8 min ago", type: "maintenance" },
      { id: "2", actor: "You", actorInitials: "SR", action: "approved quotation for", target: "MT-2026-0039", time: "24 min ago", type: "approval" },
      { id: "3", actor: "Warehouse", actorInitials: "WH", action: "issued 12 units of", target: "Hydraulic seal kit", time: "41 min ago", type: "inventory" },
      { id: "4", actor: "Rafiq Karim", actorInitials: "RK", action: "updated progress on", target: "Line Expansion", time: "1 hr ago", type: "project" },
    ],
    upcoming: [
      { id: "1", title: "Preventive maintenance", detail: "IMM-001 · 7 tasks", time: "Today, 14:00", kind: "maintenance" },
      { id: "2", title: "Weekly operations sync", detail: "6 participants · Meeting room A", time: "Tomorrow, 09:30", kind: "meeting" },
      { id: "3", title: "Quotation review", detail: "3 suppliers · MT-2026-0047", time: "Tomorrow, 11:00", kind: "review" },
    ],
  };

  res.status(200).json({ success: true, data: response });
};
