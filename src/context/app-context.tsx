"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import {
  getActiveGst,
  loadRole,
  loadStore,
  normalizeStore,
  saveRole,
  type GstProfile,
  type Role,
  type Store,
} from "@/lib/invoice-store"

type AppContextValue = {
  store: Store
  setStore: React.Dispatch<React.SetStateAction<Store>>
  dbReady: boolean
  role: Role | null
  setRole: (role: Role | null) => void
  activeGst: GstProfile
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(() => loadStore())
  const [dbReady, setDbReady] = useState(false)
  const [role, setRoleState] = useState<Role | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setRoleState(loadRole())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => null)
    fetch("/api/store")
      .then((response) => response.json())
      .then((data: { store?: Store | null }) => {
        if (data.store) setStore(normalizeStore(data.store))
      })
      .catch(() => null)
      .finally(() => setDbReady(true))
  }, [])

  useEffect(() => {
    localStorage.setItem("mechanic-invoice-store", JSON.stringify(store))
    if (!dbReady) return
    const timeout = window.setTimeout(() => {
      fetch("/api/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(store),
      }).catch(() => null)
    }, 350)
    return () => window.clearTimeout(timeout)
  }, [store, dbReady])

  const setRole = (nextRole: Role | null) => {
    saveRole(nextRole)
    setRoleState(nextRole)
  }

  const activeGst = useMemo(() => getActiveGst(store), [store])

  if (!hydrated) return null

  return (
    <AppContext.Provider value={{ store, setStore, dbReady, role, setRole, activeGst }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error("useApp must be used within AppProvider")
  return context
}
