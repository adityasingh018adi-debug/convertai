"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { Package, Plus, Search, Edit2, Trash2, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getProducts, addProduct, updateProduct, deleteProduct, searchProducts, type Product } from "@/lib/products";
import { showToast } from "@/lib/toast";

const EMPTY = { name: "", sku: "", barcode: "", hsn: "", gstPercent: "18", sellingPrice: "", purchasePrice: "", unit: "pcs", category: "", image: "" };

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProductsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    setProducts(getProducts());
    setHydrated(true);
  }, []);

  const filtered = search ? searchProducts(search) : products;

  const openAdd = () => { setEditing(null); setForm(EMPTY); setError(""); setModalOpen(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, sku: p.sku ?? "", barcode: p.barcode ?? "", hsn: p.hsn ?? "",
      gstPercent: String(p.gstPercent), sellingPrice: String(p.sellingPrice),
      purchasePrice: p.purchasePrice !== undefined ? String(p.purchasePrice) : "",
      unit: p.unit, category: p.category ?? "", image: p.image ?? "",
    });
    setError(""); setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { setError("Product name is required."); return; }
    const data = {
      name: form.name, sku: form.sku, barcode: form.barcode, hsn: form.hsn,
      gstPercent: parseFloat(form.gstPercent) || 0,
      sellingPrice: parseFloat(form.sellingPrice) || 0,
      purchasePrice: form.purchasePrice ? parseFloat(form.purchasePrice) : undefined,
      unit: form.unit || "pcs", category: form.category, image: form.image,
    };
    if (editing) updateProduct(editing.id, data);
    else addProduct(data);
    setProducts(getProducts());
    setModalOpen(false);
    showToast(editing ? "Product updated." : "Product added.", "success");
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    setProducts(getProducts());
    setDeleteTarget(null);
    showToast("Product deleted.", "success");
  };

  const handleImage = async (file: File | undefined) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setForm((p) => ({ ...p, image: dataUrl }));
  };

  if (!hydrated) return <PageSkeleton sidebarOpen={sidebarOpen} onCloseSidebar={() => setSidebarOpen(false)} />;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-4xl mx-auto space-y-6">

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Package size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Product Library</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{products.length} product{products.length !== 1 ? "s" : ""} saved</p>
                </div>
              </div>
              <button onClick={openAdd}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors">
                <Plus size={13} /> Add Product
              </button>
            </motion.div>

            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 max-w-sm">
              <Search size={15} className="text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, SKU, barcode, category..."
                className="flex-1 text-sm bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400" />
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-12 text-center">
                <Package size={40} className="text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                <p className="font-bold text-slate-700 dark:text-slate-200">{search ? "No matching products" : "No products yet"}</p>
                <p className="text-sm text-slate-400 mt-1">{search ? "Try a different search term." : "Add products to instantly add them to invoices without retyping."}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filtered.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-4 flex items-center gap-3 group">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover" />
                      ) : (
                        <Package size={18} className="text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{p.name}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        ₹{p.sellingPrice}/{p.unit} · GST {p.gstPercent}% {p.sku ? `· ${p.sku}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => openEdit(p)} aria-label={`Edit ${p.name}`}
                        className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-500 transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => setDeleteTarget(p.id)} aria-label={`Delete ${p.name}`}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

          </div>
        </main>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <motion.div className="relative z-10 w-full sm:max-w-md bg-white dark:bg-slate-800 rounded-t-[28px] sm:rounded-3xl shadow-2xl overflow-hidden"
              initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                <h2 className="font-black text-slate-800 dark:text-white text-base">{editing ? "Edit Product" : "Add Product"}</h2>
                <button onClick={() => setModalOpen(false)} aria-label="Close dialog"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500">
                  <X size={16} />
                </button>
              </div>
              <div className="px-5 py-5 space-y-3 max-h-[70vh] overflow-y-auto">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                    {form.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.image} alt={""} loading="lazy" className="w-full h-full object-cover" />
                    ) : <Package size={18} className="text-slate-400" />}
                  </div>
                  <input type="file" accept="image/*" onChange={(e) => handleImage(e.target.files?.[0])}
                    className="text-xs text-slate-600 dark:text-slate-300 file:mr-2 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-emerald-100 dark:file:bg-emerald-900/30 file:text-emerald-700 dark:file:text-emerald-400 file:text-xs file:font-semibold" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">Name *</label>
                  <input autoFocus value={form.name} onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); setError(""); }}
                    placeholder="Product name"
                    className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">SKU</label>
                    <input value={form.sku} onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                      className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">Barcode</label>
                    <input value={form.barcode} onChange={(e) => setForm((p) => ({ ...p, barcode: e.target.value }))}
                      className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">HSN Code</label>
                    <input value={form.hsn} onChange={(e) => setForm((p) => ({ ...p, hsn: e.target.value }))}
                      className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">Category</label>
                    <input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                      className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">Unit</label>
                    <input value={form.unit} onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))} placeholder="pcs, kg, box..."
                      className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">GST %</label>
                    <input type="number" value={form.gstPercent} onChange={(e) => setForm((p) => ({ ...p, gstPercent: e.target.value }))}
                      className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">Selling Price (₹)</label>
                    <input type="number" value={form.sellingPrice} onChange={(e) => setForm((p) => ({ ...p, sellingPrice: e.target.value }))}
                      className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">Purchase Price (₹)</label>
                    <input type="number" value={form.purchasePrice} onChange={(e) => setForm((p) => ({ ...p, purchasePrice: e.target.value }))}
                      className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100" />
                  </div>
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setModalOpen(false)}
                    className="flex-1 text-sm font-semibold px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    Cancel
                  </button>
                  <button onClick={handleSave}
                    className="flex-1 text-sm font-bold px-4 py-3 rounded-xl bg-emerald-600 text-white">
                    {editing ? "Save Changes" : "Add Product"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
            <motion.div className="relative z-10 w-full sm:max-w-sm bg-white dark:bg-slate-800 rounded-t-[28px] sm:rounded-3xl shadow-2xl overflow-hidden p-5"
              initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}>
              <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
                <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">This will permanently delete this product. This cannot be undone.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setDeleteTarget(null)}
                  className="flex-1 text-sm font-semibold px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteTarget)}
                  className="flex-1 text-sm font-bold px-4 py-3 rounded-xl bg-red-600 text-white">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
