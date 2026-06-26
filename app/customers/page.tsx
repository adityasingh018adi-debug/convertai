"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { Users, Plus, Search, Edit2, Trash2, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getCustomers, addCustomer, updateCustomer, deleteCustomer, searchCustomers, type Customer } from "@/lib/customers";
import { showToast } from "@/lib/toast";

const EMPTY = { name: "", gst: "", address: "", phone: "", email: "", notes: "" };

export default function CustomersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    setCustomers(getCustomers());
    setHydrated(true);
  }, []);

  const filtered = search ? searchCustomers(search) : customers;

  const openAdd = () => { setEditing(null); setForm(EMPTY); setError(""); setModalOpen(true); };
  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({ name: c.name, gst: c.gst ?? "", address: c.address ?? "", phone: c.phone ?? "", email: c.email ?? "", notes: c.notes ?? "" });
    setError(""); setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { setError("Customer name is required."); return; }
    if (editing) updateCustomer(editing.id, form);
    else addCustomer(form);
    setCustomers(getCustomers());
    setModalOpen(false);
    showToast(editing ? "Customer updated." : "Customer added.", "success");
  };

  const handleDelete = (id: string) => {
    deleteCustomer(id);
    setCustomers(getCustomers());
    setDeleteTarget(null);
    showToast("Customer deleted.", "success");
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
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                  <Users size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Customers</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{customers.length} customer{customers.length !== 1 ? "s" : ""} saved</p>
                </div>
              </div>
              <button onClick={openAdd}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors">
                <Plus size={13} /> Add Customer
              </button>
            </motion.div>

            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 max-w-sm">
              <Search size={15} className="text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, GST, phone, email..."
                className="flex-1 text-sm bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400" />
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-12 text-center">
                <Users size={40} className="text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                <p className="font-bold text-slate-700 dark:text-slate-200">{search ? "No matching customers" : "No customers yet"}</p>
                <p className="text-sm text-slate-400 mt-1">{search ? "Try a different search term." : "Add a customer to reuse them in invoices & challans."}</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                {filtered.map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-4 px-5 py-4 border-b border-slate-50 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {c.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{c.name}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {[c.phone, c.email, c.gst].filter(Boolean).join(" · ") || "No details"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => openEdit(c)} aria-label={`Edit ${c.name}`}
                        className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-500 transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => setDeleteTarget(c.id)} aria-label={`Delete ${c.name}`}
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

      {/* Add/Edit modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <motion.div className="relative z-10 w-full sm:max-w-md bg-white dark:bg-slate-800 rounded-t-[28px] sm:rounded-3xl shadow-2xl overflow-hidden"
              initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                <h2 className="font-black text-slate-800 dark:text-white text-base">{editing ? "Edit Customer" : "Add Customer"}</h2>
                <button onClick={() => setModalOpen(false)} aria-label="Close dialog"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500">
                  <X size={16} />
                </button>
              </div>
              <div className="px-5 py-5 space-y-3 max-h-[70vh] overflow-y-auto">
                {[
                  { key: "name", label: "Name *", placeholder: "Customer or business name" },
                  { key: "gst", label: "GST Number", placeholder: "27AABCS1234F1ZN" },
                  { key: "phone", label: "Phone", placeholder: "+91 98765 43210" },
                  { key: "email", label: "Email", placeholder: "customer@email.com" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">{f.label}</label>
                    <input
                      autoFocus={f.key === "name"}
                      value={form[f.key as keyof typeof form]}
                      onChange={(e) => { setForm((p) => ({ ...p, [f.key]: e.target.value })); setError(""); }}
                      placeholder={f.placeholder}
                      className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100" />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">Address</label>
                  <textarea value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} rows={2}
                    className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 resize-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">Notes</label>
                  <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} rows={2}
                    placeholder="Payment terms, preferences, etc."
                    className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 resize-none" />
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
                    className="flex-1 text-sm font-bold px-4 py-3 rounded-xl bg-blue-600 text-white">
                    {editing ? "Save Changes" : "Add Customer"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
            <motion.div className="relative z-10 w-full sm:max-w-sm bg-white dark:bg-slate-800 rounded-t-[28px] sm:rounded-3xl shadow-2xl overflow-hidden p-5"
              initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}>
              <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
                <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">This will permanently delete this customer. This cannot be undone.</p>
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
