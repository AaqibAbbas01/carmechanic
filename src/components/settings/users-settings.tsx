"use client"

import { Plus, Trash2, UsersRound } from "lucide-react"
import { useState } from "react"
import { Panel } from "@/components/ui"
import { useApp } from "@/context/app-context"
import { emptyUser, type AppUser } from "@/lib/invoice-store"

export function UsersSettings() {
  const { store, setStore } = useApp()
  const [newUser, setNewUser] = useState<AppUser>(emptyUser)

  return (
    <Panel icon={<UsersRound />} title="Users">
      <div className="grid gap-2">
        <input className="input" placeholder="User name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
        <input className="input" placeholder="Phone" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} inputMode="tel" />
        <input className="input" placeholder="PIN" value={newUser.pin} onChange={(e) => setNewUser({ ...newUser, pin: e.target.value })} inputMode="numeric" />
        <button className="btn-primary w-full sm:w-auto" onClick={() => {
          if (!newUser.name.trim() || !newUser.phone.trim() || !newUser.pin.trim()) return
          setStore((current) => ({ ...current, users: [{ ...newUser, id: crypto.randomUUID(), active: true }, ...current.users.filter((user) => user.phone.replace(/\D/g, "") !== newUser.phone.replace(/\D/g, ""))] }))
          setNewUser(emptyUser)
        }}><Plus className="h-4 w-4" /> Add user</button>
      </div>
      <div className="mt-4 space-y-2">
        {store.users.map((user) => (
          <div key={user.id} className="flex flex-col gap-3 rounded-md border border-slate-200 bg-[#f8fbfa] p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-semibold">{user.name}</p>
              <p className="break-all text-slate-500 sm:truncate">{user.phone} · PIN {user.pin}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2 self-stretch sm:self-auto">
              <button onClick={() => setStore((current) => ({ ...current, users: current.users.map((entry) => entry.id === user.id ? { ...entry, active: !entry.active } : entry) }))} className="min-h-[2.75rem] flex-1 rounded-md border border-slate-300 px-3 text-xs font-semibold sm:flex-none sm:px-2">{user.active ? "Active" : "Off"}</button>
              <button onClick={() => setStore((current) => ({ ...current, users: current.users.filter((entry) => entry.id !== user.id) }))} className="min-h-[2.75rem] rounded-md p-2 text-red-600 hover:bg-red-50" title="Remove" aria-label="Remove user"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}
