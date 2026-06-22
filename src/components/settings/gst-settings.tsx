"use client"

import { Plus, ShieldCheck, Trash2 } from "lucide-react"
import { useState } from "react"
import { Panel, Field } from "@/components/ui"
import { useApp } from "@/context/app-context"
import { defaultGstProfiles, emptyGst, type GstProfile } from "@/lib/invoice-store"

export function GstSettings() {
  const { store, setStore, activeGst } = useApp()
  const [newGst, setNewGst] = useState<GstProfile>(emptyGst)

  return (
    <Panel icon={<ShieldCheck />} title="GST master">
      <Field label="Active GST profile">
        <select className="input" value={store.activeGstId} onChange={(event) => setStore((current) => ({ ...current, activeGstId: event.target.value }))}>
          {store.gstProfiles.map((gst) => <option key={gst.id} value={gst.id}>{gst.label} {gst.enabled ? `- ${gst.gstNumber}` : "- Without GST"}</option>)}
        </select>
      </Field>
      <label className="mt-4 flex min-h-[2.75rem] items-center gap-3 text-sm font-semibold">
        <input type="checkbox" className="h-4 w-4 shrink-0" checked={activeGst.enabled} onChange={(event) => setStore((current) => ({ ...current, gstProfiles: current.gstProfiles.map((gst) => gst.id === current.activeGstId ? { ...gst, enabled: event.target.checked } : gst) }))} />
        Add GST on invoices
      </label>
      <div className="mt-3 grid gap-2">
        <input className="input" placeholder="Label" value={newGst.label} onChange={(e) => setNewGst({ ...newGst, label: e.target.value })} />
        <input className="input" placeholder="GST number" value={newGst.gstNumber} onChange={(e) => setNewGst({ ...newGst, gstNumber: e.target.value.toUpperCase() })} />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input className="input" type="number" placeholder="Tax %" value={newGst.taxRate} onChange={(e) => setNewGst({ ...newGst, taxRate: Number(e.target.value) })} />
          <label className="flex min-h-[2.75rem] items-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-semibold"><input type="checkbox" className="h-4 w-4" checked={newGst.enabled} onChange={(e) => setNewGst({ ...newGst, enabled: e.target.checked })} />GST</label>
        </div>
        <button className="btn-primary w-full sm:w-auto" onClick={() => {
          if (!newGst.label.trim()) return
          const profile = { ...newGst, id: crypto.randomUUID(), taxRate: newGst.enabled ? Number(newGst.taxRate || 0) : 0 }
          setStore((current) => ({ ...current, gstProfiles: [profile, ...current.gstProfiles], activeGstId: profile.id }))
          setNewGst(emptyGst)
        }}><Plus className="h-4 w-4" /> Save GST</button>
      </div>
      <div className="mt-4 space-y-2">
        {store.gstProfiles.map((gst) => (
          <div key={gst.id} className="flex flex-col gap-3 rounded-md border border-zinc-800 bg-black p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <button className="min-w-0 text-left" onClick={() => setStore((current) => ({ ...current, activeGstId: gst.id }))}>
              <p className="font-semibold">{gst.label}</p>
              <p className="break-all text-zinc-400 sm:truncate">{gst.enabled ? `${gst.gstNumber} - ${gst.taxRate}%` : "Without GST"}</p>
            </button>
            <button onClick={() => setStore((current) => {
              const next = current.gstProfiles.filter((entry) => entry.id !== gst.id)
              return { ...current, gstProfiles: next.length ? next : [defaultGstProfiles[1]], activeGstId: next[0]?.id || defaultGstProfiles[1].id }
            })} className="self-end rounded-md p-2 text-[#ff525a] hover:bg-[#2a0d10] sm:self-auto" title="Delete GST" aria-label="Delete GST"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </Panel>
  )
}
