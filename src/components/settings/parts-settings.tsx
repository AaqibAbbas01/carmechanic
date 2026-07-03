"use client"

import { PackagePlus, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { Panel } from "@/components/ui"
import { useApp } from "@/context/app-context"
import { money, normalizePart, type ItemType, type Part } from "@/lib/invoice-store"

export function PartsSettings() {
  const { store, setStore } = useApp()
  const [newPart, setNewPart] = useState<Part>({ id: "", name: "", price: 0, partNumber: "", type: "part" })

  return (
    <Panel icon={<PackagePlus />} title="Parts master">
      <div className="grid gap-2">
        <input className="input" placeholder="Part/labour name" value={newPart.name} onChange={(e) => setNewPart({ ...newPart, name: e.target.value })} />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <select className="input" value={newPart.type || "part"} onChange={(e) => setNewPart({ ...newPart, type: e.target.value as ItemType })}><option value="part">Part</option><option value="labour">Labour</option></select>
          <input className="input" placeholder="Price" type="number" value={newPart.price} onChange={(e) => setNewPart({ ...newPart, price: Number(e.target.value) })} />
          <input className="input" placeholder="Part Number" value={newPart.partNumber} onChange={(e) => setNewPart({ ...newPart, partNumber: e.target.value })} />
        </div>
        <button className="btn-primary w-full sm:w-auto" onClick={() => {
          if (!newPart.name.trim()) return
          setStore((current) => ({ ...current, parts: [normalizePart({ ...newPart, id: crypto.randomUUID() }), ...current.parts] }))
          setNewPart({ id: "", name: "", price: 0, partNumber: "", type: "part" })
        }}><Plus className="h-4 w-4" /> Add item</button>
      </div>
      <div className="mt-4 max-h-[min(520px,55vh)] space-y-2 overflow-y-auto sm:max-h-[520px]">
        {store.parts.map((part) => (
          <div key={part.id} className="flex flex-col gap-3 rounded-md border border-slate-200 bg-[#f8fbfa] p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-semibold">{part.name}</p>
              <p className="break-all text-slate-500 sm:truncate">{part.type || "part"} · {part.partNumber} · {money(part.price)}</p>
            </div>
            <button onClick={() => setStore((current) => ({ ...current, parts: current.parts.filter((entry) => entry.id !== part.id) }))} className="self-end rounded-md p-2 text-red-600 hover:bg-red-50 sm:self-auto" title="Remove" aria-label="Remove part"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </Panel>
  )
}
