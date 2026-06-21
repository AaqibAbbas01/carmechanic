"use client";

import {
  BadgeIndianRupee,
  Building2,
  Download,
  FileText,
  LogOut,
  MessageCircle,
  PackagePlus,
  Plus,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  Upload,
  UsersRound,
  UserRound,
} from "lucide-react";
import jsPDF from "jspdf";
import type React from "react";
import { useEffect, useMemo, useState } from "react";

type Role = "user" | "admin";

type Company = {
  name: string;
  address: string;
  phone: string;
  email: string;
  logoText: string;
  logoUrl?: string;
  whatsappMessage: string;
};

type GstProfile = {
  id: string;
  label: string;
  gstNumber: string;
  taxRate: number;
  enabled: boolean;
};

type AppUser = {
  id: string;
  name: string;
  phone: string;
  pin: string;
  active: boolean;
};

type AdminAccount = {
  username: string;
  password: string;
};

type Part = {
  id: string;
  name: string;
  price: number;
  hsn: string;
};

type LineItem = {
  id: string;
  name: string;
  qty: number;
  price: number;
  hsn: string;
};

type Template = {
  id: string;
  keyword: string;
  title: string;
  items: LineItem[];
};

type Customer = {
  name: string;
  phone: string;
  email?: string;
  vehicle?: string;
};

type Store = {
  company: Company;
  admin: AdminAccount;
  gstProfiles: GstProfile[];
  activeGstId: string;
  users: AppUser[];
  parts: Part[];
  templates: Template[];
  customers: Customer[];
};

const defaultCompany: Company = {
  name: "Ayaan Auto Works",
  address: "Main Road, Auto Market, Pune",
  phone: "+91 98765 43210",
  email: "billing@ayaanauto.in",
  logoText: "AAW",
  whatsappMessage:
    "Namaste {name}, aapka invoice {invoiceNo} ready hai. Total amount Rs {total}. Dhanyavaad.",
};

const defaultGstProfiles: GstProfile[] = [
  {
    id: "gst-1",
    label: "Main GST",
    gstNumber: "27ABCDE1234F1Z5",
    taxRate: 18,
    enabled: true,
  },
  {
    id: "gst-no",
    label: "Without GST",
    gstNumber: "",
    taxRate: 0,
    enabled: false,
  },
];

const defaultUsers: AppUser[] = [
  { id: "u1", name: "Workshop User", phone: "9999999999", pin: "user123", active: true },
];

const defaultAdmin: AdminAccount = {
  username: "admin",
  password: "admin123",
};

const defaultParts: Part[] = [
  { id: "p1", name: "Brake shoe", price: 850, hsn: "8708" },
  { id: "p2", name: "Brake pad", price: 1250, hsn: "8708" },
  { id: "p3", name: "Engine oil 10W-40", price: 1450, hsn: "2710" },
  { id: "p4", name: "Oil filter", price: 350, hsn: "8421" },
  { id: "p5", name: "Air filter", price: 450, hsn: "8421" },
  { id: "p6", name: "Spark plug", price: 220, hsn: "8511" },
  { id: "p7", name: "Clutch cable", price: 420, hsn: "8708" },
  { id: "p8", name: "Chain sprocket kit", price: 1850, hsn: "8714" },
  { id: "p9", name: "Battery check", price: 250, hsn: "9987" },
  { id: "p10", name: "General service labour", price: 700, hsn: "9987" },
  { id: "p11", name: "Wheel alignment", price: 600, hsn: "9987" },
  { id: "p12", name: "Puncture repair", price: 120, hsn: "9987" },
];

const seedStore: Store = {
  company: defaultCompany,
  admin: defaultAdmin,
  gstProfiles: defaultGstProfiles,
  activeGstId: "gst-1",
  users: defaultUsers,
  parts: defaultParts,
  templates: [
    {
      id: "t1",
      keyword: "brakeshoe change",
      title: "Brake shoe change",
      items: [
        { id: "i1", name: "Brake shoe", qty: 1, price: 850, hsn: "8708" },
        { id: "i2", name: "General service labour", qty: 1, price: 350, hsn: "9987" },
      ],
    },
    {
      id: "t2",
      keyword: "oil service",
      title: "Oil service",
      items: [
        { id: "i3", name: "Engine oil 10W-40", qty: 1, price: 1450, hsn: "2710" },
        { id: "i4", name: "Oil filter", qty: 1, price: 350, hsn: "8421" },
        { id: "i5", name: "General service labour", qty: 1, price: 500, hsn: "9987" },
      ],
    },
  ],
  customers: [],
};

