"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { ListChecks, Search, Edit2, Copy, Trash2, AlertCircle, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getInvoices, deleteInvoice, duplicateInvoice, searchInvoices, computeInvoiceTotals,
  type InvoiceRecord, type PaymentStatus,
} from "@/lib/invoices";

const INVOICE_EDIT_KEY = "doclify_invoice_edit_id";

const STATUS_STYLES: Record<PaymentStatus, string> = {
  draft: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  partial: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  overdue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function InvoicesPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setInvoices(getInvoices());
    setHydrated(true);
  }, []);

  const filtered = searchInvoices(search, statusFilter !== "all" ? { status: statusFilter } : undefined);

  const fmt = (n: number) => "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

  const handleEdit = (id: string) => {
    localStorage.setItem(INVOICE_EDIT_KEY, id);
    router.push("/invoice");
  };

  const handleDuplicate = (id: string) => {
    duplicateInvoice(id);
    setInvoices(getInvoices());
  };

  const handleDelete = (id: string) => {
    deleteInvoice(id);
    setInvoices(getInvoices());
    setDeleteTarget(null);
  };

  if (!hydrated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-5xl mx-auto space-y-6">

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                  <ListChecks size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">All Invoices</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{invoices.length} invoice{invoices.length !== 1 ? "s" : ""} saved on this device</p>
                </div>
              </div>
              <button onClick={() => router.push("/invoice")}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors">
                <Plus size={13} /> New Invoice
              </button>
            </motion.div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 max-w-sm flex-1">
                <Search size={15} className="text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by number, customer, GST, item..."
                  className="flex-1 text-sm bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400" />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | "all")}
                className="text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 outline-none">
                <option value="all">All statuses</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-12 text-center">
                <ListChecks size={40} className="text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                <p className="font-bold text-slate-700 dark:text-slate-200">{invoices.length === 0 ? "No invoices yet" : "No matching invoices"}</p>
                <p className="text-sm text-slate-400 mt-1">{invoices.length === 0 ? "Create your first invoice to see it here." : "Try a different search or filter."}</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                {filtered.map((inv, i) => {
                  const totals = computeInvoiceTotals(inv);
                  return (
                    <motion.div key={inv.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-4 px-5 py-4 border-b border-slate-50 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{inv.invoiceNo}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[inv.status]}`}>{inv.status.toUpperCase()}</span>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{inv.billTo.split("\n")[0]} · {inv.date}</p>
                      </div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 shrink-0">{fmt(totals.total)}</p>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button onClick={() => handleEdit(inv.id)} aria-label={`Edit invoice ${inv.invoiceNo}`}
                          className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-500 transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDuplicate(inv.id)} aria-label={`Duplicate invoice ${inv.invoiceNo}`}
                          className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-500 transition-colors">
                          <Copy size={14} />
                        </button>
                        <button onClick={() => setDeleteTarget(inv.id)} aria-label={`Delete invoice ${inv.invoiceNo}`}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

          </div>
        </main>
      </div>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
            <motion.div className="relative z-10 w-full sm:max-w-sm bg-white dark:bg-slate-800 rounded-t-[28px] sm:rounded-3xl shadow-2xl overflow-hidden p-5"
              initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}>
              <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
                <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">This will permanently delete this invoice. This cannot be undone.</p>
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
