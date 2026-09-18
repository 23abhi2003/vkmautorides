"use client";
import { useEffect, useState } from "react";
import { api, Driver, DieselEntry } from "@/lib/api";

export default function DieselPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [entries, setEntries] = useState<DieselEntry[]>([]);
  const [form, setForm] = useState({
    driverId: "",
    entryDate: new Date().toISOString().slice(0, 10),
    liters: "",
    costPerLiter: "",
    odometer: "",
    notes: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const [d, e] = await Promise.all([api.drivers.list(), api.diesel.list()]);
    setDrivers(d);
    setEntries(e);
    if (!form.driverId && d.length) setForm((f) => ({ ...f, driverId: d[0].id }));
  }

  const total = form.liters && form.costPerLiter ? (Number(form.liters) * Number(form.costPerLiter)).toFixed(2) : "0.00";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.diesel.create({
        driverId: form.driverId,
        entryDate: form.entryDate,
        liters: Number(form.liters),
        costPerLiter: Number(form.costPerLiter),
        odometer: form.odometer ? Number(form.odometer) : null,
        notes: form.notes,
      });
      setForm((f) => ({ ...f, liters: "", costPerLiter: "", odometer: "", notes: "" }));
      refresh();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function remove(id: string) {
    await api.diesel.remove(id);
    refresh();
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-semibold mb-3">Add Diesel Entry</h2>
        {drivers.length === 0 ? (
          <p className="text-sm text-amber-600">Add a driver first on the Drivers page.</p>
        ) : (
          <form onSubmit={submit} className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Select label="Driver" value={form.driverId} onChange={(v: string) => setForm({ ...form, driverId: v })}>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
            <Field label="Date" type="date" value={form.entryDate} onChange={(v: string) => setForm({ ...form, entryDate: v })} required />
            <Field label="Liters" type="number" value={form.liters} onChange={(v: string) => setForm({ ...form, liters: v })} required />
            <Field label="Cost / Liter (₹)" type="number" value={form.costPerLiter} onChange={(v: string) => setForm({ ...form, costPerLiter: v })} required />
            <Field label="Odometer (km)" type="number" value={form.odometer} onChange={(v: string) => setForm({ ...form, odometer: v })} />
            <Field label="Notes" value={form.notes} onChange={(v: string) => setForm({ ...form, notes: v })} />
            <div className="col-span-2 md:col-span-3 flex items-center gap-3">
              <button className="bg-slate-800 text-white px-4 py-2 rounded text-sm">Save Entry</button>
              <span className="text-sm text-slate-500">Total cost: ₹{total}</span>
              {error && <span className="text-red-600 text-sm">{error}</span>}
            </div>
          </form>
        )}
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-semibold mb-3">Diesel Log</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="py-2">ID</th>
              <th className="py-2">Date</th>
              <th className="py-2">Liters</th>
              <th className="py-2">₹/L</th>
              <th className="py-2">Total</th>
              <th className="py-2">Odometer</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b last:border-0">
                <td className="py-2 text-slate-400">{e.id}</td>
                <td className="py-2">{e.entryDate}</td>
                <td className="py-2">{e.liters}</td>
                <td className="py-2">₹{e.costPerLiter}</td>
                <td className="py-2">₹{e.totalCost}</td>
                <td className="py-2">{e.odometer ?? "-"}</td>
                <td className="py-2 text-right">
                  <button onClick={() => remove(e.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan={7} className="py-4 text-center text-slate-400">No diesel entries yet.</td></tr>
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
