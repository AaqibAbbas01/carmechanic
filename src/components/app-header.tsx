"use client"

import { FileText, LogOut, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useApp } from "@/context/app-context"

export function AppHeader() {
  const pathname = usePathname()
  const { store, role, setRole, activeGst } = useApp()
  const onSettings = pathname.startsWith("/settings")

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-800 bg-black/95 backdrop-blur">
      <div className="mx-auto flex w-full min-w-0 max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {store.company.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.company.logoUrl} alt="" className="h-9 w-9 shrink-0 rounded-md bg-white object-contain p-1 sm:h-10 sm:w-10" />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#d3121c] text-sm font-black text-white sm:h-10 sm:w-10">
              {store.company.logoText}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold sm:text-base">{store.company.name}</p>
            <p className="truncate text-[11px] text-zinc-400 sm:text-xs">
              {onSettings
                ? "Settings"
                : role === "admin"
                  ? "Admin panel"
                  : activeGst.enabled
                    ? `GSTIN ${activeGst.gstNumber}`
                    : "Without GST"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className={`rounded-md p-2.5 hover:bg-zinc-900 ${!onSettings ? "bg-zinc-900" : ""}`}
            title="Invoice"
            aria-label="Invoice"
          >
            <FileText className="h-5 w-5" />
          </Link>
          {role === "admin" ? (
            <Link
              href="/settings/company"
              className={`rounded-md p-2.5 hover:bg-zinc-900 ${onSettings ? "bg-zinc-900" : ""}`}
              title="Settings"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </Link>
          ) : null}
          <button onClick={() => setRole(null)} className="rounded-md p-2.5 hover:bg-zinc-900" title="Logout" aria-label="Logout">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
