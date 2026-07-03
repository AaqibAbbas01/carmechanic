import type React from "react"

export function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="mb-3 flex items-center gap-2 sm:mb-4">
        <span className="shrink-0 text-[#1f6f64] [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
        <h2 className="min-w-0 text-base font-semibold text-slate-950 sm:text-lg">{title}</h2>
      </div>
      {children}
    </div>
  )
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block min-w-0 text-sm font-medium text-slate-700">
      <span className="mb-1 mt-1 block sm:mt-3">{label}</span>
      {children}
    </label>
  )
}

export function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${strong ? "border-t border-zinc-300 pt-3 text-base font-bold sm:text-lg" : ""}`}>
      <span className="min-w-0 shrink">{label}</span>
      <span className="shrink-0 text-right">{value}</span>
    </div>
  )
}
