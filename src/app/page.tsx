"use client";

import {
  BadgeIndianRupee,
  Building2,
  Car,
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
import { Fragment, useEffect, useMemo, useState } from "react";

type Role = "user" | "admin";
type ItemType = "part" | "labour";

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
  partNumber: string;
  hsn?: string;
  type?: ItemType;
};

type LineItem = {
  id: string;
  name: string;
  qty: number;
  price: number;
  partNumber: string;
  hsn?: string;
  type: ItemType;
  batch?: string;
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

type JobDetails = {
  registrationNo: string;
  jobCardNo: string;
  jobCardDate: string;
  model: string;
  chassisNo: string;
  mileage: string;
  serviceAdvisor: string;
  serviceType: string;
  placeOfSupply: string;
  pan: string;
  customerGstin: string;
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
  name: "CAR MECHANIC",
  address: "Plot No. H-98 Sarita Vihar, Kalindi Kunj, New Delhi 110025",
  phone: "+91 97187 17540",
  email: "carmechanic99722@gmail.com",
  logoText: "CM",
  logoUrl: "/WhatsApp%20Image%202026-06-22%20at%2016.05.29%20(1).jpeg",
  whatsappMessage:
    "Namaste {name}, CAR MECHANIC invoice {invoiceNo} ready hai. Total amount Rs {total}. Dhanyavaad.",
};

const defaultGstProfiles: GstProfile[] = [
  {
    id: "gst-car-mechanic",
    label: "CAR MECHANIC GST",
    gstNumber: "07AARFC9099A1Z2",
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
  { id: "p1", name: "Gasket", price: 10.16, partNumber: "09168M14012", type: "part" },
  { id: "p2", name: "Element, air cleaner", price: 406.77, partNumber: "13780M50R00", type: "part" },
  { id: "p3", name: "Filter assy, oil", price: 88.98, partNumber: "16510M65L10", type: "part" },
  { id: "p4", name: "Paper floor mat", price: 2.54, partNumber: "99000M24121-137", type: "part" },
  { id: "p5", name: "Super long life coolant", price: 317.79, partNumber: "99000M24121-246", type: "part" },
  { id: "p6", name: "Grease sachet, caliper pin", price: 16.94, partNumber: "99000M25010", type: "part" },
  { id: "p7", name: "PMS - 1P 20K", price: 1625, partNumber: "ZE61L0P", type: "labour" },
  { id: "p8", name: "Front brake caliper assy", price: 408, partNumber: "MK02R0", type: "labour" },
  { id: "p9", name: "Wheel alignment", price: 440, partNumber: "ZA11L0", type: "labour" },
];

const seedStore: Store = {
  company: defaultCompany,
  admin: defaultAdmin,
  gstProfiles: defaultGstProfiles,
  activeGstId: "gst-car-mechanic",
  users: defaultUsers,
  parts: defaultParts,
  templates: [
    {
      id: "t1",
      keyword: "periodic maintenance",
      title: "Periodic maintenance service",
      items: [
        { id: "i1", name: "Filter assy, oil", qty: 1, price: 88.98, partNumber: "16510M65L10", type: "part" },
        { id: "i2", name: "PMS - 1P 20K", qty: 1, price: 1625, partNumber: "ZE61L0P", type: "labour" },
      ],
    },
  ],
  customers: [],
};

const emptyCustomer: Customer = { name: "", phone: "", email: "", vehicle: "" };
const emptyJobDetails: JobDetails = {
  registrationNo: "",
  jobCardNo: "",
  jobCardDate: "",
  model: "",
  chassisNo: "",
  mileage: "",
  serviceAdvisor: "",
  serviceType: "Periodic Maintenance Service",
  placeOfSupply: "DELHI",
  pan: "",
  customerGstin: "",
};
const newItem = (): LineItem => ({
  id: crypto.randomUUID(),
  name: "",
  qty: 1,
  price: 0,
  partNumber: "",
  type: "part",
  batch: "",
});
const invoiceNumber = () => `BR/${new Date().getFullYear().toString().slice(-2)}${Date.now().toString().slice(-6)}`;
const emptyUser: AppUser = { id: "", name: "", phone: "", pin: "", active: true };
const emptyGst: GstProfile = { id: "", label: "", gstNumber: "", taxRate: 18, enabled: true };

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function pdfMoney(value: number) {
  return Number(value || 0).toFixed(2);
}

function imageToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function normalizePart(part: Partial<Part>): Part {
  return {
    id: part.id || crypto.randomUUID(),
    name: part.name || "",
    price: Number(part.price || 0),
    partNumber: part.partNumber || part.hsn || "",
    hsn: part.hsn,
    type: part.type || "part",
  };
}

function normalizeItem(item: Partial<LineItem>): LineItem {
  return {
    id: item.id || crypto.randomUUID(),
    name: item.name || "",
    qty: Number(item.qty || 1),
    price: Number(item.price || 0),
    partNumber: item.partNumber || item.hsn || "",
    hsn: item.hsn,
    type: item.type || "part",
    batch: item.batch || "",
  };
}

function normalizeStore(input: Partial<Store> | null | undefined): Store {
  const parsed = input || {};
  const oldCompany = parsed.company as (Partial<Company> & { gstNumber?: string; taxRate?: number; gstEnabled?: boolean }) | undefined;
  const migratedGst =
    parsed.gstProfiles?.length
      ? parsed.gstProfiles
      : [
          {
            id: "gst-car-mechanic",
            label: "CAR MECHANIC GST",
            gstNumber: oldCompany?.gstNumber || defaultGstProfiles[0].gstNumber,
            taxRate: oldCompany?.taxRate ?? defaultGstProfiles[0].taxRate,
            enabled: oldCompany?.gstEnabled ?? true,
          },
          defaultGstProfiles[1],
        ];

  return {
    ...seedStore,
    ...parsed,
    company: { ...defaultCompany, ...parsed.company },
    admin: { ...defaultAdmin, ...parsed.admin },
    gstProfiles: migratedGst.map((gst) => ({ ...gst, gstNumber: gst.gstNumber || "" })),
    activeGstId: parsed.activeGstId || migratedGst[0]?.id || defaultGstProfiles[0].id,
    users: parsed.users?.length ? parsed.users : defaultUsers,
    parts: parsed.parts?.length ? parsed.parts.map(normalizePart) : defaultParts,
    templates: parsed.templates?.length
      ? parsed.templates.map((template) => ({
          ...template,
          items: template.items.map(normalizeItem),
        }))
      : seedStore.templates,
    customers: parsed.customers || [],
  };
}

function loadStore(): Store {
  if (typeof window === "undefined") return seedStore;
  const raw = localStorage.getItem("mechanic-invoice-store");
  return raw ? normalizeStore(JSON.parse(raw)) : seedStore;
}

function getActiveGst(store: Store) {
  return store.gstProfiles.find((gst) => gst.id === store.activeGstId) || store.gstProfiles[0] || defaultGstProfiles[0];
}

function splitItems(items: LineItem[]) {
  return {
    parts: items.filter((item) => item.type === "part"),
    labour: items.filter((item) => item.type === "labour"),
  };
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
  const [jobDetails, setJobDetails] = useState<JobDetails>(emptyJobDetails);
  const [items, setItems] = useState<LineItem[]>([newItem()]);
  const [invoiceNo, setInvoiceNo] = useState(invoiceNumber);
  const [templateSearch, setTemplateSearch] = useState("");
  const [newPart, setNewPart] = useState<Part>({ id: "", name: "", price: 0, partNumber: "", type: "part" });
  const [newUser, setNewUser] = useState<AppUser>(emptyUser);
  const [newGst, setNewGst] = useState<GstProfile>(emptyGst);
  const [partPickerItemId, setPartPickerItemId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const activeGst = getActiveGst(store);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => null);
    fetch("/api/store")
      .then((response) => response.json())
      .then((data: { store?: Store | null }) => {
        if (data.store) setStore(normalizeStore(data.store));
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
    const total = subtotal + tax;
    return {
      subtotal,
      tax,
      cgst: activeGst.enabled ? tax / 2 : 0,
      sgst: activeGst.enabled ? tax / 2 : 0,
      total,
      rounded: Math.round(total),
    };
  }, [items, activeGst.enabled, activeGst.taxRate]);

  const matchedTemplates = store.templates.filter((template) =>
    `${template.keyword} ${template.title}`.toLowerCase().includes(templateSearch.toLowerCase()),
  );
  const pickerItem = items.find((item) => item.id === partPickerItemId);
  const pickerQuery = pickerItem?.name.trim().toLowerCase() || "";
  const pickerType: ItemType = pickerItem?.type || "part";
  const pickerOptions = store.parts.filter((part) => (part.type || "part") === pickerType);
  const filteredParts = pickerOptions.filter((part) =>
    `${part.name} ${part.partNumber}`.toLowerCase().includes(pickerQuery),
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
      partNumber: part?.partNumber ?? "",
      type: part?.type || "part",
    });
  }

  function typePartName(itemId: string, partName: string) {
    const part = store.parts.find((entry) => entry.name.toLowerCase() === partName.toLowerCase());
    updateItem(
      itemId,
      part ? { name: part.name, price: part.price, partNumber: part.partNumber, type: part.type || "part" } : { name: partName },
    );
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
    setItems(template.items.map((item) => ({ ...normalizeItem(item), id: crypto.randomUUID() })));
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
    const doc = new jsPDF({ unit: "pt", format: [864, 1080] });
    const pageWidth = 864;
    const margin = 44;
    const tableWidth = pageWidth - margin * 2;
    const sectioned = splitItems(items);

    doc.setFont("courier", "bold");
    doc.setFontSize(10);
    doc.text("ORIGINAL FOR RECIPIENT/DUPLICATE FOR TRANSPORTER/TRIPLICATE FOR SUPPLIER", pageWidth / 2, 28, { align: "center" });
    doc.setFillColor(205, 205, 205);
    doc.rect(margin, 54, tableWidth, 21, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.text("Job Card Retail - Tax Invoice", pageWidth / 2, 70, { align: "center" });

    if (store.company.logoUrl) {
      try {
        const logoBlob = await fetch(store.company.logoUrl).then((response) => response.blob());
        const logoData = await imageToDataUrl(logoBlob);
        doc.addImage(logoData, "PNG", margin, 92, 46, 46);
      } catch {
        doc.setFillColor(200, 20, 20);
        doc.rect(margin, 92, 46, 46, "F");
      }
    } else {
      doc.setFillColor(200, 20, 20);
      doc.rect(margin, 92, 46, 46, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(store.company.logoText, margin + 23, 121, { align: "center" });
      doc.setTextColor(0, 0, 0);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(store.company.name, margin + 56, 106);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(store.company.address, margin + 56, 121, { maxWidth: 280 });
    doc.text(`${store.company.phone} | ${store.company.email}`, margin + 56, 144);
    doc.text(activeGst.enabled ? `Dealer GSTIN : ${activeGst.gstNumber}` : "Without GST bill", margin + 56, 158);

    const y = 206;
    doc.setFontSize(10);
    const leftRows = [
      ["Customer Name & Address", customer.name || "-"],
      ["Mobile", customer.phone || "-"],
      ["Email", customer.email || "-"],
      ["Customer GSTIN/UIN", jobDetails.customerGstin || "N/A"],
      ["PAN", jobDetails.pan || "N/A"],
    ];
    const rightRows = [
      ["Invoice No.", invoiceNo],
      ["Date", new Date().toLocaleString("en-IN")],
      ["Job Card No.", jobDetails.jobCardNo || "-"],
      ["Job Card Date", jobDetails.jobCardDate || "-"],
      ["Reg.No.", jobDetails.registrationNo || customer.vehicle || "-"],
      ["Model", jobDetails.model || "-"],
      ["Chassis No.", jobDetails.chassisNo || "-"],
      ["Mileage", jobDetails.mileage || "-"],
      ["SA Name", jobDetails.serviceAdvisor || "-"],
      ["Service type", jobDetails.serviceType || "-"],
      ["Place of Supply", jobDetails.placeOfSupply || "-"],
    ];
    leftRows.forEach((row, index) => {
      doc.text(`${row[0]} :`, margin, y + index * 16);
      doc.text(row[1], margin + 130, y + index * 16, { maxWidth: 210 });
    });
    rightRows.forEach((row, index) => {
      const x = index < 5 ? 390 : 610;
      const rowY = y + (index < 5 ? index : index - 5) * 16;
      doc.text(`${row[0]} :`, x, rowY);
      doc.text(row[1], x + 82, rowY, { maxWidth: 150 });
    });

    const tableTop = 410;
    doc.setFillColor(204, 204, 204);
    doc.rect(margin, tableTop, tableWidth, 38, "F");
    doc.setDrawColor(0, 0, 0);
    doc.rect(margin, tableTop, tableWidth, 38);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const cols = [
      ["Srl.", margin + 2],
      ["Part Number", margin + 34],
      ["Description", margin + 138],
      ["Batch", margin + 300],
      ["Tax", margin + 392],
      ["Qty.", margin + 446],
      ["Rate", margin + 520],
      ["Taxable\nAmount", margin + 580],
      ["Tax Paid\nAmount", margin + 672],
      ["Labour\nCharges", margin + 750],
    ] as const;
    cols.forEach(([label, xPos]) => doc.text(label, xPos, tableTop + 17));

    let rowY = tableTop + 52;
    let serial = 1;
    const drawSection = (title: string, rows: LineItem[]) => {
      if (!rows.length) return;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(title, margin + 2, rowY);
      doc.line(margin, rowY + 4, margin + tableWidth, rowY + 4);
      rowY += 17;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Demanded Repairs-Others/Suggested Jobs", margin + 2, rowY);
      rowY += 16;
      rows.forEach((item) => {
        const amount = item.qty * item.price;
        const tax = activeGst.enabled ? (amount * activeGst.taxRate) / 100 : 0;
        doc.text(String(serial), margin + 2, rowY);
        doc.text(item.partNumber || "-", margin + 34, rowY);
        doc.text(item.name || "Custom item", margin + 138, rowY, { maxWidth: 150 });
        doc.text(item.batch || "-", margin + 300, rowY);
        doc.text(`${activeGst.enabled ? activeGst.taxRate : 0}%`, margin + 392, rowY);
        doc.text(item.qty.toFixed(3), margin + 446, rowY);
        doc.text(pdfMoney(item.price), margin + 520, rowY, { align: "right" });
        doc.text(item.type === "part" ? pdfMoney(amount) : "0.00", margin + 640, rowY, { align: "right" });
        doc.text(pdfMoney(tax), margin + 720, rowY, { align: "right" });
        doc.text(item.type === "labour" ? pdfMoney(amount) : "0.00", margin + 820, rowY, { align: "right" });
        rowY += 16;
        serial += 1;
      });
      doc.line(margin, rowY + 2, margin + tableWidth, rowY + 2);
      rowY += 18;
    };

    drawSection("Parts", sectioned.parts);
    drawSection("Labour", sectioned.labour);

    const totalsY = Math.max(rowY + 70, 720);
    doc.line(margin, totalsY - 24, pageWidth - margin, totalsY - 24);
    doc.setFontSize(11);
    doc.text("Recommendations :", margin, totalsY - 10);
    doc.line(310, totalsY - 22, 310, totalsY + 148);
    doc.setFont("helvetica", "normal");
    const partSubtotal = sectioned.parts.reduce((sum, item) => sum + item.qty * item.price, 0);
    const labourSubtotal = sectioned.labour.reduce((sum, item) => sum + item.qty * item.price, 0);
    const partTax = activeGst.enabled ? (partSubtotal * activeGst.taxRate) / 100 : 0;
    const labourTax = activeGst.enabled ? (labourSubtotal * activeGst.taxRate) / 100 : 0;
    const totalRows: Array<[string, number, number]> = [
      ["Sub Total Amount", partSubtotal, labourSubtotal],
      ["Less Discount on Parts & Labour", 0, 0],
      [`CGST @ ${activeGst.enabled ? activeGst.taxRate / 2 : 0}%`, partTax / 2, labourTax / 2],
      [`SGST @ ${activeGst.enabled ? activeGst.taxRate / 2 : 0}%`, partTax / 2, labourTax / 2],
      ["Sub Total Amount", partSubtotal + partTax, labourSubtotal + labourTax],
      ["Net Bill Amount (Rounded)", 0, totals.rounded],
    ];
    totalRows.forEach((row, index) => {
      const yy = totalsY + index * 17;
      doc.text(row[0], 318, yy);
      doc.text(":", 585, yy);
      doc.text(pdfMoney(row[1]), 650, yy, { align: "right" });
      doc.text(pdfMoney(row[2]), 820, yy, { align: "right" });
      if (index === 4) doc.line(318, yy - 11, 820, yy - 11);
    });
    doc.setFont("helvetica", "bold");
    doc.text(`For ${store.company.name}`, 170, totalsY + 65, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.text("Authorised Signatory", 170, totalsY + 92, { align: "center" });

    const footerY = 910;
    doc.line(margin, footerY - 22, pageWidth - margin, footerY - 22);
    doc.setFontSize(8);
    doc.text(
      "I acknowledge that the jobs/repairs/service carried out in my vehicle and estimates were explained to me. I confirm completion of repairs to my satisfaction.",
      margin,
      footerY,
      { maxWidth: 520 },
    );
    doc.setFontSize(12);
    doc.text("Customer Signature", 585, footerY + 20);
    doc.text("Mobile No.", 720, footerY + 20);
    doc.setFillColor(210, 210, 210);
    doc.rect(margin, footerY + 76, tableWidth, 20, "F");
    doc.text("Gate Pass", pageWidth / 2, footerY + 91, { align: "center" });
    doc.setFontSize(10);
    doc.text(`GP No. : ${jobDetails.jobCardNo || "-"}`, margin, footerY + 116);
    doc.text(`Cust. Name : ${customer.name || "-"}`, margin, footerY + 132);
    doc.text(`Reg.No. : ${jobDetails.registrationNo || customer.vehicle || "-"}`, 330, footerY + 132);
    doc.text(`Bill No. : ${invoiceNo}`, 610, footerY + 116);
    doc.text(`Amount : ${pdfMoney(totals.rounded)}`, 720, footerY + 116);
    return doc;
  }

  async function shareInvoice() {
    if (!saveCustomer()) return;
    const doc = await createPdf();
    const file = new File([doc.output("blob")], `${invoiceNo}.pdf`, { type: "application/pdf" });
    const message = store.company.whatsappMessage
      .replaceAll("{name}", customer.name)
      .replaceAll("{invoiceNo}", invoiceNo)
      .replaceAll("{total}", money(totals.rounded));

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title: invoiceNo, text: message, files: [file] });
      return;
    }
    doc.save(`${invoiceNo}.pdf`);
    window.open(`https://wa.me/91${customer.phone.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(message)}`);
  }

  if (!role) {
    return (
      <main className="car-bg-login min-h-screen text-white">
        <section className="mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-4 py-8 md:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            {store.company.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={store.company.logoUrl} alt="" className="h-24 w-24 rounded-md bg-white object-contain p-2 shadow-2xl" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-[#d3121c] text-xl font-black text-white">
                {store.company.logoText}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#ff2b35]">CAR MECHANIC</p>
              <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight md:text-6xl">
                Job-card invoices for serious workshop billing.
              </h1>
              <p className="mt-4 max-w-xl text-sm text-zinc-300">
                GST, parts, labour, vehicle details, PDF invoice, and WhatsApp sharing in one red-black workshop console.
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-[#111]/90 p-5 shadow-2xl backdrop-blur">
            <div className="mb-5 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#ff2b35]" />
              <h2 className="text-xl font-semibold">Login</h2>
            </div>
            <div className="mb-4 grid grid-cols-2 rounded-md bg-black p-1">
              {(["user", "admin"] as Role[]).map((entry) => (
                <button
                  key={entry}
                  onClick={() => setLoginRole(entry)}
                  className={`rounded px-4 py-2 text-sm font-semibold capitalize ${
                    loginRole === entry ? "bg-[#d3121c] text-white" : "text-zinc-400"
                  }`}
                >
                  {entry}
                </button>
              ))}
            </div>
            {loginRole === "admin" ? (
              <>
                <label className="block text-sm font-medium">Username</label>
                <input value={adminUsername} onChange={(event) => setAdminUsername(event.target.value)} className="input mt-2" placeholder="Enter username" />
                <label className="mt-3 block text-sm font-medium">Password</label>
                <input
                  value={adminPassword}
                  onChange={(event) => setAdminPassword(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && login()}
                  className="input mt-2"
                  placeholder="Enter password"
                  type="password"
                />
              </>
            ) : (
              <>
                <label className="mt-3 block text-sm font-medium">User phone</label>
                <input value={loginPhone} onChange={(event) => setLoginPhone(event.target.value)} className="input mt-2" placeholder="Enter phone" />
                <label className="mt-3 block text-sm font-medium">PIN</label>
                <input
                  value={pin}
                  onChange={(event) => setPin(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && login()}
                  className="input mt-2"
                  placeholder="Enter PIN"
                  type="password"
                />
              </>
            )}
            <button onClick={login} className="btn-primary mt-4 w-full">
              Continue
            </button>
            {status ? <p className="mt-3 text-sm text-[#ff525a]">{status}</p> : null}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="car-bg-app min-h-screen text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-black/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {store.company.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={store.company.logoUrl} alt="" className="h-10 w-10 rounded-md bg-white object-contain p-1" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#d3121c] font-black text-white">
                {store.company.logoText}
              </div>
            )}
            <div>
              <p className="font-bold">{store.company.name}</p>
              <p className="text-xs text-zinc-400">
                {role === "admin" ? "Admin panel" : activeGst.enabled ? `GSTIN ${activeGst.gstNumber}` : "Without GST"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setActive("invoice")} className="rounded-md p-2 hover:bg-zinc-900" title="Invoice">
              <FileText className="h-5 w-5" />
            </button>
            {role === "admin" ? (
              <button onClick={() => setActive("admin")} className="rounded-md p-2 hover:bg-zinc-900" title="Admin">
                <Settings className="h-5 w-5" />
              </button>
            ) : null}
            <button onClick={() => setRole(null)} className="rounded-md p-2 hover:bg-zinc-900" title="Logout">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[1fr_390px]">
        {active === "invoice" ? (
          <>
            <section className="space-y-4">
              <Panel icon={<UserRound />} title="Customer">
                <div className="grid gap-3 md:grid-cols-4">
                  <Field label="Phone *"><input value={customer.phone} onChange={(event) => findCustomer(event.target.value)} className="input" /></Field>
                  <Field label="Name *"><input value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} className="input" /></Field>
                  <Field label="Email"><input value={customer.email || ""} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} className="input" /></Field>
                  <Field label="Vehicle"><input value={customer.vehicle || ""} onChange={(event) => setCustomer({ ...customer, vehicle: event.target.value })} className="input" /></Field>
                </div>
              </Panel>

              <Panel icon={<Car />} title="Vehicle and job card">
                <div className="grid gap-3 md:grid-cols-4">
                  <Field label="Registration no."><input value={jobDetails.registrationNo} onChange={(e) => setJobDetails({ ...jobDetails, registrationNo: e.target.value.toUpperCase() })} className="input" /></Field>
                  <Field label="Job card no."><input value={jobDetails.jobCardNo} onChange={(e) => setJobDetails({ ...jobDetails, jobCardNo: e.target.value })} className="input" /></Field>
                  <Field label="Job card date"><input type="date" value={jobDetails.jobCardDate} onChange={(e) => setJobDetails({ ...jobDetails, jobCardDate: e.target.value })} className="input" /></Field>
                  <Field label="Model"><input value={jobDetails.model} onChange={(e) => setJobDetails({ ...jobDetails, model: e.target.value.toUpperCase() })} className="input" /></Field>
                  <Field label="Chassis no."><input value={jobDetails.chassisNo} onChange={(e) => setJobDetails({ ...jobDetails, chassisNo: e.target.value })} className="input" /></Field>
                  <Field label="Mileage"><input value={jobDetails.mileage} onChange={(e) => setJobDetails({ ...jobDetails, mileage: e.target.value })} className="input" /></Field>
                  <Field label="Service advisor"><input value={jobDetails.serviceAdvisor} onChange={(e) => setJobDetails({ ...jobDetails, serviceAdvisor: e.target.value })} className="input" /></Field>
                  <Field label="Service type"><input value={jobDetails.serviceType} onChange={(e) => setJobDetails({ ...jobDetails, serviceType: e.target.value })} className="input" /></Field>
                  <Field label="Place of supply"><input value={jobDetails.placeOfSupply} onChange={(e) => setJobDetails({ ...jobDetails, placeOfSupply: e.target.value.toUpperCase() })} className="input" /></Field>
                  <Field label="PAN"><input value={jobDetails.pan} onChange={(e) => setJobDetails({ ...jobDetails, pan: e.target.value.toUpperCase() })} className="input" /></Field>
                  <Field label="Customer GSTIN/UIN"><input value={jobDetails.customerGstin} onChange={(e) => setJobDetails({ ...jobDetails, customerGstin: e.target.value.toUpperCase() })} className="input" /></Field>
                </div>
              </Panel>

              <Panel icon={<Search />} title="Template">
                <div className="flex flex-col gap-3 md:flex-row">
                  <input value={templateSearch} onChange={(event) => setTemplateSearch(event.target.value)} className="input" placeholder="periodic maintenance..." />
                  <button onClick={saveTemplate} className="btn-secondary"><Save className="h-4 w-4" /> Save current</button>
                </div>
                {templateSearch ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {matchedTemplates.map((template) => (
                      <button key={template.id} onClick={() => applyTemplate(template)} className="rounded-md bg-[#2a0d10] px-3 py-2 text-sm font-medium text-[#ff525a]">
                        {template.title}
                      </button>
                    ))}
                    {!matchedTemplates.length ? <span className="text-sm text-zinc-400">No template. Current items save kar sakte ho.</span> : null}
                  </div>
                ) : null}
              </Panel>

              <Panel icon={<PackagePlus />} title="Invoice items">
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="grid gap-2 rounded-lg border border-zinc-800 bg-[#111] p-3 md:grid-cols-[110px_1fr_130px_100px_100px_44px]">
                      <select value={item.type} onChange={(event) => updateItem(item.id, { type: event.target.value as ItemType })} className="input">
                        <option value="part">Part</option>
                        <option value="labour">Labour</option>
                      </select>
                      <div className="flex gap-2">
                        <input value={item.name} onChange={(event) => typePartName(item.id, event.target.value)} onFocus={() => setPartPickerItemId(item.id)} className="input" placeholder="Part or labour item" />
                        <button onClick={() => setPartPickerItemId(item.id)} className="rounded-md border border-zinc-700 bg-black px-3 text-[#ff2b35]" title="Search parts">
                          <Search className="h-4 w-4" />
                        </button>
                      </div>
                      <input value={item.partNumber} onChange={(event) => updateItem(item.id, { partNumber: event.target.value })} className="input" placeholder="Part Number" />
                      <input type="number" value={item.price} onChange={(event) => updateItem(item.id, { price: Number(event.target.value) })} className="input" placeholder="Rate" />
                      <input type="number" value={item.qty} onChange={(event) => updateItem(item.id, { qty: Number(event.target.value) })} className="input" placeholder="Qty" />
                      <button onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))} className="rounded-md p-2 text-[#ff525a] hover:bg-[#2a0d10]" title="Remove">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={() => setItems((current) => [...current, newItem()])} className="btn-secondary mt-3"><Plus className="h-4 w-4" /> Add item</button>
              </Panel>
            </section>

            <aside className="space-y-4">
              <Panel icon={<BadgeIndianRupee />} title="Summary">
                <Field label="Invoice no."><input value={invoiceNo} onChange={(event) => setInvoiceNo(event.target.value)} className="input" /></Field>
                <div className="mt-4 space-y-2 text-sm">
                  <Row label="Subtotal" value={money(totals.subtotal)} />
                  <Row label={`CGST ${activeGst.enabled ? activeGst.taxRate / 2 : 0}%`} value={money(totals.cgst)} />
                  <Row label={`SGST ${activeGst.enabled ? activeGst.taxRate / 2 : 0}%`} value={money(totals.sgst)} />
                  <Row label="Rounded total" value={money(totals.rounded)} strong />
                </div>
                <div className="mt-4 grid gap-2">
                  <button onClick={async () => (await createPdf()).save(`${invoiceNo}.pdf`)} className="btn-secondary"><Download className="h-4 w-4" /> PDF</button>
                  <button onClick={shareInvoice} className="btn-primary"><MessageCircle className="h-4 w-4" /> WhatsApp share</button>
                </div>
                {status ? <p className="mt-3 text-sm text-[#ff525a]">{status}</p> : null}
              </Panel>
              <InvoicePreview company={store.company} gst={activeGst} customer={customer} jobDetails={jobDetails} invoiceNo={invoiceNo} items={items} totals={totals} />
            </aside>
          </>
        ) : (
          <AdminPanel store={store} setStore={setStore} newPart={newPart} setNewPart={setNewPart} newUser={newUser} setNewUser={setNewUser} newGst={newGst} setNewGst={setNewGst} />
        )}
      </div>

      {partPickerItemId ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/70 p-0 sm:items-center sm:p-6">
          <div className="max-h-[82vh] w-full overflow-hidden rounded-t-xl border border-zinc-800 bg-[#111] shadow-xl sm:mx-auto sm:max-w-lg sm:rounded-xl">
            <div className="border-b border-zinc-800 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">Select {pickerType === "part" ? "part" : "labour"}</p>
                  <p className="text-xs text-zinc-400">Search by name or part number.</p>
                </div>
                <button className="rounded-md border border-zinc-700 px-3 py-2 text-sm font-semibold" onClick={() => setPartPickerItemId(null)}>Close</button>
              </div>
              <input value={pickerItem?.name || ""} onChange={(event) => partPickerItemId && typePartName(partPickerItemId, event.target.value)} className="input mt-3" autoFocus placeholder={`Search ${pickerType === "part" ? "parts" : "labour"}...`} />
            </div>
            <div className="max-h-[58vh] overflow-y-auto p-3">
              {(pickerQuery ? filteredParts : pickerOptions).map((part) => (
                <button
                  key={part.id}
                  onClick={() => {
                    pickPart(partPickerItemId, part.name);
                    setPartPickerItemId(null);
                  }}
                  className="mb-2 flex w-full items-center justify-between rounded-lg border border-zinc-800 bg-black p-3 text-left"
                >
                  <span>
                    <span className="block font-semibold">{part.name}</span>
                    <span className="block text-xs text-zinc-400">Part Number {part.partNumber || "-"} · {money(part.price)}</span>
                  </span>
                  <span className="text-sm font-bold text-[#ff2b35]">Select</span>
                </button>
              ))}
              {pickerQuery && !filteredParts.length ? (
                <p className="rounded-lg border border-zinc-800 bg-black p-4 text-sm text-zinc-400">
                  No matching {pickerType === "part" ? "parts" : "labour"} found.
                </p>
              ) : null}
              {!pickerOptions.length ? (
                <p className="rounded-lg border border-zinc-800 bg-black p-4 text-sm text-zinc-400">
                  No saved {pickerType === "part" ? "parts" : "labour"} found. Admin panel se add karo.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
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
        <div className="mt-4 grid gap-3 rounded-lg border border-zinc-800 bg-black p-3 md:grid-cols-[96px_1fr]">
          {store.company.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.company.logoUrl} alt="" className="h-24 w-24 rounded-md bg-white object-contain p-2" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-md bg-[#d3121c] text-xl font-black text-white">{store.company.logoText}</div>
          )}
          <div>
            <p className="text-sm font-semibold">Invoice logo</p>
            <p className="mt-1 text-xs text-zinc-400">Logo Cloudinary me upload hoga aur invoice preview/PDF me use hoga.</p>
            <label className="btn-secondary mt-3 w-fit">
              <Upload className="h-4 w-4" /> Upload logo
              <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only" onChange={(event) => uploadLogo(event.target.files?.[0])} />
            </label>
            {store.company.logoUrl ? <button className="ml-2 rounded-md px-3 py-2 text-sm font-semibold text-[#ff525a]" onClick={() => updateCompany({ logoUrl: "" })}>Remove</button> : null}
            {logoStatus ? <p className="mt-2 text-xs text-zinc-400">{logoStatus}</p> : null}
          </div>
        </div>
        <Field label="Address"><textarea className="input min-h-20 py-2" value={store.company.address} onChange={(e) => updateCompany({ address: e.target.value })} /></Field>
        <Field label="WhatsApp message"><textarea className="input min-h-24 py-2" value={store.company.whatsappMessage} onChange={(e) => updateCompany({ whatsappMessage: e.target.value })} /></Field>
        <p className="mt-2 text-xs text-zinc-400">Variables: {"{name}"} {"{invoiceNo}"} {"{total}"}</p>
        <div className="mt-4 grid gap-3 rounded-lg border border-zinc-800 bg-black p-3 md:grid-cols-2">
          <Field label="Admin username"><input className="input" value={store.admin.username} onChange={(e) => updateAdmin({ username: e.target.value })} /></Field>
          <Field label="Admin password"><input className="input" type="password" value={store.admin.password} onChange={(e) => updateAdmin({ password: e.target.value })} /></Field>
        </div>
      </Panel>

      <Panel icon={<ShieldCheck />} title="GST master">
        <Field label="Active GST profile">
          <select className="input" value={store.activeGstId} onChange={(event) => setStore((current) => ({ ...current, activeGstId: event.target.value }))}>
            {store.gstProfiles.map((gst) => <option key={gst.id} value={gst.id}>{gst.label} {gst.enabled ? `- ${gst.gstNumber}` : "- Without GST"}</option>)}
          </select>
        </Field>
        <label className="mt-4 flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={activeGst.enabled} onChange={(event) => setStore((current) => ({ ...current, gstProfiles: current.gstProfiles.map((gst) => gst.id === current.activeGstId ? { ...gst, enabled: event.target.checked } : gst) }))} />
          Add GST on invoices
        </label>
        <div className="mt-3 grid gap-2">
          <input className="input" placeholder="Label" value={newGst.label} onChange={(e) => setNewGst({ ...newGst, label: e.target.value })} />
          <input className="input" placeholder="GST number" value={newGst.gstNumber} onChange={(e) => setNewGst({ ...newGst, gstNumber: e.target.value.toUpperCase() })} />
          <div className="grid grid-cols-2 gap-2">
            <input className="input" type="number" placeholder="Tax %" value={newGst.taxRate} onChange={(e) => setNewGst({ ...newGst, taxRate: Number(e.target.value) })} />
            <label className="flex items-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-semibold"><input type="checkbox" checked={newGst.enabled} onChange={(e) => setNewGst({ ...newGst, enabled: e.target.checked })} />GST</label>
          </div>
          <button className="btn-primary" onClick={() => {
            if (!newGst.label.trim()) return;
            const profile = { ...newGst, id: crypto.randomUUID(), taxRate: newGst.enabled ? Number(newGst.taxRate || 0) : 0 };
            setStore((current) => ({ ...current, gstProfiles: [profile, ...current.gstProfiles], activeGstId: profile.id }));
            setNewGst(emptyGst);
          }}><Plus className="h-4 w-4" /> Save GST</button>
        </div>
        <div className="mt-4 space-y-2">
          {store.gstProfiles.map((gst) => (
            <div key={gst.id} className="flex items-center justify-between rounded-md border border-zinc-800 bg-black p-3 text-sm">
              <button className="text-left" onClick={() => setStore((current) => ({ ...current, activeGstId: gst.id }))}>
                <p className="font-semibold">{gst.label}</p>
                <p className="text-zinc-400">{gst.enabled ? `${gst.gstNumber} - ${gst.taxRate}%` : "Without GST"}</p>
              </button>
              <button onClick={() => setStore((current) => {
                const next = current.gstProfiles.filter((entry) => entry.id !== gst.id);
                return { ...current, gstProfiles: next.length ? next : [defaultGstProfiles[1]], activeGstId: next[0]?.id || defaultGstProfiles[1].id };
              })} className="rounded-md p-2 text-[#ff525a] hover:bg-[#2a0d10]" title="Delete GST"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </Panel>

      <Panel icon={<UsersRound />} title="Users">
        <div className="grid gap-2">
          <input className="input" placeholder="User name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
          <input className="input" placeholder="Phone" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} />
          <input className="input" placeholder="PIN" value={newUser.pin} onChange={(e) => setNewUser({ ...newUser, pin: e.target.value })} />
          <button className="btn-primary" onClick={() => {
            if (!newUser.name.trim() || !newUser.phone.trim() || !newUser.pin.trim()) return;
            setStore((current) => ({ ...current, users: [{ ...newUser, id: crypto.randomUUID(), active: true }, ...current.users.filter((user) => user.phone.replace(/\D/g, "") !== newUser.phone.replace(/\D/g, ""))] }));
            setNewUser(emptyUser);
          }}><Plus className="h-4 w-4" /> Add user</button>
        </div>
        <div className="mt-4 space-y-2">
          {store.users.map((user) => (
            <div key={user.id} className="flex items-center justify-between rounded-md border border-zinc-800 bg-black p-3 text-sm">
              <div><p className="font-semibold">{user.name}</p><p className="text-zinc-400">{user.phone} - PIN {user.pin}</p></div>
              <div className="flex items-center gap-1">
                <button onClick={() => setStore((current) => ({ ...current, users: current.users.map((entry) => entry.id === user.id ? { ...entry, active: !entry.active } : entry) }))} className="rounded-md border border-zinc-700 px-2 py-1 text-xs font-semibold">{user.active ? "Active" : "Off"}</button>
                <button onClick={() => setStore((current) => ({ ...current, users: current.users.filter((entry) => entry.id !== user.id) }))} className="rounded-md p-2 text-[#ff525a] hover:bg-[#2a0d10]" title="Remove"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel icon={<PackagePlus />} title="Parts master">
        <div className="grid gap-2">
          <input className="input" placeholder="Part/labour name" value={newPart.name} onChange={(e) => setNewPart({ ...newPart, name: e.target.value })} />
          <div className="grid grid-cols-3 gap-2">
            <select className="input" value={newPart.type || "part"} onChange={(e) => setNewPart({ ...newPart, type: e.target.value as ItemType })}><option value="part">Part</option><option value="labour">Labour</option></select>
            <input className="input" placeholder="Price" type="number" value={newPart.price} onChange={(e) => setNewPart({ ...newPart, price: Number(e.target.value) })} />
            <input className="input" placeholder="Part Number" value={newPart.partNumber} onChange={(e) => setNewPart({ ...newPart, partNumber: e.target.value })} />
          </div>
          <button className="btn-primary" onClick={() => {
            if (!newPart.name.trim()) return;
            setStore((current) => ({ ...current, parts: [normalizePart({ ...newPart, id: crypto.randomUUID() }), ...current.parts] }));
            setNewPart({ id: "", name: "", price: 0, partNumber: "", type: "part" });
          }}><Plus className="h-4 w-4" /> Add item</button>
        </div>
        <div className="mt-4 max-h-[520px] space-y-2 overflow-auto">
          {store.parts.map((part) => (
            <div key={part.id} className="flex items-center justify-between rounded-md border border-zinc-800 bg-black p-3 text-sm">
              <div><p className="font-semibold">{part.name}</p><p className="text-zinc-400">{part.type || "part"} · {part.partNumber} · {money(part.price)}</p></div>
              <button onClick={() => setStore((current) => ({ ...current, parts: current.parts.filter((entry) => entry.id !== part.id) }))} className="rounded-md p-2 text-[#ff525a] hover:bg-[#2a0d10]" title="Remove"><Trash2 className="h-4 w-4" /></button>
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
  jobDetails,
  invoiceNo,
  items,
  totals,
}: {
  company: Company;
  gst: GstProfile;
  customer: Customer;
  jobDetails: JobDetails;
  invoiceNo: string;
  items: LineItem[];
  totals: { subtotal: number; tax: number; cgst: number; sgst: number; total: number; rounded: number };
}) {
  const sectioned = splitItems(items);
  const rows = [...sectioned.parts, ...sectioned.labour];

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-white text-black shadow-sm">
      <div className="bg-black px-4 py-3 text-white">
        <p className="text-center font-mono text-[10px] uppercase tracking-wide text-zinc-300">Original for recipient / Duplicate for transporter / Triplicate for supplier</p>
        <div className="mt-2 bg-zinc-300 py-1 text-center text-lg font-semibold text-black">Job Card Retail - Tax Invoice</div>
      </div>
      <div className="space-y-4 p-4 text-xs">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="font-bold">{company.name}</p>
            <p>{company.address}</p>
            <p>{company.phone}</p>
            <p>{company.email}</p>
            <p>{gst.enabled ? `Dealer GSTIN: ${gst.gstNumber}` : "Without GST bill"}</p>
          </div>
          <div className="text-left sm:text-right">
            <p>Invoice No. : {invoiceNo}</p>
            <p>Date : {new Date().toLocaleDateString("en-IN")}</p>
            <p>Job Card No. : {jobDetails.jobCardNo || "-"}</p>
            <p>Reg.No. : {jobDetails.registrationNo || customer.vehicle || "-"}</p>
            <p>Model : {jobDetails.model || "-"}</p>
          </div>
        </div>
        <div className="grid gap-3 border-y border-zinc-300 py-3 sm:grid-cols-2">
          <div>
            <p className="font-semibold">Customer Name & Address</p>
            <p>{customer.name || "-"}</p>
            <p>Mobile : {customer.phone || "-"}</p>
            <p>Cust GSTIN/UIN : {jobDetails.customerGstin || "N/A"}</p>
            <p>PAN : {jobDetails.pan || "N/A"}</p>
          </div>
          <div>
            <p>SA Name : {jobDetails.serviceAdvisor || "-"}</p>
            <p>Mileage : {jobDetails.mileage || "-"}</p>
            <p>Chassis No. : {jobDetails.chassisNo || "-"}</p>
            <p>Service type : {jobDetails.serviceType || "-"}</p>
            <p>Place of Supply : {jobDetails.placeOfSupply || "-"}</p>
          </div>
        </div>
        <div className="overflow-auto border border-zinc-400">
          <table className="min-w-[720px] w-full text-left text-[11px]">
            <thead className="bg-zinc-300">
              <tr>
                <th className="p-1">Srl.</th>
                <th className="p-1">Part Number</th>
                <th className="p-1">Description</th>
                <th className="p-1">Tax</th>
                <th className="p-1">Qty.</th>
                <th className="p-1 text-right">Rate</th>
                <th className="p-1 text-right">Taxable Amount</th>
                <th className="p-1 text-right">Tax Paid Amount</th>
                <th className="p-1 text-right">Labour Charges</th>
              </tr>
            </thead>
            <tbody>
              {(["part", "labour"] as ItemType[]).map((type) => (
                <Fragment key={type}>
                  <tr><td colSpan={9} className="border-y border-zinc-400 bg-zinc-100 p-1 font-bold capitalize">{type === "part" ? "Parts" : "Labour"}</td></tr>
                  {rows.filter((item) => item.type === type).map((item, index) => {
                    const amount = item.qty * item.price;
                    const tax = gst.enabled ? (amount * gst.taxRate) / 100 : 0;
                    return (
                      <tr key={item.id} className="border-t border-zinc-200">
                        <td className="p-1">{index + 1}</td>
                        <td className="p-1">{item.partNumber || "-"}</td>
                        <td className="p-1">{item.name || "Custom item"}</td>
                        <td className="p-1">{gst.enabled ? gst.taxRate : 0}%</td>
                        <td className="p-1">{item.qty}</td>
                        <td className="p-1 text-right">{pdfMoney(item.price)}</td>
                        <td className="p-1 text-right">{item.type === "part" ? pdfMoney(amount) : "0.00"}</td>
                        <td className="p-1 text-right">{pdfMoney(tax)}</td>
                        <td className="p-1 text-right">{item.type === "labour" ? pdfMoney(amount) : "0.00"}</td>
                      </tr>
                    );
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="ml-auto max-w-sm space-y-1 text-sm">
          <Row label="Sub Total Amount" value={money(totals.subtotal)} />
          <Row label={`CGST @ ${gst.enabled ? gst.taxRate / 2 : 0}%`} value={money(totals.cgst)} />
          <Row label={`SGST @ ${gst.enabled ? gst.taxRate / 2 : 0}%`} value={money(totals.sgst)} />
          <Row label="Net Bill Amount (Rounded)" value={money(totals.rounded)} strong />
        </div>
        <div className="grid gap-3 border-t border-zinc-300 pt-3 text-xs sm:grid-cols-2">
          <p>I acknowledge that the jobs/repairs/service carried out in my vehicle were explained to me.</p>
          <div className="text-right">
            <p>Customer Signature</p>
            <p className="mt-4">Authorised Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-[#111] p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-[#ff2b35] [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
        <h2 className="font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-zinc-200">
      <span className="mb-1 mt-3 block">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${strong ? "border-t border-zinc-300 pt-3 text-lg font-bold" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
