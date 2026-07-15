"use client";

import {
  BatteryCharging,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileText,
  Gauge,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useState, type Dispatch, type FormEvent, type ReactNode, type SetStateAction } from "react";
import { normalizeStore, seedStore, type SlotBooking, type Store, type WebsiteEnquiry } from "@/lib/invoice-store";

const services = [
  { icon: <Gauge />, title: "Computer diagnostics", text: "Scanner-based fault tracing, warning light diagnosis, and repair direction." },
  { icon: <ClipboardCheck />, title: "Periodic maintenance", text: "Oil, filters, fluids, inspection, and preventive care for daily use." },
  { icon: <Sparkles />, title: "AC service", text: "Cooling checks, gas refill, leak testing, blower, and cabin comfort work." },
  { icon: <ShieldCheck />, title: "Brake & suspension", text: "Pads, discs, steering, suspension, tyres, and road safety checks." },
  { icon: <Wrench />, title: "Engine repair", text: "Pickup, noise, overheating, leakage, timing, and performance repairs." },
  { icon: <BatteryCharging />, title: "Electrical systems", text: "Battery, starter, alternator, wiring, lights, sensors, and charging issues." },
];

const serviceNames = services.map((service) => service.title);
const slotTimes = ["09:30", "10:30", "11:30", "12:30", "14:30", "15:30", "16:30", "17:30"];
const brands = ["Maruti Suzuki", "Hyundai", "Honda", "Toyota", "Mahindra", "Tata", "Kia", "Skoda", "Volkswagen", "Renault"];
const today = new Date().toISOString().slice(0, 10);

const emptyLead = {
  name: "",
  phone: "",
  email: "",
  vehicle: "",
  model: "",
  registrationNo: "",
  service: serviceNames[0],
  message: "",
};

type LeadValues = typeof emptyLead & { date?: string; time?: string };

async function loadRemoteStore() {
  const response = await fetch("/api/store", { cache: "no-store" });
  const data = (await response.json()) as { store?: Store | null };
  return normalizeStore(data.store || seedStore);
}

async function saveRemoteStore(store: Store) {
  await fetch("/api/store", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(store),
  });
}

