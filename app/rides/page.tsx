"use client";
import { useEffect, useState } from "react";
import { api, Driver, Ride } from "@/lib/api";

export default function RidesPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [form, setForm] = useState({
    driverId: "",
    rideDate: new Date().toISOString().slice(0, 10),
    pickup: "",
    dropLocation: "",
    distanceKm: "",
    fareAmount: "",
    notes: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const [d, r] = await Promise.all([api.drivers.list(), api.rides.list()]);
    setDrivers(d);
    setRides(r);
    if (!form.driverId && d.length) setForm((f) => ({ ...f, driverId: d[0].id }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.rides.create({
        driverId: form.driverId,
        rideDate: form.rideDate,
        pickup: form.pickup,
        dropLocation: form.dropLocation,
        distanceKm: form.distanceKm ? Number(form.distanceKm) : null,
        fareAmount: Number(form.fareAmount),
        notes: form.notes,
      });
      setForm((f) => ({ ...f, pickup: "", dropLocation: "", distanceKm: "", fareAmount: "", notes: "" }));
      refresh();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function remove(id: string) {
    await api.rides.remove(id);
    refresh();
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-semibold mb-3">Add Ride</h2>
        {drivers.length === 0 ? (
          <p className="text-sm text-amber-600">Add a driver first on the Drivers page.</p>
        ) : (
          <form onSubmit={submit} className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Select label="Driver" value={form.driverId} onChange={(v: string) => setForm({ ...form, driverId: v })}>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
            <Field label="Date" type="date" value={form.rideDate} onChange={(v: string) => setForm({ ...form, rideDate: v })} required />
            <Field label="Fare Amount (₹)" type="number" value={form.fareAmount} onChange={(v: string) => setForm({ ...form, fareAmount: v })} required />
            <Field label="Pickup" value={form.pickup} onChange={(v: string) => setForm({ ...form, pickup: v })} />
            <Field label="Drop" value={form.dropLocation} onChange={(v: string) => setForm({ ...form, dropLocation: v })} />
            <Field label="Distance (km)" type="number" value={form.distanceKm} onChange={(v: string) => setForm({ ...form, distanceKm: v })} />
            <Field label="Notes" value={form.notes} onChange={(v: string) => setForm({ ...form, notes: v })} />
            <div className="col-span-2 md:col-span-3">
              <button className="bg-slate-800 text-white px-4 py-2 rounded text-sm">Save Ride</button>
              {error && <span className="text-red-600 text-sm ml-3">{error}</span>}
            </div>
          </form>
        )}
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-semibold mb-3">Rides</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="py-2">ID</th>
              <th className="py-2">Date</th>
              <th className="py-2">Route</th>
              <th className="py-2">Distance</th>
              <th className="py-2">Fare</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rides.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="py-2 text-slate-400">{r.id}</td>
                <td className="py-2">{r.rideDate}</td>
                <td className="py-2">{[r.pickup, r.dropLocation].filter(Boolean).join(" → ") || "-"}</td>
                <td className="py-2">{r.distanceKm ?? "-"}</td>
                <td className="py-2">₹{r.fareAmount}</td>
                <td className="py-2 text-right">
                  <button onClick={() => remove(r.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
            {rides.length === 0 && (
              <tr><td colSpan={6} className="py-4 text-center text-slate-400">No rides logged yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required }: any) {
  return (
    <label className="text-xs text-slate-500">
      {label}
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full border rounded px-2 py-1 mt-1 text-sm text-slate-800"
      />
    </label>
  );
}

function Select({ label, value, onChange, children }: any) {
  return (
    <label className="text-xs text-slate-500">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="block w-full border rounded px-2 py-1 mt-1 text-sm text-slate-800">
        {children}
      </select>
    </label>
  );
}
