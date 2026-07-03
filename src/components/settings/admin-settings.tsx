"use client"

import { KeyRound, Save } from "lucide-react"
import { useState } from "react"
import { Panel, Field } from "@/components/ui"
import { useApp } from "@/context/app-context"

export function AdminSettings() {
  const { store, setStore } = useApp()
  const [username, setUsername] = useState(store.admin.username)
  const [password, setPassword] = useState(store.admin.password)
  const [status, setStatus] = useState("")

  const handleSave = () => {
    const nextUsername = username.trim()
    const nextPassword = password.trim()

    if (!nextUsername || !nextPassword) {
      setStatus("Username aur password dono required hain.")
      return
    }

    setStore((current) => ({
      ...current,
      admin: { username: nextUsername, password: nextPassword },
    }))
    setStatus("Admin login saved.")
  }

  return (
    <Panel icon={<KeyRound />} title="Admin login">
      <p className="mb-3 text-sm text-slate-600">
        Yahan se admin username ya password change kar sakte ho. Save ke baad naye details se login hoga.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Admin username">
          <input
            className="input"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              setStatus("")
            }}
            placeholder="Enter new username"
            autoComplete="username"
          />
        </Field>
        <Field label="Admin password">
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setStatus("")
            }}
            placeholder="Enter new password"
            autoComplete="new-password"
          />
        </Field>
      </div>
      <button type="button" onClick={handleSave} className="btn-primary mt-4 w-full sm:w-auto">
        <Save className="h-4 w-4" /> Save admin login
      </button>
      {status ? (
        <p className={`mt-3 text-sm ${status.includes("saved") ? "text-emerald-600" : "text-red-600"}`}>{status}</p>
      ) : null}
    </Panel>
  )
}
