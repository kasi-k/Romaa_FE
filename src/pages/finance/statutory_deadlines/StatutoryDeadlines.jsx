import { useState } from "react";
import { Calendar, RefreshCw, CheckSquare, AlertTriangle, Clock } from "lucide-react";
import {
  useStatutoryCalendar, useStatutoryUpcoming, useStatutoryFilings, useMarkFiled,
} from "./hooks/useStatutoryDeadlines";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const urgencyBadge = (daysLeft) => {
  if (daysLeft == null) return { cls: "bg-gray-100 text-gray-500", label: "—" };
  if (daysLeft < 0) return { cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", label: "Overdue" };
  if (daysLeft <= 3) return { cls: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400", label: `${daysLeft}d` };
  if (daysLeft <= 7) return { cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", label: `${daysLeft}d` };
  return { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300", label: `${daysLeft}d` };
};

/* ── Filed Drawer ───────────────────────────────────────────────── */
const FiledDrawer = ({ deadline, onClose }) => {
  const { data: filings = [], isLoading } = useStatutoryFilings({ deadline_id: deadline._id });
  const markFiled = useMarkFiled({ onSuccess: onClose });
  const [form, setForm] = useState({ filed_on: new Date().toISOString().slice(0, 10), arn: "", note: "" });

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <p className="text-sm font-bold text-gray-800 dark:text-white">{deadline.title}</p>
            <p className="text-[10px] text-gray-400">Due: {deadline.due_date?.slice(0, 10)}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-2">Mark as Filed</p>
            {[
              { label: "Filed On", key: "filed_on", type: "date" },
              { label: "ARN / Ack No.", key: "arn", type: "text", placeholder: "optional" },
              { label: "Note", key: "note", type: "text", placeholder: "optional" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-[10px] text-gray-400 mb-0.5">{label}</label>
                <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none" />
              </div>
            ))}
            <button onClick={() => markFiled.mutate({ deadline_id: deadline._id, ...form })} disabled={markFiled.isPending}
              className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60">
              {markFiled.isPending ? "Saving…" : "Mark Filed"}
            </button>
          </div>

          {isLoading && <div className="text-center text-sm text-gray-400">Loading history…</div>}
          {!isLoading && filings.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-2">Filing History</p>
              {(Array.isArray(filings) ? filings : []).map((f, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-800 text-xs">
                  <CheckSquare size={12} className="text-emerald-500 shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">{f.filed_on?.slice(0, 10)}</span>
                  {f.arn && <span className="font-mono text-indigo-600 dark:text-indigo-400">{f.arn}</span>}
                  {f.note && <span className="text-gray-400 truncate">{f.note}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Main Page ──────────────────────────────────────────────────── */
const StatutoryDeadlines = () => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(null);

  const { data: calendar = [], isLoading: calLoading, refetch } = useStatutoryCalendar({ year, month: month + 1 });
  const { data: upcoming = [], isLoading: upLoading } = useStatutoryUpcoming({ days: 30 });

  const safeCalendar = Array.isArray(calendar) ? calendar : [];
  const safeUpcoming = Array.isArray(upcoming) ? upcoming : [];

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1); };

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={18} className="text-rose-600 dark:text-rose-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Enterprise</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Statutory Deadlines</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">‹</button>
          <span className="text-sm font-bold text-gray-700 dark:text-gray-200 w-28 text-center">{MONTHS[month]} {year}</span>
          <button onClick={nextMonth} className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">›</button>
          <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 ml-1"><RefreshCw size={15} /></button>
        </div>
      </div>

      <div className="px-6 py-5 flex gap-5 flex-col lg:flex-row">
        {/* Calendar grid */}
        <div className="flex-1">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Calendar — {MONTHS[month]} {year}</p>
          {calLoading && <div className="py-12 text-center text-sm text-gray-400">Loading…</div>}
          {!calLoading && (
            <div className="space-y-2">
              {safeCalendar.length === 0 && <p className="text-sm text-center py-10 text-gray-400">No deadlines this month.</p>}
              {safeCalendar.map((d) => {
                const daysLeft = d.due_date ? Math.round((new Date(d.due_date) - today) / 86400000) : null;
                const badge = urgencyBadge(daysLeft);
                return (
                  <div key={d._id || d.deadline_id} onClick={() => setSelected(d)}
                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-rose-300 dark:hover:border-rose-700 transition-colors">
                    <div className="text-center w-10 shrink-0">
                      <p className="text-lg font-extrabold text-gray-700 dark:text-gray-200 leading-none">{d.due_date?.slice(8, 10)}</p>
                      <p className="text-[9px] text-gray-400">{MONTHS[parseInt(d.due_date?.slice(5, 7)) - 1]}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate">{d.title}</p>
                      <p className="text-[10px] text-gray-400">{d.form_type} · {d.category}</p>
                    </div>
                    {d.is_filed ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold"><CheckSquare size={11} />Filed</span>
                    ) : (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge.cls}`}>{badge.label}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming widget */}
        <div className="w-full lg:w-64 shrink-0">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Next 30 Days</p>
          {upLoading && <div className="text-center text-sm text-gray-400 py-6">Loading…</div>}
          {!upLoading && (
            <div className="space-y-2">
              {safeUpcoming.map((d, i) => {
                const daysLeft = d.due_date ? Math.round((new Date(d.due_date) - today) / 86400000) : null;
                const badge = urgencyBadge(daysLeft);
                return (
                  <div key={i} onClick={() => setSelected(d)}
                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm px-3 py-2.5 flex items-center gap-2 cursor-pointer hover:border-rose-300 dark:hover:border-rose-700 transition-colors">
                    <Clock size={11} className="text-gray-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-200 truncate">{d.title}</p>
                      <p className="text-[9px] text-gray-400">{d.due_date?.slice(0, 10)}</p>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${badge.cls}`}>{badge.label}</span>
                  </div>
                );
              })}
              {!safeUpcoming.length && <p className="text-xs text-center text-gray-400 py-6">Nothing due soon.</p>}
            </div>
          )}
        </div>
      </div>

      {selected && <FiledDrawer deadline={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default StatutoryDeadlines;
