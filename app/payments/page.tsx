"use client";
import { useEffect, useState } from "react";
import { api, Driver, DriverPayment } from "@/lib/api";

export default function PaymentsPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [payments, setPayments] = useState<DriverPayment[]>([]);
  const [form, setForm] = useState({
    driverId: "",
    paymentDate: new Date().toISOString().slice(0, 10),
    amount: "",
    paymentType: "daily",
    notes: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const [d, p] = await Promise.all([api.drivers.list(), api.payments.list()]);
    setDrivers(d);
    setPayments(p);
    if (!form.driverId && d.length) setForm((f) => ({ ...f, driverId: d[0].id }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.payments.create({
        driverId: form.driverId,
        paymentDate: form.paymentDate,
        amount: Number(form.amount),
        paymentType: form.paymentType,
        notes: form.notes,
      });
      setForm((f) => ({ ...f, amount: "", notes: "" }));
      refresh();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function remove(id: string) {
    await api.payments.remove(id);
    refresh();
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-semibold mb-3">Add Driver Payment</h2>
        {drivers.length === 0 ? (
          <p className="text-sm text-amber-600">Add a driver first on the Drivers page.</p>
        ) : (
          <form onSubmit={submit} className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Select label="Driver" value={form.driverId} onChange={(v: string) => setForm({ ...form, driverId: v })}>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
            <Field label="Date" type="date" value={form.paymentDate} onChange={(v: string) => setForm({ ...form, paymentDate: v })} required />
            <Field label="Amount (₹)" type="number" value={form.amount} onChange={(v: string) => setForm({ ...form, amount: v })} required />
            <Select label="Type" value={form.paymentType} onChange={(v: string) => setForm({ ...form, paymentType: v })}>
              <option value="daily">Daily</option>
              <option value="salary">Salary</option>
              <option value="commission">Commission</option>
            </Select>
            <Field label="Notes" value={form.notes} onChange={(v: string) => setForm({ ...form, notes: v })} />
            <div className="col-span-2 md:col-span-3">
              <button className="bg-slate-800 text-white px-4 py-2 rounded text-sm">Save Payment</button>
              {error && <span className="text-red-600 text-sm ml-3">{error}</span>}
            </div>
          </form>
        )}
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-semibold mb-3">Payment History</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="py-2">ID</th>
              <th className="py-2">Date</th>
              <th className="py-2">Type</th>
              <th className="py-2">Amount</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="py-2 text-slate-400">{p.id}</td>
                <td className="py-2">{p.paymentDate}</td>
                <td className="py-2 capitalize">{p.paymentType}</td>
                <td className="py-2">₹{p.amount}</td>
                <td className="py-2 text-right">
                  <button onClick={() => remove(p.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan={5} className="py-4 text-center text-slate-400">No payments logged yet.</td></tr>
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
