import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-2">
      <div className="text-3xl">🛺</div>
      <h1 className="font-semibold text-lg text-slate-800">Page not found</h1>
      <Link href="/" className="text-sm text-slate-500 underline">Back to dashboard</Link>
    </div>
  );
}
