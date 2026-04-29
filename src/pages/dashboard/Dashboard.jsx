import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Briefcase,
  Users,
  Truck,
  Building2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ShieldAlert,
  Megaphone,
  ClipboardList,
  Landmark,
  Receipt,
  CalendarCheck,
  CalendarX,
  UserCheck,
  UserMinus,
  UserX,
  Hourglass,
  BellRing,
  Cog,
  HardHat,
  Hammer,
  CircleDollarSign,
  ArrowUpRight,
  PackageCheck,
  Send,
  FileCheck,
  Layers,
  TrendingUp,
  CalendarClock,
  Fingerprint,
  TreePalm,
  Timer,
  ArrowRight,
} from "lucide-react";
import { TbCalendarDue } from "react-icons/tb";
import { LuClipboardList } from "react-icons/lu";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import Title from "../../components/Title";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import ViewWorkOrderDashboard from "./ViewWorkOrderDashboard";
import { useDashboard } from "./hooks/useDashboard";
import { useAuth } from "../../context/AuthContext";
import { formatDistanceToNow, format } from "date-fns";

// --- Helpers ---
const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const formatCompact = (value) => {
  if (!value) return "0";
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

// --- Reusable UI ---

const GlassCard = ({ children, className = "", hover = true }) => (
  <div
    className={`relative bg-white dark:bg-layout-dark rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm ${
      hover ? "hover:shadow-lg hover:-translate-y-0.5" : ""
    } transition-all duration-300 overflow-hidden ${className}`}
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
      <h3 className="text-sm font-bold dark:text-white text-gray-800 tracking-tight">
        {title}
      </h3>
      {badge}
    </div>
    {action}
  </div>
);

const Badge = ({ children, variant = "default" }) => {
  const styles = {
    default: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    primary: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
    success:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
    warning:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
    danger: "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400",
    violet:
      "bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400",
    orange:
      "bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400",
    indigo:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400",
    teal: "bg-teal-50 text-teal-600 dark:bg-teal-950/30 dark:text-teal-400",
  };
  return (
    <span
      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${styles[variant]}`}
    >
      {children}
    </span>
  );
};

const MiniDonut = ({ data, colors, centerLabel, size = 130 }) => (
  <div className="relative" style={{ width: size, height: size }}>
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="58%"
          outerRadius="82%"
          paddingAngle={3}
          cornerRadius={6}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: "12px",
            border: "none",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            fontSize: "12px",
            padding: "8px 12px",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
    {centerLabel && (
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold dark:text-white text-gray-800">
          {centerLabel}
        </span>
      </div>
    )}
  </div>
);

const ProgressBar = ({ value, max, color = "#3b82f6", height = "h-2" }) => {
  const pct = max ? Math.min(Math.round((value / max) * 100), 100) : 0;
  return (
    <div
      className={`${height} rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden`}
    >
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
};

const EmptyState = ({ icon, message }) => {
  const IconComp = icon;
  return (
    <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-3">
        <IconComp className="size-6 opacity-40" />
      </div>
      <p className="text-xs font-medium">{message}</p>
    </div>
  );
};

// --- Section Components ---

const WelcomeHeader = ({ user, data }) => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const userName = user?.name?.split(" ")[0] || "User";

  const quickStats = [];
  if (data?.overview) {
    quickStats.push(
      { label: "Tenders", val: data.overview.tenders, icon: FileText },
      { label: "Projects", val: data.overview.projects, icon: Briefcase },
      { label: "Employees", val: data.overview.activeEmployees, icon: Users },
    );
  }

  // My work profile quick info
  const myProfile = data?.myWorkProfile;
  const attendanceStatus = myProfile?.todayAttendance?.status;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-darkest-blue via-[#3d5a8a] to-[#2a4470] p-6 text-white">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full bg-blue-400/20 blur-3xl" />
      </div>
      <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <p className="text-blue-200/80 text-xs font-medium tracking-wide uppercase">
            {formattedDate}
          </p>
          <h1 className="text-2xl font-bold mt-1 tracking-tight">
            {getGreeting()}, {userName}
          </h1>
          <p className="text-blue-200/60 text-sm mt-1">
            Here's what's happening across your projects today
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {quickStats.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/10"
            >
              <item.icon className="size-4 text-blue-200" />
              <div>
                <p className="text-lg font-bold leading-none tabular-nums">
                  {item.val}
                </p>
                <p className="text-[10px] text-blue-200/70 mt-0.5">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
          {attendanceStatus && (
            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/10">
              <Fingerprint className="size-4 text-blue-200" />
              <div>
                <p className="text-sm font-bold leading-none">
                  {attendanceStatus}
                </p>
                <p className="text-[10px] text-blue-200/70 mt-0.5">My Status</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const OverviewSection = ({ data }) => {
  const cards = [
    {
      label: "Total Tenders",
      value: data.tenders,
      icon: FileText,
      gradient: "from-blue-500 to-blue-600",
      text: "text-blue-600 dark:text-blue-400",
      shadow: "shadow-blue-100 dark:shadow-blue-900/10",
    },
    {
      label: "Active Projects",
      value: data.projects,
      icon: Briefcase,
      gradient: "from-emerald-500 to-teal-500",
      text: "text-emerald-600 dark:text-emerald-400",
      shadow: "shadow-emerald-100 dark:shadow-emerald-900/10",
    },
    {
      label: "Active Employees",
      value: data.activeEmployees,
      icon: Users,
      gradient: "from-violet-500 to-purple-600",
      text: "text-violet-600 dark:text-violet-400",
      shadow: "shadow-violet-100 dark:shadow-violet-900/10",
    },
    {
      label: "Vendors",
      value: data.vendors,
      icon: Truck,
      gradient: "from-orange-400 to-orange-500",
      text: "text-orange-600 dark:text-orange-400",
      shadow: "shadow-orange-100 dark:shadow-orange-900/10",
    },
    {
      label: "Clients",
      value: data.clients,
      icon: Building2,
      gradient: "from-cyan-500 to-cyan-600",
      text: "text-cyan-600 dark:text-cyan-400",
      shadow: "shadow-cyan-100 dark:shadow-cyan-900/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c) => (
        <GlassCard key={c.label} className={`p-5 ${c.shadow}`}>
          <div className="flex items-center justify-between">
            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white shadow-lg`}
            >
              <c.icon className="size-5" />
            </div>
            <TrendingUp className={`size-4 ${c.text} opacity-50`} />
          </div>
          <h2 className="text-2xl font-bold dark:text-white text-gray-800 tabular-nums mt-4">
            {c.value}
          </h2>
          <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mt-1">
            {c.label}
          </p>
        </GlassCard>
      ))}
    </div>
  );
};

