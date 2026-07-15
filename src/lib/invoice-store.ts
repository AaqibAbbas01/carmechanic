export type Role = "user" | "admin"
export type ItemType = "part" | "labour"

export type Company = {
  name: string
  address: string
  phone: string
  email: string
  logoText: string
  logoUrl?: string
  whatsappMessage: string
}

export type GstProfile = {
  id: string
  label: string
  gstNumber: string
  taxRate: number
  enabled: boolean
}

export type AppUser = {
  id: string
  name: string
  phone: string
  pin: string
  active: boolean
}

export type AdminAccount = {
  username: string
  password: string
}

export type Part = {
  id: string
  name: string
  price: number
  partNumber: string
  hsn?: string
  type?: ItemType
}

export type LineItem = {
  id: string
  name: string
  qty: number
  price: number
  partNumber: string
  hsn?: string
  type: ItemType
  batch?: string
}

export type Template = {
  id: string
  keyword: string
  title: string
  items: LineItem[]
}

export type EstimateStatus = "draft" | "sent" | "approved" | "closed"
export type EnquiryStatus = "new" | "contacted" | "closed"
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled"

export type Customer = {
  name: string
  phone: string
  email?: string
  vehicle?: string
  registrationNo?: string
  model?: string
  chassisNo?: string
  mileage?: string
  customerGstin?: string
}

export type JobDetails = {
  registrationNo: string
  jobCardNo: string
  jobCardDate: string
  model: string
  chassisNo: string
  mileage: string
  serviceAdvisor: string
  serviceType: string
  placeOfSupply: string
  pan: string
  customerGstin: string
}

export type EstimateRecord = {
  id: string
  estimateNo: string
  customer: Customer
  jobDetails: JobDetails
  items: LineItem[]
  notes: string
  subtotal: number
  tax: number
  total: number
  rounded: number
  gstProfileId: string
  status: EstimateStatus
  createdAt: string
}

export type WebsiteEnquiry = {
  id: string
  name: string
  phone: string
  email?: string
  vehicle: string
  model: string
  registrationNo: string
  service: string
  message: string
  status: EnquiryStatus
  createdAt: string
}

export type SlotBooking = {
  id: string
  name: string
  phone: string
  email?: string
  vehicle: string
  model: string
  registrationNo: string
  service: string
  date: string
  time: string
  message: string
  status: BookingStatus
  createdAt: string
}

export type Store = {
  company: Company
  admin: AdminAccount
  gstProfiles: GstProfile[]
  activeGstId: string
  users: AppUser[]
  parts: Part[]
  templates: Template[]
  customers: Customer[]
  estimates: EstimateRecord[]
  enquiries: WebsiteEnquiry[]
  bookings: SlotBooking[]
}

export const defaultCompany: Company = {
  name: "CAR MECHANIC",
  address: "Plot No. H-98 Sarita Vihar, Kalindi Kunj, New Delhi 110025",
  phone: "+91 97187 17540",
  email: "carmechanic99722@gmail.com",
  logoText: "CM",
  logoUrl: "/WhatsApp%20Image%202026-06-22%20at%2016.05.29%20(1).jpeg",
  whatsappMessage:
    "Namaste {name}, CAR MECHANIC invoice {invoiceNo} ready hai. Total amount Rs {total}. Dhanyavaad.",
}

export const defaultGstProfiles: GstProfile[] = [
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
]

export const defaultUsers: AppUser[] = [
  { id: "u1", name: "Workshop User", phone: "9999999999", pin: "user123", active: true },
]

export const defaultAdmin: AdminAccount = {
  username: "admin",
  password: "admin123",
}

