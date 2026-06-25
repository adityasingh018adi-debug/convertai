export type Customer = {
  id: string;
  name: string;
  gst?: string;
  address?: string;
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: string;
};

const LS_KEY = "doclify_customers_v1";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function getCustomers(): Customer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Customer[]) : [];
  } catch {
    return [];
  }
}

function persist(list: Customer[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function addCustomer(data: Omit<Customer, "id" | "createdAt">): Customer {
  const customer: Customer = { id: uid(), createdAt: new Date().toISOString(), ...data, name: data.name.trim() };
  persist([customer, ...getCustomers()]);
  return customer;
}

export function updateCustomer(id: string, data: Partial<Omit<Customer, "id" | "createdAt">>) {
  persist(getCustomers().map((c) => (c.id === id ? { ...c, ...data } : c)));
}

export function deleteCustomer(id: string) {
  persist(getCustomers().filter((c) => c.id !== id));
}

export function searchCustomers(query: string): Customer[] {
  const q = query.trim().toLowerCase();
  if (!q) return getCustomers();
  return getCustomers().filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.gst?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.email?.toLowerCase().includes(q)
  );
}
