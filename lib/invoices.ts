export type PaymentStatus = "draft" | "pending" | "paid" | "partial" | "overdue";

export type InvoiceLineItem = {
  id: string;
  productId?: string;
  desc: string;
  hsn?: string;
  qty: number;
  rate: number;
  gstPercent: number;
};

export type InvoiceRecord = {
  id: string;
  invoiceNo: string;
  date: string;
  dueDate?: string;
  poNumber?: string;
  deliveryDate?: string;
  companyId: string;
  customerId?: string;
  billTo: string;
  gstin: string;
  items: InvoiceLineItem[];
  discountType: "percent" | "flat";
  discountValue: number;
  shipping: number;
  roundOff: boolean;
  taxMode: "cgst-sgst" | "igst";
  notes?: string;
  terms?: string;
  status: PaymentStatus;
  template: "modern" | "minimal" | "professional" | "gst" | "restaurant" | "retail" | "wholesale";
  createdAt: string;
  updatedAt: string;
};

const LS_KEY = "doclify_invoices_v1";
const LS_COUNTER = "doclify_invoice_counter_v1";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function getInvoices(): InvoiceRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as InvoiceRecord[]) : [];
  } catch {
    return [];
  }
}

function persist(list: InvoiceRecord[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function getInvoice(id: string): InvoiceRecord | undefined {
  return getInvoices().find((i) => i.id === id);
}

export function nextInvoiceNumber(): string {
  if (typeof window === "undefined") return "INV-0001";
  try {
    const raw = localStorage.getItem(LS_COUNTER);
    const next = raw ? parseInt(raw, 10) + 1 : 1;
    localStorage.setItem(LS_COUNTER, String(next));
    return `INV-${String(next).padStart(4, "0")}`;
  } catch {
    return `INV-${Date.now()}`;
  }
}

export function saveInvoice(data: Omit<InvoiceRecord, "id" | "createdAt" | "updatedAt"> & { id?: string }): InvoiceRecord {
  const now = new Date().toISOString();
  const list = getInvoices();
  if (data.id) {
    const existing = list.find((i) => i.id === data.id);
    if (existing) {
      const updated: InvoiceRecord = { ...existing, ...data, id: existing.id, updatedAt: now };
      persist(list.map((i) => (i.id === existing.id ? updated : i)));
      return updated;
    }
  }
  const record: InvoiceRecord = { ...data, id: uid(), createdAt: now, updatedAt: now };
  persist([record, ...list]);
  return record;
}

export function deleteInvoice(id: string) {
  persist(getInvoices().filter((i) => i.id !== id));
}

export function duplicateInvoice(id: string): InvoiceRecord | undefined {
  const original = getInvoice(id);
  if (!original) return undefined;
  const now = new Date().toISOString();
  const copy: InvoiceRecord = {
    ...original,
    id: uid(),
    invoiceNo: nextInvoiceNumber(),
    status: "draft",
    createdAt: now,
    updatedAt: now,
    items: original.items.map((it) => ({ ...it, id: uid() })),
  };
  persist([copy, ...getInvoices()]);
  return copy;
}

export function computeInvoiceTotals(inv: Pick<InvoiceRecord, "items" | "discountType" | "discountValue" | "shipping" | "roundOff" | "taxMode">) {
  const subtotal = inv.items.reduce((s, i) => s + i.qty * i.rate, 0);
  const discount = inv.discountType === "percent" ? subtotal * (inv.discountValue / 100) : inv.discountValue;
  const taxable = Math.max(0, subtotal - discount);
  const taxAmount = inv.items.reduce((s, i) => {
    const lineTaxable = i.qty * i.rate * (taxable / Math.max(subtotal, 1));
    return s + lineTaxable * (i.gstPercent / 100);
  }, 0);
  const beforeRound = taxable + taxAmount + inv.shipping;
  const total = inv.roundOff ? Math.round(beforeRound) : Math.round(beforeRound * 100) / 100;
  return {
    subtotal,
    discount,
    taxable,
    taxAmount,
    cgst: inv.taxMode === "cgst-sgst" ? taxAmount / 2 : 0,
    sgst: inv.taxMode === "cgst-sgst" ? taxAmount / 2 : 0,
    igst: inv.taxMode === "igst" ? taxAmount : 0,
    shipping: inv.shipping,
    total,
    roundOffAmount: inv.roundOff ? total - beforeRound : 0,
  };
}

export function searchInvoices(query: string, filters?: { status?: PaymentStatus }): InvoiceRecord[] {
  let list = getInvoices();
  if (filters?.status) list = list.filter((i) => i.status === filters.status);
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter(
    (i) =>
      i.invoiceNo.toLowerCase().includes(q) ||
      i.billTo.toLowerCase().includes(q) ||
      i.gstin.toLowerCase().includes(q) ||
      i.items.some((it) => it.desc.toLowerCase().includes(q))
  );
}
