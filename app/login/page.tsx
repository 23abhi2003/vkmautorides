"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/Auth";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await login(phone, pin);
    if (res.ok) router.replace("/");
    else setError(res.error || "Login failed");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <form onSubmit={submit} className="bg-white border rounded-lg p-6 w-full max-w-sm space-y-4">
        <div className="text-center">
          <div className="text-2xl mb-1">🛺</div>
          <h1 className="font-semibold text-lg text-slate-800">VKM Auto Rides</h1>
          <p className="text-xs text-slate-500 mt-1">Sign in to manage rides &amp; earnings</p>
        </div>
        <label className="block text-xs text-slate-500">
          Phone number
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="block w-full border rounded px-3 py-2 mt-1 text-sm"
            required
          />
        </label>
        <label className="block text-xs text-slate-500">
          PIN
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="block w-full border rounded px-3 py-2 mt-1 text-sm"
            required
          />
        </label>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="w-full bg-slate-800 text-white rounded px-4 py-2 text-sm">Sign in</button>
      </form>
    </div>
  );
}
