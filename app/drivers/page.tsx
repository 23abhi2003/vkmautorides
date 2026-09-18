"use client";
import { useEffect, useState } from "react";
import { api, Driver } from "@/lib/api";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", vehicleNumber: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setDrivers(await api.drivers.list());
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.drivers.create(form);
      setForm({ name: "", phone: "", vehicleNumber: "" });
      refresh();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-semibold mb-3">Add Driver</h2>
        <form onSubmit={submit} className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Field label="Name" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} required />
          <Field label="Phone" value={form.phone} onChange={(v: string) => setForm({ ...form, phone: v })} />
          <Field label="Vehicle Number" value={form.vehicleNumber} onChange={(v: string) => setForm({ ...form, vehicleNumber: v })} />
          <div className="col-span-2 md:col-span-3">
            <button className="bg-slate-800 text-white px-4 py-2 rounded text-sm">Save Driver</button>
            {error && <span className="text-red-600 text-sm ml-3">{error}</span>}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-semibold mb-3">Drivers</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="py-2">ID</th>
              <th className="py-2">Name</th>
              <th className="py-2">Phone</th>
              <th className="py-2">Vehicle</th>
              <th className="py-2">Joined</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr key={d.id} className="border-b last:border-0">
                <td className="py-2 text-slate-400">{d.id}</td>
                <td className="py-2">{d.name}</td>
                <td className="py-2">{d.phone || "-"}</td>
                <td className="py-2">{d.vehicleNumber || "-"}</td>
                <td className="py-2">{d.joinedDate}</td>
              </tr>
            ))}
            {drivers.length === 0 && (
              <tr><td colSpan={5} className="py-4 text-center text-slate-400">No drivers yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, required }: any) {
  return (
    <label className="text-xs text-slate-500">
      {label}
      <input
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full border rounded px-2 py-1 mt-1 text-sm text-slate-800"
      />
    </label>
  );
}
