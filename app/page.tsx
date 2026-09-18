"use client";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { api, Summary, LeaderboardRow, TrendPoint } from "@/lib/api";

function monthStart() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}
function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const [from, setFrom] = useState(monthStart());
  const [to, setTo] = useState(today());
  const [summary, setSummary] = useState<Summary | null>(null);
  const [board, setBoard] = useState<LeaderboardRow[]>([]);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, [from, to]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [s, b, t] = await Promise.all([
        api.dashboard.summary({ from, to }),
        api.dashboard.leaderboard({ from, to }),
        api.dashboard.trends({ from, to, groupBy: "day" }),
      ]);
      setSummary(s);
      setBoard(b);
      setTrends(t);
    } catch (e: any) {
      setError(e.message || "Failed to load dashboard. Is the API running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-slate-500">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-xs text-slate-500">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border rounded px-2 py-1" />
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded">{error}</div>}
      {loading && <div className="text-slate-500 text-sm">Loading...</div>}

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card label="Total Rides" value={summary.totalRides} />
          <Card label="Fare Collected" value={`₹${summary.totalFare}`} />
          <Card label="Diesel Cost" value={`₹${summary.totalDieselCost}`} sub={`${summary.totalLiters} L`} />
          <Card label="Driver Pay" value={`₹${summary.totalDriverPay}`} />
          <Card label="Net Profit" value={`₹${summary.netProfit}`} highlight={summary.netProfit >= 0 ? "good" : "bad"} />
          <Card label="Avg Fare / Ride" value={`₹${summary.avgFarePerRide}`} />
          <Card label="Distance" value={`${summary.totalDistanceKm} km`} />
          <Card label="Diesel Cost / km" value={summary.dieselCostPerKm != null ? `₹${summary.dieselCostPerKm}` : "-"} />
        </div>
      )}

      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-semibold mb-3">Fare vs Diesel Cost (daily)</h2>
        {trends.length === 0 ? (
          <p className="text-sm text-slate-500">No data yet for this range.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="fare" name="Fare (₹)" stroke="#2563eb" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="dieselCost" name="Diesel Cost (₹)" stroke="#dc2626" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-semibold mb-3">Driver Leaderboard</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="py-2">Driver</th>
              <th className="py-2">Rides</th>
              <th className="py-2">Fare</th>
              <th className="py-2">Diesel</th>
              <th className="py-2">Pay</th>
              <th className="py-2">Net Profit</th>
            </tr>
          </thead>
          <tbody>
            {board.map((row) => (
              <tr key={row.driverId} className="border-b last:border-0">
                <td className="py-2">{row.name}</td>
                <td className="py-2">{row.totalRides}</td>
                <td className="py-2">₹{row.totalFare}</td>
                <td className="py-2">₹{row.totalDieselCost}</td>
                <td className="py-2">₹{row.totalDriverPay}</td>
                <td className={`py-2 font-medium ${row.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ₹{row.netProfit}
                </td>
              </tr>
            ))}
            {board.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-center text-slate-400">
                  No drivers yet — add one on the Drivers page.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({ label, value, sub, highlight }: { label: string; value: string | number; sub?: string; highlight?: "good" | "bad" }) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div
        className={`text-xl font-semibold mt-1 ${
          highlight === "good" ? "text-green-600" : highlight === "bad" ? "text-red-600" : "text-slate-800"
        }`}
      >
        {value}
      </div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}
