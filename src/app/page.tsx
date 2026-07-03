import {
  BatteryCharging,
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
import Image from "next/image";
import Link from "next/link";
import ownerPhoto from "../../public/PHOTO-2026-07-03-21-08-40.jpg";

const services = [
  { icon: <Gauge />, title: "Computer diagnostics", text: "Scanner-based fault tracing, warning light diagnosis, and repair direction." },
  { icon: <ClipboardCheck />, title: "Periodic maintenance", text: "Oil, filters, fluids, inspection, and preventive care for daily use." },
  { icon: <Sparkles />, title: "AC service", text: "Cooling checks, gas refill, leak testing, blower, and cabin comfort work." },
  { icon: <ShieldCheck />, title: "Brake & suspension", text: "Pads, discs, steering, suspension, tyres, and road safety checks." },
  { icon: <Wrench />, title: "Engine repair", text: "Pickup, noise, overheating, leakage, timing, and performance repairs." },
  { icon: <BatteryCharging />, title: "Electrical systems", text: "Battery, starter, alternator, wiring, lights, sensors, and charging issues." },
];

const brands = ["Maruti Suzuki", "Hyundai", "Honda", "Toyota", "Mahindra", "Tata", "Kia", "Skoda", "Volkswagen", "Renault"];

const process = [
  ["01", "Inspect", "Vehicle check, scan, road-test notes, and customer concern capture."],
  ["02", "Explain", "Clear job-card with work, parts, labour, and priority shared upfront."],
  ["03", "Repair", "Skilled execution using brand-aware procedures and practical workshop experience."],
  ["04", "Deliver", "Final checks, invoice, and customer update through phone or WhatsApp."],
];

export default function LandingPage() {
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
              CAR MECHANIC brings professional diagnostics, repair discipline, and transparent workshop billing under the guidance of Mr Waseem Khan.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="tel:+919718717540" className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#176f63] px-5 text-sm font-black text-white shadow-lg shadow-[#176f63]/20 hover:bg-[#12594f]">
                <Phone className="mr-2 h-4 w-4" /> Book service
              </a>
              <a href="https://wa.me/919718717540" className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-black text-slate-900 shadow-sm hover:border-[#176f63] hover:text-[#176f63]">
                <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp now
              </a>
            </div>
            <div className="mt-9 grid max-w-[22rem] grid-cols-1 gap-3 sm:max-w-3xl sm:grid-cols-3">
              {[
                ["16+", "Years hands-on experience"],
                ["10+", "Popular car brands handled"],
                ["GST", "Job-card invoice system"],
              ].map(([value, label]) => (
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
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
            <Image src={ownerPhoto} alt="Mr Waseem Khan, owner of CAR MECHANIC" priority className="aspect-[16/11] w-full object-cover object-[62%_38%]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black uppercase tracking-wide text-[#176f63]">Owner & automotive expert</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight text-slate-950 sm:text-5xl">Mr Waseem Khan</h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              With 16+ years of experience, Mr Waseem Khan has worked across major car brands and workshop environments, combining practical diagnosis with customer-first service delivery.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Brand-aware service approach",
                "Transparent parts and labour billing",
                "Diagnosis before repair",
                "Customer updates on phone and WhatsApp",
              ].map((item) => (
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
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-[#176f63]">Service process</p>
              <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight text-slate-950 sm:text-4xl">A cleaner workshop flow from first check to final invoice.</h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {process.map(([step, title, text]) => (
                  <article key={step} className="rounded-md border border-slate-200 bg-[#f8fbfa] p-5">
                    <p className="font-mono text-sm font-black text-[#176f63]">{step}</p>
                    <h3 className="mt-3 text-xl font-black text-slate-950">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                  </article>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-[#a9d8d0] bg-[#e6f3f0] p-6">
              <FileText className="h-9 w-9 text-[#176f63]" />
              <h3 className="mt-4 text-2xl font-black text-slate-950">Professional invoice system</h3>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                Job-card details, customer records, parts, labour, GST profiles, PDF generation, and WhatsApp sharing are managed through the workshop admin.
              </p>
              <Link href="/admin" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-[#176f63] px-4 text-sm font-black text-white">
                Open admin
              </Link>
            </div>
          </div>
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
            {[
              { icon: <Star />, title: "Experienced leadership", text: "16+ years under Mr Waseem Khan." },
              { icon: <Clock />, title: "Timely communication", text: "Clear status updates before delivery." },
              { icon: <MapPin />, title: "Convenient location", text: "Plot No. H-98 Sarita Vihar, Kalindi Kunj." },
            ].map((item) => (
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
              Call or WhatsApp CAR MECHANIC for diagnostics, service, AC, brake, engine, and electrical work.
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