const MyWorkProfileSection = ({ data, navigate }) => {
  const { todayAttendance, leaveBalance, recentLeaveApplications } = data;

  const statusMap = {
    "Not Punched": {
      color: "text-slate-400",
      bg: "bg-slate-400/10",
      icon: Timer,
      label: "Awaiting Check-in",
    },
    Present: {
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      icon: UserCheck,
      label: "On Duty",
    },
    Late: {
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      icon: Clock,
      label: "Late Check-in",
    },
  };

  const currentStatus =
    statusMap[todayAttendance?.status] || statusMap["Not Punched"];
  const StatusIcon = currentStatus.icon;

  // Leave styles for the Bento Grid
  const leaveConfigs = {
    PL: {
      label: "Privilege",
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
    },
    CL: {
      label: "Casual",
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-500/10",
    },
    SL: {
      label: "Sick",
      color: "text-rose-600",
      bg: "bg-rose-50 dark:bg-rose-500/10",
    },
  };

  return (
    <GlassCard
      hover={false}
      className="p-0 h-full flex flex-col overflow-hidden"
    >
      {/* 1. Header Identity */}
      <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-50 dark:border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Fingerprint className="size-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black dark:text-white text-gray-800">
              My Work Pulse
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
              Personal Workspace
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/dashboard/profile")}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowUpRight className="size-4 text-gray-400" />
        </button>
      </div>

      <div className="p-6 space-y-8 flex-1">
        {/* 2. Today's Attendance Hero */}
        <div
          className={`relative p-5 rounded-3xl border border-transparent transition-all ${currentStatus.bg}`}
        >
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="size-16 rounded-2xl bg-white dark:bg-gray-950 shadow-xl flex items-center justify-center">
                <StatusIcon className={`size-8 ${currentStatus.color}`} />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${currentStatus.color} opacity-30`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-4 w-4 border-2 border-white dark:border-gray-900 ${currentStatus.color.replace("text-", "bg-")}`}
                ></span>
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Today's Status
              </p>
              <h4 className="text-xl font-black dark:text-white text-gray-900 leading-none">
                {todayAttendance?.status || "Unknown"}
              </h4>
              <p className="text-[11px] text-gray-500 font-medium mt-2 flex items-center gap-1.5">
                <Timer className="size-3" />
                Shift: 09:00 AM - 06:00 PM
              </p>
            </div>
          </div>
        </div>

        {/* 3. Leave Entitlement Bento Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Available Balance
            </p>
            <span className="text-[10px] font-bold text-blue-500 cursor-pointer">
              Request Leave
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(leaveBalance || {})
              .filter(([k]) => k !== "compOff")
              .map(([type, val]) => {
                const cfg = leaveConfigs[type] || {
                  label: type,
                  color: "text-gray-600",
                  bg: "bg-gray-50",
                };
                return (
                  <div
                    key={type}
                    className={`p-3 rounded-2xl border border-transparent hover:shadow-md transition-all ${cfg.bg}`}
                  >
                    <p
                      className={`text-2xl font-black tabular-nums leading-none ${cfg.color}`}
                    >
                      {val}
                    </p>
                    <p className="text-[9px] font-bold text-gray-500 uppercase mt-2 tracking-tighter">
                      {cfg.label}
                    </p>
                  </div>
                );
              })}
          </div>
        </div>

        {/* 4. Recent Timeline */}
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Recent Activity
          </p>
          <div className="space-y-2">
            {recentLeaveApplications.slice(0, 2).map((leave) => (
              <div
                key={leave._id}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`size-2 rounded-full ${
                      leave.status === "Rejected"
                        ? "bg-rose-500"
                        : leave.status === "Pending"
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    }`}
                  />
                  <div>
                    <p className="text-xs font-bold dark:text-white">
                      {leave.leaveType} Request
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {format(new Date(leave.fromDate), "dd MMM")}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    leave.status === "Rejected"
                      ? "danger"
                      : leave.status === "Pending"
                        ? "warning"
                        : "success"
                  }
                >
                  {leave.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

const UpcomingDeadlinesSection = ({ data }) => {
  const hasDeadlines = data?.upcoming && data.upcoming.length > 0;

  return (
    <GlassCard
      hover={false}
      className="p-0 h-full flex flex-col overflow-hidden"
    >
      {/* 1. Header with Urgency Badge */}
      <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-50 dark:border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <CalendarClock className="size-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black dark:text-white text-gray-800">
              Critical Deadlines
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
              Timeline Overview
            </p>
          </div>
        </div>
        {hasDeadlines && (
          <div className="px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">
            <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase">
              {data.count} Pending
            </span>
          </div>
        )}
      </div>

      <div className="p-6 flex-1">
        {!hasDeadlines ? (
          /* Zero-State: All Clear */
          <div className="h-full flex flex-col items-center justify-center py-12 px-6 text-center">
            {/* Animated Icon Container */}
            <div className="relative mb-6">
              <div className="size-20 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center">
                <CheckCircle2 className="size-10 text-emerald-500" />
              </div>
              {/* Decorative background pulse */}
              <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
            </div>

            {/* Positive Messaging */}
            <div className="space-y-2">
              <h4 className="text-sm font-black dark:text-white text-gray-800 tracking-tight">
                Everything is on Track!
              </h4>
              <p className="text-[11px] text-gray-400 max-w-[220px] leading-relaxed mx-auto">
                You've cleared all urgent tender milestones. Your project
                pipeline is
                <span className="text-emerald-500 font-bold">
                  {" "}
                  100% up to date
                </span>
                .
              </p>
            </div>

            {/* Optional Motivational Footer */}
            <div className="mt-8 pt-6 border-t border-gray-50 dark:border-gray-800/50 w-full">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                Current Status:{" "}
                <span className="text-emerald-500">Ahead of Schedule</span>
              </p>
            </div>
          </div>
        ) : (
          /* Active Deadlines */
          <div className="space-y-4">
            {data.upcoming.map((item) => {
              const endDate = new Date(item.tender_end_date);
              const daysLeft = Math.ceil(
                (endDate - new Date()) / (1000 * 60 * 60 * 24),
              );
              const isUrgent = daysLeft <= 1;

              return (
                <div
                  key={item._id}
                  className={`group relative p-4 rounded-2xl border transition-all hover:shadow-lg ${
                    isUrgent
                      ? "bg-rose-50/30 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/30"
                      : "bg-white dark:bg-gray-900/20 border-gray-100 dark:border-gray-800"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 font-mono">
                          {item.tender_id}
                        </span>
                        <h4 className="text-xs font-bold dark:text-white truncate pr-2">
                          {item.tender_name}
                        </h4>
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium truncate">
                        {item.client_name} • {formatCompact(item.tender_value)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-black tabular-nums ${isUrgent ? "text-rose-600" : "text-blue-500"}`}
                      >
                        {daysLeft === 0 ? "Today" : `${daysLeft}d left`}
                      </span>
                    </div>
                  </div>

                  {/* Deadline Progress Indicator */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${isUrgent ? "bg-rose-500" : "bg-blue-500"}`}
                        style={{
                          width: `${Math.max(15, 100 - daysLeft * 15)}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold whitespace-nowrap">
                      <Clock className="size-2.5" />
                      {format(endDate, "dd MMM")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Quick Action */}
      <div className="p-6 pt-0 mt-auto">
        <button className="w-full py-2.5 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 text-[10px] font-bold text-gray-400 hover:text-blue-500 hover:border-blue-500/50 transition-all uppercase tracking-widest">
          View Submission Calendar
        </button>
      </div>
    </GlassCard>
  );
};

const AttendanceSection = ({ data }) => {
  const segments = [
    {
      name: "Present",
      value: data.present,
      color: "#10b981",
      icon: CalendarCheck,
    },
    { name: "Absent", value: data.absent, color: "#ef4444", icon: CalendarX },
    {
      name: "Half Day",
      value: data.halfDay,
      color: "#f97316",
      icon: Hourglass,
    },
    {
      name: "On Leave",
      value: data.onLeave,
      color: "#3b82f6",
      icon: Briefcase,
    },
    {
      name: "Not Punched",
      value: data.notYetPunched,
      color: "#94a3b8",
      icon: Clock,
    },
  ];
  const colors = segments.map((s) => s.color);
  const pieData = segments.map(({ name, value }) => ({ name, value }));
  const pct = data.totalActive
    ? Math.round((data.present / data.totalActive) * 100)
    : 0;

  return (
    <GlassCard hover={false} className="p-5">
      <SectionHeader
        title="Today's Attendance"
        icon={UserCheck}
        badge={
          data.late > 0 ? (
            <Badge variant="warning">
              <span className="flex items-center gap-1">
                <Clock className="size-2.5" />
                {data.late} late
              </span>
            </Badge>
          ) : null
        }
      />
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <MiniDonut
            data={pieData}
            colors={colors}
            centerLabel={`${pct}%`}
            size={155}
          />
          <p className="text-center text-[10px] text-gray-400 mt-1 tabular-nums">
            {data.present}/{data.totalActive} present
          </p>
        </div>
        <div className="flex-1 space-y-2.5">
          {segments.map((s) => {
            const Icon = s.icon;
            const barPct = data.totalActive
              ? (s.value / data.totalActive) * 100
              : 0;
            return (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${s.color}12` }}
                    >
                      <Icon className="size-3" style={{ color: s.color }} />
                    </div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {s.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold dark:text-white text-gray-700 tabular-nums">
                    {s.value}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${barPct}%`, backgroundColor: s.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
};

const PendingLeavesSection = ({ data }) => (
  <GlassCard hover={false} className="p-5">
    <SectionHeader
      title="Pending Leaves"
      icon={CalendarX}
      badge={
        data.pendingCount > 0 ? (
          <Badge variant="warning">{data.pendingCount} pending</Badge>
        ) : null
      }
    />
    {!data.requests?.length ? (
      <EmptyState
        icon={CalendarCheck}
        message="All caught up! No pending requests"
      />
    ) : (
      <div className="space-y-1">
        {data.requests.slice(0, 5).map((r, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-3 px-3 -mx-1 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
              {r.employeeId?.name?.[0] || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold dark:text-white text-gray-800 truncate">
                {r.employeeId?.name}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-semibold">
                  {r.leaveType}
                </span>
                {r.employeeId?.department}
                <span className="text-gray-300 dark:text-gray-600">|</span>
                {r.totalDays} day{r.totalDays > 1 ? "s" : ""}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-gray-400 tabular-nums font-medium">
                {new Date(r.fromDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                })}
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500">
                <Clock className="size-2.5" />
                Pending
              </span>
            </div>
          </div>
        ))}
      </div>
    )}
  </GlassCard>
);

const TenderPipelineSection = ({ data }) => {
  const { counts, recentTenders } = data;
  const pieData = [
    { name: "Pending", value: counts.pending },
    { name: "Approved", value: counts.approved },
    { name: "With Work Order", value: counts.withWorkOrder },
  ];
  const pieColors = ["#f59e0b", "#10b981", "#3b82f6"];

  return (
    <GlassCard hover={false} className="p-5">
      <SectionHeader
        title="Tender Pipeline"
        icon={FileText}
        badge={<Badge variant="primary">{counts.total} total</Badge>}
      />
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Chart and Financial Summary */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-6 shrink-0 lg:w-64">
          <div className="flex justify-center">
            <MiniDonut
              data={pieData}
              colors={pieColors}
              centerLabel={counts.total}
              size={160}
            />
          </div>
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 gap-2">
              {pieData.map((d, i) => (
                <div
                  key={d.name}
                  className="flex items-center justify-between p-2 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: pieColors[i] }}
                    />
                    <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                      {d.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold dark:text-white tabular-nums">
                    {d.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">
                  Total Value
                </p>
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(counts.totalValue)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">
                  Agreement Value
                </p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(counts.totalAgreementValue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Modernized Recent Tenders List */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
            Recent Tender Activity
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentTenders?.slice(0, 4).map((t) => {
              const isPending = t.tender_status === "PENDING";
              return (
                <div
                  key={t._id || t.tender_id}
                  className="group relative p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/40 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-mono">
                      {t.tender_id}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider ${isPending ? "text-amber-500" : "text-emerald-500"}`}
                    >
                      {t.tender_status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold dark:text-white text-gray-800 truncate mb-1 pr-4">
                    {t.tender_name}
                  </h4>
                  <p className="text-[10px] text-gray-400 mb-3 truncate">
                    {t.client_name}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50 dark:border-gray-800/50">
                    <div className="flex items-center gap-1">
                      <CircleDollarSign className="size-3 text-gray-400" />
                      <span className="text-[11px] font-bold dark:text-gray-200">
                        {formatCompact(t.tender_value)}
                      </span>
                    </div>
                    <span className="text-[9px] text-gray-400 flex items-center gap-1">
                      <CalendarClock className="size-2.5" />
                      {format(new Date(t.createdAt), "dd MMM yy")}
                    </span>
                  </div>

                  {/* Hover indicator */}
                  {/* <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="size-3 text-blue-500" />
                  </div> */}
                </div>
              );
            })}
          </div>

          <button className="w-full mt-4 py-2 rounded-lg border border-dashed border-gray-200 dark:border-gray-800 text-[11px] font-bold text-gray-400 hover:text-blue-500 hover:border-blue-500/50 transition-all">
            View All Tender Pipeline
          </button>
        </div>
      </div>
    </GlassCard>
  );
};

const PipelineSection = ({
  title,
  icon,
  counts,
  recentRaised,
  recentQuotations,
  stages,
  badgeVariant = "primary",
}) => {
  const total = counts.total || 1;

  return (
    <GlassCard hover={false} className="p-6">
      <SectionHeader
        title={title}
        icon={icon}
        badge={
          <Badge variant={badgeVariant}>{counts.total} Total Requests</Badge>
        }
      />

      {/* Modern Stage Progress */}
      <div className="grid grid-cols-5 gap-2 mb-8">
        {stages.map((stage, i) => (
          <div key={i} className="relative">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase truncate">
                {stage.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black dark:text-white tabular-nums">
                  {stage.value}
                </span>
                <div className="h-1.5 flex-1 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(stage.value / total) * 100}%`,
                      backgroundColor: stage.color,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Active Quotations - Focus on Vendor Data */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <RefreshCw className="size-3 text-amber-500" /> Pending Quotations
            </h4>
          </div>
          <div className="space-y-3">
            {recentQuotations?.slice(0, 2).map((q) => {
              const pendingCount = q.vendorQuotations?.filter(
                (v) => v.approvalStatus === "Pending",
              ).length;
              return (
                <div
                  key={q._id}
                  className="p-4 rounded-2xl bg-amber-50/30 dark:bg-amber-900/10 border border-amber-100/50 dark:border-amber-900/30"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-[10px] font-mono text-amber-600 dark:text-amber-500 font-bold">
                        {q.requestId}
                      </p>
                      <h5 className="text-sm font-bold dark:text-white">
                        {q.title || "Material Request"}
                      </h5>
                    </div>
                    <Badge variant="warning">
                      {pendingCount} Vendors Pending
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Building2 className="size-3" />{" "}
                      {q.vendorQuotations?.length} Total Quotes
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarClock className="size-3" />{" "}
                      {format(new Date(q.requestDate), "dd MMM")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Requests - Compact Tracking */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <Send className="size-3 text-blue-500" /> Recent Requests
          </h4>
          <div className="space-y-2">
            {recentRaised?.slice(0, 3).map((item) => (
              <div
                key={item._id}
                className="group flex items-center justify-between p-3 rounded-xl border border-gray-50 dark:border-gray-800/50 bg-gray-50/30 dark:bg-gray-800/20 hover:bg-white dark:hover:bg-gray-800 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center">
                    <PackageCheck className="size-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold dark:text-white">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {item.requestId} •{" "}
                      {item.tender_project_name || "Ongoing Project"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400">
                    {format(new Date(item.requestDate), "dd MMM")}
                  </p>
                  <p className="text-[9px] text-blue-500 font-medium">Raised</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

const PurchaseSection = ({ data }) => {
  const c = data.counts;
  const stages = [
    { label: "Raised", value: c.requestRaised, icon: Send, color: "#3b82f6" },
    {
      label: "Quotation Req.",
      value: c.quotationRequested,
      icon: FileText,
      color: "#6366f1",
    },
    {
      label: "Quotation Rcvd.",
      value: c.quotationReceived,
      icon: FileCheck,
      color: "#eab308",
    },
    {
      label: "Vendor Approved",
      value: c.vendorApproved,
      icon: PackageCheck,
      color: "#f97316",
    },
    {
      label: "PO Issued",
      value: c.purchaseOrderIssued,
      icon: ClipboardList,
      color: "#22c55e",
    },
  ];

  return (
    <PipelineSection
      title="Purchase Pipeline"
      icon={ClipboardList}
      counts={c}
      recentRaised={data.recentRaised}
      recentQuotations={data.recentQuotationReceived}
      stages={stages}
      badgeVariant="primary"
    />
  );
};

const WorkOrderSection = ({ data }) => {
  const c = data.counts;
  const stages = [
    { label: "Raised", value: c.requestRaised, icon: Send, color: "#6366f1" },
    {
      label: "Quotation Rcvd.",
      value: c.quotationReceived,
      icon: FileCheck,
      color: "#eab308",
    },
    {
      label: "Vendor Approved",
      value: c.vendorApproved,
      icon: PackageCheck,
      color: "#f97316",
    },
    {
      label: "WO Issued",
      value: c.workOrderIssued,
      icon: Hammer,
      color: "#22c55e",
    },
    {
      label: "Completed",
      value: c.completed,
      icon: CheckCircle2,
      color: "#94a3b8",
    },
  ];

  return (
    <PipelineSection
      title="Work Orders"
      icon={Hammer}
      counts={c}
      recentRaised={data.recentRaised}
      recentQuotations={data.recentQuotationReceived} // New mapping
      stages={stages}
      badgeVariant="indigo"
    />
  );
};

const EmdSection = ({ data }) => {
  const groups = [
    {
      label: "EMD",
      icon: Landmark,
      collected: data.totalCollected,
      pending: data.totalPending,
      total: data.totalApprovedAmount,
      color: "#10b981",
    },
    {
      label: "Security Deposit",
      icon: ShieldAlert,
      collected: data.sdCollected,
      pending: data.sdPending,
      total: data.sdTotalAmount,
      color: "#3b82f6",
    },
  ];

  return (
    <GlassCard hover={false} className="p-5">
      <SectionHeader
        title="EMD & Security Deposit"
        icon={Landmark}
        badge={<Badge variant="success">{data.count} tenders</Badge>}
      />
      <div className="space-y-4">
        {groups.map((g) => {
          const pct = g.total ? Math.round((g.collected / g.total) * 100) : 0;
          const Icon = g.icon;
          return (
            <div
              key={g.label}
              className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/30 border border-gray-100/80 dark:border-gray-700/30"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${g.color}12` }}
                  >
                    <Icon className="size-4" style={{ color: g.color }} />
                  </div>
                  <span className="text-xs font-bold dark:text-white text-gray-700">
                    {g.label}
                  </span>
                </div>
                <span
                  className="text-xs font-bold tabular-nums"
                  style={{ color: g.color }}
                >
                  {pct}%
                </span>
              </div>
              <ProgressBar
                value={g.collected}
                max={g.total}
                color={g.color}
                height="h-2.5"
              />
              <div className="flex justify-between mt-2.5 text-[11px]">
                <span className="text-gray-400 font-medium">
                  Collected:{" "}
                  <span className="font-bold dark:text-white text-gray-700">
                    {formatCurrency(g.collected)}
                  </span>
                </span>
                <span className="text-rose-400 font-medium">
                  Pending: {formatCurrency(g.pending)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};

const PenaltySection = ({ data }) => {
  const totalPenalty = data.totalPenaltyValue || 0;

  return (
    <GlassCard hover={false} className="p-6">
      <SectionHeader
        title="Project Penalties"
        icon={AlertTriangle}
        badge={
          <Badge variant="danger">
            {data.tendersWithPenalties} Affected Tenders
          </Badge>
        }
      />

      <div className="flex flex-col gap-6">
        {/* Total Impact Banner */}
        <div className="relative overflow-hidden p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">
                Total Financial Loss
              </p>
              <h2 className="text-3xl font-black text-rose-600 dark:text-rose-400 tabular-nums mt-1">
                {formatCurrency(totalPenalty)}
              </h2>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <ShieldAlert className="size-6 text-rose-600" />
            </div>
          </div>
          {/* Subtle Background Pattern */}
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <XCircle className="size-24 text-rose-600" />
          </div>
        </div>

        {/* Scrollable Project Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Penalty by Project
            </p>
            <span className="text-[10px] font-medium text-gray-400">
              Scroll to view all
            </span>
          </div>

          <div className="max-h-[280px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
            {data.byProject?.map((p, index) => {
              // Calculate percentage of total penalty for the micro-bar
              const pct = totalPenalty
                ? (p.penaltyValue / totalPenalty) * 100
                : 0;

              return (
                <div
                  key={p._id || index}
                  className="p-3 rounded-xl bg-white dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 hover:border-rose-200 dark:hover:border-rose-900/50 transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-400 font-mono">
                          {p._id}
                        </span>
                        <h5 className="text-xs font-bold dark:text-white truncate w-32 group-hover:text-rose-500 transition-colors">
                          {p.tenderName}
                        </h5>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5 truncate italic">
                        {p.projectName || "General Site Operations"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-rose-500 tabular-nums">
                        {formatCurrency(p.penaltyValue)}
                      </p>
                      <p className="text-[9px] text-gray-400 uppercase font-medium">
                        Penalty
                      </p>
                    </div>
                  </div>

                  {/* Visual Impact Bar */}
                  <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 opacity-60 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Callout */}
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-dashed border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <Clock className="size-4 text-gray-400" />
          <p className="text-[10px] text-gray-500 dark:text-gray-400">
            Most recent penalty: <strong>₹3,400</strong> on Romaa Review V1.2
          </p>
        </div>
      </div>
    </GlassCard>
  );
};

const BillingSection = ({ data }) => {
  // Mapping icons and colors to the specific billing stages in your JSON
  const stages = [
    {
      label: "Draft",
      value: data.draft,
      icon: FileText,
      color: "text-gray-400",
      bg: "bg-gray-400/10",
    },
    {
      label: "Submitted",
      value: data.submitted,
      icon: Send,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Approved",
      value: data.approved,
      icon: CheckCircle2,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Paid",
      value: data.paid,
      icon: CircleDollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <GlassCard hover={false} className="p-6">
      <SectionHeader
        title="Client Billing"
        icon={Receipt}
        badge={<Badge variant="success">{data.billCount} Total Bills</Badge>}
      />

      <div className="flex flex-col gap-6">
        {/* Top Metric: Total Revenue Overview */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200 dark:shadow-none">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase opacity-80 tracking-widest">
                Total Value Billed
              </p>
              <h2 className="text-3xl font-black tabular-nums mt-1">
                {formatCurrency(data.totalBilled)}
              </h2>
            </div>
            <TrendingUp className="size-6 opacity-40" />
          </div>
          <div className="mt-4 flex gap-4 border-t border-white/20 pt-4">
            <div className="text-xs font-medium">
              <span className="opacity-70">Status: </span>
              <span className="font-bold">All Draft ({data.draft})</span>
            </div>
          </div>
        </div>

        {/* Billing Lifecycle Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stages.map((s) => (
            <div
              key={s.label}
              className={`p-3 rounded-xl ${s.bg} border border-transparent transition-all`}
            >
              <div className="flex items-center gap-2 mb-1">
                <s.icon className={`size-3.5 ${s.color}`} />
                <span className="text-[10px] font-bold text-gray-500 uppercase">
                  {s.label}
                </span>
              </div>
              <p className="text-lg font-black dark:text-white tabular-nums">
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Project Breakdown - Mapping all project fields */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Billing by Project
          </p>
          {data.byProject?.map((p) => (
            <div
              key={p.tenderId}
              className="group p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-mono">
                      {p.tenderId}
                    </span>
                    <h5 className="text-sm font-bold dark:text-white truncate">
                      {p.tenderName}
                    </h5>
                  </div>
                  <p className="text-[10px] text-gray-400 truncate">
                    {p.projectName}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    {formatCompact(p.totalBilled)}
                  </p>
                  <p className="text-[9px] text-gray-400 font-medium">
                    Total Project Bill
                  </p>
                </div>
              </div>

              {/* Progress towards payment for this project */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                  {/* Visualizing Draft vs Paid for the specific project */}
                  <div
                    className="h-full bg-gray-400"
                    style={{ width: `${(p.draft / p.billCount) * 100}%` }}
                  />
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${(p.paid / p.billCount) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-gray-500">
                  {p.billCount} Bill{p.billCount > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
};

const EmployeesSection = ({ data }) => {
  const deptData = Object.entries(data.byDepartment)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const statusCards = [
    {
      label: "Active",
      value: data.byStatus.Active || 0,
      icon: UserCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Inactive",
      value: data.byStatus.Inactive || 0,
      icon: UserMinus,
      color: "text-gray-400",
      bg: "bg-gray-400/10",
    },
  ];

  const siteCount = data.byUserType?.Site || 0;
  const officeCount = data.byUserType?.Office || 0;
  const sitePct = data.total ? Math.round((siteCount / data.total) * 100) : 0;

  return (
    <GlassCard hover={false} className="p-6">
      <SectionHeader
        title="Workforce Overview"
        icon={Users}
        badge={<Badge variant="violet">{data.total} Total Staff</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1: Status & Headcount */}
        <div className="space-y-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Employment Status
          </p>
          <div className="grid grid-cols-2 gap-4">
            {statusCards.map((s) => (
              <div
                key={s.label}
                className={`p-4 rounded-2xl ${s.bg} border border-transparent hover:border-white/20 transition-all`}
              >
                <s.icon className={`size-5 ${s.color} mb-2`} />
                <p className="text-2xl font-black dark:text-white tabular-nums">
                  {s.value}
                </p>
                <p className="text-[10px] font-bold text-gray-500 uppercase">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/50">
            <div className="flex justify-between items-end mb-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase">
                Field vs Office
              </p>
              <span className="text-[10px] font-bold text-orange-500">
                {sitePct}% Field Force
              </span>
            </div>
            <div className="h-3 w-full bg-blue-500 rounded-full flex overflow-hidden">
              <div
                className="h-full bg-orange-500"
                style={{ width: `${sitePct}%` }}
              />
            </div>
            <div className="flex justify-between mt-3">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-orange-500" />
                <span className="text-xs font-bold dark:text-white">
                  {siteCount} Site
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-blue-500" />
                <span className="text-xs font-bold dark:text-white">
                  {officeCount} Office
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Department Distribution */}
        <div className="lg:col-span-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            Department Strength
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {deptData.map((dept) => (
              <div
                key={dept.name}
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/20 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                    <Briefcase className="size-4 text-violet-500" />
                  </div>
                  <span className="text-xs font-bold dark:text-white text-gray-700">
                    {dept.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black dark:text-white tabular-nums">
                    {dept.value}
                  </span>
                  <div className="w-12 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500"
                      style={{ width: `${(dept.value / data.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2 p-3 rounded-xl bg-violet-50/50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900/30">
            <ShieldAlert className="size-4 text-violet-500" />
            <p className="text-[10px] text-violet-700 dark:text-violet-400 font-medium">
              Headcount is distributed across <strong>{deptData.length}</strong>{" "}
              active departments.
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

const SiteWorkDoneSection = ({ data }) => {
  const statuses = [
    { label: "Draft", value: data.draft, icon: FileText, color: "#94a3b8" },
    { label: "Submitted", value: data.submitted, icon: Send, color: "#3b82f6" },
    {
      label: "Approved",
      value: data.approved,
      icon: CheckCircle2,
      color: "#10b981",
    },
    {
      label: "Rejected",
      value: data.rejected,
      icon: XCircle,
      color: "#ef4444",
    },
  ];

  return (
    <GlassCard hover={false} className="p-5">
      <SectionHeader
        title="Site Work Done"
        icon={Layers}
        badge={<Badge variant="teal">{data.total} total</Badge>}
      />
      <div className="grid grid-cols-2 gap-3">
        {statuses.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gray-50/80 dark:bg-gray-800/30 border border-gray-100/80 dark:border-gray-700/30 group hover:shadow-sm transition-all"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform"
                style={{
                  background: `linear-gradient(135deg, ${s.color}, ${s.color}cc)`,
                }}
              >
                <Icon className="size-4" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                  {s.label}
                </p>
                <p className="text-xl font-bold dark:text-white tabular-nums leading-tight">
                  {s.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};

const MachinerySection = ({ data }) => {
  const statuses = [
    {
      label: "Active",
      value: data.byStatus?.Active || 0,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Maintenance",
      value: data.byStatus?.Maintenance || 0,
      icon: Cog,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Breakdown",
      value: data.byStatus?.Breakdown || 0,
      icon: ShieldAlert,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
    {
      label: "Idle",
      value: data.byStatus?.Idle || 0,
      icon: Clock,
      color: "text-gray-400",
      bg: "bg-gray-400/10",
    },
  ];

  const complianceAlert = data.expiringComplianceCount > 0;

  return (
    <GlassCard hover={false} className="p-6">
      <SectionHeader
        title="Machinery & Fleet"
        icon={HardHat}
        badge={<Badge variant="orange">{data.total} Total Assets</Badge>}
      />

      <div className="flex flex-col gap-6">
        {/* Fleet Status Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statuses.map((s) => (
            <div
              key={s.label}
              className={`p-4 rounded-2xl ${s.bg} border border-transparent flex flex-col items-center text-center transition-all`}
            >
              <s.icon className={`size-5 ${s.color} mb-2`} />
              <p className="text-2xl font-black dark:text-white tabular-nums leading-none">
                {s.value}
              </p>
              <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Compliance & Health Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Health Progress */}
          <div className="p-5 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/50">
            <div className="flex justify-between items-center mb-4">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                Fleet Availability
              </p>
              <span className="text-xs font-black text-emerald-500">
                {data.total
                  ? Math.round(
                      ((data.byStatus?.Active || 0) / data.total) * 100,
                    )
                  : 0}
                %
              </span>
            </div>
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
                style={{
                  width: `${data.total ? ((data.byStatus?.Active || 0) / data.total) * 100 : 0}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-3 flex items-center gap-1.5">
              <CheckCircle2 className="size-3 text-emerald-500" /> All assets
              are currently operational.
            </p>
          </div>

          {/* Compliance Card */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              complianceAlert
                ? "bg-orange-50/50 dark:bg-orange-950/10 border-orange-200 dark:border-orange-900/30"
                : "bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/20"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  complianceAlert
                    ? "bg-orange-500 text-white"
                    : "bg-emerald-500 text-white"
                }`}
              >
                {complianceAlert ? (
                  <ShieldAlert className="size-6" />
                ) : (
                  <FileCheck className="size-6" />
                )}
              </div>
              <div>
                <h4
                  className={`text-sm font-bold ${complianceAlert ? "text-orange-700 dark:text-orange-400" : "text-emerald-700 dark:text-emerald-400"}`}
                >
                  {complianceAlert
                    ? "Compliance Action Required"
                    : "Compliance Up-to-Date"}
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  {complianceAlert
                    ? `${data.expiringComplianceCount} documents expiring within 30 days.`
                    : "All machinery documents and insurance are valid."}
                </p>
                {complianceAlert && (
                  <button className="mt-3 text-[10px] font-bold text-orange-600 dark:text-orange-400 underline underline-offset-4">
                    Renew Documents
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

const NotificationsSection = ({ data, navigate }) => {
  const categoryConfig = {
    announcement: { icon: Megaphone, color: "#8b5cf6" },
    approval: { icon: CheckCircle2, color: "#22c55e" },
    task: { icon: ClipboardList, color: "#3b82f6" },
    alert: { icon: AlertTriangle, color: "#f59e0b" },
    reminder: { icon: Clock, color: "#6366f1" },
    system: { icon: Cog, color: "#64748b" },
  };

  return (
    <GlassCard hover={false} className="p-5">
      <SectionHeader
        title="Recent Notifications"
        icon={BellRing}
        badge={
          data.unreadCount > 0 ? (
            <Badge variant="danger">{data.unreadCount} unread</Badge>
          ) : null
        }
      />
      {!data.recent?.length ? (
        <EmptyState icon={BellRing} message="No recent notifications" />
      ) : (
        <div className="space-y-1">
          {data.recent.slice(0, 5).map((n) => {
            const config = categoryConfig[n.category] || categoryConfig.system;
            const Icon = config.icon;
            return (
              <div
                key={n._id}
                onClick={() => n.actionUrl && navigate(n.actionUrl)}
                className="flex items-center gap-3 py-3 px-3 -mx-1 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${config.color}12` }}
                >
                  <Icon className="size-4" style={{ color: config.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold dark:text-white text-gray-800 truncate">
                    {n.title}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">
                    {n.message}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-gray-400 tabular-nums">
                    {formatDistanceToNow(new Date(n.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  <ArrowUpRight className="size-3.5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
};

// --- Main Dashboard ---

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, canAccess } = useAuth();
  const [ViewWorkOrderModal, setViewWorkOrderModal] = useState(false);
  const { data, isLoading, isError, refetch, isFetching } = useDashboard();

  // Check if user has read access to any subModule within a module
  const hasModuleAccess = (module) => {
    const modPerms = user?.role?.permissions?.[module];
    if (!modPerms) return false;
    return Object.values(modPerms).some((sub) => sub?.read === true);
  };

  if (isLoading) return <Loader />;

  if (isError || !data || data.message === "No role assigned") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
        <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <XCircle className="size-8 opacity-50" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold dark:text-white text-gray-700">
            {data?.message === "No role assigned"
              ? "No Role Assigned"
              : "Dashboard Unavailable"}
          </p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs">
            {data?.message === "No role assigned"
              ? "Your account doesn't have a role. Please contact your administrator."
              : "We couldn't load the dashboard data. Please try again."}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 font-semibold bg-blue-50 dark:bg-blue-950/30 px-4 py-2 rounded-xl transition-colors"
        >
          <RefreshCw className="size-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-full pb-16">
      {/* Header Bar */}
      <div className="flex justify-between items-center mb-4">
        <Title
          title="Dashboard"
          sub_title="Main Dashboard"
          page_title="Main Dashboard"
        />
        <div className="flex gap-2 items-center">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 rounded-xl dark:bg-layout-dark bg-white dark:text-white text-darkest-blue border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer hover:shadow-sm"
            title="Refresh dashboard"
          >
            <RefreshCw
              className={`size-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </button>
          <Button
            onClick={() => navigate("employeedashboard")}
            button_name="Employee"
            paddingY="py-2.5"
          />
          <Button
            onClick={() => navigate("viewcalendar")}
            button_name="Calendar"
            bgColor="dark:bg-layout-dark bg-white"
            textColor="dark:text-white text-darkest-blue"
            button_icon={<TbCalendarDue size={20} />}
            paddingY="py-2.5"
          />
          <Button
            onClick={() => setViewWorkOrderModal(true)}
            button_name="Work Orders"
            bgColor="dark:bg-layout-dark bg-white"
            textColor="dark:text-white text-darkest-blue"
            button_icon={<LuClipboardList size={20} />}
            paddingY="py-2.5"
          />
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="space-y-5 overflow-y-auto h-full no-scrollbar pb-8">
        {/* Welcome Banner */}
        <WelcomeHeader user={user} data={data} />

        {/* Overview Stats */}
        {data.overview && <OverviewSection data={data.overview} />}

        {/* My Work Profile + Upcoming Deadlines */}
        {(data.myWorkProfile || data.upcomingDeadlines) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {data.myWorkProfile && (
              <MyWorkProfileSection
                data={data.myWorkProfile}
                navigate={navigate}
              />
            )}
            {data.upcomingDeadlines && (
              <UpcomingDeadlinesSection data={data.upcomingDeadlines} />
            )}
          </div>
        )}

        {/* Tender Pipeline - Full Width */}
        {data.tenderPipeline && hasModuleAccess("tender") && (
          <TenderPipelineSection data={data.tenderPipeline} />
        )}

        {/* Purchase & Work Orders Row */}
        {(() => {
          const showPurchase =
            data.purchaseRequests && hasModuleAccess("purchase");
          const showWorkOrders = data.workOrders && hasModuleAccess("project");
          if (!showPurchase && !showWorkOrders) return null;
          const colClass =
            showPurchase && showWorkOrders
              ? "grid-cols-1 lg:grid-cols-2"
              : "grid-cols-1";
          return (
            <div className={`grid ${colClass} gap-3`}>
              {showPurchase && <PurchaseSection data={data.purchaseRequests} />}
              {showWorkOrders && <WorkOrderSection data={data.workOrders} />}
            </div>
          );
        })()}

        {/* Financial Row */}
        {(() => {
          const showEmd = data.emdSummary && canAccess("tender", "emd");
          const showBilling = data.billing && hasModuleAccess("finance");
          const showPenalty =
            data.penaltySummary && canAccess("tender", "project_penalty");
          const visibleCount = [showEmd, showBilling, showPenalty].filter(
            Boolean,
          ).length;
          if (visibleCount === 0) return null;
          const colClass =
            visibleCount === 3
              ? "grid-cols-1 lg:grid-cols-3"
              : visibleCount === 2
                ? "grid-cols-1 lg:grid-cols-2"
                : "grid-cols-1";
          return (
            <div className={`grid ${colClass} gap-3`}>
              {showEmd && <EmdSection data={data.emdSummary} />}
              {showBilling && <BillingSection data={data.billing} />}
              {showPenalty && <PenaltySection data={data.penaltySummary} />}
            </div>
          );
        })()}

        {/* Employees - Full Width */}
        {data.employees && hasModuleAccess("hr") && (
          <EmployeesSection data={data.employees} />
        )}

        {/* Site & Machinery Row */}
        {(() => {
          const showSite = data.siteWorkDone && hasModuleAccess("site");
          const showMachinery =
            data.machinery &&
            (hasModuleAccess("site") || hasModuleAccess("purchase"));
          if (!showSite && !showMachinery) return null;
          const colClass =
            showSite && showMachinery
              ? "grid-cols-1 lg:grid-cols-2"
              : "grid-cols-1";
          return (
            <div className={`grid ${colClass} gap-3`}>
              {showSite && <SiteWorkDoneSection data={data.siteWorkDone} />}
              {showMachinery && <MachinerySection data={data.machinery} />}
            </div>
          );
        })()}

        {/* Notifications */}
        {data.notifications && (
          <NotificationsSection data={data.notifications} navigate={navigate} />
        )}
      </div>

      {ViewWorkOrderModal && (
        <ViewWorkOrderDashboard onclose={() => setViewWorkOrderModal(false)} />
      )}
    </div>
  );
};

export default Dashboard;