export default function LandingPage() {
  const [enquiry, setEnquiry] = useState<LeadValues>(emptyLead);
  const [booking, setBooking] = useState<LeadValues>({ ...emptyLead, date: today, time: slotTimes[0] });
  const [enquiryStatus, setEnquiryStatus] = useState("");
  const [bookingStatus, setBookingStatus] = useState("");
  const [saving, setSaving] = useState<"enquiry" | "booking" | "">("");

  async function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving("enquiry");
    setEnquiryStatus("");
    try {
      const store = await loadRemoteStore();
      const record: WebsiteEnquiry = {
        id: crypto.randomUUID(),
        ...enquiry,
        status: "new",
        createdAt: new Date().toISOString(),
      };
      await saveRemoteStore({ ...store, enquiries: [record, ...store.enquiries] });
      setEnquiry(emptyLead);
      setEnquiryStatus("Enquiry sent. Workshop team will contact you.");
    } catch (error) {
      setEnquiryStatus(error instanceof Error ? error.message : "Unable to send enquiry.");
    } finally {
      setSaving("");
    }
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving("booking");
    setBookingStatus("");
    try {
      const store = await loadRemoteStore();
      const duplicate = store.bookings.some(
        (entry) => entry.date === booking.date && entry.time === booking.time && entry.status !== "cancelled",
      );
      if (duplicate) {
        setBookingStatus("This slot is already booked. Please choose another time.");
        return;
      }
      const record: SlotBooking = {
        id: crypto.randomUUID(),
        ...booking,
        date: booking.date || today,
        time: booking.time || slotTimes[0],
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      await saveRemoteStore({ ...store, bookings: [record, ...store.bookings] });
      setBooking({ ...emptyLead, date: today, time: slotTimes[0] });
      setBookingStatus("Slot request saved. Workshop team will confirm it.");
    } catch (error) {
      setBookingStatus(error instanceof Error ? error.message : "Unable to book slot.");
    } finally {
      setSaving("");
    }
  }

  return (
    <main className="min-h-screen max-w-[100vw] overflow-x-hidden bg-[#f6f8f5] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#176f63] text-sm font-black text-white shadow-sm">CM</span>
            <span className="min-w-0">
              <span className="block truncate text-base font-black tracking-wide text-slate-950">CAR MECHANIC</span>
              <span className="block truncate text-xs font-semibold text-slate-500">Sarita Vihar, New Delhi</span>
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <a href="tel:+919718717540" className="hidden min-h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:border-[#176f63] hover:text-[#176f63] sm:inline-flex">
              <Phone className="mr-2 h-4 w-4" /> Call
            </a>
            <Link href="/admin" className="inline-flex min-h-10 items-center rounded-md bg-[#176f63] px-4 text-sm font-bold text-white shadow-sm hover:bg-[#12594f]">
              Admin
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative isolate overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(246,248,245,.97),rgba(246,248,245,.88)_46%,rgba(246,248,245,.50)),url('/bannerweb.jpg')] bg-cover bg-center" />
        <div className="mx-auto flex min-h-[calc(100svh-69px)] max-w-7xl items-center px-4 py-10 sm:px-6 lg:py-16">
          <div className="w-full max-w-[22rem] sm:max-w-3xl">
            <p className="inline-flex rounded-md border border-[#a9d8d0] bg-white/80 px-3 py-1 text-xs font-black uppercase tracking-wide text-[#176f63] shadow-sm">
              Multi-brand car service specialist
            </p>
            <h1 className="mt-5 text-4xl font-black leading-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Precision service for modern cars.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
              CAR MECHANIC brings professional diagnostics, repair discipline, transparent estimates, and workshop billing from Sarita Vihar, New Delhi.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="#book-slot" className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#176f63] px-5 text-sm font-black text-white shadow-lg shadow-[#176f63]/20 hover:bg-[#12594f]">
                <CalendarClock className="mr-2 h-4 w-4" /> Book slot
              </a>
              <a href="#enquiry" className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-black text-slate-900 shadow-sm hover:border-[#176f63] hover:text-[#176f63]">
                <MessageCircle className="mr-2 h-4 w-4" /> Send enquiry
              </a>
            </div>
            <div className="mt-9 grid max-w-[22rem] grid-cols-1 gap-3 sm:max-w-3xl sm:grid-cols-3">
              {[["16+", "Years hands-on experience"], ["10+", "Popular car brands handled"], ["GST", "Estimate and invoice system"]].map(([value, label]) => (
                <div key={label} className="rounded-md border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur">
                  <p className="text-3xl font-black text-[#176f63]">{value}</p>
                  <p className="mt-1 text-sm font-bold text-slate-600">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-center lg:py-16">
          <div className="rounded-lg border border-[#a9d8d0] bg-[#e6f3f0] p-6 shadow-xl">
            <MapPin className="h-9 w-9 text-[#176f63]" />
            <h2 className="mt-4 text-3xl font-black leading-tight text-slate-950">CAR MECHANIC Workshop</h2>
            <div className="mt-5 space-y-3 text-sm font-semibold leading-6 text-slate-700">
              <p>Plot No. H-98 Sarita Vihar, Kalindi Kunj, New Delhi 110025</p>
              <p>Phone: +91 97187 17540</p>
              <p>Email: carmechanic99722@gmail.com</p>
              <p>Open for diagnostics, service, repair estimates, parts, labour, and final billing.</p>
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black uppercase tracking-wide text-[#176f63]">Workshop details</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight text-slate-950 sm:text-5xl">Transparent service flow from enquiry to delivery.</h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              Send your issue, reserve a visit slot, receive a clear estimate, and get job-card billing with parts, labour, and GST details.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {["Scanner diagnosis before major repair", "Saved customer and vehicle records", "Estimate and invoice PDF sharing", "Phone and WhatsApp customer updates"].map((item) => (
                <p key={item} className="flex items-center gap-3 rounded-md border border-slate-200 bg-[#f8fbfa] px-4 py-3 text-sm font-bold text-slate-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#176f63]" /> {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[#176f63]">Workshop capability</p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">Advanced care for everyday reliability.</h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              A focused service setup for diagnostics, scheduled maintenance, electrical faults, and mechanical repairs.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article key={service.title} className="group rounded-md border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#a9d8d0] hover:shadow-xl hover:shadow-slate-200/70">
                <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-md bg-[#e6f3f0] text-[#176f63] group-hover:bg-[#176f63] group-hover:text-white [&>svg]:h-5 [&>svg]:w-5">
                  {service.icon}
                </span>
                <h3 className="font-black text-slate-950">{service.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{service.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-16">
          <LeadForm id="enquiry" title="Send service enquiry" icon={<MessageCircle />} status={enquiryStatus} saving={saving === "enquiry"} submitLabel="Send enquiry" values={enquiry} setValues={setEnquiry} onSubmit={submitEnquiry} />
          <LeadForm id="book-slot" title="Book workshop slot" icon={<CalendarClock />} status={bookingStatus} saving={saving === "booking"} submitLabel="Book slot" values={booking} setValues={setBooking} onSubmit={submitBooking} booking />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[#176f63]">Brand confidence</p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">Experience with leading car brands.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
              Built for common Indian and international vehicles, with practical repair judgment for family cars, fleet cars, and premium daily drivers.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {brands.map((brand) => (
                <span key={brand} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm">
                  {brand}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-3">
            {[{ icon: <Star />, title: "Experienced leadership", text: "16+ years workshop experience." }, { icon: <Clock />, title: "Timed visits", text: "Reserve a date and time before arriving." }, { icon: <FileText />, title: "Clear paperwork", text: "Estimate, invoice, and customer records in admin." }].map((item) => (
              <article key={item.title} className="flex gap-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#e6f3f0] text-[#176f63] [&>svg]:h-5 [&>svg]:w-5">{item.icon}</span>
                <span>
                  <span className="block font-black text-slate-950">{item.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-slate-600">{item.text}</span>
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-[#10201d] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[#9be0d3]">Book a visit</p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">Need a reliable mechanic for your car?</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200">
              Call, WhatsApp, send enquiry, or book a workshop slot for diagnostics, service, AC, brake, engine, and electrical work.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <a href="tel:+919718717540" className="inline-flex min-h-12 items-center justify-center rounded-md bg-white px-5 text-sm font-black text-[#176f63]">
              <Phone className="mr-2 h-4 w-4" /> +91 97187 17540
            </a>
            <a href="https://wa.me/919718717540" className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/30 px-5 text-sm font-black text-white">
              <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

function LeadForm({
  id,
  title,
  icon,
  status,
  saving,
  submitLabel,
  values,
  setValues,
  onSubmit,
  booking,
}: {
  id: string;
  title: string;
  icon: ReactNode;
  status: string;
  saving: boolean;
  submitLabel: string;
  values: LeadValues;
  setValues: Dispatch<SetStateAction<LeadValues>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  booking?: boolean;
}) {
  const patch = (field: keyof LeadValues, value: string) => setValues((current) => ({ ...current, [field]: value }));

  return (
    <form id={id} onSubmit={onSubmit} className="rounded-lg border border-slate-200 bg-[#f8fbfa] p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-md bg-[#e6f3f0] text-[#176f63] [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
        <h2 className="text-xl font-black text-slate-950">{title}</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input required value={values.name} onChange={(event) => patch("name", event.target.value)} className="input" placeholder="Name *" />
        <input required value={values.phone} onChange={(event) => patch("phone", event.target.value)} className="input" placeholder="Phone *" inputMode="tel" />
        <input value={values.email} onChange={(event) => patch("email", event.target.value)} className="input" placeholder="Email" type="email" />
        <select required value={values.service} onChange={(event) => patch("service", event.target.value)} className="input">
          {serviceNames.map((service) => <option key={service}>{service}</option>)}
        </select>
        <input required value={values.vehicle} onChange={(event) => patch("vehicle", event.target.value)} className="input" placeholder="Vehicle *" />
        <input required value={values.model} onChange={(event) => patch("model", event.target.value)} className="input" placeholder="Model *" />
        <input required value={values.registrationNo} onChange={(event) => patch("registrationNo", event.target.value.toUpperCase())} className="input" placeholder="Registration no. *" />
        {booking ? (
          <>
            <input required type="date" min={today} value={values.date || today} onChange={(event) => patch("date", event.target.value)} className="input" />
            <select required value={values.time || slotTimes[0]} onChange={(event) => patch("time", event.target.value)} className="input">
              {slotTimes.map((time) => <option key={time}>{time}</option>)}
            </select>
          </>
        ) : null}
      </div>
      <textarea required value={values.message} onChange={(event) => patch("message", event.target.value)} className="input mt-3 min-h-28 py-3" placeholder={booking ? "Work needed or issue details *" : "Tell us what service you need *"} />
      <button disabled={saving} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-[#176f63] px-5 text-sm font-black text-white disabled:opacity-60">
        {saving ? "Saving..." : submitLabel}
      </button>
      {status ? <p className="mt-3 text-sm font-semibold text-[#176f63]">{status}</p> : null}
    </form>
  );
}
