"use client"

import { Building2, Upload } from "lucide-react"
import { useState } from "react"
import { Panel, Field } from "@/components/ui"
import { useApp } from "@/context/app-context"
import type { Company } from "@/lib/invoice-store"

export function CompanySettings() {
  const { store, setStore } = useApp()
  const [logoStatus, setLogoStatus] = useState("")

  const updateCompany = (patch: Partial<Company>) =>
    setStore((current) => ({ ...current, company: { ...current.company, ...patch } }))

  async function uploadLogo(file: File | undefined) {
    if (!file) return
    setLogoStatus("Uploading logo...")
    const formData = new FormData()
    formData.append("file", file)
    const response = await fetch("/api/logo", { method: "POST", body: formData })
    const data = (await response.json()) as { url?: string; error?: string }
    if (!response.ok || !data.url) {
      setLogoStatus(data.error || "Logo upload failed.")
      return
    }
    updateCompany({ logoUrl: data.url })
    setLogoStatus("Logo uploaded.")
  }

  return (
    <Panel icon={<Building2 />} title="Company & WhatsApp">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Company name"><input className="input" value={store.company.name} onChange={(e) => updateCompany({ name: e.target.value })} /></Field>
        <Field label="Logo text"><input className="input" value={store.company.logoText} onChange={(e) => updateCompany({ logoText: e.target.value })} /></Field>
        <Field label="Phone"><input className="input" value={store.company.phone} onChange={(e) => updateCompany({ phone: e.target.value })} /></Field>
        <Field label="Email"><input className="input" value={store.company.email} onChange={(e) => updateCompany({ email: e.target.value })} /></Field>
      </div>
      <div className="mt-4 flex flex-col items-center gap-3 rounded-lg border border-slate-200 bg-[#f8fbfa] p-3 sm:flex-row sm:items-start">
        {store.company.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={store.company.logoUrl} alt="" className="h-24 w-24 shrink-0 rounded-md bg-white object-contain p-2" />
        ) : (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-md bg-[#1f6f64] text-xl font-black text-white">{store.company.logoText}</div>
        )}
        <div className="min-w-0 w-full text-center sm:text-left">
          <p className="text-sm font-semibold">Invoice logo</p>
          <p className="mt-1 text-xs text-slate-500">Logo Cloudinary me upload hoga aur invoice preview/PDF me use hoga.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <label className="btn-secondary w-full sm:w-fit">
              <Upload className="h-4 w-4" /> Upload logo
              <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only" onChange={(event) => uploadLogo(event.target.files?.[0])} />
            </label>
            {store.company.logoUrl ? (
              <button className="w-full rounded-md px-3 py-2 text-sm font-semibold text-red-600 sm:w-auto" onClick={() => updateCompany({ logoUrl: "" })}>Remove</button>
            ) : null}
          </div>
          {logoStatus ? <p className="mt-2 text-xs text-slate-500">{logoStatus}</p> : null}
        </div>
      </div>
      <Field label="Address"><textarea className="input min-h-20 w-full resize-y py-2" value={store.company.address} onChange={(e) => updateCompany({ address: e.target.value })} /></Field>
      <Field label="WhatsApp message"><textarea className="input min-h-24 w-full resize-y py-2" value={store.company.whatsappMessage} onChange={(e) => updateCompany({ whatsappMessage: e.target.value })} /></Field>
      <p className="mt-2 text-xs text-slate-500">Variables: {"{name}"} {"{invoiceNo}"} {"{total}"}</p>
    </Panel>
  )
}