export const defaultParts: Part[] = [
  { id: "p1", name: "Gasket", price: 10.16, partNumber: "09168M14012", type: "part" },
  { id: "p2", name: "Element, air cleaner", price: 406.77, partNumber: "13780M50R00", type: "part" },
  { id: "p3", name: "Filter assy, oil", price: 88.98, partNumber: "16510M65L10", type: "part" },
  { id: "p4", name: "Paper floor mat", price: 2.54, partNumber: "99000M24121-137", type: "part" },
  { id: "p5", name: "Super long life coolant", price: 317.79, partNumber: "99000M24121-246", type: "part" },
  { id: "p6", name: "Grease sachet, caliper pin", price: 16.94, partNumber: "99000M25010", type: "part" },
  { id: "p7", name: "PMS - 1P 20K", price: 1625, partNumber: "ZE61L0P", type: "labour" },
  { id: "p8", name: "Front brake caliper assy", price: 408, partNumber: "MK02R0", type: "labour" },
  { id: "p9", name: "Wheel alignment", price: 440, partNumber: "ZA11L0", type: "labour" },
]

export const seedStore: Store = {
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
  estimates: [],
  enquiries: [],
  bookings: [],
}

export const emptyCustomer: Customer = {
  name: "",
  phone: "",
  email: "",
  vehicle: "",
  registrationNo: "",
  model: "",
  chassisNo: "",
  mileage: "",
  customerGstin: "",
}
export const emptyJobDetails: JobDetails = {
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
}
export const emptyUser: AppUser = { id: "", name: "", phone: "", pin: "", active: true }
export const emptyGst: GstProfile = { id: "", label: "", gstNumber: "", taxRate: 18, enabled: true }

export const ROLE_STORAGE_KEY = "mechanic-invoice-role"

export const newItem = (): LineItem => ({
  id: crypto.randomUUID(),
  name: "",
  qty: 1,
  price: 0,
  partNumber: "",
  type: "part",
  batch: "",
})

export const invoiceNumber = () =>
  `BR/${new Date().getFullYear().toString().slice(-2)}${Date.now().toString().slice(-6)}`

export const estimateNumber = () =>
  `EST/${new Date().getFullYear().toString().slice(-2)}${Date.now().toString().slice(-6)}`

export function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value)
}

export function pdfMoney(value: number) {
  return Number(value || 0).toFixed(2)
}

export function imageToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export function customerWhatsAppUrl(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "").slice(-10)
  if (digits.length !== 10) return null
  return `https://wa.me/91${digits}?text=${encodeURIComponent(message)}`
}

export function normalizeCustomerPhone(phone: string) {
  return phone.replace(/\D/g, "").slice(-10)
}

export function normalizeCustomer(customer: Partial<Customer>): Customer {
  const registrationNo = customer.registrationNo || customer.vehicle || ""
  return {
    name: customer.name || "",
    phone: customer.phone || "",
    email: customer.email || "",
    vehicle: customer.vehicle || registrationNo,
    registrationNo,
    model: customer.model || "",
    chassisNo: customer.chassisNo || "",
    mileage: customer.mileage || "",
    customerGstin: customer.customerGstin || "",
  }
}

export function customerFromForm(customer: Customer, jobDetails: JobDetails): Customer {
  return normalizeCustomer({
    ...customer,
    registrationNo: jobDetails.registrationNo,
    model: jobDetails.model,
    chassisNo: jobDetails.chassisNo,
    mileage: jobDetails.mileage,
    customerGstin: jobDetails.customerGstin,
    vehicle: customer.vehicle || jobDetails.registrationNo,
  })
}

export function applyCustomerToJobDetails(jobDetails: JobDetails, customer: Customer): JobDetails {
  return {
    ...jobDetails,
    registrationNo: customer.registrationNo || customer.vehicle || jobDetails.registrationNo,
    model: customer.model || jobDetails.model,
    chassisNo: customer.chassisNo || jobDetails.chassisNo,
    mileage: customer.mileage || jobDetails.mileage,
    customerGstin: customer.customerGstin || jobDetails.customerGstin,
  }
}

export function normalizePart(part: Partial<Part>): Part {
  return {
    id: part.id || crypto.randomUUID(),
    name: part.name || "",
    price: Number(part.price || 0),
    partNumber: part.partNumber || part.hsn || "",
    hsn: part.hsn,
    type: part.type || "part",
  }
}

export function normalizeItem(item: Partial<LineItem>): LineItem {
  return {
    id: item.id || crypto.randomUUID(),
    name: item.name || "",
    qty: Number(item.qty || 1),
    price: Number(item.price || 0),
    partNumber: item.partNumber || item.hsn || "",
    hsn: item.hsn,
    type: item.type || "part",
    batch: item.batch || "",
  }
}

