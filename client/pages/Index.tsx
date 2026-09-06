import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Boxes,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Clock3,
  FileBarChart,
  Filter,
  Gauge,
  LayoutDashboard,
  MapPin,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Package,
  PanelLeftClose,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
  Wrench,
  X,
  XCircle,
} from "lucide-react";
import type { DashboardResponse, MaintenanceTicket } from "@shared/api";

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Maintenance", icon: Wrench, count: "18" },
  { label: "Machines", icon: Settings2 },
  { label: "Inventory", icon: Boxes, count: "3" },
  { label: "Projects", icon: BriefcaseBusiness },
];

const workspace = [
  { label: "Team", icon: Users },
  { label: "Reports", icon: FileBarChart },
  { label: "Analytics", icon: BarChart3 },
];

const statusClasses: Record<MaintenanceTicket["priority"], string> = {
  Critical: "bg-[#fff0ee] text-[#cb4a3c] border-[#f6d2cc]",
  High: "bg-[#fff8e9] text-[#b77a11] border-[#f0dfaf]",
  Medium: "bg-[#edf5ff] text-[#4276ad] border-[#d2e3f5]",
  Low: "bg-[#eef8f3] text-[#33815f] border-[#d2eddf]",
};

const severityClasses = {
  critical: "text-[#d95b4f] bg-[#fff1ef]",
  warning: "text-[#b77a11] bg-[#fff8e9]",
  normal: "text-[#33815f] bg-[#eef8f3]",
};

