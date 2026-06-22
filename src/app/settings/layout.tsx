"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { SettingsNav } from "@/components/settings-nav"
import { useApp } from "@/context/app-context"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { role } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (role !== "admin") router.replace("/")
  }, [role, router])

  if (role !== "admin") return null

  return (
    <main className="car-bg-app min-h-screen overflow-x-hidden text-zinc-100">
      <AppHeader />
      <div className="mx-auto w-full min-w-0 max-w-3xl px-3 py-3 sm:px-4 sm:py-4">
        <SettingsNav />
        {children}
      </div>
    </main>
  )
}
