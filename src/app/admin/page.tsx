"use client";

import {
  BadgeIndianRupee,
  Bot,
  CalendarClock,
  Car,
  Download,
  FileText,
  FilePlus2,
  Inbox,
  MessageCircle,
  PackagePlus,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import jsPDF from "jspdf";
import { Fragment, useMemo, useState, type ReactNode } from "react";
import { AppHeader } from "@/components/app-header";
import { Field, Panel, Row } from "@/components/ui";
import { useApp } from "@/context/app-context";
import {
  applyCustomerToJobDetails,
  customerFromForm,
  emptyCustomer,
  customerWhatsAppUrl,
  normalizeCustomerPhone,
  emptyJobDetails,
  estimateNumber,
  imageToDataUrl,
  invoiceNumber,
  money,
  newItem,
  normalizeItem,
  pdfMoney,
  splitItems,
  type Company,
  type Customer,
  type BookingStatus,
  type EnquiryStatus,
  type GstProfile,
  type ItemType,
  type JobDetails,
  type LineItem,
  type Role,
  type SlotBooking,
  type Template,
  type WebsiteEnquiry,
} from "@/lib/invoice-store";

type AdminTab = "invoice" | "estimate" | "enquiries" | "bookings";

export default function Home() {
  const { store, setStore, role, setRole, activeGst } = useApp();
  const [loginRole, setLoginRole] = useState<Role>("user");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [pin, setPin] = useState("");
  const [customer, setCustomer] = useState<Customer>(emptyCustomer);
  const [jobDetails, setJobDetails] = useState<JobDetails>(emptyJobDetails);
  const [items, setItems] = useState<LineItem[]>([newItem()]);
  const [invoiceNo, setInvoiceNo] = useState(invoiceNumber);
  const [templateSearch, setTemplateSearch] = useState("");
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [templatePopupQuery, setTemplatePopupQuery] = useState("");
  const [partPickerItemId, setPartPickerItemId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("invoice");
  const [estimateCustomer, setEstimateCustomer] = useState<Customer>(emptyCustomer);
  const [estimateJobDetails, setEstimateJobDetails] = useState<JobDetails>(emptyJobDetails);
  const [estimateItems, setEstimateItems] = useState<LineItem[]>([newItem()]);
  const [estimateNo, setEstimateNo] = useState(estimateNumber);
  const [estimateNotes, setEstimateNotes] = useState("");
  const [estimateStatus, setEstimateStatus] = useState("");
  const [estimatePickerItemId, setEstimatePickerItemId] = useState<string | null>(null);
  const [estimateSearch, setEstimateSearch] = useState("");
  const [recordsQuery, setRecordsQuery] = useState("");

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

  const estimateTotals = useMemo(() => {
    const subtotal = estimateItems.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.price || 0), 0);
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
  }, [estimateItems, activeGst.enabled, activeGst.taxRate]);

  const customerPhoneReady = normalizeCustomerPhone(customer.phone).length === 10;
  const matchedTemplates = store.templates.filter((template) =>
    `${template.keyword} ${template.title}`.toLowerCase().includes(templatePopupQuery.toLowerCase()),
  );

  const handleOpenTemplatePicker = () => {
    setTemplatePopupQuery("");
    setTemplatePickerOpen(true);
  };
  const pickerItem = items.find((item) => item.id === partPickerItemId);
  const pickerQuery = pickerItem?.name.trim().toLowerCase() || "";
  const pickerType: ItemType = pickerItem?.type || "part";
  const pickerOptions = store.parts.filter((part) => (part.type || "part") === pickerType);
  const filteredParts = pickerOptions.filter((part) =>
    `${part.name} ${part.partNumber}`.toLowerCase().includes(pickerQuery),
  );
  const estimatePickerItem = estimateItems.find((item) => item.id === estimatePickerItemId);
  const estimatePickerQuery = estimatePickerItem?.name.trim().toLowerCase() || "";
  const estimatePickerType: ItemType = estimatePickerItem?.type || "part";
  const estimatePickerOptions = store.parts.filter((part) => (part.type || "part") === estimatePickerType);
  const estimateFilteredParts = estimatePickerOptions.filter((part) =>
    `${part.name} ${part.partNumber}`.toLowerCase().includes(estimatePickerQuery),
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

  function updateEstimateItem(id: string, patch: Partial<LineItem>) {
    setEstimateItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function pickEstimatePart(itemId: string, partName: string) {
    const part = store.parts.find((entry) => entry.name === partName);
    updateEstimateItem(itemId, {
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

  function typeEstimatePartName(itemId: string, partName: string) {
    const part = store.parts.find((entry) => entry.name.toLowerCase() === partName.toLowerCase());
    updateEstimateItem(
      itemId,
      part ? { name: part.name, price: part.price, partNumber: part.partNumber, type: part.type || "part" } : { name: partName },
    );
  }

  function findCustomer(phone: string) {
    setCustomer((current) => ({ ...current, phone }));
    const normalizedPhone = phone.replace(/\D/g, "");
    if (!normalizedPhone) return;
    const found = store.customers.find((entry) => entry.phone.replace(/\D/g, "") === normalizedPhone);
    if (!found) return;
    setCustomer(found);
    setJobDetails((current) => applyCustomerToJobDetails(current, found));
  }

  function findEstimateCustomer(phone: string) {
    setEstimateCustomer((current) => ({ ...current, phone }));
    const normalizedPhone = phone.replace(/\D/g, "");
    if (!normalizedPhone) return;
    const found = store.customers.find((entry) => entry.phone.replace(/\D/g, "") === normalizedPhone);
    if (!found) return;
    setEstimateCustomer(found);
    setEstimateJobDetails((current) => applyCustomerToJobDetails(current, found));
  }

  function saveCustomer() {
    if (!customer.name.trim() || !customer.phone.trim()) {
      setStatus("Name aur phone mandatory hai.");
      return false;
    }
    const record = customerFromForm(customer, jobDetails);
    setStore((current) => ({
      ...current,
      customers: [
        record,
        ...current.customers.filter((entry) => entry.phone.replace(/\D/g, "") !== record.phone.replace(/\D/g, "")),
      ],
    }));
    setCustomer(record);
    setStatus("Customer saved.");
    return true;
  }

  function saveEstimateCustomer() {
    if (!estimateCustomer.name.trim() || !estimateCustomer.phone.trim()) {
      setEstimateStatus("Name aur phone mandatory hai.");
      return false;
    }
    const record = customerFromForm(estimateCustomer, estimateJobDetails);
    setStore((current) => ({
      ...current,
      customers: [
        record,
        ...current.customers.filter((entry) => entry.phone.replace(/\D/g, "") !== record.phone.replace(/\D/g, "")),
      ],
    }));
    setEstimateCustomer(record);
    return true;
  }

  function applyTemplate(template: Template) {
    setItems(template.items.map((item) => ({ ...normalizeItem(item), id: crypto.randomUUID() })));
    setTemplateSearch(template.keyword);
    setTemplatePickerOpen(false);
    setStatus(`Template applied: ${template.title}`);
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

  async function createEstimatePdf() {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 36;
    const sectioned = splitItems(estimateItems);
    let y = 44;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Service Estimate", pageWidth / 2, y, { align: "center" });
    y += 28;

    if (store.company.logoUrl) {
      try {
        const logoBlob = await fetch(store.company.logoUrl).then((response) => response.blob());
        const logoData = await imageToDataUrl(logoBlob);
        doc.addImage(logoData, "PNG", margin, y - 8, 42, 42);
      } catch {
        // PDF should still generate if logo fetch fails.
      }
    }

    doc.setFontSize(13);
    doc.text(store.company.name, margin + 54, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(store.company.address, margin + 54, y + 14, { maxWidth: 260 });
    doc.text(`${store.company.phone} | ${store.company.email}`, margin + 54, y + 38);
    doc.text(activeGst.enabled ? `GSTIN: ${activeGst.gstNumber}` : "Without GST estimate", margin + 54, y + 52);
    doc.text(`Estimate No.: ${estimateNo}`, pageWidth - margin, y, { align: "right" });
    doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, pageWidth - margin, y + 14, { align: "right" });
    y += 84;

    doc.setDrawColor(210);
    doc.line(margin, y, pageWidth - margin, y);
    y += 20;
    doc.setFont("helvetica", "bold");
    doc.text("Customer", margin, y);
    doc.text("Vehicle", pageWidth / 2, y);
    doc.setFont("helvetica", "normal");
    y += 15;
    doc.text(estimateCustomer.name || "-", margin, y);
    doc.text(`Phone: ${estimateCustomer.phone || "-"}`, margin, y + 14);
    doc.text(`Email: ${estimateCustomer.email || "-"}`, margin, y + 28);
    doc.text(`Reg.: ${estimateJobDetails.registrationNo || estimateCustomer.vehicle || "-"}`, pageWidth / 2, y);
    doc.text(`Model: ${estimateJobDetails.model || "-"}`, pageWidth / 2, y + 14);
    doc.text(`Service: ${estimateJobDetails.serviceType || "-"}`, pageWidth / 2, y + 28);
    y += 58;

    doc.setFont("helvetica", "bold");
    doc.text("Items", margin, y);
    y += 12;
    doc.setFillColor(230, 230, 230);
    doc.rect(margin, y, pageWidth - margin * 2, 22, "F");
    doc.setFontSize(9);
    doc.text("Type", margin + 6, y + 14);
    doc.text("Description", margin + 70, y + 14);
    doc.text("Qty", pageWidth - 180, y + 14);
    doc.text("Rate", pageWidth - 132, y + 14);
    doc.text("Amount", pageWidth - 48, y + 14, { align: "right" });
    y += 34;
    doc.setFont("helvetica", "normal");
    [...sectioned.parts, ...sectioned.labour].forEach((item) => {
      const amount = Number(item.qty || 0) * Number(item.price || 0);
      doc.text(item.type === "part" ? "Part" : "Labour", margin + 6, y);
      doc.text(item.name || "Custom item", margin + 70, y, { maxWidth: pageWidth - 290 });
      doc.text(String(item.qty || 0), pageWidth - 180, y);
      doc.text(pdfMoney(item.price), pageWidth - 104, y, { align: "right" });
      doc.text(pdfMoney(amount), pageWidth - 48, y, { align: "right" });
      y += 18;
    });
    y += 16;

    doc.line(pageWidth - 240, y - 10, pageWidth - margin, y - 10);
    const rows: Array<[string, number]> = [
      ["Subtotal", estimateTotals.subtotal],
      [`CGST ${activeGst.enabled ? activeGst.taxRate / 2 : 0}%`, estimateTotals.cgst],
      [`SGST ${activeGst.enabled ? activeGst.taxRate / 2 : 0}%`, estimateTotals.sgst],
      ["Rounded Total", estimateTotals.rounded],
    ];
    rows.forEach(([label, value], index) => {
      doc.setFont("helvetica", index === rows.length - 1 ? "bold" : "normal");
      doc.text(label, pageWidth - 220, y);
      doc.text(pdfMoney(value), pageWidth - 48, y, { align: "right" });
      y += 17;
    });

    if (estimateNotes.trim()) {
      y += 18;
      doc.setFont("helvetica", "bold");
      doc.text("Notes", margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(estimateNotes, margin, y + 15, { maxWidth: pageWidth - margin * 2 });
    }

    doc.setFontSize(8);
    doc.text("This is an estimate. Final invoice may change after inspection and customer approval.", margin, 810, {
      maxWidth: pageWidth - margin * 2,
    });
    return doc;
  }

  function saveEstimate(nextStatus: "draft" | "sent" = "draft") {
    if (!saveEstimateCustomer()) return false;
    const record = {
      id: crypto.randomUUID(),
      estimateNo,
      customer: customerFromForm(estimateCustomer, estimateJobDetails),
      jobDetails: estimateJobDetails,
      items: estimateItems.map(normalizeItem),
      notes: estimateNotes,
      subtotal: estimateTotals.subtotal,
      tax: estimateTotals.tax,
      total: estimateTotals.total,
      rounded: estimateTotals.rounded,
      gstProfileId: activeGst.id,
      status: nextStatus,
      createdAt: new Date().toISOString(),
    };
    setStore((current) => ({
      ...current,
      estimates: [record, ...current.estimates.filter((entry) => entry.estimateNo !== estimateNo)],
    }));
    setEstimateStatus(nextStatus === "sent" ? "Estimate saved and ready to share." : "Estimate saved.");
    return true;
  }

  async function sendEstimateToCustomer() {
    if (!saveEstimate("sent")) return;
    const waUrl = customerWhatsAppUrl(
      estimateCustomer.phone,
      `Namaste ${estimateCustomer.name}, CAR MECHANIC estimate ${estimateNo} ready hai. Total amount Rs ${estimateTotals.rounded}.`,
    );
    if (!waUrl) {
      setEstimateStatus("Customer ka valid 10-digit phone number add karo.");
      return;
    }
    const doc = await createEstimatePdf();
    doc.save(`${estimateNo}.pdf`);
    window.open(waUrl, "_blank", "noopener,noreferrer");
    setEstimateStatus("WhatsApp opened. Estimate PDF download ho gaya.");
  }

  async function suggestEstimateWithAi() {
    setEstimateStatus("AI estimate suggestion loading...");
    try {
      const response = await fetch("/api/ai/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issue: estimateNotes,
          vehicle: `${estimateCustomer.vehicle || ""} ${estimateJobDetails.model || ""} ${estimateJobDetails.registrationNo || ""}`,
          service: estimateJobDetails.serviceType,
          parts: store.parts,
        }),
      });
      const data = await response.json();
      if (!data.ok) {
        setEstimateStatus(data.error || "AI suggestion unavailable.");
        return;
      }
      const suggestion = data.suggestion as { title?: string; notes?: string; items?: Array<{ name?: string; qty?: number; type?: ItemType }> };
      if (suggestion.notes) setEstimateNotes(suggestion.notes);
      const suggestedItems = (suggestion.items || [])
        .map((entry) => {
          const found = store.parts.find((part) => part.name.toLowerCase() === String(entry.name || "").toLowerCase());
          return found
            ? normalizeItem({ ...found, qty: entry.qty || 1, type: (found.type || entry.type || "part") as ItemType })
            : null;
        })
        .filter(Boolean) as LineItem[];
      if (suggestedItems.length) setEstimateItems(suggestedItems.map((item) => ({ ...item, id: crypto.randomUUID() })));
      setEstimateStatus(suggestion.title ? `AI suggestion applied: ${suggestion.title}` : "AI suggestion applied.");
    } catch (error) {
      setEstimateStatus(error instanceof Error ? error.message : "AI suggestion unavailable.");
    }
  }

  async function sendInvoiceToCustomer() {
    if (!saveCustomer()) return;

    const phoneDigits = normalizeCustomerPhone(customer.phone);
    if (phoneDigits.length !== 10) {
      setStatus("Customer ka valid 10-digit phone number add karo.");
      return;
    }

    const message = store.company.whatsappMessage
      .replaceAll("{name}", customer.name)
      .replaceAll("{invoiceNo}", invoiceNo)
      .replaceAll("{total}", money(totals.rounded));
    const waUrl = customerWhatsAppUrl(customer.phone, message);
    if (!waUrl) {
      setStatus("Customer ka valid 10-digit phone number add karo.");
      return;
    }

    const doc = await createPdf();
    const file = new File([doc.output("blob")], `${invoiceNo}.pdf`, { type: "application/pdf" });

    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ title: invoiceNo, text: message, files: [file] });
        setStatus(`Invoice shared. WhatsApp par ${customer.name || phoneDigits} ko bhejo.`);
        return;
      } catch {
        // User cancelled share sheet — fall through to direct WhatsApp open.
      }
    }

    doc.save(`${invoiceNo}.pdf`);
    window.open(waUrl, "_blank", "noopener,noreferrer");
    setStatus(`WhatsApp opened for ${customer.name || phoneDigits}. PDF download ho gaya — chat me attach karo.`);
  }

  if (!role) {
    return (
      <main className="car-bg-login min-h-screen overflow-x-hidden text-slate-900">
        <section className="mx-auto grid min-h-screen w-full min-w-0 max-w-6xl items-center gap-6 px-3 py-6 sm:gap-8 sm:px-4 sm:py-8 md:grid-cols-[1fr_420px]">
          <div className="min-w-0 space-y-4 sm:space-y-6">
            {store.company.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={store.company.logoUrl} alt="" className="h-20 w-20 rounded-md bg-white object-contain p-2 shadow-2xl sm:h-24 sm:w-24" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-[#1f6f64] text-xl font-black text-white">
                {store.company.logoText}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#1f6f64]">CAR MECHANIC</p>
              <h1 className="mt-3 max-w-2xl text-3xl font-black leading-tight sm:text-4xl md:text-6xl">
                Job-card invoices for serious workshop billing.
              </h1>
              <p className="mt-4 max-w-xl text-sm text-slate-600">
                GST, parts, labour, vehicle details, PDF invoice, and WhatsApp sharing in one professional workshop console.
              </p>
            </div>
          </div>
          <div className="min-w-0 rounded-lg border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:p-5">
            <div className="mb-5 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#1f6f64]" />
              <h2 className="text-xl font-semibold">Login</h2>
            </div>
            <div className="mb-4 grid grid-cols-2 rounded-md bg-slate-100 p-1">
              {(["user", "admin"] as Role[]).map((entry) => (
                <button
                  key={entry}
                  onClick={() => setLoginRole(entry)}
                  className={`rounded px-4 py-2 text-sm font-semibold capitalize ${
                    loginRole === entry ? "bg-[#1f6f64] text-white" : "text-slate-500"
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
            {status ? <p className="mt-3 text-sm text-red-600">{status}</p> : null}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="car-bg-app min-h-screen overflow-x-hidden text-slate-900">
      <AppHeader />

      <div className="mx-auto w-full max-w-7xl px-3 pt-3 sm:px-4">
        <div className="flex gap-2 overflow-x-auto rounded-lg border border-slate-200 bg-white/95 p-2 shadow-sm">
          {([
            ["invoice", "Invoice", <FileText key="invoice" className="h-4 w-4" />],
            ["estimate", "Estimate", <FilePlus2 key="estimate" className="h-4 w-4" />],
            ["enquiries", `Enquiries (${store.enquiries.length})`, <Inbox key="enquiries" className="h-4 w-4" />],
            ["bookings", `Bookings (${store.bookings.length})`, <CalendarClock key="bookings" className="h-4 w-4" />],
          ] as Array<[AdminTab, string, ReactNode]>).map(([tab, label, icon]) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-bold ${
                activeTab === tab ? "bg-[#1f6f64] text-white" : "text-slate-600 hover:bg-[#e8f4f1] hover:text-[#1f6f64]"
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "invoice" ? (
      <div className="mx-auto grid w-full min-w-0 max-w-7xl gap-3 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4 lg:grid-cols-[minmax(0,1fr)_390px]">
        <section className="min-w-0 space-y-3 sm:space-y-4">
              <Panel icon={<UserRound />} title="Customer">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                  <Field label="Phone *"><input value={customer.phone} onChange={(event) => findCustomer(event.target.value)} className="input" inputMode="tel" /></Field>
                  <Field label="Name *"><input value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} className="input" /></Field>
                  <Field label="Email"><input value={customer.email || ""} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} className="input" /></Field>
                  <Field label="Vehicle"><input value={customer.vehicle || ""} onChange={(event) => setCustomer({ ...customer, vehicle: event.target.value })} className="input" /></Field>
                </div>
                <button
                  type="button"
                  onClick={sendInvoiceToCustomer}
                  disabled={!customerPhoneReady}
                  className="btn-primary mt-3 w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  <MessageCircle className="h-4 w-4" /> Send invoice to customer
                </button>
                {!customerPhoneReady && customer.phone ? (
                  <p className="mt-2 text-xs text-slate-500">WhatsApp send ke liye 10-digit phone number chahiye.</p>
                ) : null}
              </Panel>

              <Panel icon={<Car />} title="Vehicle and job card">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
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
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex min-w-0 flex-1 gap-2">
                    <input
                      value={templateSearch}
                      onChange={(event) => setTemplateSearch(event.target.value)}
                      className="input min-w-0 flex-1"
                      placeholder="Template keyword..."
                    />
                    <button
                      type="button"
                      onClick={handleOpenTemplatePicker}
                      className="shrink-0 rounded-md border border-slate-300 bg-white px-3 text-[#1f6f64]"
                      title="Browse templates"
                      aria-label="Browse templates"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                  <button onClick={saveTemplate} className="btn-secondary w-full shrink-0 sm:w-auto"><Save className="h-4 w-4" /> Save current</button>
                </div>
                <button type="button" onClick={handleOpenTemplatePicker} className="btn-secondary mt-3 w-full sm:w-auto">
                  <Search className="h-4 w-4" /> Browse templates
                </button>
              </Panel>

              <Panel icon={<PackagePlus />} title="Invoice items">
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="grid gap-2 rounded-lg border border-slate-200 bg-[#f8fbfa] p-3 md:grid-cols-[110px_minmax(0,1fr)_130px_100px_100px_44px]">
                      <select value={item.type} onChange={(event) => updateItem(item.id, { type: event.target.value as ItemType })} className="input">
                        <option value="part">Part</option>
                        <option value="labour">Labour</option>
                      </select>
                      <div className="flex min-w-0 gap-2">
                        <input value={item.name} onChange={(event) => typePartName(item.id, event.target.value)} onFocus={() => setPartPickerItemId(item.id)} className="input min-w-0 flex-1" placeholder="Part or labour item" />
                        <button onClick={() => setPartPickerItemId(item.id)} className="shrink-0 rounded-md border border-slate-300 bg-white px-3 text-[#1f6f64]" title="Search parts" aria-label="Search parts">
                          <Search className="h-4 w-4" />
                        </button>
                      </div>
                      <input value={item.partNumber} onChange={(event) => updateItem(item.id, { partNumber: event.target.value })} className="input" placeholder="Part Number" />
                      <input type="number" value={item.price} onChange={(event) => updateItem(item.id, { price: Number(event.target.value) })} className="input" placeholder="Rate" />
                      <input type="number" value={item.qty} onChange={(event) => updateItem(item.id, { qty: Number(event.target.value) })} className="input" placeholder="Qty" />
                      <button onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))} className="justify-self-end rounded-md p-2 text-red-600 hover:bg-red-50 md:justify-self-auto" title="Remove" aria-label="Remove item">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={() => setItems((current) => [...current, newItem()])} className="btn-secondary mt-3"><Plus className="h-4 w-4" /> Add item</button>
              </Panel>
            </section>

            <aside className="min-w-0 space-y-3 sm:space-y-4">
              <div className="space-y-3 sm:space-y-4 lg:sticky lg:top-[4.25rem]">
                <Panel icon={<BadgeIndianRupee />} title="Summary">
                  <Field label="Invoice no."><input value={invoiceNo} onChange={(event) => setInvoiceNo(event.target.value)} className="input" /></Field>
                  <div className="mt-4 space-y-2 text-sm">
                    <Row label="Subtotal" value={money(totals.subtotal)} />
                    <Row label={`CGST ${activeGst.enabled ? activeGst.taxRate / 2 : 0}%`} value={money(totals.cgst)} />
                    <Row label={`SGST ${activeGst.enabled ? activeGst.taxRate / 2 : 0}%`} value={money(totals.sgst)} />
                    <Row label="Rounded total" value={money(totals.rounded)} strong />
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                    <button onClick={async () => (await createPdf()).save(`${invoiceNo}.pdf`)} className="btn-secondary w-full"><Download className="h-4 w-4" /> PDF</button>
                    <button onClick={sendInvoiceToCustomer} disabled={!customerPhoneReady} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50">
                      <MessageCircle className="h-4 w-4" /> Send to customer
                    </button>
                  </div>
                  {status ? <p className="mt-3 text-sm text-red-600">{status}</p> : null}
                </Panel>
                <InvoicePreview company={store.company} gst={activeGst} customer={customer} jobDetails={jobDetails} invoiceNo={invoiceNo} items={items} totals={totals} />
              </div>
            </aside>
      </div>
      ) : null}

      {activeTab === "estimate" ? (
        <div className="mx-auto grid w-full min-w-0 max-w-7xl gap-3 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4 lg:grid-cols-[minmax(0,1fr)_390px]">
          <section className="min-w-0 space-y-3 sm:space-y-4">
            <Panel icon={<UserRound />} title="Estimate customer">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                <Field label="Phone *"><input value={estimateCustomer.phone} onChange={(event) => findEstimateCustomer(event.target.value)} className="input" inputMode="tel" /></Field>
                <Field label="Name *"><input value={estimateCustomer.name} onChange={(event) => setEstimateCustomer({ ...estimateCustomer, name: event.target.value })} className="input" /></Field>
                <Field label="Email"><input value={estimateCustomer.email || ""} onChange={(event) => setEstimateCustomer({ ...estimateCustomer, email: event.target.value })} className="input" /></Field>
                <Field label="Vehicle"><input value={estimateCustomer.vehicle || ""} onChange={(event) => setEstimateCustomer({ ...estimateCustomer, vehicle: event.target.value })} className="input" /></Field>
              </div>
            </Panel>

            <Panel icon={<Car />} title="Vehicle and service">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                <Field label="Registration no."><input value={estimateJobDetails.registrationNo} onChange={(e) => setEstimateJobDetails({ ...estimateJobDetails, registrationNo: e.target.value.toUpperCase() })} className="input" /></Field>
                <Field label="Model"><input value={estimateJobDetails.model} onChange={(e) => setEstimateJobDetails({ ...estimateJobDetails, model: e.target.value.toUpperCase() })} className="input" /></Field>
                <Field label="Chassis no."><input value={estimateJobDetails.chassisNo} onChange={(e) => setEstimateJobDetails({ ...estimateJobDetails, chassisNo: e.target.value })} className="input" /></Field>
                <Field label="Mileage"><input value={estimateJobDetails.mileage} onChange={(e) => setEstimateJobDetails({ ...estimateJobDetails, mileage: e.target.value })} className="input" /></Field>
                <Field label="Service type"><input value={estimateJobDetails.serviceType} onChange={(e) => setEstimateJobDetails({ ...estimateJobDetails, serviceType: e.target.value })} className="input" /></Field>
                <Field label="Service advisor"><input value={estimateJobDetails.serviceAdvisor} onChange={(e) => setEstimateJobDetails({ ...estimateJobDetails, serviceAdvisor: e.target.value })} className="input" /></Field>
              </div>
              <Field label="Estimate notes / customer issue">
                <textarea value={estimateNotes} onChange={(event) => setEstimateNotes(event.target.value)} className="input min-h-24 py-3" placeholder="Customer issue, inspection note, recommendation..." />
              </Field>
              <button type="button" onClick={suggestEstimateWithAi} className="btn-secondary mt-3"><Bot className="h-4 w-4" /> Suggest estimate</button>
            </Panel>

            <Panel icon={<PackagePlus />} title="Estimate items">
              <div className="space-y-3">
                {estimateItems.map((item) => (
                  <div key={item.id} className="grid gap-2 rounded-lg border border-slate-200 bg-[#f8fbfa] p-3 md:grid-cols-[110px_minmax(0,1fr)_130px_100px_100px_44px]">
                    <select value={item.type} onChange={(event) => updateEstimateItem(item.id, { type: event.target.value as ItemType })} className="input">
                      <option value="part">Part</option>
                      <option value="labour">Labour</option>
                    </select>
                    <div className="flex min-w-0 gap-2">
                      <input value={item.name} onChange={(event) => typeEstimatePartName(item.id, event.target.value)} onFocus={() => setEstimatePickerItemId(item.id)} className="input min-w-0 flex-1" placeholder="Part or labour item" />
                      <button onClick={() => setEstimatePickerItemId(item.id)} className="shrink-0 rounded-md border border-slate-300 bg-white px-3 text-[#1f6f64]" title="Search parts" aria-label="Search parts">
                        <Search className="h-4 w-4" />
                      </button>
                    </div>
                    <input value={item.partNumber} onChange={(event) => updateEstimateItem(item.id, { partNumber: event.target.value })} className="input" placeholder="Part Number" />
                    <input type="number" value={item.price} onChange={(event) => updateEstimateItem(item.id, { price: Number(event.target.value) })} className="input" placeholder="Rate" />
                    <input type="number" value={item.qty} onChange={(event) => updateEstimateItem(item.id, { qty: Number(event.target.value) })} className="input" placeholder="Qty" />
                    <button onClick={() => setEstimateItems((current) => current.filter((entry) => entry.id !== item.id))} className="justify-self-end rounded-md p-2 text-red-600 hover:bg-red-50 md:justify-self-auto" title="Remove" aria-label="Remove item">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => setEstimateItems((current) => [...current, newItem()])} className="btn-secondary mt-3"><Plus className="h-4 w-4" /> Add item</button>
            </Panel>

            <RecordsList
              title="Saved estimates"
              records={store.estimates}
              query={estimateSearch}
              setQuery={setEstimateSearch}
              render={(entry) => (
                <div key={entry.id} className="rounded-lg border border-slate-200 bg-[#f8fbfa] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold">{entry.estimateNo} · {entry.customer.name || "-"}</p>
                    <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-[#1f6f64]">{entry.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{entry.customer.phone || "-"} · {entry.jobDetails.registrationNo || entry.customer.vehicle || "-"} · {money(entry.rounded)}</p>
                </div>
              )}
            />
          </section>

          <aside className="min-w-0 space-y-3 sm:space-y-4">
            <div className="space-y-3 sm:space-y-4 lg:sticky lg:top-[4.25rem]">
              <Panel icon={<BadgeIndianRupee />} title="Estimate summary">
                <Field label="Estimate no."><input value={estimateNo} onChange={(event) => setEstimateNo(event.target.value)} className="input" /></Field>
                <div className="mt-4 space-y-2 text-sm">
                  <Row label="Subtotal" value={money(estimateTotals.subtotal)} />
                  <Row label={`CGST ${activeGst.enabled ? activeGst.taxRate / 2 : 0}%`} value={money(estimateTotals.cgst)} />
                  <Row label={`SGST ${activeGst.enabled ? activeGst.taxRate / 2 : 0}%`} value={money(estimateTotals.sgst)} />
                  <Row label="Rounded total" value={money(estimateTotals.rounded)} strong />
                </div>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  <button onClick={() => saveEstimate("draft")} className="btn-secondary w-full"><Save className="h-4 w-4" /> Save</button>
                  <button onClick={async () => (await createEstimatePdf()).save(`${estimateNo}.pdf`)} className="btn-secondary w-full"><Download className="h-4 w-4" /> PDF</button>
                  <button onClick={sendEstimateToCustomer} disabled={normalizeCustomerPhone(estimateCustomer.phone).length !== 10} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50">
                    <MessageCircle className="h-4 w-4" /> Send estimate
                  </button>
                </div>
                {estimateStatus ? <p className="mt-3 text-sm text-red-600">{estimateStatus}</p> : null}
              </Panel>
              <InvoicePreview company={store.company} gst={activeGst} customer={estimateCustomer} jobDetails={estimateJobDetails} invoiceNo={estimateNo} items={estimateItems} totals={estimateTotals} title="Service Estimate" />
            </div>
          </aside>
        </div>
      ) : null}

      {activeTab === "enquiries" ? (
        <AdminRecordsPanel
          title="Website enquiries"
          icon={<Inbox />}
          query={recordsQuery}
          setQuery={setRecordsQuery}
          records={store.enquiries}
          statuses={["new", "contacted", "closed"]}
          onStatus={(id, nextStatus) => setStore((current) => ({
            ...current,
            enquiries: current.enquiries.map((entry) => entry.id === id ? { ...entry, status: nextStatus as EnquiryStatus } : entry),
          }))}
        />
      ) : null}

      {activeTab === "bookings" ? (
        <AdminRecordsPanel
          title="Slot bookings"
          icon={<CalendarClock />}
          query={recordsQuery}
          setQuery={setRecordsQuery}
          records={store.bookings}
          statuses={["pending", "confirmed", "completed", "cancelled"]}
          onStatus={(id, nextStatus) => setStore((current) => ({
            ...current,
            bookings: current.bookings.map((entry) => entry.id === id ? { ...entry, status: nextStatus as BookingStatus } : entry),
          }))}
        />
      ) : null}

      {templatePickerOpen ? (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-900/35 p-0 sm:items-center sm:p-6">
          <div className="max-h-[82vh] w-full overflow-hidden rounded-t-xl border border-slate-200 bg-white shadow-xl sm:mx-auto sm:max-w-lg sm:rounded-xl">
            <div className="border-b border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">Select template</p>
                  <p className="text-xs text-slate-500">All saved invoice templates.</p>
                </div>
                <button type="button" className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold" onClick={() => setTemplatePickerOpen(false)}>Close</button>
              </div>
              <input
                value={templatePopupQuery}
                onChange={(event) => setTemplatePopupQuery(event.target.value)}
                className="input mt-3"
                autoFocus
                placeholder="Search templates..."
              />
            </div>
            <div className="max-h-[58vh] overflow-y-auto p-3">
              {matchedTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className="mb-2 flex w-full items-center justify-between rounded-lg border border-slate-200 bg-[#f8fbfa] p-3 text-left"
                >
                  <span className="min-w-0">
                    <span className="block font-semibold">{template.title}</span>
                    <span className="block truncate text-xs text-slate-500">{template.keyword} · {template.items.length} items</span>
                  </span>
                  <span className="shrink-0 text-sm font-bold text-[#1f6f64]">Apply</span>
                </button>
              ))}
              {!store.templates.length ? (
                <p className="rounded-lg border border-slate-200 bg-[#f8fbfa] p-4 text-sm text-slate-500">
                  No templates saved yet. Invoice items add karke Save current use karo.
                </p>
              ) : null}
              {store.templates.length && !matchedTemplates.length ? (
                <p className="rounded-lg border border-slate-200 bg-[#f8fbfa] p-4 text-sm text-slate-500">
                  No matching template found.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {partPickerItemId ? (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-900/35 p-0 sm:items-center sm:p-6">
          <div className="max-h-[82vh] w-full overflow-hidden rounded-t-xl border border-slate-200 bg-white shadow-xl sm:mx-auto sm:max-w-lg sm:rounded-xl">
            <div className="border-b border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">Select {pickerType === "part" ? "part" : "labour"}</p>
                  <p className="text-xs text-slate-500">Search by name or part number.</p>
                </div>
                <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold" onClick={() => setPartPickerItemId(null)}>Close</button>
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
                  className="mb-2 flex w-full items-center justify-between rounded-lg border border-slate-200 bg-[#f8fbfa] p-3 text-left"
                >
                  <span>
                    <span className="block font-semibold">{part.name}</span>
                    <span className="block text-xs text-slate-500">Part Number {part.partNumber || "-"} · {money(part.price)}</span>
                  </span>
                  <span className="text-sm font-bold text-[#1f6f64]">Select</span>
                </button>
              ))}
              {pickerQuery && !filteredParts.length ? (
                <p className="rounded-lg border border-slate-200 bg-[#f8fbfa] p-4 text-sm text-slate-500">
                  No matching {pickerType === "part" ? "parts" : "labour"} found.
                </p>
              ) : null}
              {!pickerOptions.length ? (
                <p className="rounded-lg border border-slate-200 bg-[#f8fbfa] p-4 text-sm text-slate-500">
                  No saved {pickerType === "part" ? "parts" : "labour"} found. Admin panel se add karo.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {estimatePickerItemId ? (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-900/35 p-0 sm:items-center sm:p-6">
          <div className="max-h-[82vh] w-full overflow-hidden rounded-t-xl border border-slate-200 bg-white shadow-xl sm:mx-auto sm:max-w-lg sm:rounded-xl">
            <div className="border-b border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">Select {estimatePickerType === "part" ? "part" : "labour"}</p>
                  <p className="text-xs text-slate-500">Search by name or part number.</p>
                </div>
                <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold" onClick={() => setEstimatePickerItemId(null)}>Close</button>
              </div>
              <input value={estimatePickerItem?.name || ""} onChange={(event) => estimatePickerItemId && typeEstimatePartName(estimatePickerItemId, event.target.value)} className="input mt-3" autoFocus placeholder={`Search ${estimatePickerType === "part" ? "parts" : "labour"}...`} />
            </div>
            <div className="max-h-[58vh] overflow-y-auto p-3">
              {(estimatePickerQuery ? estimateFilteredParts : estimatePickerOptions).map((part) => (
                <button
                  key={part.id}
                  onClick={() => {
                    pickEstimatePart(estimatePickerItemId, part.name);
                    setEstimatePickerItemId(null);
                  }}
                  className="mb-2 flex w-full items-center justify-between rounded-lg border border-slate-200 bg-[#f8fbfa] p-3 text-left"
                >
                  <span>
                    <span className="block font-semibold">{part.name}</span>
                    <span className="block text-xs text-slate-500">Part Number {part.partNumber || "-"} · {money(part.price)}</span>
                  </span>
                  <span className="text-sm font-bold text-[#1f6f64]">Select</span>
                </button>
              ))}
              {estimatePickerQuery && !estimateFilteredParts.length ? (
                <p className="rounded-lg border border-slate-200 bg-[#f8fbfa] p-4 text-sm text-slate-500">
                  No matching {estimatePickerType === "part" ? "parts" : "labour"} found.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function RecordsList<T>({
  title,
  records,
  query,
  setQuery,
  render,
}: {
  title: string;
  records: T[];
  query: string;
  setQuery: (value: string) => void;
  render: (record: T) => ReactNode;
}) {
  const lowered = query.toLowerCase();
  const filtered = records.filter((record) => JSON.stringify(record).toLowerCase().includes(lowered));
  return (
    <Panel icon={<FileText />} title={title}>
      <input value={query} onChange={(event) => setQuery(event.target.value)} className="input mb-3" placeholder="Search..." />
      <div className="space-y-2">
        {filtered.map(render)}
        {!filtered.length ? <p className="rounded-lg border border-slate-200 bg-[#f8fbfa] p-4 text-sm text-slate-500">No records found.</p> : null}
      </div>
    </Panel>
  );
}

type AdminRecord = WebsiteEnquiry | SlotBooking;

function AdminRecordsPanel({
  title,
  icon,
  query,
  setQuery,
  records,
  statuses,
  onStatus,
}: {
  title: string;
  icon: ReactNode;
  query: string;
  setQuery: (value: string) => void;
  records: AdminRecord[];
  statuses: string[];
  onStatus: (id: string, status: string) => void;
}) {
  const lowered = query.toLowerCase();
  const filtered = records
    .filter((record) => `${record.name} ${record.phone} ${record.vehicle} ${record.model} ${record.registrationNo} ${record.service} ${record.status}`.toLowerCase().includes(lowered))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-4 sm:py-4">
      <Panel icon={icon} title={title}>
        <input value={query} onChange={(event) => setQuery(event.target.value)} className="input mb-3" placeholder="Search name, phone, service, vehicle, status..." />
        <div className="grid gap-3">
          {filtered.map((record) => (
            <article key={record.id} className="rounded-lg border border-slate-200 bg-[#f8fbfa] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-950">{record.name} · {record.phone}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {record.service} · {record.vehicle} {record.model} · {record.registrationNo || "-"}
                  </p>
                  {"date" in record ? (
                    <p className="mt-1 text-sm font-semibold text-[#1f6f64]">{record.date} at {record.time}</p>
                  ) : null}
                </div>
                <select value={record.status} onChange={(event) => onStatus(record.id, event.target.value)} className="input w-auto min-w-36">
                  {statuses.map((status) => <option key={status}>{status}</option>)}
                </select>
              </div>
              {record.message ? <p className="mt-3 rounded-md bg-white p-3 text-sm text-slate-700">{record.message}</p> : null}
              <p className="mt-2 text-xs text-slate-500">{new Date(record.createdAt).toLocaleString("en-IN")}</p>
            </article>
          ))}
          {!filtered.length ? <p className="rounded-lg border border-slate-200 bg-[#f8fbfa] p-4 text-sm text-slate-500">No records found.</p> : null}
        </div>
      </Panel>
    </div>
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
  title = "Job Card Retail - Tax Invoice",
}: {
  company: Company;
  gst: GstProfile;
  customer: Customer;
  jobDetails: JobDetails;
  invoiceNo: string;
  items: LineItem[];
  totals: { subtotal: number; tax: number; cgst: number; sgst: number; total: number; rounded: number };
  title?: string;
}) {
  const sectioned = splitItems(items);
  const rows = [...sectioned.parts, ...sectioned.labour];

  return (
    <div className="min-w-0 max-w-full overflow-hidden rounded-lg border border-zinc-800 bg-white text-black shadow-sm">
      <div className="bg-black px-3 py-3 text-white sm:px-4">
        <p className="text-center font-mono text-[9px] uppercase leading-snug tracking-wide text-zinc-300 sm:text-[10px]">Original for recipient / Duplicate for transporter / Triplicate for supplier</p>
        <div className="mt-2 bg-zinc-300 py-1 text-center text-base font-semibold text-black sm:text-lg">{title}</div>
      </div>
      <div className="space-y-4 p-3 text-xs sm:p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="font-bold">{company.name}</p>
            <p>{company.address}</p>
            <p>{company.phone}</p>
            <p>{company.email}</p>
            <p>{gst.enabled ? `Dealer GSTIN: ${gst.gstNumber}` : "Without GST bill"}</p>
          </div>
          <div className="text-left sm:text-right">
            <p>{title.includes("Estimate") ? "Estimate" : "Invoice"} No. : {invoiceNo}</p>
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
        <div className="-mx-3 max-w-full overflow-x-auto border border-zinc-400 sm:-mx-0">
          <table className="min-w-[640px] w-full text-left text-[11px]">
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
        <div className="w-full max-w-full space-y-1 text-sm sm:ml-auto sm:max-w-sm">
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
