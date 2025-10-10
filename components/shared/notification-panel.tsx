"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CheckCircle, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type NotificationItem = {
  id: string;
  type: string;
  message: string;
  timestamp: number;
  meta?: {
    employeeName?: string;
    daysRequested?: number;
    leaveType?: string;
    status?: string;
  };
};

export function NotificationPanel({ role }: { role?: "admin" | "hr" | "employee" }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const formatTime = (ts: number) => {
    const now = new Date();
    const d = new Date(ts);
    const isSameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    if (isSameDay) {
      const diffMs = now.getTime() - ts;
      const sec = Math.max(1, Math.floor(diffMs / 1000));
      if (sec < 60) return "just now";
      const min = Math.floor(sec / 60);
      if (min < 60) return `${min} min ago`;
      const hrs = Math.floor(min / 60);
      return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
    }
    const dd = String(d.getDate()).padStart(2, "0");
    const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    const mon = months[d.getMonth()];
    return `${dd} ${mon}`;
  };

  useEffect(() => {
    // Hydrate from localStorage
    try {
      const saved = localStorage.getItem("notifications");
      if (saved) setItems(JSON.parse(saved));
    } catch {}

    const handler = (e: CustomEvent) => {
      const { type, message, audience } = e.detail || {};
      if (audience && role && audience !== role) return; // filter by dashboard role if provided
      const item: NotificationItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type,
        message: message || "New update",
        timestamp: Date.now(),
      };
      setItems((prev) => {
        const next = [item, ...prev].slice(0, 50);
        try { localStorage.setItem("notifications", JSON.stringify(next)); } catch {}
        return next;
      });
    };

    window.addEventListener("data-update", handler as EventListener);
    return () => window.removeEventListener("data-update", handler as EventListener);
  }, []);

  // Poll leave requests to ensure admin/hr see employee requests and employees see approvals
  useEffect(() => {
    let timer: any;
    const poll = async () => {
      try {
        let url = "";
        if (role === "admin" || role === "hr") {
          url = "/api/leave-requests"; // all requests
        } else if (role === "employee") {
          url = "/api/employee/leave-requests"; // only self
        } else {
          return;
        }

        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        const requests: any[] = json?.data || json || [];

        // Optionally fetch employees to show names in admin/hr
        let usersMap: Record<string, any> = {};
        if (role === "admin" || role === "hr") {
          try {
            const usersRes = await fetch("/api/employees", { cache: "no-store" });
            const usersJson = await usersRes.json();
            const users = usersJson?.data || usersJson || [];
            usersMap = Object.fromEntries(users.map((u: any) => [String(u._id || u.id), u]));
          } catch {}
        }

        // Build notifications based on role
        const mapped: NotificationItem[] = requests
          .filter((r: any) => {
            if (role === "employee") return r.status !== "pending"; // employees only see decisions
            return r.status === "pending"; // admin/hr see incoming requests
          })
          .map((r: any) => {
            const ts = new Date(r.updated_at || r.created_at || Date.now()).getTime();
            const employeeId = String(r.employee_id || "");
            const employee = usersMap[employeeId];
            const employeeName = employee?.full_name || employee?.name || employee?.email || r.employee_name || undefined;
            const days = Number(r.days_requested || r.days || 0);
            const leaveType = r.leave_type || r.type;
            const status = r.status;

            const labelForAdmin = employeeName
              ? `${employeeName} requested ${days} day${days === 1 ? "" : "s"} (${leaveType})`
              : `Leave request: ${days} day${days === 1 ? "" : "s"} (${leaveType})`;
            const labelForEmployee = status === "approved" ? `Your ${leaveType} leave was approved (${days} day${days === 1 ? "" : "s"})` : `Your ${leaveType} leave was rejected (${days} day${days === 1 ? "" : "s"})`;

            const base: NotificationItem = {
              id: `${r._id || r.id || ts}`,
              type: status === "pending" ? "leave_request" : status === "approved" ? "leave_approved" : status === "rejected" ? "leave_rejected" : "leave_request",
              message: role === "employee" ? labelForEmployee : labelForAdmin,
              timestamp: ts,
              meta: {
                employeeName,
                daysRequested: days,
                leaveType,
                status,
              },
            };
            return base;
          })
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 50);

        setItems(mapped);
        try { localStorage.setItem("notifications", JSON.stringify(mapped)); } catch {}
      } catch {}
    };

    poll();
    timer = setInterval(poll, 10000);
    return () => timer && clearInterval(timer);
  }, [role]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, []);

  // Unread indicator based on last-read timestamp
  const [lastReadAt, setLastReadAt] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const key = `notif_last_read_${role || "all"}`;
    const raw = localStorage.getItem(key);
    return raw ? Number(raw) : 0;
  });

  const unreadCount = items.filter((it) => it.timestamp > lastReadAt).length;

  const renderIcon = (type: string) => {
    if (type === "leave_request_updated" || type === "leave_approved") return <CheckCircle className='w-4 h-4 text-emerald-500' />;
    if (type === "leave_rejected") return <XCircle className='w-4 h-4 text-red-500' />;
    return <Clock className='w-4 h-4 text-blue-400' />;
  };

  return (
    <div ref={containerRef} className='relative'>
      <button
        aria-label='Notifications'
        onClick={(e) => { e.stopPropagation(); const now = Date.now(); setLastReadAt(now); try { localStorage.setItem(`notif_last_read_${role || "all"}`, String(now)); } catch {}; setOpen(!open); }}
        className='relative flex items-center justify-center w-6 h-6 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white transition-colors'>
        <Bell className='w-5 h-5' />
        {unreadCount > 0 && (
          <span className='absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold flex items-center justify-center animate-pulse'>
            {Math.min(unreadCount, 9)}
          </span>
        )}
      </button>

      {open && (
        <div className='absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white/90 backdrop-blur-xl text-slate-900 rounded-xl shadow-2xl border border-white/40 p-2 z-[99999]'>
          <div className='flex items-center justify-between px-2 pb-2 border-b border-slate-200/60'>
            <div className='flex items-center gap-2'>
              <Bell className='w-4 h-4 text-rose-600' />
              <span className='text-sm font-semibold'>Notifications</span>
            </div>
            <Badge onClick={() => setItems([])} className='cursor-pointer bg-rose-50 text-rose-700 hover:bg-rose-100'>Clear</Badge>
          </div>
          <div className='divide-y divide-slate-200/60'>
            {items.length === 0 ? (
              <div className='p-4 text-sm text-slate-600'>No notifications yet.</div>
            ) : (
              items.map((it) => {
                const header = (() => {
                  if (role === "employee") {
                    if (it.meta?.status === "approved") return "Leave approved";
                    if (it.meta?.status === "rejected") return "Leave rejected";
                    return "Leave update";
                  }
                  // admin/hr
                  if (it.meta?.status === "pending") return "New leave request";
                  return "Leave update";
                })();

                const paragraph = (() => {
                  const days = it.meta?.daysRequested ?? 0;
                  const leaveType = it.meta?.leaveType || "Leave";
                  if (role === "employee") {
                    const action = it.meta?.status === "approved" ? "approved" : it.meta?.status === "rejected" ? "rejected" : "updated";
                    return `Admin/HR ${action} your ${days} day${days === 1 ? '' : 's'} ${leaveType}.`;
                  }
                  // admin/hr view
                  const name = it.meta?.employeeName || "Employee";
                  return `${name} requested ${days} day${days === 1 ? '' : 's'} ${leaveType}.`;
                })();

                return (
                <div key={it.id} className='flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg'>
                  {renderIcon(it.type)}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between gap-3'>
                      <div className='text-sm font-semibold truncate'>{header}</div>
                      <div className='text-[10px] text-slate-500 shrink-0'>{formatTime(it.timestamp)}</div>
                    </div>
                    <div className='text-xs text-slate-600 mt-0.5 truncate'>{paragraph}</div>
                  </div>
                </div>
              )})
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationPanel;


