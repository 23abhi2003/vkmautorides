/**
 * Base URL of the Cloudflare Worker backend (see the sibling `api/`
 * project). Set NEXT_PUBLIC_API_URL at build time — e.g. in Cloudflare
 * Pages' "Environment variables" settings, or in `.env.local` for local dev.
 */
export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787").replace(/\/$/, "");

/** localStorage key the auth session (token + user) is persisted under. */
export const AUTH_STORAGE_KEY = "vkm_auto_rides_auth";

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token?: string };
    return parsed?.token ?? null;
  } catch {
    return null;
  }
}

/**
 * fetch() against the Worker API. Attaches the signed-in user's bearer
 * token (if any) so call sites don't each need to know about auth.
 */
export function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getStoredToken();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(`${API_BASE}${path}`, { cache: "no-store", ...init, headers });
}

async function request(path: string, init?: RequestInit) {
  const res = await apiFetch(path, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export type Driver = {
  id: string;
  name: string;
  phone: string;
  vehicleNumber: string;
  joinedDate: string;
};

export type Ride = {
  id: string;
  driverId: string;
  rideDate: string;
  pickup: string;
  dropLocation: string;
  distanceKm: number | null;
  fareAmount: number;
  notes: string;
};

export type DieselEntry = {
  id: string;
  driverId: string;
  entryDate: string;
  liters: number;
  costPerLiter: number;
  totalCost: number;
  odometer: number | null;
  notes: string;
};

export type DriverPayment = {
  id: string;
  driverId: string;
  paymentDate: string;
  amount: number;
  paymentType: string;
  notes: string;
};

export type Summary = {
  totalRides: number;
  totalFare: number;
  totalDistanceKm: number;
  totalLiters: number;
  totalDieselCost: number;
  totalDriverPay: number;
  netProfit: number;
  avgFarePerRide: number;
  dieselCostPerKm: number | null;
};

export type LeaderboardRow = {
  driverId: string;
  name: string;
  totalRides: number;
  totalFare: number;
  totalDieselCost: number;
  totalDriverPay: number;
  netProfit: number;
};

export type TrendPoint = {
  date: string;
  rides: number;
  fare: number;
  dieselCost: number;
  liters: number;
};

export const api = {
  drivers: {
    list: (): Promise<Driver[]> => request("/api/drivers"),
    create: (data: Partial<Driver>) => request("/api/drivers", { method: "POST", body: JSON.stringify(data) }),
  },
  rides: {
    list: (params?: { from?: string; to?: string }): Promise<Ride[]> => request(`/api/rides${qs(params)}`),
    create: (data: Partial<Ride>) => request("/api/rides", { method: "POST", body: JSON.stringify(data) }),
    remove: (id: string) => request(`/api/rides/${id}`, { method: "DELETE" }),
  },
  diesel: {
    list: (params?: { from?: string; to?: string }): Promise<DieselEntry[]> => request(`/api/diesel${qs(params)}`),
    create: (data: Partial<DieselEntry>) => request("/api/diesel", { method: "POST", body: JSON.stringify(data) }),
    remove: (id: string) => request(`/api/diesel/${id}`, { method: "DELETE" }),
  },
  payments: {
    list: (params?: { from?: string; to?: string }): Promise<DriverPayment[]> => request(`/api/payments${qs(params)}`),
    create: (data: Partial<DriverPayment>) => request("/api/payments", { method: "POST", body: JSON.stringify(data) }),
    remove: (id: string) => request(`/api/payments/${id}`, { method: "DELETE" }),
  },
  dashboard: {
    summary: (params?: { from?: string; to?: string }): Promise<Summary> => request(`/api/dashboard/summary${qs(params)}`),
    leaderboard: (params?: { from?: string; to?: string }): Promise<LeaderboardRow[]> =>
      request(`/api/dashboard/leaderboard${qs(params)}`),
    trends: (params?: { from?: string; to?: string; groupBy?: "day" | "month" }): Promise<TrendPoint[]> =>
      request(`/api/dashboard/trends${qs(params)}`),
  },
};

function qs(params?: Record<string, string | undefined>) {
  if (!params) return "";
  const entries = Object.entries(params).filter(([, v]) => v);
  if (!entries.length) return "";
  return "?" + new URLSearchParams(entries as [string, string][]).toString();
}
