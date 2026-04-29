import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import Title from "../../components/Title";
import {
  Users,
  UserCheck,
  UserMinus,
  CalendarCheck,
  CalendarX,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ClipboardEdit,
  DollarSign,
  MapPin,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  Shield,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ─── Data hooks ──────────────────────────────────────────────────────────────

const useHRScorecard = (month, year) => {
  // Employees
  const employees = useQuery({
    queryKey: ["scorecard-employees"],
    queryFn: async () => {
      const { data } = await api.get("/employee/list", { params: { limit: 1000 } });
      return data;
    },
    staleTime: 2 * 60 * 1000,
  });

  // Today attendance
  const today = new Date().toISOString().split("T")[0];
  const dailyAtt = useQuery({
    queryKey: ["scorecard-daily", today],
    queryFn: async () => {
      const { data } = await api.get("/attendance/get-daily-report", { params: { date: today } });
      return data;
    },
    staleTime: 60 * 1000,
  });

  // Monthly attendance report
  const monthlyAtt = useQuery({
    queryKey: ["scorecard-monthly-att", month, year],
    queryFn: async () => {
      const { data } = await api.get("/attendance/get-monthly-report", { params: { month, year } });
      return data;
    },
    staleTime: 2 * 60 * 1000,
  });

  // All pending leaves
  const leaves = useQuery({
    queryKey: ["scorecard-leaves"],
    queryFn: async () => {
      const { data } = await api.get("/leave/all-pending");
      return data;
    },
    staleTime: 60 * 1000,
  });

  // Payroll monthly
  const payroll = useQuery({
    queryKey: ["scorecard-payroll", month, year],
    queryFn: async () => {
      const { data } = await api.get("/payroll/monthly-run", { params: { month, year } });
      return data;
    },
    staleTime: 2 * 60 * 1000,
  });

  // Regularizations pending
  const regularizations = useQuery({
    queryKey: ["scorecard-regs"],
    queryFn: async () => {
      const { data } = await api.get("/attendance/regularization-list", { params: { status: "Pending" } });
      return data;
    },
    staleTime: 60 * 1000,
  });

  // Geofences
  const geofences = useQuery({
    queryKey: ["scorecard-geo"],
    queryFn: async () => {
      const { data } = await api.get("/geofence/list");
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const loading =
    employees.isLoading || dailyAtt.isLoading || leaves.isLoading || payroll.isLoading;

  const refetchAll = () => {
    employees.refetch();
    dailyAtt.refetch();
    monthlyAtt.refetch();
    leaves.refetch();
    payroll.refetch();
    regularizations.refetch();
    geofences.refetch();
  };

  return {
    employees: employees.data,
    dailyAtt: dailyAtt.data,
    monthlyAtt: monthlyAtt.data,
    leaves: leaves.data,
    payroll: payroll.data,
    regularizations: regularizations.data,
    geofences: geofences.data,
    loading,
    refetchAll,
  };
};

// ─── Reusable UI ─────────────────────────────────────────────────────────────

const GlassCard = ({ children, className = "" }) => (
  <div
    className={`relative bg-white dark:bg-layout-dark rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden ${className}`}
  >
    {children}
  </div>
);

const SectionHeader = ({ title, icon: Icon, badge, action }) => (
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 flex items-center justify-center border border-gray-100 dark:border-gray-700/50">
          <Icon className="size-4 text-gray-500 dark:text-gray-400" />
        </div>
      )}
      <h3 className="text-sm font-bold dark:text-white text-gray-800 tracking-tight">{title}</h3>
      {badge}
    </div>
    {action}
  </div>
);

const Badge = ({ children, variant = "default" }) => {
  const styles = {
    default: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    primary: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
    success: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
    warning: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
    danger: "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400",
    violet: "bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400",
  };
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${styles[variant]}`}>
      {children}
    </span>
  );
};

const ProgressBar = ({ value, max, color = "#3b82f6" }) => {
  const pct = max ? Math.min(Math.round((value / max) * 100), 100) : 0;
  return (
    <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
};

const KPICard = ({ title, value, sub, icon: Icon, color, trend, loading }) => {
  const colors = {
    blue:   { bg: "from-blue-500 to-blue-600",    light: "bg-blue-50 dark:bg-blue-950/30",    text: "text-blue-600 dark:text-blue-400",    shadow: "shadow-blue-200" },
    emerald:{ bg: "from-emerald-500 to-teal-500",  light: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-600 dark:text-emerald-400", shadow: "shadow-emerald-200" },
    amber:  { bg: "from-amber-400 to-orange-500",  light: "bg-amber-50 dark:bg-amber-950/30",  text: "text-amber-600 dark:text-amber-400",  shadow: "shadow-amber-200" },
    rose:   { bg: "from-rose-500 to-red-500",      light: "bg-rose-50 dark:bg-rose-950/30",    text: "text-rose-600 dark:text-rose-400",    shadow: "shadow-rose-200" },
    violet: { bg: "from-violet-500 to-purple-600", light: "bg-violet-50 dark:bg-violet-950/30", text: "text-violet-600 dark:text-violet-400", shadow: "shadow-violet-200" },
    indigo: { bg: "from-indigo-500 to-blue-600",   light: "bg-indigo-50 dark:bg-indigo-950/30", text: "text-indigo-600 dark:text-indigo-400", shadow: "shadow-indigo-200" },
  };
  const c = colors[color] || colors.blue;

  return (
    <GlassCard className="p-5">
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-[0.04] bg-gradient-to-br" style={{ background: `var(--tw-gradient-stops)` }} />
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest truncate">{title}</p>
          {loading ? (
            <div className="h-8 w-20 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse mt-2" />
          ) : (
            <p className="text-3xl font-bold text-gray-800 dark:text-white tabular-nums mt-1.5 tracking-tight">
              {value ?? "—"}
            </p>
          )}
          {sub && (
            <p className={`text-xs mt-1 font-medium ${c.text}`}>{sub}</p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.bg} flex items-center justify-center text-white shadow-lg ${c.shadow} flex-shrink-0 ml-3`}>
          {Icon && <Icon size={20} />}
        </div>
      </div>
      {trend !== undefined && !loading && (
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <ArrowUpRight size={12} className={trend >= 0 ? "text-emerald-500" : "text-rose-500 rotate-90"} />
          <span className={`text-[11px] font-semibold ${trend >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {Math.abs(trend)}%
          </span>
          <span className="text-[11px] text-gray-400">vs last month</span>
        </div>
      )}
    </GlassCard>
  );
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ─── Main Component ───────────────────────────────────────────────────────────

const HRScorecard = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, 0);
    }
  }, []);

  const {
    employees, dailyAtt, monthlyAtt, leaves, payroll,
    regularizations, geofences, loading, refetchAll,
  } = useHRScorecard(month, year);

  // ── Derived numbers ──────────────────────────────────────────────────────
  const empList   = employees?.data || [];
  const activeEmp = empList.filter((e) => e.status === "Active").length;
  const siteEmp   = empList.filter((e) => e.userType === "Site").length;
  const officeEmp = empList.filter((e) => e.userType === "Office").length;

  // Departments breakdown
  const deptMap = {};
  empList.forEach((e) => {
    const d = e.department || "Other";
    deptMap[d] = (deptMap[d] || 0) + 1;
  });
  const deptData = Object.entries(deptMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Today's attendance
  const dailyList = dailyAtt?.data || [];
  const todayPresent = dailyList.filter((r) => r.status === "Present").length;
  const todayAbsent  = dailyList.filter((r) => r.status === "Absent").length;
  const todayLeave   = dailyList.filter((r) => r.status === "On Leave").length;
  const todayLate    = dailyList.filter((r) => r.late === "Yes").length;
  const totalPunched = dailyList.length;

  // Monthly attendance chart — last 14 days from report
  const monthlyRows = monthlyAtt?.data || [];
  // Aggregate per-day counts across all employees
  const dayCountMap = {};
  monthlyRows.forEach((emp) => {
    if (!emp.attendance) return;
    Object.entries(emp.attendance).forEach(([dateKey, rec]) => {
      if (!dayCountMap[dateKey]) dayCountMap[dateKey] = { date: dateKey, Present: 0, Absent: 0, Leave: 0, "Half-Day": 0 };
      const s = rec.status;
      if (s === "Present")   dayCountMap[dateKey].Present++;
      else if (s === "Absent") dayCountMap[dateKey].Absent++;
      else if (s === "On Leave") dayCountMap[dateKey].Leave++;
      else if (s === "Half-Day") dayCountMap[dateKey]["Half-Day"]++;
    });
  });
  const attChartData = Object.values(dayCountMap)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14)
    .map((d) => ({ ...d, day: new Date(d.date).getDate() }));

  // Leave breakdown
  const allLeaves = leaves?.data || [];
  const pendingLeaves  = allLeaves.filter((l) => l.status === "Pending").length;
  const mgrApproved    = allLeaves.filter((l) => l.status === "Manager Approved").length;
  const leaveTypeMap   = {};
  allLeaves.forEach((l) => {
    leaveTypeMap[l.leaveType] = (leaveTypeMap[l.leaveType] || 0) + 1;
  });
  const leaveTypeData = Object.entries(leaveTypeMap).map(([name, value]) => ({ name, value }));

  // Payroll
  const payrollList = payroll?.data || [];
  const payPending   = payrollList.filter((p) => p.status === "Pending").length;
  const payProcessed = payrollList.filter((p) => p.status === "Processed").length;
  const payPaid      = payrollList.filter((p) => p.status === "Paid").length;
  const totalNetPay  = payrollList.reduce((s, p) => s + (p.netPay || 0), 0);
  const payStatusData = [
    { name: "Pending", value: payPending, color: "#f59e0b" },
    { name: "Processed", value: payProcessed, color: "#3b82f6" },
    { name: "Paid", value: payPaid, color: "#10b981" },
  ].filter((d) => d.value > 0);

  // Regularizations
  const regPending = regularizations?.data?.length || 0;

  // Geofences
  const geoList    = geofences?.data || [];
  const geoActive  = geoList.filter((g) => g.isActive).length;

  // Recent pending leaves (top 5)
  const recentPending = allLeaves
    .filter((l) => l.status === "Pending" || l.status === "Manager Approved")
    .slice(0, 5);

  const LEAVE_COLORS = ["#3b82f6","#f59e0b","#8b5cf6","#ef4444","#14b8a6","#f97316"];
  const ATT_COLORS   = { Present: "#10b981", Absent: "#f43f5e", Leave: "#3b82f6", "Half-Day": "#f59e0b" };

  const formatLakh = (v) => {
    if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
    if (v >= 100000)   return `₹${(v / 100000).toFixed(1)}L`;
    if (v >= 1000)     return `₹${(v / 1000).toFixed(0)}K`;
    return `₹${v}`;
  };

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto overflow-x-hidden no-scrollbar font-layout-font space-y-5 pb-6">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Title title="HR Management" sub_title="Score Card" page_title="HR Scorecard" />
        <div className="flex items-center gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(+e.target.value)}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
          >
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(+e.target.value)}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
          >
            {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button
            onClick={refetchAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Hero Banner ────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-darkest-blue via-[#3d5a8a] to-[#2a4470] p-6 text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full bg-blue-400/20 blur-3xl" />
        </div>
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-blue-200/80 text-xs font-medium uppercase tracking-widest">
              {MONTHS[month - 1]} {year} · HR Scorecard
            </p>
            <h1 className="text-2xl font-bold mt-1 tracking-tight">Human Resources Overview</h1>
            <p className="text-blue-200/60 text-sm mt-1">
              Live metrics across workforce, attendance, leaves, and payroll.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Total Employees", val: empList.length, icon: Users },
              { label: "Active",          val: activeEmp,      icon: UserCheck },
              { label: "Present Today",   val: todayPresent,   icon: CalendarCheck },
              { label: "Pending Leaves",  val: pendingLeaves,  icon: Clock },
            ].map(({ label, val, icon: Icon }) => (
              <div key={label} className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/10">
                {Icon && <Icon className="size-4 text-blue-200" />}
                <div>
                  <p className="text-lg font-bold leading-none tabular-nums">{loading ? "—" : val}</p>
                  <p className="text-[10px] text-blue-200/70 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI Row ────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard title="Total Employees"  value={empList.length}   sub={`${activeEmp} active`}          icon={Users}       color="blue"    loading={loading} />
        <KPICard title="Present Today"    value={todayPresent}     sub={`of ${totalPunched} punched`}   icon={UserCheck}   color="emerald" loading={loading} />
        <KPICard title="Absent Today"     value={todayAbsent}      sub={todayLate > 0 ? `${todayLate} late` : "clean day"}  icon={UserMinus}  color="rose"    loading={loading} />
        <KPICard title="On Leave Today"   value={todayLeave}       sub={`${pendingLeaves} pending`}     icon={CalendarX}   color="amber"   loading={loading} />
        <KPICard title="Reg. Pending"     value={regPending}       sub="need review"                    icon={ClipboardEdit} color="violet" loading={loading} />
        <KPICard title="Active Geofences" value={geoActive}        sub={`of ${geoList.length} zones`}   icon={MapPin}      color="indigo"  loading={loading} />
      </div>

      {/* ── Row 2: Today's Snapshot + Leave Approval Queue ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Today's Punch Snapshot */}
        <GlassCard className="p-5">
          <SectionHeader
            title="Today's Attendance Snapshot"
            icon={CalendarCheck}
            badge={<Badge variant="primary">{new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</Badge>}
          />
          <div className="space-y-3">
            {[
              { label: "Present",   value: todayPresent,  max: totalPunched, color: "#10b981", icon: <CheckCircle2 size={14} className="text-emerald-500" /> },
              { label: "Absent",    value: todayAbsent,   max: totalPunched, color: "#f43f5e", icon: <XCircle size={14} className="text-rose-500" /> },
              { label: "On Leave",  value: todayLeave,    max: totalPunched, color: "#3b82f6", icon: <CalendarX size={14} className="text-blue-500" /> },
              { label: "Late Entry",value: todayLate,     max: totalPunched, color: "#f59e0b", icon: <AlertTriangle size={14} className="text-amber-500" /> },
            ].map(({ label, value, max, color, icon }) => (
              <div key={label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 font-medium">
                    {icon} {label}
                  </div>
                  <span className="font-bold text-gray-800 dark:text-white tabular-nums">{loading ? "—" : value}</span>
                </div>
                <ProgressBar value={value} max={max || 1} color={color} />
              </div>
            ))}
          </div>
          {!loading && totalPunched === 0 && (
            <p className="text-xs text-center text-gray-400 mt-4 italic">No punch data for today yet.</p>
          )}
        </GlassCard>

        {/* Leave Approval Queue */}
        <GlassCard className="p-5 lg:col-span-2">
          <SectionHeader
            title="Pending Leave Approvals"
            icon={Clock}
            badge={
              (pendingLeaves + mgrApproved) > 0
                ? <Badge variant="warning">{pendingLeaves + mgrApproved} pending</Badge>
                : <Badge variant="success">All clear</Badge>
            }
          />
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-gray-100 dark:bg-gray-700 rounded w-32" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentPending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <CheckCircle2 size={32} className="text-emerald-200 mb-2" />
              <p className="text-sm font-medium">No pending leave requests</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentPending.map((leave) => (
                <div
                  key={leave._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {leave.employeeId?.name?.[0] || "E"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                      {leave.employeeId?.name || "Employee"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {leave.leaveType} · {leave.totalDays}d ·{" "}
                      {new Date(leave.fromDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                    </p>
                  </div>
                  <LeaveStatusChip status={leave.status} />
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* ── Row 3: Monthly Attendance Chart + Leave Types ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Monthly Attendance Bar Chart */}
        <GlassCard className="p-5 lg:col-span-2">
          <SectionHeader
            title={`Attendance Trend — ${MONTHS[month - 1]} ${year}`}
            icon={TrendingUp}
            badge={<Badge variant="default">Last 14 days</Badge>}
          />
          {attChartData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-gray-400">
              <p className="text-sm">No attendance data for this month yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={attChartData} barCategoryGap="30%" barSize={10}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", fontSize: "12px" }}
                />
                <Bar dataKey="Present"  fill={ATT_COLORS.Present}  radius={[4,4,0,0]} />
                <Bar dataKey="Absent"   fill={ATT_COLORS.Absent}   radius={[4,4,0,0]} />
                <Bar dataKey="Half-Day" fill={ATT_COLORS["Half-Day"]} radius={[4,4,0,0]} />
                <Bar dataKey="Leave"    fill={ATT_COLORS.Leave}    radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap gap-4 mt-3 justify-center">
            {Object.entries(ATT_COLORS).map(([label, color]) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                {label}
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Leave Type Breakdown */}
        <GlassCard className="p-5">
          <SectionHeader
            title="Leave Type Breakdown"
            icon={CalendarX}
            badge={<Badge variant="default">{allLeaves.length} total</Badge>}
          />
          {leaveTypeData.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-gray-400 text-sm">
              No leave data
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={leaveTypeData} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={3} cornerRadius={6}>
                      {leaveTypeData.map((_, i) => (
                        <Cell key={i} fill={LEAVE_COLORS[i % LEAVE_COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-1">
                {leaveTypeData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: LEAVE_COLORS[i % LEAVE_COLORS.length] }} />
                      <span className="text-gray-600 dark:text-gray-300 font-medium">{d.name}</span>
                    </div>
                    <span className="font-bold text-gray-800 dark:text-white">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </GlassCard>
      </div>

      {/* ── Row 4: Payroll + Department + Employee Types ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Payroll Summary */}
        <GlassCard className="p-5">
          <SectionHeader
            title={`Payroll — ${MONTHS[month - 1]} ${year}`}
            icon={DollarSign}
          />
          {payrollList.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center text-gray-400 gap-2">
              <DollarSign size={28} className="text-gray-200" />
              <p className="text-sm">No payroll generated yet</p>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-4 mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Total Net Pay</p>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums mt-0.5">
                    {formatLakh(totalNetPay)}
                  </p>
                </div>
                <div className="w-11 h-11 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center">
                  <TrendingUp size={20} className="text-emerald-600" />
                </div>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: "Pending",   value: payPending,   color: "#f59e0b", bg: "bg-amber-50 dark:bg-amber-950/20",   text: "text-amber-700 dark:text-amber-400"   },
                  { label: "Processed", value: payProcessed, color: "#3b82f6", bg: "bg-blue-50 dark:bg-blue-950/20",     text: "text-blue-700 dark:text-blue-400"     },
                  { label: "Paid",      value: payPaid,      color: "#10b981", bg: "bg-emerald-50 dark:bg-emerald-950/20", text: "text-emerald-700 dark:text-emerald-400" },
                ].map(({ label, value, bg, text }) => (
                  <div key={label} className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${bg}`}>
                    <span className={`text-sm font-semibold ${text}`}>{label}</span>
                    <span className={`text-lg font-bold tabular-nums ${text}`}>{value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </GlassCard>

        {/* Department Headcount */}
        <GlassCard className="p-5">
          <SectionHeader
            title="Headcount by Department"
            icon={Shield}
            badge={<Badge variant="default">{deptData.length} depts</Badge>}
          />
          {deptData.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-gray-400 text-sm">No data</div>
          ) : (
            <div className="space-y-2.5">
              {deptData.map(({ name, count }, i) => (
                <div key={name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-300 font-medium truncate">{name}</span>
                    <span className="font-bold text-gray-800 dark:text-white ml-2">{count}</span>
                  </div>
                  <ProgressBar value={count} max={deptData[0].count} color={["#3b82f6","#10b981","#8b5cf6","#f59e0b","#ef4444","#14b8a6","#f97316","#06b6d4"][i % 8]} />
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Workforce Type + HR Alerts */}
        <GlassCard className="p-5">
          <SectionHeader title="Workforce Split" icon={Users} />
          {/* Site vs Office donut */}
          <div className="flex justify-center mb-2">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Site", value: siteEmp },
                    { name: "Office", value: officeEmp },
                  ]}
                  dataKey="value"
                  innerRadius={40}
                  outerRadius={62}
                  paddingAngle={4}
                  cornerRadius={6}
                >
                  <Cell fill="#3b82f6" stroke="none" />
                  <Cell fill="#10b981" stroke="none" />
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Site",   value: siteEmp,   color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950/20"    },
              { label: "Office", value: officeEmp, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`text-center p-3 rounded-xl ${bg}`}>
                <p className={`text-xl font-bold tabular-nums ${color}`}>{value}</p>
                <p className={`text-xs font-semibold mt-0.5 ${color}`}>{label}</p>
              </div>
            ))}
          </div>

          {/* Alerts */}
          <div className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Action Needed</p>
            {[
              { label: "Regularization Pending", value: regPending,                color: "amber",  icon: <ClipboardEdit size={13} /> },
              { label: "HR Approval Pending",    value: mgrApproved,              color: "blue",   icon: <Clock size={13} /> },
              { label: "Inactive Geofences",     value: geoList.length - geoActive, color: "rose", icon: <MapPin size={13} /> },
            ].map(({ label, value, color, icon }) => {
              const cols = {
                amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400",
                blue:  "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400",
                rose:  "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400",
              };
              return (
                <div key={label} className={`flex items-center justify-between px-3 py-2 rounded-lg ${cols[color]}`}>
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    {icon} {label}
                  </div>
                  <span className="text-sm font-bold">{value}</span>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* ── Row 5: Payroll Status Donut + Geofence list ── */}
      {payStatusData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <GlassCard className="p-5">
            <SectionHeader title="Payroll Status Mix" icon={DollarSign} />
            <div className="flex justify-center">
              <ResponsiveContainer width={150} height={150}>
                <PieChart>
                  <Pie data={payStatusData} dataKey="value" innerRadius={45} outerRadius={68} paddingAngle={4} cornerRadius={6}>
                    {payStatusData.map((d, i) => (
                      <Cell key={i} fill={d.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-2">
              {payStatusData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-gray-600 dark:text-gray-300">{d.name}</span>
                  </div>
                  <span className="font-bold text-gray-800 dark:text-white">{d.value}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5 lg:col-span-3">
            <SectionHeader
              title="Geofence Zones"
              icon={MapPin}
              badge={<Badge variant="success">{geoActive} active</Badge>}
            />
            {geoList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <MapPin size={28} className="text-gray-200 mb-2" />
                <p className="text-sm">No geofence zones configured</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {geoList.map((g) => (
                  <div
                    key={g._id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      g.isActive
                        ? "border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/10"
                        : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      g.isActive ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600" : "bg-gray-100 dark:bg-gray-700 text-gray-400"
                    }`}>
                      <MapPin size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">{g.name}</p>
                      <p className="text-[10px] text-gray-400">{g.radiusMeters}m radius</p>
                    </div>
                    <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                      g.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {g.isActive ? "ON" : "OFF"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      )}

    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LeaveStatusChip = ({ status }) => {
  const config = {
    Pending:          "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30",
    "Manager Approved":"bg-blue-100 text-blue-700 dark:bg-blue-950/30",
    "HR Approved":    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30",
    Rejected:         "bg-rose-100 text-rose-700 dark:bg-rose-950/30",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${config[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

export default HRScorecard;
