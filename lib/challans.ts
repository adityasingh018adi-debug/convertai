export const CHALLAN_TYPES = [
  "Delivery Challan",
  "Goods Return Challan",
  "Stock Transfer Challan",
  "Material Transfer Challan",
  "Job Work Challan",
  "Rental Challan",
  "Repair Challan",
  "Sample Challan",
  "Courier Challan",
  "Gate Pass",
] as const;
export type ChallanType = (typeof CHALLAN_TYPES)[number];

export type ChallanLineItem = { id: string; desc: string; qty: number; unit: string; rate?: number };

export type ChallanRecord = {
  id: string;
  challanNo: string;
  type: ChallanType;
  date: string;
  companyId: string;
  deliverTo: string;
  vehicle: string;
  items: ChallanLineItem[];
  createdAt: string;
  updatedAt: string;
};

const LS_KEY = "doclify_challans_v1";
const LS_COUNTER = "doclify_challan_counter_v1";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function getChallans(): ChallanRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as ChallanRecord[]) : [];
  } catch {
    return [];
  }
}

function persist(list: ChallanRecord[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function getChallan(id: string): ChallanRecord | undefined {
  return getChallans().find((c) => c.id === id);
}

export function nextChallanNumber(): string {
  if (typeof window === "undefined") return "CH-0001";
  try {
    const raw = localStorage.getItem(LS_COUNTER);
    const next = raw ? parseInt(raw, 10) + 1 : 1;
    localStorage.setItem(LS_COUNTER, String(next));
    return `CH-${String(next).padStart(4, "0")}`;
  } catch {
    return `CH-${Date.now()}`;
  }
}

export function saveChallan(data: Omit<ChallanRecord, "id" | "createdAt" | "updatedAt"> & { id?: string }): ChallanRecord {
  const now = new Date().toISOString();
  const list = getChallans();
  if (data.id) {
    const existing = list.find((c) => c.id === data.id);
    if (existing) {
      const updated: ChallanRecord = { ...existing, ...data, id: existing.id, updatedAt: now };
      persist(list.map((c) => (c.id === existing.id ? updated : c)));
      return updated;
    }
  }
  const record: ChallanRecord = { ...data, id: uid(), createdAt: now, updatedAt: now };
  persist([record, ...list]);
  return record;
}

export function deleteChallan(id: string) {
  persist(getChallans().filter((c) => c.id !== id));
}

export function searchChallans(query: string): ChallanRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return getChallans();
  return getChallans().filter(
    (c) =>
      c.challanNo.toLowerCase().includes(q) ||
      c.deliverTo.toLowerCase().includes(q) ||
      c.vehicle.toLowerCase().includes(q) ||
      c.items.some((it) => it.desc.toLowerCase().includes(q))
  );
}