function Avatar({ initials, tone = "blue" }: { initials: string; tone?: "blue" | "navy" | "green" | "amber" }) {
  const tones = {
    blue: "bg-[#dcecfb] text-[#3d6d9e]",
    navy: "bg-[#dfe6ed] text-[#32485d]",
    green: "bg-[#dff1e7] text-[#37805d]",
    amber: "bg-[#f8e9c8] text-[#a06e18]",
  };
  return <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${tones[tone]}`}>{initials}</span>;
}

function MiniSparkline({ trend }: { trend: "up" | "down" | "flat" }) {
  const points = trend === "down" ? "0,5 10,10 20,7 30,12 40,9 50,15 60,13" : trend === "flat" ? "0,11 10,9 20,12 30,10 40,10 50,8 60,9" : "0,14 10,11 20,12 30,7 40,9 50,3 60,5";
  return (
    <svg className="h-5 w-[60px]" viewBox="0 0 60 18" fill="none" aria-hidden="true">
      <polyline points={points} stroke={trend === "down" ? "#d95b4f" : "#4e9c78"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#f5f7f9] p-4 md:p-8">
      <div className="mx-auto max-w-[1440px] animate-pulse space-y-6">
        <div className="h-12 w-full rounded-2xl bg-white" />
        <div className="h-40 rounded-[24px] bg-[#18344b]" />
        <div className="grid gap-4 md:grid-cols-4"><div className="h-32 rounded-2xl bg-white" /><div className="h-32 rounded-2xl bg-white" /><div className="h-32 rounded-2xl bg-white" /><div className="h-32 rounded-2xl bg-white" /></div>
        <div className="grid gap-5 lg:grid-cols-[1.4fr_.8fr]"><div className="h-96 rounded-2xl bg-white" /><div className="h-96 rounded-2xl bg-white" /></div>
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f7f9] p-6">
      <div className="max-w-sm rounded-3xl border border-[#e4e9ee] bg-white p-8 text-center shadow-[0_14px_40px_rgba(28,50,68,0.08)]">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1ef] text-[#d95b4f]"><AlertCircle size={22} /></div>
        <h1 className="text-lg font-bold text-[#18344b]">Couldn&apos;t load your workspace</h1>
        <p className="mt-2 text-sm leading-6 text-[#71808d]">The operations feed is unavailable right now. Try again to reconnect.</p>
        <button onClick={onRetry} className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-[#18344b] px-4 text-sm font-semibold text-white transition hover:bg-[#244b68]"><RefreshCw size={15} /> Retry</button>
      </div>
    </div>
  );
}

export default function Index() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeNav, setActiveNav] = useState("Overview");
  const [query, setQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notice, setNotice] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch("/api/dashboard");
      if (!response.ok) throw new Error("Dashboard request failed");
      const payload = (await response.json()) as { success: boolean; data: DashboardResponse };
      setData(payload.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const filteredMaintenance = useMemo(() => {
    if (!data) return [];
    const normalized = query.toLowerCase().trim();
    if (!normalized) return data.maintenance;
    return data.maintenance.filter((ticket) => [ticket.id, ticket.title, ticket.machine, ticket.owner, ticket.status].join(" ").toLowerCase().includes(normalized));
  }, [data, query]);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState onRetry={() => void loadDashboard()} />;

  const changeNav = (label: string) => {
    setActiveNav(label);
    setMobileNavOpen(false);
    if (label !== "Overview") setNotice(`${label} workspace is ready to open from the expanded navigation.`);
  };

  return (
    <div className="min-h-screen bg-[#f5f7f9] text-[#18344b] selection:bg-[#d8e7f3]">
      <div className="mx-auto flex min-h-screen max-w-[1680px]">
        <aside className="hidden w-[248px] shrink-0 flex-col bg-[#17344b] px-4 py-5 text-white lg:flex">
          <div className="flex items-center gap-3 px-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e5f0f8] text-[#17344b]"><Gauge size={20} strokeWidth={2.5} /></div>
            <div><div className="text-[15px] font-extrabold tracking-[-0.02em]">Luna<span className="text-[#87c9bc]">Ops</span></div><div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8da4b7]">Operations OS</div></div>
          </div>
          <div className="my-8 h-px bg-white/10" />
          <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#7792a6]">Workspace</div>
          <nav className="space-y-1">
            {navigation.map((item) => { const Icon = item.icon; const selected = activeNav === item.label; return <button key={item.label} onClick={() => changeNav(item.label)} className={`group flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-[13px] font-semibold transition ${selected ? "bg-white text-[#17344b] shadow-[0_8px_18px_rgba(3,17,29,0.12)]" : "text-[#afc2d0] hover:bg-white/10 hover:text-white"}`}><span className="flex items-center gap-3"><Icon size={17} strokeWidth={selected ? 2.4 : 1.8} />{item.label}</span>{item.count && <span className={`rounded-md px-1.5 py-0.5 text-[10px] ${selected ? "bg-[#edf3f7] text-[#41647f]" : "bg-white/10 text-[#afc2d0]"}`}>{item.count}</span>}</button>; })}
          </nav>
          <div className="mb-3 mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#7792a6]">Manage</div>
          <nav className="space-y-1">
            {workspace.map((item) => { const Icon = item.icon; return <button key={item.label} onClick={() => changeNav(item.label)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-semibold transition ${activeNav === item.label ? "bg-white/10 text-white" : "text-[#afc2d0] hover:bg-white/10 hover:text-white"}`}><Icon size={17} strokeWidth={1.8} />{item.label}</button>; })}
          </nav>
          <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8da4b7]">System health</span><span className="flex items-center gap-1.5 text-[10px] font-bold text-[#8bd0bb]"><span className="h-1.5 w-1.5 rounded-full bg-[#73c8ae]" />Operational</span></div>
            <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[96%] rounded-full bg-[#72c7ae]" /></div>
            <p className="text-[11px] leading-5 text-[#90a7b9]">All systems are running normally.</p>
          </div>
          <button className="mt-4 flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[12px] font-semibold text-[#afc2d0] transition hover:bg-white/10 hover:text-white"><Settings2 size={17} />Settings</button>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-[#e5eaee]/80 bg-[#f5f7f9]/95 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <button onClick={() => setMobileNavOpen(true)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dce4ea] bg-white text-[#496176] lg:hidden"><Menu size={19} /></button>
                <div className="min-w-0"><p className="truncate text-xs font-semibold text-[#80909e]">Wednesday, March 18, 2026</p><h1 className="truncate text-[19px] font-extrabold tracking-[-0.03em] text-[#18344b] sm:text-[21px]">Good morning, Sofia <span className="hidden sm:inline">— here&apos;s your pulse.</span></h1></div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="relative hidden w-[220px] md:block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#93a1ad]" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search maintenance..." className="h-10 w-full rounded-xl border border-[#dfe6eb] bg-white pl-9 pr-3 text-xs font-medium text-[#18344b] outline-none placeholder:text-[#9aa7b2] focus:border-[#88b7d0] focus:ring-2 focus:ring-[#d9eaf4]" /></div>
                <button onClick={() => setShowNotifications((value) => !value)} className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#dce4ea] bg-white text-[#587082] transition hover:border-[#b6cad8] hover:text-[#18344b]"><Bell size={17} /> <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#d95b4f] ring-2 ring-white" /></button>
                <div className="hidden items-center gap-2 sm:flex"><Avatar initials={data.user.initials} tone="navy" /><div className="hidden xl:block"><div className="text-xs font-bold text-[#18344b]">{data.user.name}</div><div className="text-[10px] font-medium text-[#82909c]">{data.user.role}</div></div><ChevronDown size={14} className="text-[#8c9aa6]" /></div>
              </div>
            </div>
            {showNotifications && <div className="absolute right-4 top-[68px] w-[290px] rounded-2xl border border-[#dfe7ec] bg-white p-4 shadow-[0_18px_50px_rgba(27,51,68,0.16)] sm:right-10"><div className="flex items-center justify-between"><p className="text-sm font-extrabold">Notifications</p><span className="rounded-md bg-[#fff1ef] px-2 py-1 text-[10px] font-bold text-[#c9584d]">3 new</span></div><div className="mt-3 space-y-3"><div className="flex gap-3 border-b border-[#eef1f4] pb-3"><span className="mt-0.5 rounded-lg bg-[#fff0ee] p-2 text-[#d95b4f]"><AlertTriangle size={14} /></span><div><p className="text-xs font-bold">SLA breach risk</p><p className="mt-0.5 text-[11px] text-[#81909c]">MT-2026-0047 needs attention.</p></div></div><div className="flex gap-3"><span className="mt-0.5 rounded-lg bg-[#eef8f3] p-2 text-[#33815f]"><CheckCircle2 size={14} /></span><div><p className="text-xs font-bold">Parts request fulfilled</p><p className="mt-0.5 text-[11px] text-[#81909c]">Hydraulic seal kit is ready.</p></div></div></div></div>}
          </header>

          <div className="px-4 pb-10 pt-5 sm:px-6 lg:px-10 lg:pt-7">
            <div className="mx-auto max-w-[1260px]">
              <section className="relative overflow-hidden rounded-[24px] bg-[#183b53] px-5 py-6 text-white shadow-[0_18px_40px_rgba(24,59,83,0.12)] sm:px-8 sm:py-7">
                <div className="relative z-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="mb-3 flex items-center gap-2"><span className="flex items-center gap-1.5 rounded-full bg-[#d7f0e7]/10 px-2.5 py-1 text-[10px] font-bold text-[#a5dfce]"><span className="h-1.5 w-1.5 rounded-full bg-[#71c7ad]" />All systems operational</span><span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-[#b7cbd7]">{data.environment} environment</span></div><h2 className="max-w-lg text-[26px] font-extrabold leading-[1.12] tracking-[-0.04em] sm:text-[31px]">Keep the floor moving.<br /><span className="text-[#9bd7c6]">Your team is counting on you.</span></h2><p className="mt-3 max-w-md text-xs leading-5 text-[#b3c8d5] sm:text-sm">Here&apos;s what needs your attention across maintenance, inventory, and projects today.</p></div><button onClick={() => setNotice("New request flow opened. Choose a request type to continue.")} className="flex h-10 w-fit items-center gap-2 rounded-xl bg-[#9bd7c6] px-4 text-xs font-extrabold text-[#17344b] transition hover:bg-[#b7e6d8]"><Plus size={15} strokeWidth={2.5} /> New request</button></div>
                <div className="pointer-events-none absolute -right-8 -top-20 h-64 w-64 rounded-full border-[32px] border-white/[0.035]" /><div className="pointer-events-none absolute -bottom-36 right-24 h-72 w-72 rounded-full border-[1px] border-[#9bd7c6]/10" /><Sparkles className="absolute bottom-7 right-8 text-white/10" size={100} strokeWidth={1} />
              </section>

              <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {data.metrics.map((metric, index) => <div key={metric.label} className="rounded-2xl border border-[#e3e9ee] bg-white p-4 shadow-[0_5px_18px_rgba(27,51,68,0.025)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(27,51,68,0.07)]"><div className="flex items-start justify-between"><p className="text-[11px] font-bold text-[#81909e]">{metric.label}</p><span className={`flex items-center gap-0.5 rounded-md px-1.5 py-1 text-[9px] font-bold ${metric.trend === "down" ? "bg-[#fff1ef] text-[#d95b4f]" : metric.trend === "flat" ? "bg-[#f2f5f7] text-[#6b7d8c]" : "bg-[#eef8f3] text-[#39805f]"}`}>{metric.trend === "up" ? <ArrowUpRight size={11} /> : metric.trend === "down" ? <ArrowDownRight size={11} /> : null}{metric.change}</span></div><div className="mt-2 flex items-end justify-between"><p className="text-[28px] font-extrabold tracking-[-0.04em] text-[#18344b]">{metric.value}</p><MiniSparkline trend={metric.trend} /></div><p className="mt-1 text-[10px] font-medium text-[#a0abb4]">{metric.detail}</p></div>)}
              </section>

              <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(330px,.65fr)]">
                <section className="min-w-0 rounded-2xl border border-[#e3e9ee] bg-white shadow-[0_5px_18px_rgba(27,51,68,0.025)]">
                  <div className="flex flex-col gap-3 border-b border-[#edf1f4] p-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><h3 className="text-[15px] font-extrabold tracking-[-0.02em]">Maintenance queue</h3><span className="rounded-md bg-[#fff1ef] px-1.5 py-1 text-[10px] font-bold text-[#cb4a3c]">18 open</span></div><p className="mt-1 text-[11px] font-medium text-[#8d9aa5]">Prioritized by urgency and SLA risk</p></div><div className="flex items-center gap-2"><button onClick={() => setNotice("Filters are ready for priority, status, machine, and assignee.")} className="flex h-8 items-center gap-1.5 rounded-lg border border-[#dfe6eb] px-2.5 text-[10px] font-bold text-[#617484] transition hover:border-[#adc5d4] hover:text-[#18344b]"><SlidersHorizontal size={13} /> Filter</button><button onClick={() => void loadDashboard()} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#dfe6eb] text-[#617484] transition hover:border-[#adc5d4] hover:text-[#18344b]" aria-label="Refresh maintenance queue"><RefreshCw size={13} /></button></div></div>
                  <div className="hidden grid-cols-[minmax(180px,1.5fr)_100px_110px_104px_100px_18px] gap-3 border-b border-[#edf1f4] px-5 py-3 text-[9px] font-extrabold uppercase tracking-[0.11em] text-[#9ba7b0] sm:grid"><span>Ticket</span><span>Priority</span><span>Status</span><span>Assigned to</span><span>SLA</span><span /></div>
                  <div className="divide-y divide-[#edf1f4]">{filteredMaintenance.length ? filteredMaintenance.map((ticket) => <button key={ticket.id} onClick={() => setSelectedTicket(ticket)} className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-3 px-5 py-4 text-left transition hover:bg-[#f8fafb] sm:grid-cols-[minmax(180px,1.5fr)_100px_110px_104px_100px_18px] sm:items-center"><div className="min-w-0"><div className="flex items-center gap-2"><span className={`h-1.5 w-1.5 shrink-0 rounded-full ${ticket.priority === "Critical" ? "bg-[#d95b4f]" : ticket.priority === "High" ? "bg-[#dba333]" : "bg-[#5d9cc5]"}`} /><span className="truncate text-xs font-extrabold text-[#27465e]">{ticket.title}</span></div><div className="mt-1 flex items-center gap-2 pl-3.5 text-[10px] font-semibold text-[#93a0aa]"><span>{ticket.id}</span><span className="text-[#c6cdd2]">•</span><span>{ticket.machine}</span><span className="hidden md:inline">· {ticket.location}</span></div></div><span className={`w-fit rounded-md border px-2 py-1 text-[9px] font-bold ${statusClasses[ticket.priority]}`}>{ticket.priority}</span><span className="hidden text-[10px] font-bold text-[#627786] sm:block">{ticket.status}</span><span className="hidden items-center gap-1.5 text-[10px] font-bold text-[#657a89] sm:flex"><Avatar initials={ticket.ownerInitials} tone="blue" /> <span className="truncate">{ticket.owner.split(" ")[0]}</span></span><span className={`hidden w-fit items-center gap-1 rounded-md px-2 py-1 text-[9px] font-bold sm:flex ${severityClasses[ticket.slaState]}`}><Clock3 size={10} />{ticket.sla}</span><ChevronRight className="mt-1 text-[#b4c0c8]" size={15} /></button>) : <div className="p-10 text-center"><Search className="mx-auto text-[#a5b1ba]" size={22} /><p className="mt-2 text-sm font-bold text-[#526b7d]">No tickets match your search</p><p className="mt-1 text-xs text-[#98a6b0]">Try a ticket ID, machine, status, or assignee.</p></div>}</div>
                  <button onClick={() => { setActiveNav("Maintenance"); setNotice("Maintenance workspace is ready to open from the expanded navigation."); }} className="flex w-full items-center justify-center gap-2 border-t border-[#edf1f4] py-3.5 text-[11px] font-extrabold text-[#4c83a8] transition hover:bg-[#f8fafb]">View all maintenance <ChevronRight size={14} /></button>
                </section>

                <div className="space-y-5">
                  <section className="rounded-2xl border border-[#e3e9ee] bg-white p-5 shadow-[0_5px_18px_rgba(27,51,68,0.025)]"><div className="flex items-center justify-between"><div><h3 className="text-[15px] font-extrabold tracking-[-0.02em]">SLA health</h3><p className="mt-1 text-[11px] font-medium text-[#8d9aa5]">Across active maintenance</p></div><button onClick={() => setNotice("SLA analytics are available in the Analytics workspace.")} className="text-[#a1adb6] transition hover:text-[#18344b]"><MoreHorizontal size={18} /></button></div><div className="mt-5 flex items-center gap-5"><div className="relative flex h-[112px] w-[112px] shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(#4e9c78 0 74%, #e0ae45 74% 92%, #d95b4f 92% 100%)` }}><div className="flex h-[82px] w-[82px] flex-col items-center justify-center rounded-full bg-white"><span className="text-[22px] font-extrabold tracking-[-0.05em]">94.2%</span><span className="text-[9px] font-bold text-[#96a3ad]">compliance</span></div></div><div className="min-w-0 flex-1 space-y-3">{[["Within SLA", data.sla.within, "#4e9c78"], ["At risk", data.sla.atRisk, "#e0ae45"], ["Breached", data.sla.breached, "#d95b4f"]].map(([label, value, color]) => <div key={label as string} className="flex items-center justify-between text-[11px]"><span className="flex items-center gap-2 font-semibold text-[#71818e]"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: color as string }} />{label as string}</span><span className="font-extrabold text-[#294960]">{value as number}%</span></div>)}</div></div><div className="mt-5 flex items-center gap-2 rounded-xl bg-[#f5faf8] px-3 py-2.5 text-[10px] font-semibold text-[#4b866b]"><ShieldCheck size={14} />SLA performance is up 3.1% this month</div></section>
                  <section className="rounded-2xl border border-[#e3e9ee] bg-white p-5 shadow-[0_5px_18px_rgba(27,51,68,0.025)]"><div className="flex items-center justify-between"><div><h3 className="text-[15px] font-extrabold tracking-[-0.02em]">Upcoming</h3><p className="mt-1 text-[11px] font-medium text-[#8d9aa5]">Your next actions</p></div><button onClick={() => setNotice("Calendar view is ready to open from the expanded navigation.")} className="text-[10px] font-extrabold text-[#4c83a8]">View calendar</button></div><div className="mt-3 divide-y divide-[#edf1f4]">{data.upcoming.map((item) => <button key={item.id} onClick={() => setNotice(`${item.title} selected.`)} className="flex w-full items-center gap-3 py-3 text-left transition hover:bg-[#fafcfd]"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.kind === "maintenance" ? "bg-[#fff1ef] text-[#d95b4f]" : item.kind === "meeting" ? "bg-[#edf5ff] text-[#4c83a8]" : "bg-[#fff8e9] text-[#b77a11]"}`}>{item.kind === "maintenance" ? <Wrench size={14} /> : item.kind === "meeting" ? <CalendarDays size={14} /> : <FileBarChart size={14} />}</span><span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-extrabold text-[#36536a]">{item.title}</span><span className="mt-0.5 block truncate text-[10px] font-medium text-[#94a0a9]">{item.detail}</span></span><span className="shrink-0 text-[9px] font-bold text-[#7f8f9b]">{item.time}</span></button>)}</div></section>
                </div>
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
                <section className="rounded-2xl border border-[#e3e9ee] bg-white p-5 shadow-[0_5px_18px_rgba(27,51,68,0.025)]"><div className="flex items-center justify-between"><div><h3 className="text-[15px] font-extrabold tracking-[-0.02em]">Recent activity</h3><p className="mt-1 text-[11px] font-medium text-[#8d9aa5]">A live trail of your workspace</p></div><Activity size={18} className="text-[#9babb6]" /></div><div className="mt-4 space-y-4">{data.activity.map((item, index) => <div key={item.id} className="flex gap-3"><div className="relative"><Avatar initials={item.actorInitials} tone={index % 2 === 0 ? "blue" : "green"} />{index < data.activity.length - 1 && <span className="absolute left-1/2 top-9 h-5 w-px -translate-x-1/2 bg-[#e8edf0]" />}</div><div className="min-w-0 flex-1 pt-0.5"><p className="text-[11px] leading-5 text-[#748492]"><span className="font-extrabold text-[#36536a]">{item.actor}</span> {item.action} <span className="font-extrabold text-[#4c83a8]">{item.target}</span></p><p className="mt-0.5 text-[10px] font-medium text-[#a1adb6]">{item.time}</p></div><span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#b9c8d2]" /></div>)}</div></section>
                <section className="rounded-2xl border border-[#e3e9ee] bg-white p-5 shadow-[0_5px_18px_rgba(27,51,68,0.025)]"><div className="flex items-center justify-between"><div><h3 className="text-[15px] font-extrabold tracking-[-0.02em]">Quick actions</h3><p className="mt-1 text-[11px] font-medium text-[#8d9aa5]">Move work forward</p></div><CircleDot size={18} className="text-[#9babb6]" /></div><div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">{[[Wrench, "Report issue", "#fff1ef", "#d95b4f"], [Package, "Request parts", "#fff8e9", "#b77a11"], [MessageSquareText, "Start discussion", "#edf5ff", "#4c83a8"], [BarChart3, "View analytics", "#eef8f3", "#39805f"]].map(([Icon, label, bg, color]) => <button key={label as string} onClick={() => setNotice(`${label} flow opened.`)} className="flex flex-col items-start gap-3 rounded-xl border border-[#edf1f4] p-3 text-left transition hover:-translate-y-0.5 hover:border-[#cadbe5] hover:shadow-sm"><span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: bg as string, color: color as string }}>{(() => { const ActionIcon = Icon as typeof Wrench; return <ActionIcon size={15} />; })()}</span><span className="text-[10px] font-extrabold text-[#466075]">{label as string}</span></button>)}</div></section>
              </div>
            </div>
          </div>
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#dfe7ec] bg-white/95 px-4 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md lg:hidden"><div className="mx-auto grid max-w-lg grid-cols-4"><button onClick={() => changeNav("Overview")} className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[9px] font-bold ${activeNav === "Overview" ? "text-[#2d709d]" : "text-[#8c9aa5]"}`}><LayoutDashboard size={18} />Home</button><button onClick={() => changeNav("Maintenance")} className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[9px] font-bold ${activeNav === "Maintenance" ? "text-[#2d709d]" : "text-[#8c9aa5]"}`}><Wrench size={18} />Work</button><button onClick={() => setShowNotifications((value) => !value)} className="relative flex flex-col items-center gap-1 rounded-xl py-2 text-[9px] font-bold text-[#8c9aa5]"><Bell size={18} /><span className="absolute left-1/2 top-1 h-1.5 w-1.5 rounded-full bg-[#d95b4f]" />Alerts</button><button onClick={() => setMobileNavOpen(true)} className="flex flex-col items-center gap-1 rounded-xl py-2 text-[9px] font-bold text-[#8c9aa5]"><Menu size={18} />More</button></div></div>

      {mobileNavOpen && <div className="fixed inset-0 z-40 lg:hidden"><button onClick={() => setMobileNavOpen(false)} className="absolute inset-0 bg-[#102c40]/55" aria-label="Close navigation" /><div className="absolute bottom-0 left-0 right-0 rounded-t-[26px] bg-[#17344b] p-5 pb-8 text-white shadow-[0_-15px_45px_rgba(10,28,42,0.25)]"><div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8da4b7]">LunaOps</p><h2 className="mt-1 text-lg font-extrabold">More workspace</h2></div><button onClick={() => setMobileNavOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"><X size={17} /></button></div><div className="grid grid-cols-2 gap-2">{[...navigation, ...workspace].map((item) => { const Icon = item.icon; return <button key={item.label} onClick={() => changeNav(item.label)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-bold ${activeNav === item.label ? "bg-white text-[#17344b]" : "bg-white/[0.07] text-[#c5d4de]"}`}><Icon size={16} />{item.label}</button>; })}</div></div></div>}

      {selectedTicket && <div className="fixed inset-0 z-50"><button onClick={() => setSelectedTicket(null)} className="absolute inset-0 bg-[#102c40]/45" aria-label="Close ticket details" /><aside className="absolute bottom-0 right-0 top-0 w-full max-w-[490px] overflow-y-auto bg-white p-5 shadow-[-16px_0_40px_rgba(17,43,60,0.16)] sm:p-7"><div className="flex items-center justify-between"><div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#8b9aa5]"><Wrench size={14} className="text-[#4c83a8]" /> Maintenance ticket</div><button onClick={() => setSelectedTicket(null)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f3f6f8] text-[#667c8c]"><X size={17} /></button></div><div className="mt-7"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold text-[#4c83a8]">{selectedTicket.id}</p><h2 className="mt-2 text-[24px] font-extrabold leading-tight tracking-[-0.04em] text-[#18344b]">{selectedTicket.title}</h2><p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#8b99a5]"><MapPin size={13} />{selectedTicket.machine} · {selectedTicket.location}</p></div><span className={`rounded-md border px-2 py-1 text-[9px] font-bold ${statusClasses[selectedTicket.priority]}`}>{selectedTicket.priority}</span></div><div className="mt-6 grid grid-cols-2 gap-2"><div className="rounded-xl bg-[#f7f9fa] p-3"><p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#9aa7b0]">Current status</p><p className="mt-1 text-sm font-extrabold text-[#36536a]">{selectedTicket.status}</p></div><div className={`rounded-xl p-3 ${severityClasses[selectedTicket.slaState]}`}><p className="text-[9px] font-bold uppercase tracking-[0.1em] opacity-70">SLA clock</p><p className="mt-1 text-sm font-extrabold">{selectedTicket.sla}</p></div></div><div className="mt-7"><h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#7e8e9a]">Workflow</h3><div className="mt-4 space-y-0">{["Reported", "Assigned", "Diagnosis", "Quotation review", "Repair", "Testing", "Completed"].map((step, index) => { const currentIndex = ["Reported", "Assigned", "Diagnosis", "Quotation review", "Repair", "Testing", "Completed"].indexOf(selectedTicket.status); const done = index < currentIndex; const current = index === currentIndex; return <div key={step} className="flex gap-3"><div className="flex flex-col items-center"><span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-extrabold ${done ? "bg-[#e2f3eb] text-[#39805f]" : current ? "bg-[#dcecfb] text-[#4c83a8] ring-4 ring-[#edf5fa]" : "bg-[#f1f4f6] text-[#a0adb6]"}`}>{done ? <Check size={13} /> : index + 1}</span>{index < 6 && <span className={`h-7 w-px ${done ? "bg-[#b8dfcc]" : "bg-[#e5eaee]"}`} />}</div><div className="pt-1"><p className={`text-xs font-bold ${current ? "text-[#36536a]" : done ? "text-[#6f8896]" : "text-[#abb6bd]"}`}>{step}</p>{current && <p className="mt-1 text-[10px] font-semibold text-[#4c83a8]">Current owner · {selectedTicket.owner}</p>}</div></div>; })}</div></div><div className="mt-7 border-t border-[#edf1f4] pt-5"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9aa7b0]">Assigned technician</p><div className="mt-2 flex items-center gap-2"><Avatar initials={selectedTicket.ownerInitials} tone="blue" /><span className="text-xs font-extrabold text-[#36536a]">{selectedTicket.owner}</span></div></div><button onClick={() => setNotice("Reassignment requires authorization and an available technician.")} className="flex h-9 items-center gap-1.5 rounded-lg border border-[#dfe6eb] px-3 text-[10px] font-extrabold text-[#4c83a8]">Reassign <ChevronRight size={13} /></button></div></div><div className="mt-7 flex gap-2"><button onClick={() => setNotice("Ticket update saved after backend validation.")} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#18344b] text-xs font-extrabold text-white transition hover:bg-[#244b68]"><CheckCircle2 size={15} /> Update ticket</button><button onClick={() => setNotice("Discussion opened for authorized participants.")} className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#dfe6eb] text-[#587082]"><MessageSquareText size={16} /></button></div></div></aside></div>}

      {notice && <div className="fixed bottom-[88px] left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-[#17344b] px-4 py-3 text-xs font-bold text-white shadow-[0_12px_30px_rgba(15,39,56,0.25)] lg:bottom-6"><CheckCircle2 size={15} className="text-[#90d4c0]" />{notice}</div>}
    </div>
  );
}
