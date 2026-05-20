"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { SubmissionRecord } from "@/lib/pocketbase";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  complete: "bg-green-500/10 text-green-400 border-green-500/30",
};

export default function DashboardPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/submissions?${params}`);
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSubmissions(data.items || []);
      setError(null);
    } catch {
      setError("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, router]);

  // Initial fetch + auto-refresh every 10s
  useEffect(() => {
    fetchSubmissions();
    const interval = setInterval(fetchSubmissions, 10000);
    return () => clearInterval(interval);
  }, [fetchSubmissions]);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const filtered = submissions.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      s.first_name?.toLowerCase().includes(q) ||
      s.last_name?.toLowerCase().includes(q) ||
      s.phone?.includes(q) ||
      s.email?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <main className="min-h-screen bg-[#0a0f1e]">
      {/* Header */}
      <header className="border-b border-[#d4af37]/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#d4af37] flex items-center justify-center">
              <span className="text-[#0a0f1e] font-bold">T</span>
            </div>
            <div>
              <span className="text-white font-semibold">Trinity Solutions</span>
              <span className="text-white/40 text-sm ml-2">· Agent Dashboard</span>
            </div>
          </div>
          <button
            onClick={async () => {
              await fetch("/api/admin/login", { method: "DELETE" });
              router.push("/admin");
            }}
            className="text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0d1530] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]/50 transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0d1530] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#d4af37]/50 transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="complete">Complete</option>
          </select>
          <button
            onClick={fetchSubmissions}
            className="flex items-center gap-2 border border-white/10 hover:border-[#d4af37]/40 text-white/60 hover:text-white px-4 py-2.5 rounded-lg transition-colors text-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total", value: submissions.length, color: "text-white" },
            {
              label: "Pending",
              value: submissions.filter((s) => s.status === "pending").length,
              color: "text-yellow-400",
            },
            {
              label: "Complete",
              value: submissions.filter((s) => s.status === "complete").length,
              color: "text-green-400",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[#0d1530] border border-white/10 rounded-xl p-4 text-center"
            >
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs text-white/40 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#0d1530] border border-white/10 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-white/40">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin" />
                <span className="text-sm">Loading submissions...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-400 text-sm">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-white/30 text-sm">
              No submissions found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-xs text-white/40 font-medium px-6 py-3">
                      Name
                    </th>
                    <th className="text-left text-xs text-white/40 font-medium px-6 py-3">
                      Contact
                    </th>
                    <th className="text-left text-xs text-white/40 font-medium px-6 py-3">
                      Type
                    </th>
                    <th className="text-left text-xs text-white/40 font-medium px-6 py-3">
                      Status
                    </th>
                    <th className="text-left text-xs text-white/40 font-medium px-6 py-3">
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr
                      key={s.id}
                      onClick={() =>
                        router.push(`/admin/submissions/${s.id}`)
                      }
                      className={`cursor-pointer hover:bg-white/5 transition-colors ${
                        i !== filtered.length - 1 ? "border-b border-white/5" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <span className="text-white font-medium">
                          {s.first_name} {s.last_name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white/60 text-sm">{s.email}</div>
                        <div className="text-white/40 text-xs">{s.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize text-white/70 text-sm">
                          {s.insurance_type === "both"
                            ? "Auto + Home"
                            : s.insurance_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
                            STATUS_COLORS[s.status] || ""
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/40 text-sm">
                        {formatDate(s.created)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-center text-white/20 text-xs mt-4">
          Auto-refreshes every 10 seconds
        </p>
      </div>
    </main>
  );
}
