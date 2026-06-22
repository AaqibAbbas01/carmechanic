"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SETTINGS_ROUTES } from "@/lib/invoice-store"

export function SettingsNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Settings sections" className="sticky top-[3.75rem] z-[5] -mx-3 mb-3 border-b border-zinc-800 bg-black/95 px-3 py-2 backdrop-blur sm:-mx-4 sm:px-4">
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SETTINGS_ROUTES.map((section) => {
          const active = pathname === section.href
          return (
            <Link
              key={section.href}
              href={section.href}
              className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
                active
                  ? "border-[#ff2b35] bg-[#2a0d10] text-white"
                  : "border-zinc-700 text-zinc-200 hover:border-[#ff2b35] hover:text-white"
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
