export type Product = {
  id: string;
  name: string;
  sku?: string;
  barcode?: string;
  hsn?: string;
  gstPercent: number;
  sellingPrice: number;
  purchasePrice?: number;
  unit: string;
  category?: string;
  image?: string; // dataURL
  createdAt: string;
};

const LS_KEY = "doclify_products_v1";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function getProducts(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Product[]) : [];
  } catch {
    return [];
  }
}

function persist(list: Product[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function addProduct(data: Omit<Product, "id" | "createdAt">): Product {
  const product: Product = { id: uid(), createdAt: new Date().toISOString(), ...data, name: data.name.trim() };
  persist([product, ...getProducts()]);
  return product;
}

export function updateProduct(id: string, data: Partial<Omit<Product, "id" | "createdAt">>) {
  persist(getProducts().map((p) => (p.id === id ? { ...p, ...data } : p)));
}

export function deleteProduct(id: string) {
  persist(getProducts().filter((p) => p.id !== id));
}

export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return getProducts();
  return getProducts().filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.barcode?.includes(q) ||
      p.category?.toLowerCase().includes(q)
  );
}