const emptyCustomer: Customer = { name: "", phone: "", email: "", vehicle: "" };
const newItem = (): LineItem => ({ id: crypto.randomUUID(), name: "", qty: 1, price: 0, hsn: "" });
const invoiceNumber = () => `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
const emptyUser: AppUser = { id: "", name: "", phone: "", pin: "", active: true };
const emptyGst: GstProfile = { id: "", label: "", gstNumber: "", taxRate: 18, enabled: true };

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function imageToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function loadStore(): Store {
  if (typeof window === "undefined") return seedStore;
  const raw = localStorage.getItem("mechanic-invoice-store");
  if (!raw) return seedStore;
  const parsed = JSON.parse(raw) as Partial<Store> & {
    company?: Partial<Company> & { gstNumber?: string; taxRate?: number; gstEnabled?: boolean };
  };
  const migratedGst =
    parsed.gstProfiles?.length
      ? parsed.gstProfiles
      : [
          {
            id: "gst-1",
            label: "Main GST",
            gstNumber: parsed.company?.gstNumber || defaultGstProfiles[0].gstNumber,
            taxRate: parsed.company?.taxRate ?? defaultGstProfiles[0].taxRate,
            enabled: parsed.company?.gstEnabled ?? true,
          },
          defaultGstProfiles[1],
        ];

  return {
    ...seedStore,
    ...parsed,
    company: { ...defaultCompany, ...parsed.company },
    admin: { ...defaultAdmin, ...parsed.admin },
    gstProfiles: migratedGst,
    activeGstId: parsed.activeGstId || migratedGst[0].id,
    users: parsed.users?.length ? parsed.users : defaultUsers,
    parts: parsed.parts?.length ? parsed.parts : defaultParts,
    templates: parsed.templates?.length ? parsed.templates : seedStore.templates,
    customers: parsed.customers || [],
  };
}

function getActiveGst(store: Store) {
  return store.gstProfiles.find((gst) => gst.id === store.activeGstId) || store.gstProfiles[0] || defaultGstProfiles[0];
}

export default function Home() {
  const [role, setRole] = useState<Role | null>(null);
const [loginRole, setLoginRole] = useState<Role>("user");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [pin, setPin] = useState("");
  const [store, setStore] = useState<Store>(() => loadStore());
  const [dbReady, setDbReady] = useState(false);
  const [active, setActive] = useState<"invoice" | "admin">("invoice");
  const [customer, setCustomer] = useState<Customer>(emptyCustomer);
  const [items, setItems] = useState<LineItem[]>([newItem()]);
  const [invoiceNo, setInvoiceNo] = useState(invoiceNumber);
  const [templateSearch, setTemplateSearch] = useState("");
  const [newPart, setNewPart] = useState<Part>({ id: "", name: "", price: 0, hsn: "" });
  const [newUser, setNewUser] = useState<AppUser>(emptyUser);
  const [newGst, setNewGst] = useState<GstProfile>(emptyGst);
  const [status, setStatus] = useState("");
  const activeGst = getActiveGst(store);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => null);
    fetch("/api/store")
      .then((response) => response.json())
      .then((data: { store?: Store | null }) => {
        if (data.store) setStore({ ...seedStore, ...data.store });
      })
      .catch(() => null)
      .finally(() => setDbReady(true));
  }, []);

  useEffect(() => {
    localStorage.setItem("mechanic-invoice-store", JSON.stringify(store));
    if (!dbReady) return;
    const timeout = window.setTimeout(() => {
      fetch("/api/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(store),
      }).catch(() => null);
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [store, dbReady]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.price || 0), 0);
    const tax = activeGst.enabled ? (subtotal * activeGst.taxRate) / 100 : 0;
    return { subtotal, tax, total: subtotal + tax };
  }, [items, activeGst.enabled, activeGst.taxRate]);

  const matchedTemplates = store.templates.filter((template) =>
    `${template.keyword} ${template.title}`.toLowerCase().includes(templateSearch.toLowerCase()),
  );

  function login() {
    const user = store.users.find(
      (entry) => entry.active && entry.phone.replace(/\D/g, "") === loginPhone.replace(/\D/g, "") && entry.pin === pin,
    );
    const adminOk =
      store.admin.username.trim().toLowerCase() === adminUsername.trim().toLowerCase() &&
      store.admin.password === adminPassword;
    const ok = (loginRole === "admin" && adminOk) || (loginRole === "user" && Boolean(user));
    if (!ok) {
      setStatus("Wrong login details.");
      return;
    }
    setRole(loginRole);
    setActive(loginRole === "admin" ? "admin" : "invoice");
    setStatus("");
  }

  function updateItem(id: string, patch: Partial<LineItem>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function pickPart(itemId: string, partName: string) {
    const part = store.parts.find((entry) => entry.name === partName);
    updateItem(itemId, {
      name: partName,
      price: part?.price ?? 0,
      hsn: part?.hsn ?? "",
    });
  }

  function findCustomer(phone: string) {
    setCustomer((current) => ({ ...current, phone }));
    const found = store.customers.find((entry) => entry.phone === phone);
    if (found) setCustomer(found);
  }

  function saveCustomer() {
    if (!customer.name.trim() || !customer.phone.trim()) {
      setStatus("Name aur phone mandatory hai.");
      return false;
    }
    setStore((current) => ({
      ...current,
      customers: [
        customer,
        ...current.customers.filter((entry) => entry.phone !== customer.phone),
      ],
    }));
    setStatus("Customer saved.");
    return true;
  }

  function applyTemplate(template: Template) {
    setItems(template.items.map((item) => ({ ...item, id: crypto.randomUUID() })));
    setTemplateSearch(template.keyword);
  }

  function saveTemplate() {
    const keyword = templateSearch.trim();
    if (!keyword) {
      setStatus("Template keyword required.");
      return;
    }
    setStore((current) => ({
      ...current,
      templates: [
        { id: crypto.randomUUID(), keyword: keyword.toLowerCase(), title: keyword, items },
        ...current.templates.filter((template) => template.keyword !== keyword.toLowerCase()),
      ],
    }));
    setStatus("Template saved.");
  }

  async function createPdf() {
    const doc = new jsPDF();
    const company = store.company;
    if (company.logoUrl) {
      try {
        const logoBlob = await fetch(company.logoUrl).then((response) => response.blob());
        const logoData = await imageToDataUrl(logoBlob);
        doc.addImage(logoData, "PNG", 14, 10, 18, 18);
      } catch {
        doc.setFillColor(31, 79, 70);
        doc.rect(14, 10, 18, 18, "F");
      }
    }
    doc.setFontSize(18);
    doc.text(company.name, company.logoUrl ? 36 : 14, 18);
    doc.setFontSize(10);
    doc.text(company.address, company.logoUrl ? 36 : 14, 25);
    doc.text(`Phone: ${company.phone}  Email: ${company.email}`, 14, 34);
    doc.text(activeGst.enabled ? `GSTIN: ${activeGst.gstNumber}` : "Without GST bill", 14, 37);
    doc.setFontSize(14);
    doc.text("Tax Invoice", 150, 18);
    doc.setFontSize(10);
    doc.text(`Invoice: ${invoiceNo}`, 150, 26);
    doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, 150, 32);
    doc.text(`Customer: ${customer.name}`, 14, 50);
    doc.text(`Phone: ${customer.phone}`, 14, 56);
    doc.text(`Vehicle: ${customer.vehicle || "-"}`, 14, 62);
    doc.line(14, 70, 196, 70);
    doc.text("Item", 14, 78);
    doc.text("HSN", 95, 78);
    doc.text("Qty", 120, 78);
    doc.text("Rate", 140, 78);
    doc.text("Amount", 170, 78);
    let y = 86;
    items.forEach((item) => {
      const amount = Number(item.qty) * Number(item.price);
      doc.text(item.name || "Custom item", 14, y);
      doc.text(item.hsn || "-", 95, y);
      doc.text(String(item.qty), 122, y);
      doc.text(String(item.price), 140, y);
      doc.text(String(amount), 172, y);
      y += 8;
    });
    doc.line(14, y, 196, y);
    y += 10;
    doc.text(`Subtotal: ${money(totals.subtotal)}`, 140, y);
    y += 7;
    doc.text(`GST ${activeGst.enabled ? activeGst.taxRate : 0}%: ${money(totals.tax)}`, 140, y);
    y += 7;
    doc.setFontSize(12);
    doc.text(`Total: ${money(totals.total)}`, 140, y);
    return doc;
  }

  async function shareInvoice() {
    if (!saveCustomer()) return;
    const doc = await createPdf();
    const file = new File([doc.output("blob")], `${invoiceNo}.pdf`, { type: "application/pdf" });
    const message = store.company.whatsappMessage
      .replaceAll("{name}", customer.name)
      .replaceAll("{invoiceNo}", invoiceNo)
      .replaceAll("{total}", money(totals.total));

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title: invoiceNo, text: message, files: [file] });
      return;
    }
    doc.save(`${invoiceNo}.pdf`);
    window.open(`https://wa.me/91${customer.phone.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(message)}`);
  }

  if (!role) {
    return (
      <main className="min-h-screen bg-[#f7f4ef] text-[#191713]">
        <section className="mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-4 py-8 md:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#1f4f46] text-xl font-bold text-white">
              MI
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#9b3d22]">Mechanic Invoice PWA</p>
              <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight md:text-6xl">
                Workshop billing, GST invoice, templates, WhatsApp share.
              </h1>
            </div>
            <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
              {["Fixed GST for users", "Admin controls", "Mobile PWA"].map((label) => (
                <div key={label} className="rounded-lg border border-[#ded6ca] bg-white/70 p-4 text-sm font-medium">
                  {label}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-[#d7cdbf] bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#1f4f46]" />
              <h2 className="text-xl font-semibold">Login</h2>
            </div>
            <div className="mb-4 grid grid-cols-2 rounded-lg bg-[#f0ebe3] p-1">
              {(["user", "admin"] as Role[]).map((entry) => (
                <button
                  key={entry}
                  onClick={() => setLoginRole(entry)}
                  className={`rounded-md px-4 py-2 text-sm font-semibold capitalize ${
                    loginRole === entry ? "bg-white shadow-sm" : "text-[#756d61]"
                  }`}
                >
                  {entry}
                </button>
              ))}
            </div>
            {loginRole === "admin" ? (
              <>
                <label className="block text-sm font-medium">Username</label>
                <input
                  value={adminUsername}
                  onChange={(event) => setAdminUsername(event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-[#d7cdbf] px-3 outline-none focus:border-[#1f4f46]"
                  placeholder="Enter username"
                />
                <label className="mt-3 block text-sm font-medium">Password</label>
                <input
                  value={adminPassword}
                  onChange={(event) => setAdminPassword(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && login()}
                  className="mt-2 h-11 w-full rounded-md border border-[#d7cdbf] px-3 outline-none focus:border-[#1f4f46]"
                  placeholder="Enter password"
                  type="password"
                />
              </>
            ) : (
              <>
                <label className="mt-3 block text-sm font-medium">User phone</label>
                <input
                  value={loginPhone}
                  onChange={(event) => setLoginPhone(event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-[#d7cdbf] px-3 outline-none focus:border-[#1f4f46]"
                  placeholder="Enter phone"
                />
                <label className="mt-3 block text-sm font-medium">PIN</label>
                <input
                  value={pin}
                  onChange={(event) => setPin(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && login()}
                  className="mt-2 h-11 w-full rounded-md border border-[#d7cdbf] px-3 outline-none focus:border-[#1f4f46]"
                  placeholder="Enter PIN"
                  type="password"
                />
              </>
            )}
            <button onClick={login} className="mt-4 h-11 w-full rounded-md bg-[#1f4f46] font-semibold text-white">
              Continue
            </button>
            {status ? <p className="mt-3 text-sm text-[#9b3d22]">{status}</p> : null}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ef] text-[#191713]">
      <header className="sticky top-0 z-10 border-b border-[#ddd4c8] bg-[#f7f4ef]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {store.company.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={store.company.logoUrl} alt="" className="h-10 w-10 rounded-md bg-white object-contain p-1" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#1f4f46] font-bold text-white">
                {store.company.logoText}
              </div>
            )}
            <div>
              <p className="font-semibold">{store.company.name}</p>
              <p className="text-xs text-[#756d61]">
                {role === "admin" ? "Admin panel" : activeGst.enabled ? `GSTIN ${activeGst.gstNumber}` : "Without GST"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setActive("invoice")} className="rounded-md p-2 hover:bg-[#eee6db]" title="Invoice">
              <FileText className="h-5 w-5" />
            </button>
            {role === "admin" ? (
              <button onClick={() => setActive("admin")} className="rounded-md p-2 hover:bg-[#eee6db]" title="Admin">
                <Settings className="h-5 w-5" />
              </button>
            ) : null}
            <button onClick={() => setRole(null)} className="rounded-md p-2 hover:bg-[#eee6db]" title="Logout">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[1fr_340px]">
        {active === "invoice" ? (
          <>
            <section className="space-y-4">
              <Panel icon={<UserRound />} title="Customer">
                <div className="grid gap-3 md:grid-cols-4">
                  <Field label="Phone *">
                    <input value={customer.phone} onChange={(event) => findCustomer(event.target.value)} className="input" />
                  </Field>
                  <Field label="Name *">
                    <input value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} className="input" />
                  </Field>
                  <Field label="Email">
                    <input value={customer.email || ""} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} className="input" />
                  </Field>
                  <Field label="Vehicle">
                    <input value={customer.vehicle || ""} onChange={(event) => setCustomer({ ...customer, vehicle: event.target.value })} className="input" />
                  </Field>
                </div>
              </Panel>

              <Panel icon={<Search />} title="Template">
                <div className="flex flex-col gap-3 md:flex-row">
                  <input
                    value={templateSearch}
                    onChange={(event) => setTemplateSearch(event.target.value)}
                    className="input"
                    placeholder="brakeshoe change, oil service..."
                  />
                  <button onClick={saveTemplate} className="btn-secondary">
                    <Save className="h-4 w-4" /> Save current
                  </button>
                </div>
                {templateSearch ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {matchedTemplates.map((template) => (
                      <button key={template.id} onClick={() => applyTemplate(template)} className="rounded-md bg-[#e6efe9] px-3 py-2 text-sm font-medium text-[#1f4f46]">
                        {template.title}
                      </button>
                    ))}
                    {!matchedTemplates.length ? <span className="text-sm text-[#756d61]">No template. Current items save kar sakte ho.</span> : null}
                  </div>
                ) : null}
              </Panel>

              <Panel icon={<PackagePlus />} title="Invoice items">
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="grid gap-2 rounded-lg border border-[#e2d8cb] bg-[#fbfaf7] p-3 md:grid-cols-[1fr_90px_120px_90px_40px]">
                      <div>
                        <input list="parts" value={item.name} onChange={(event) => pickPart(item.id, event.target.value)} className="input" placeholder="Part or custom item" />
                      </div>
                      <input value={item.hsn} onChange={(event) => updateItem(item.id, { hsn: event.target.value })} className="input" placeholder="HSN" />
                      <input type="number" value={item.price} onChange={(event) => updateItem(item.id, { price: Number(event.target.value) })} className="input" placeholder="Rate" />
                      <input type="number" value={item.qty} onChange={(event) => updateItem(item.id, { qty: Number(event.target.value) })} className="input" placeholder="Qty" />
                      <button onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))} className="rounded-md p-2 text-[#9b3d22] hover:bg-[#f4e0d8]" title="Remove">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <datalist id="parts">
                  {store.parts.map((part) => <option key={part.id} value={part.name} />)}
                </datalist>
                <button onClick={() => setItems((current) => [...current, newItem()])} className="mt-3 btn-secondary">
                  <Plus className="h-4 w-4" /> Add item
                </button>
              </Panel>
            </section>

            <aside className="space-y-4">
              <Panel icon={<BadgeIndianRupee />} title="Summary">
                <Field label="Invoice no.">
                  <input value={invoiceNo} onChange={(event) => setInvoiceNo(event.target.value)} className="input" />
                </Field>
                <div className="mt-4 space-y-2 text-sm">
                  <Row label="Subtotal" value={money(totals.subtotal)} />
                  <Row label={`GST ${activeGst.enabled ? activeGst.taxRate : 0}%`} value={money(totals.tax)} />
                  <Row label="Total" value={money(totals.total)} strong />
                </div>
                <div className="mt-4 grid gap-2">
                  <button onClick={async () => (await createPdf()).save(`${invoiceNo}.pdf`)} className="btn-secondary">
                    <Download className="h-4 w-4" /> PDF
                  </button>
                  <button onClick={shareInvoice} className="btn-primary">
                    <MessageCircle className="h-4 w-4" /> WhatsApp share
                  </button>
                </div>
                {status ? <p className="mt-3 text-sm text-[#9b3d22]">{status}</p> : null}
              </Panel>
              <InvoicePreview
                company={store.company}
                gst={activeGst}
                customer={customer}
                invoiceNo={invoiceNo}
                items={items}
                totals={totals}
              />
            </aside>
          </>
        ) : (
          <AdminPanel
            store={store}
            setStore={setStore}
            newPart={newPart}
            setNewPart={setNewPart}
            newUser={newUser}
            setNewUser={setNewUser}
            newGst={newGst}
            setNewGst={setNewGst}
          />
        )}
      </div>
    </main>
  );
}

function AdminPanel({
  store,
  setStore,
  newPart,
  setNewPart,
  newUser,
  setNewUser,
  newGst,
  setNewGst,
}: {
  store: Store;
  setStore: React.Dispatch<React.SetStateAction<Store>>;
  newPart: Part;
  setNewPart: React.Dispatch<React.SetStateAction<Part>>;
  newUser: AppUser;
  setNewUser: React.Dispatch<React.SetStateAction<AppUser>>;
  newGst: GstProfile;
  setNewGst: React.Dispatch<React.SetStateAction<GstProfile>>;
}) {
  const [logoStatus, setLogoStatus] = useState("");
  const updateCompany = (patch: Partial<Company>) =>
    setStore((current) => ({ ...current, company: { ...current.company, ...patch } }));
  const updateAdmin = (patch: Partial<AdminAccount>) =>
    setStore((current) => ({ ...current, admin: { ...current.admin, ...patch } }));
  const activeGst = getActiveGst(store);

  async function uploadLogo(file: File | undefined) {
    if (!file) return;
    setLogoStatus("Uploading logo...");
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/logo", { method: "POST", body: formData });
    const data = (await response.json()) as { url?: string; error?: string };
    if (!response.ok || !data.url) {
      setLogoStatus(data.error || "Logo upload failed.");
      return;
    }
    updateCompany({ logoUrl: data.url });
    setLogoStatus("Logo uploaded.");
  }

  return (
    <section className="grid gap-4 lg:col-span-2 lg:grid-cols-[1fr_420px]">
      <Panel icon={<Building2 />} title="Company, GST, WhatsApp">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Company name"><input className="input" value={store.company.name} onChange={(e) => updateCompany({ name: e.target.value })} /></Field>
          <Field label="Logo text"><input className="input" value={store.company.logoText} onChange={(e) => updateCompany({ logoText: e.target.value })} /></Field>
          <Field label="Phone"><input className="input" value={store.company.phone} onChange={(e) => updateCompany({ phone: e.target.value })} /></Field>
          <Field label="Email"><input className="input" value={store.company.email} onChange={(e) => updateCompany({ email: e.target.value })} /></Field>
        </div>
        <div className="mt-4 grid gap-3 rounded-lg border border-[#e2d8cb] bg-[#fbfaf7] p-3 md:grid-cols-[96px_1fr]">
          {store.company.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.company.logoUrl} alt="" className="h-24 w-24 rounded-md bg-white object-contain p-2" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-md bg-[#1f4f46] text-xl font-bold text-white">
              {store.company.logoText}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold">Invoice logo</p>
            <p className="mt-1 text-xs text-[#756d61]">Logo Cloudinary me upload hoga aur invoice preview/PDF me use hoga.</p>
            <label className="btn-secondary mt-3 w-fit">
              <Upload className="h-4 w-4" /> Upload logo
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="sr-only"
                onChange={(event) => uploadLogo(event.target.files?.[0])}
              />
            </label>
            {store.company.logoUrl ? (
              <button className="ml-2 rounded-md px-3 py-2 text-sm font-semibold text-[#9b3d22]" onClick={() => updateCompany({ logoUrl: "" })}>
                Remove
              </button>
            ) : null}
            {logoStatus ? <p className="mt-2 text-xs text-[#756d61]">{logoStatus}</p> : null}
          </div>
        </div>
        <Field label="Address"><textarea className="input min-h-20 py-2" value={store.company.address} onChange={(e) => updateCompany({ address: e.target.value })} /></Field>
        <Field label="WhatsApp message">
          <textarea className="input min-h-24 py-2" value={store.company.whatsappMessage} onChange={(e) => updateCompany({ whatsappMessage: e.target.value })} />
        </Field>
        <p className="mt-2 text-xs text-[#756d61]">Variables: {"{name}"} {"{invoiceNo}"} {"{total}"}</p>
        <div className="mt-4 grid gap-3 rounded-lg border border-[#e2d8cb] bg-[#fbfaf7] p-3 md:grid-cols-2">
          <Field label="Admin username">
            <input className="input" value={store.admin.username} onChange={(e) => updateAdmin({ username: e.target.value })} />
          </Field>
          <Field label="Admin password">
            <input className="input" type="password" value={store.admin.password} onChange={(e) => updateAdmin({ password: e.target.value })} />
          </Field>
        </div>
      </Panel>

      <Panel icon={<ShieldCheck />} title="GST master">
        <Field label="Active GST profile">
          <select
            className="input"
            value={store.activeGstId}
            onChange={(event) => setStore((current) => ({ ...current, activeGstId: event.target.value }))}
          >
            {store.gstProfiles.map((gst) => (
              <option key={gst.id} value={gst.id}>
                {gst.label} {gst.enabled ? `- ${gst.gstNumber}` : "- Without GST"}
              </option>
            ))}
          </select>
        </Field>
        <label className="mt-4 flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={activeGst.enabled}
            onChange={(event) =>
              setStore((current) => ({
                ...current,
                gstProfiles: current.gstProfiles.map((gst) =>
                  gst.id === current.activeGstId ? { ...gst, enabled: event.target.checked } : gst,
                ),
              }))
            }
          />
          Add GST on invoices
        </label>
        <div className="mt-3 grid gap-2">
          <input className="input" placeholder="Label" value={newGst.label} onChange={(e) => setNewGst({ ...newGst, label: e.target.value })} />
          <input className="input" placeholder="GST number" value={newGst.gstNumber} onChange={(e) => setNewGst({ ...newGst, gstNumber: e.target.value.toUpperCase() })} />
          <div className="grid grid-cols-2 gap-2">
            <input className="input" type="number" placeholder="Tax %" value={newGst.taxRate} onChange={(e) => setNewGst({ ...newGst, taxRate: Number(e.target.value) })} />
            <label className="flex items-center gap-2 rounded-md border border-[#d7cdbf] px-3 text-sm font-semibold">
              <input type="checkbox" checked={newGst.enabled} onChange={(e) => setNewGst({ ...newGst, enabled: e.target.checked })} />
              GST
            </label>
          </div>
          <button
            className="btn-primary"
            onClick={() => {
              if (!newGst.label.trim()) return;
              const profile = { ...newGst, id: crypto.randomUUID(), taxRate: newGst.enabled ? Number(newGst.taxRate || 0) : 0 };
              setStore((current) => ({
                ...current,
                gstProfiles: [profile, ...current.gstProfiles],
                activeGstId: profile.id,
              }));
              setNewGst(emptyGst);
            }}
          >
            <Plus className="h-4 w-4" /> Save GST
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {store.gstProfiles.map((gst) => (
            <div key={gst.id} className="flex items-center justify-between rounded-md border border-[#e2d8cb] bg-[#fbfaf7] p-3 text-sm">
              <button
                className="text-left"
                onClick={() => setStore((current) => ({ ...current, activeGstId: gst.id }))}
              >
                <p className="font-semibold">{gst.label}</p>
                <p className="text-[#756d61]">{gst.enabled ? `${gst.gstNumber} - ${gst.taxRate}%` : "Without GST"}</p>
              </button>
              <button
                onClick={() =>
                  setStore((current) => {
                    const next = current.gstProfiles.filter((entry) => entry.id !== gst.id);
                    return { ...current, gstProfiles: next.length ? next : [defaultGstProfiles[1]], activeGstId: next[0]?.id || defaultGstProfiles[1].id };
                  })
                }
                className="rounded-md p-2 text-[#9b3d22] hover:bg-[#f4e0d8]"
                title="Delete GST"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </Panel>

      <Panel icon={<UsersRound />} title="Users">
        <div className="grid gap-2">
          <input className="input" placeholder="User name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
          <input className="input" placeholder="Phone" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} />
          <input className="input" placeholder="PIN" value={newUser.pin} onChange={(e) => setNewUser({ ...newUser, pin: e.target.value })} />
          <button
            className="btn-primary"
            onClick={() => {
              if (!newUser.name.trim() || !newUser.phone.trim() || !newUser.pin.trim()) return;
              setStore((current) => ({
                ...current,
                users: [
                  { ...newUser, id: crypto.randomUUID(), active: true },
                  ...current.users.filter((user) => user.phone.replace(/\D/g, "") !== newUser.phone.replace(/\D/g, "")),
                ],
              }));
              setNewUser(emptyUser);
            }}
          >
            <Plus className="h-4 w-4" /> Add user
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {store.users.map((user) => (
            <div key={user.id} className="flex items-center justify-between rounded-md border border-[#e2d8cb] bg-[#fbfaf7] p-3 text-sm">
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-[#756d61]">{user.phone} - PIN {user.pin}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setStore((current) => ({
                      ...current,
                      users: current.users.map((entry) => (entry.id === user.id ? { ...entry, active: !entry.active } : entry)),
                    }))
                  }
                  className="rounded-md border border-[#d7cdbf] px-2 py-1 text-xs font-semibold"
                >
                  {user.active ? "Active" : "Off"}
                </button>
                <button onClick={() => setStore((current) => ({ ...current, users: current.users.filter((entry) => entry.id !== user.id) }))} className="rounded-md p-2 text-[#9b3d22] hover:bg-[#f4e0d8]" title="Remove">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel icon={<PackagePlus />} title="Parts master">
        <div className="grid gap-2">
          <input className="input" placeholder="Part name" value={newPart.name} onChange={(e) => setNewPart({ ...newPart, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input className="input" placeholder="Price" type="number" value={newPart.price} onChange={(e) => setNewPart({ ...newPart, price: Number(e.target.value) })} />
            <input className="input" placeholder="HSN" value={newPart.hsn} onChange={(e) => setNewPart({ ...newPart, hsn: e.target.value })} />
          </div>
          <button
            className="btn-primary"
            onClick={() => {
              if (!newPart.name.trim()) return;
              setStore((current) => ({
                ...current,
                parts: [{ ...newPart, id: crypto.randomUUID() }, ...current.parts],
              }));
              setNewPart({ id: "", name: "", price: 0, hsn: "" });
            }}
          >
            <Plus className="h-4 w-4" /> Add part
          </button>
        </div>
        <div className="mt-4 max-h-[520px] space-y-2 overflow-auto">
          {store.parts.map((part) => (
            <div key={part.id} className="flex items-center justify-between rounded-md border border-[#e2d8cb] bg-[#fbfaf7] p-3 text-sm">
              <div>
                <p className="font-semibold">{part.name}</p>
                <p className="text-[#756d61]">{part.hsn} · {money(part.price)}</p>
              </div>
              <button onClick={() => setStore((current) => ({ ...current, parts: current.parts.filter((entry) => entry.id !== part.id) }))} className="rounded-md p-2 text-[#9b3d22] hover:bg-[#f4e0d8]" title="Remove">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function InvoicePreview({
  company,
  gst,
  customer,
  invoiceNo,
  items,
  totals,
}: {
  company: Company;
  gst: GstProfile;
  customer: Customer;
  invoiceNo: string;
  items: LineItem[];
  totals: { subtotal: number; tax: number; total: number };
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#d7cdbf] bg-white shadow-sm">
      <div className="border-b border-[#e8dfd4] bg-[#182f2b] px-4 py-3 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {company.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logoUrl} alt="" className="h-12 w-12 shrink-0 rounded-md bg-white object-contain p-1" />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white text-sm font-black text-[#182f2b]">
                {company.logoText}
              </div>
            )}
            <div>
              <p className="text-base font-bold">{company.name}</p>
              <p className="text-xs text-white/75">{company.phone}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-white/60">Invoice</p>
            <p className="font-mono text-sm font-semibold">{invoiceNo}</p>
          </div>
        </div>
      </div>
      <div className="space-y-4 p-4">
        <div className="grid gap-3 text-xs sm:grid-cols-2">
          <div className="rounded-md bg-[#f7f4ef] p-3">
            <p className="mb-1 font-bold text-[#756d61]">Bill To</p>
            <p className="font-semibold">{customer.name || "Customer name"}</p>
            <p>{customer.phone || "Phone number"}</p>
            <p>{customer.vehicle || "Vehicle details"}</p>
          </div>
          <div className="rounded-md bg-[#f7f4ef] p-3">
            <p className="mb-1 font-bold text-[#756d61]">Tax Profile</p>
            <p className="font-semibold">{gst.label}</p>
            <p>{gst.enabled ? gst.gstNumber : "Without GST"}</p>
            <p>{gst.enabled ? `${gst.taxRate}% GST` : "No tax added"}</p>
          </div>
        </div>
        <div className="overflow-hidden rounded-md border border-[#e8dfd4]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f0ebe3] text-[#756d61]">
              <tr>
                <th className="px-3 py-2">Description</th>
                <th className="px-2 py-2">Qty</th>
                <th className="px-2 py-2 text-right">Rate</th>
                <th className="px-3 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-[#eee8df]">
                  <td className="px-3 py-2">
                    <p className="font-medium">{item.name || "Custom item"}</p>
                    <p className="text-[#756d61]">HSN {item.hsn || "-"}</p>
                  </td>
                  <td className="px-2 py-2">{item.qty || 0}</td>
                  <td className="px-2 py-2 text-right">{money(item.price || 0)}</td>
                  <td className="px-3 py-2 text-right font-semibold">{money((item.qty || 0) * (item.price || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="ml-auto max-w-56 space-y-2 text-sm">
          <Row label="Subtotal" value={money(totals.subtotal)} />
          <Row label={`GST ${gst.enabled ? gst.taxRate : 0}%`} value={money(totals.tax)} />
          <Row label="Grand Total" value={money(totals.total)} strong />
        </div>
        <div className="rounded-md bg-[#f7f4ef] p-3 text-xs text-[#756d61]">
          <p className="font-semibold text-[#191713]">Thank you for your business.</p>
          <p>{company.address}</p>
        </div>
      </div>
    </div>
  );
}

function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[#d7cdbf] bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-[#1f4f46] [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
        <h2 className="font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium">
      <span className="mb-1 mt-3 block">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${strong ? "border-t border-[#ddd4c8] pt-3 text-lg font-bold" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