export function normalizeEstimate(estimate: Partial<EstimateRecord>): EstimateRecord {
  return {
    id: estimate.id || crypto.randomUUID(),
    estimateNo: estimate.estimateNo || estimateNumber(),
    customer: normalizeCustomer(estimate.customer || {}),
    jobDetails: { ...emptyJobDetails, ...estimate.jobDetails },
    items: estimate.items?.map(normalizeItem) || [],
    notes: estimate.notes || "",
    subtotal: Number(estimate.subtotal || 0),
    tax: Number(estimate.tax || 0),
    total: Number(estimate.total || 0),
    rounded: Number(estimate.rounded || estimate.total || 0),
    gstProfileId: estimate.gstProfileId || defaultGstProfiles[0].id,
    status: estimate.status || "draft",
    createdAt: estimate.createdAt || new Date().toISOString(),
  }
}

export function normalizeEnquiry(enquiry: Partial<WebsiteEnquiry>): WebsiteEnquiry {
  return {
    id: enquiry.id || crypto.randomUUID(),
    name: enquiry.name || "",
    phone: enquiry.phone || "",
    email: enquiry.email || "",
    vehicle: enquiry.vehicle || "",
    model: enquiry.model || "",
    registrationNo: enquiry.registrationNo || "",
    service: enquiry.service || "",
    message: enquiry.message || "",
    status: enquiry.status || "new",
    createdAt: enquiry.createdAt || new Date().toISOString(),
  }
}

export function normalizeBooking(booking: Partial<SlotBooking>): SlotBooking {
  return {
    id: booking.id || crypto.randomUUID(),
    name: booking.name || "",
    phone: booking.phone || "",
    email: booking.email || "",
    vehicle: booking.vehicle || "",
    model: booking.model || "",
    registrationNo: booking.registrationNo || "",
    service: booking.service || "",
    date: booking.date || "",
    time: booking.time || "",
    message: booking.message || "",
    status: booking.status || "pending",
    createdAt: booking.createdAt || new Date().toISOString(),
  }
}

export function normalizeStore(input: Partial<Store> | null | undefined): Store {
  const parsed = input || {}
  const oldCompany = parsed.company as
    | (Partial<Company> & { gstNumber?: string; taxRate?: number; gstEnabled?: boolean })
    | undefined
  const migratedGst = parsed.gstProfiles?.length
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
      ]

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
    customers: parsed.customers?.map(normalizeCustomer) || [],
    estimates: parsed.estimates?.map(normalizeEstimate) || [],
    enquiries: parsed.enquiries?.map(normalizeEnquiry) || [],
    bookings: parsed.bookings?.map(normalizeBooking) || [],
  }
}

export function loadStore(): Store {
  if (typeof window === "undefined") return seedStore
  const raw = localStorage.getItem("mechanic-invoice-store")
  return raw ? normalizeStore(JSON.parse(raw)) : seedStore
}

export function loadRole(): Role | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(ROLE_STORAGE_KEY)
  return raw === "admin" || raw === "user" ? raw : null
}

export function saveRole(role: Role | null) {
  if (typeof window === "undefined") return
  if (role) localStorage.setItem(ROLE_STORAGE_KEY, role)
  else localStorage.removeItem(ROLE_STORAGE_KEY)
}

export function getActiveGst(store: Store) {
  return store.gstProfiles.find((gst) => gst.id === store.activeGstId) || store.gstProfiles[0] || defaultGstProfiles[0]
}

export function splitItems(items: LineItem[]) {
  return {
    parts: items.filter((item) => item.type === "part"),
    labour: items.filter((item) => item.type === "labour"),
  }
}

export const SETTINGS_ROUTES = [
  { href: "/settings/company", label: "Company" },
  { href: "/settings/admin", label: "Admin" },
  { href: "/settings/gst", label: "GST" },
  { href: "/settings/users", label: "Users" },
  { href: "/settings/parts", label: "Parts" },
] as const
