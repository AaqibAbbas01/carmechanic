"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SETTINGS_ROUTES } from "@/lib/invoice-store"

export function SettingsNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Settings sections" className="sticky top-[3.75rem] z-[5] -mx-3 mb-3 border-b border-slate-200 bg-white/95 px-3 py-2 backdrop-blur sm:-mx-4 sm:px-4">
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SETTINGS_ROUTES.map((section) => {
          const active = pathname === section.href
          return (
            <Link
              key={section.href}
              href={section.href}
              className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
                active
                  ? "border-[#1f6f64] bg-[#e8f4f1] text-[#1f6f64]"
                  : "border-slate-300 text-slate-600 hover:border-[#1f6f64] hover:text-[#1f6f64]"
              }`}
            >
              {section.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
