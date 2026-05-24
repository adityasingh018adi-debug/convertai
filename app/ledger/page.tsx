"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import {
  BookOpen, Plus, Search, TrendingUp, TrendingDown, IndianRupee,
  X, ArrowUpRight, ArrowDownLeft, Trash2, Edit2, ChevronRight,
  Phone, MapPin, Calendar, AlertCircle, CheckCircle, Sparkles, Receipt,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Customer = {
  id: string; name: string; phone: string; city: string; createdAt: string;
};
type TxType = "gave" | "got";
type Transaction = {
  id: string; customerId: string; type: TxType;
  amount: number; note: string; date: string;
};

// ─────────────────────────────────────────────
// Utils
// ─────────────────────────────────────────────
const uid    = () => Math.random().toString(36).slice(2, 10);
const fmt    = (n: number) => "₹" + new Intl.NumberFormat("en-IN").format(n);
const fmtShort = (n: number) => {
  if (n >= 10_00_000) return "₹" + (n / 10_00_000).toFixed(1) + "L";
  if (n >= 1_000)     return "₹" + (n / 1_000).toFixed(1) + "K";
  return "₹" + n;
};
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const LS_CUSTOMERS    = "kh_customers_v2";
const LS_TRANSACTIONS = "kh_transactions_v2";

const SEED_CUSTOMERS: Customer[] = [
  { id: "c1", name: "Sharma Electronics", phone: "+91 98765 43210", city: "New Delhi",  createdAt: "2025-01-15T10:00:00Z" },
  { id: "c2", name: "Gupta Traders",       phone: "+91 87654 32109", city: "Mumbai",    createdAt: "2025-02-10T10:00:00Z" },
  { id: "c3", name: "Kumar Wholesale",     phone: "+91 76543 21098", city: "Jaipur",    createdAt: "2025-03-05T10:00:00Z" },
  { id: "c4", name: "Singh & Co.",         phone: "+91 65432 10987", city: "Bangalore", createdAt: "2025-04-01T10:00:00Z" },
];
const SEED_TRANSACTIONS: Transaction[] = [
  { id: "t1", customerId: "c1", type: "gave", amount: 125000, note: "Electronics stock supplied",      date: "2025-04-02T10:00:00Z" },
  { id: "t2", customerId: "c1", type: "got",  amount: 45000,  note: "Partial payment received",        date: "2025-05-02T10:00:00Z" },
  { id: "t3", customerId: "c2", type: "gave", amount: 98500,  note: "Goods delivered",                 date: "2025-04-18T10:00:00Z" },
  { id: "t4", customerId: "c2", type: "got",  amount: 98500,  note: "Full payment — account cleared",  date: "2025-05-18T10:00:00Z" },
  { id: "t5", customerId: "c3", type: "gave", amount: 67200,  note: "Wholesale order dispatched",      date: "2025-04-22T10:00:00Z" },
  { id: "t6", customerId: "c3", type: "got",  amount: 12000,  note: "Advance payment received",        date: "2025-05-22T10:00:00Z" },
  { id: "t7", customerId: "c4", type: "gave", amount: 45000,  note: "Monthly supply",                  date: "2025-05-01T10:00:00Z" },
  { id: "t8", customerId: "c4", type: "got",  amount: 45000,  note: "Payment received",                date: "2025-05-10T10:00:00Z" },
];

function loadLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const r = localStorage.getItem(key); return r ? (JSON.parse(r) as T) : fallback; }
  catch { return fallback; }
}
function saveLS<T>(key: string, val: T) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* ignore */ }
}

// ─────────────────────────────────────────────
// Modal (bottom-sheet on mobile, centered on desktop)
// ─────────────────────────────────────────────
function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative z-10 w-full sm:max-w-md bg-white dark:bg-slate-800 rounded-t-[28px] sm:rounded-3xl shadow-2xl overflow-hidden"
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}>
            {/* Drag handle (mobile only) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-600" />
            </div>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="font-black text-slate-800 dark:text-white text-base">{title}</h2>
              <button onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 active:bg-slate-200 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="px-5 py-5 overflow-y-auto max-h-[70vh]">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
// Avatar helper
// ─────────────────────────────────────────────
function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const s = size === "sm" ? "w-9 h-9 text-sm" : size === "lg" ? "w-12 h-12 text-xl" : "w-10 h-10 text-base";
  return (
    <div className={cn("rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black shrink-0", s)}>
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function LedgerPage() {
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [customers,    setCustomers]    = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hydrated,     setHydrated]     = useState(false);
  const [search,       setSearch]       = useState("");

  const [selected,     setSelected]     = useState<Customer | null>(null);

  const [custModal,    setCustModal]    = useState(false);
  const [editingCust,  setEditingCust]  = useState<Customer | null>(null);
  const [custForm,     setCustForm]     = useState({ name: "", phone: "", city: "" });
  const [custError,    setCustError]    = useState("");

  const [txModal,      setTxModal]      = useState(false);
  const [txForm,       setTxForm]       = useState({ type: "gave" as TxType, amount: "", note: "", date: "" });
  const [txError,      setTxError]      = useState("");

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // ── Load / seed ──
  useEffect(() => {
    const savedC = loadLS<Customer[]>(LS_CUSTOMERS, []);
    const savedT = loadLS<Transaction[]>(LS_TRANSACTIONS, []);
    if (savedC.length === 0) {
      setCustomers(SEED_CUSTOMERS); setTransactions(SEED_TRANSACTIONS);
      saveLS(LS_CUSTOMERS, SEED_CUSTOMERS); saveLS(LS_TRANSACTIONS, SEED_TRANSACTIONS);
    } else {
      setCustomers(savedC); setTransactions(savedT);
    }
    setHydrated(true);
  }, []);

  // ── Helpers ──
  const balanceFor = useCallback((cid: string) =>
    transactions.filter(t => t.customerId === cid)
      .reduce((s, t) => s + (t.type === "gave" ? t.amount : -t.amount), 0)
  , [transactions]);

  const lastTxFor = useCallback((cid: string) => {
    const txs = transactions.filter(t => t.customerId === cid);
    if (!txs.length) return null;
    return txs.sort((a, b) => b.date.localeCompare(a.date))[0].date;
  }, [transactions]);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const totalReceivable = customers.reduce((s, c) => s + Math.max(0, balanceFor(c.id)), 0);
  const activeCount     = customers.filter(c => balanceFor(c.id) > 0).length;
  const clearedCount    = customers.filter(c => balanceFor(c.id) <= 0).length;

  const custTxs = selected
    ? [...transactions.filter(t => t.customerId === selected.id)]
        .sort((a, b) => b.date.localeCompare(a.date))
    : [];

  // ── Customer CRUD ──
  const openAddCust = () => {
    setEditingCust(null); setCustForm({ name: "", phone: "", city: "" }); setCustError(""); setCustModal(true);
  };
  const openEditCust = (c: Customer) => {
    setEditingCust(c); setCustForm({ name: c.name, phone: c.phone, city: c.city }); setCustError("");
    setSelected(null); setCustModal(true);
  };
  const saveCust = () => {
    const name = custForm.name.trim();
    if (!name) { setCustError("Customer name is required."); return; }
    if (custForm.phone && !/^[\d\s+\-()\\.]{7,16}$/.test(custForm.phone.trim())) {
      setCustError("Enter a valid phone number."); return;
    }
    if (editingCust) {
      const u = customers.map(c => c.id === editingCust.id ? { ...c, name, phone: custForm.phone.trim(), city: custForm.city.trim() } : c);
      setCustomers(u); saveLS(LS_CUSTOMERS, u);
    } else {
      const u = [{ id: uid(), name, phone: custForm.phone.trim(), city: custForm.city.trim(), createdAt: new Date().toISOString() }, ...customers];
      setCustomers(u); saveLS(LS_CUSTOMERS, u);
    }
    setCustModal(false);
  };
  const deleteCust = (id: string) => {
    const uc = customers.filter(c => c.id !== id);
    const ut = transactions.filter(t => t.customerId !== id);
    setCustomers(uc); setTransactions(ut);
    saveLS(LS_CUSTOMERS, uc); saveLS(LS_TRANSACTIONS, ut);
    setDeleteTarget(null); setSelected(null);
  };

  // ── Transaction CRUD ──
  const openAddTx = (type: TxType = "gave") => {
    setTxForm({ type, amount: "", note: "", date: new Date().toISOString().slice(0, 10) }); setTxError(""); setTxModal(true);
  };
  const saveTx = () => {
    if (!selected) return;
    const amt = parseFloat(txForm.amount);
    if (!txForm.amount || isNaN(amt) || amt <= 0) { setTxError("Enter a valid amount greater than ₹0."); return; }
    if (!txForm.date) { setTxError("Please select a date."); return; }
    const u = [{ id: uid(), customerId: selected.id, type: txForm.type, amount: amt, note: txForm.note.trim(), date: new Date(txForm.date).toISOString() }, ...transactions];
    setTransactions(u); saveLS(LS_TRANSACTIONS, u); setTxModal(false);
  };
  const deleteTx = (txId: string) => {
    const u = transactions.filter(t => t.id !== txId);
    setTransactions(u); saveLS(LS_TRANSACTIONS, u);
  };

  // Keep selected in sync
  useEffect(() => {
    if (selected) {
      const r = customers.find(c => c.id === selected.id);
      if (r) setSelected(r);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customers]);

  if (!hydrated) return null;

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-3 sm:p-6">
            <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">

              {/* ── Header ── */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-violet-900/40 shrink-0">
                    <BookOpen size={22} className="text-white sm:hidden" />
                    <BookOpen size={26} className="text-white hidden sm:block" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white leading-tight">
                      Khatabook <span className="text-violet-500">Ledger</span>
                    </h1>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                      <Sparkles size={10} className="text-violet-400" />
                      Track credits &amp; payments
                    </p>
                  </div>
                </div>
                <button onClick={openAddCust}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-purple-600 active:from-violet-700 active:to-purple-700 text-white font-bold text-xs px-3.5 py-2.5 sm:px-4 rounded-xl transition-all shadow-md shadow-violet-200 dark:shadow-violet-900/40 shrink-0 min-h-[40px]">
                  <Plus size={15} />
                  <span className="hidden xs:inline sm:inline">Add Customer</span>
                  <span className="xs:hidden sm:hidden">Add</span>
                </button>
              </motion.div>

              {/* ── Stats ── */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                className="grid grid-cols-3 gap-2 sm:gap-4">
                {[
                  { icon: IndianRupee, label: "Receivable",       mobileVal: fmtShort(totalReceivable), desktopVal: fmt(totalReceivable),
                    bg: "bg-violet-50 dark:bg-violet-900/20",  border: "border-violet-100 dark:border-violet-800",  color: "text-violet-600" },
                  { icon: TrendingUp,  label: "Active",           mobileVal: activeCount.toString(),    desktopVal: `${activeCount} active`,
                    bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-100 dark:border-emerald-800", color: "text-emerald-600" },
                  { icon: TrendingDown, label: "Cleared",         mobileVal: clearedCount.toString(),   desktopVal: `${clearedCount} cleared`,
                    bg: "bg-slate-100 dark:bg-slate-800",       border: "border-slate-200 dark:border-slate-700",    color: "text-slate-500" },
                ].map((s) => (
                  <div key={s.label} className={cn("rounded-2xl p-3 sm:p-4 border", s.bg, s.border)}>
                    <s.icon size={16} className={cn(s.color, "mb-1.5 sm:mb-2")} />
                    <p className="text-sm sm:text-lg font-extrabold text-slate-800 dark:text-white leading-tight">
                      <span className="sm:hidden">{s.mobileVal}</span>
                      <span className="hidden sm:inline">{s.desktopVal}</span>
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{s.label}</p>
                  </div>
                ))}
              </motion.div>

              {/* ── Search ── */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 shadow-sm w-full sm:max-w-sm">
                  <Search size={15} className="text-slate-400 shrink-0" />
                  <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search name, city, phone…"
                    className="flex-1 text-sm bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 min-w-0"
                  />
                  {search && (
                    <button onClick={() => setSearch("")}
                      className="text-slate-400 active:text-slate-600 transition-colors p-1">
                      <X size={13} />
                    </button>
                  )}
                </div>
              </motion.div>

              {/* ── Customer List ── */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>

                {customers.length === 0 ? (
                  /* Empty state */
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-10 sm:p-14 text-center">
                    <BookOpen size={44} className="text-violet-200 dark:text-violet-800 mx-auto mb-3" />
                    <p className="font-black text-slate-700 dark:text-slate-200 text-base mb-1">No customers yet</p>
                    <p className="text-sm text-slate-400 mb-6">Add your first customer to start tracking their ledger.</p>
                    <button onClick={openAddCust}
                      className="inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-bold px-6 py-3 rounded-xl shadow-md shadow-violet-200 dark:shadow-violet-900/30 min-h-[48px]">
                      <Plus size={15} /> Add First Customer
                    </button>
                  </div>

                ) : filtered.length === 0 ? (
                  /* No search results */
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-10 text-center">
                    <Search size={34} className="text-slate-300 mx-auto mb-3" />
                    <p className="font-bold text-slate-600 dark:text-slate-300">No results for &ldquo;{search}&rdquo;</p>
                    <p className="text-sm text-slate-400 mt-1">Try a different name, city, or phone.</p>
                  </div>

                ) : (
                  <>
                    {/* ── MOBILE: Card list (hidden on sm+) ── */}
                    <div className="sm:hidden space-y-2">
                      {filtered.map((c, i) => {
                        const bal  = balanceFor(c.id);
                        const last = lastTxFor(c.id);
                        return (
                          <motion.div key={c.id}
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            onClick={() => setSelected(c)}
                            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm active:bg-violet-50 dark:active:bg-violet-900/10 transition-colors cursor-pointer overflow-hidden">
                            <div className="flex items-center gap-3 px-4 py-3.5">
                              <Avatar name={c.name} size="md" />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{c.name}</p>
                                <p className="text-xs text-slate-400 truncate mt-0.5">
                                  {c.phone || c.city || "No details"}
                                  {c.phone && c.city ? ` · ${c.city}` : ""}
                                </p>
                                {last && (
                                  <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                    <Calendar size={8} /> {fmtDate(last)}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-1.5 shrink-0">
                                <span className={cn(
                                  "text-sm font-black",
                                  bal > 0 ? "text-emerald-600" : bal < 0 ? "text-red-500" : "text-slate-400"
                                )}>
                                  {bal === 0 ? "Settled" : bal > 0 ? fmtShort(bal) : `-${fmtShort(Math.abs(bal))}`}
                                </span>
                                <span className={cn(
                                  "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                                  bal > 0
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                                )}>
                                  {bal > 0 ? "Active" : "Cleared"}
                                </span>
                              </div>
                              <ChevronRight size={14} className="text-slate-300 shrink-0 ml-1" />
                            </div>
                          </motion.div>
                        );
                      })}
                      <p className="text-center text-[11px] text-slate-400 pt-1 pb-2">
                        {filtered.length} customer{filtered.length !== 1 ? "s" : ""}
                        {search ? ` matching "${search}"` : ""}
                      </p>
                    </div>

                    {/* ── DESKTOP: Table (hidden on mobile) ── */}
                    <div className="hidden sm:block bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                          <tr>
                            <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Customer</th>
                            <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">City</th>
                            <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3 hidden md:table-cell">Last Entry</th>
                            <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3">Balance</th>
                            <th className="text-center text-xs font-semibold text-slate-500 px-4 py-3">Status</th>
                            <th className="px-4 py-3 w-6" />
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((c, i) => {
                            const bal  = balanceFor(c.id);
                            const last = lastTxFor(c.id);
                            return (
                              <motion.tr key={c.id}
                                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                onClick={() => setSelected(c)}
                                className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors cursor-pointer">
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-3">
                                    <Avatar name={c.name} size="sm" />
                                    <div>
                                      <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{c.name}</p>
                                      <p className="text-xs text-slate-400">{c.phone || "—"}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400">{c.city || "—"}</td>
                                <td className="px-4 py-3.5 text-right text-xs text-slate-400 hidden md:table-cell">
                                  {last ? fmtDate(last) : "No entries"}
                                </td>
                                <td className="px-4 py-3.5 text-right">
                                  <span className={cn("font-bold text-sm",
                                    bal > 0 ? "text-emerald-600" : bal < 0 ? "text-red-500" : "text-slate-400"
                                  )}>
                                    {bal === 0 ? "Settled" : bal > 0 ? fmt(bal) : `-${fmt(Math.abs(bal))}`}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5 text-center">
                                  <span className={cn("inline-flex text-xs font-semibold px-2 py-0.5 rounded-full",
                                    bal > 0
                                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                      : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                                  )}>
                                    {bal > 0 ? "Active" : "Cleared"}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5">
                                  <ChevronRight size={14} className="text-slate-300" />
                                </td>
                              </motion.tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <div className="px-5 py-2.5 border-t border-slate-50 dark:border-slate-700/50 text-[11px] text-slate-400">
                        {filtered.length} customer{filtered.length !== 1 ? "s" : ""}
                        {search ? ` matching "${search}"` : ""}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>

              <Footer />
            </div>
          </div>
        </main>
      </div>

      {/* ════════════════════════════════════════
          Customer Detail Sheet
          Full-screen on mobile, centred panel on desktop
          ════════════════════════════════════════ */}
      <AnimatePresence>
        {selected && (
          <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
            <motion.div
              className="relative z-10 w-full sm:max-w-lg bg-white dark:bg-slate-800 rounded-t-[28px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              style={{ maxHeight: "92dvh" }}
              initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}>

              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
                <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-600" />
              </div>

              {/* Header */}
              <div className="px-4 sm:px-5 pt-2 sm:pt-4 pb-4 border-b border-slate-100 dark:border-slate-700 shrink-0">
                {/* Name row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={selected.name} size="lg" />
                    <div className="min-w-0">
                      <h3 className="font-black text-slate-800 dark:text-white text-base leading-tight truncate">{selected.name}</h3>
                      <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 mt-1">
                        {selected.phone && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Phone size={10} /> {selected.phone}
                          </span>
                        )}
                        {selected.city && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <MapPin size={10} /> {selected.city}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEditCust(selected)}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 active:bg-violet-100 active:text-violet-600 transition-colors">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => setDeleteTarget(selected.id)}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 active:bg-red-100 active:text-red-600 transition-colors">
                      <Trash2 size={15} />
                    </button>
                    <button onClick={() => setSelected(null)}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 active:bg-slate-200 transition-colors">
                      <X size={15} />
                    </button>
                  </div>
                </div>

                {/* Balance card */}
                {(() => {
                  const bal = balanceFor(selected.id);
                  return (
                    <div className={cn(
                      "rounded-2xl px-4 py-3.5 flex items-center justify-between mb-3",
                      bal > 0 ? "bg-emerald-50 dark:bg-emerald-900/20" :
                      bal < 0 ? "bg-red-50 dark:bg-red-900/20" :
                      "bg-slate-50 dark:bg-slate-700/40"
                    )}>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                          {bal > 0 ? "Customer owes you" : bal < 0 ? "You owe customer" : "All settled up!"}
                        </p>
                        <p className={cn("text-2xl font-black",
                          bal > 0 ? "text-emerald-600" : bal < 0 ? "text-red-600" : "text-slate-400"
                        )}>
                          {bal === 0 ? "₹0" : fmt(Math.abs(bal))}
                        </p>
                      </div>
                      {bal === 0 && <CheckCircle size={28} className="text-emerald-400" />}
                    </div>
                  );
                })()}

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button onClick={() => openAddTx("gave")}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 active:bg-emerald-600 text-white text-sm font-bold py-3 rounded-xl transition-colors shadow-sm min-h-[48px]">
                    <ArrowUpRight size={16} /> You Gave
                  </button>
                  <button onClick={() => openAddTx("got")}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-500 active:bg-blue-600 text-white text-sm font-bold py-3 rounded-xl transition-colors shadow-sm min-h-[48px]">
                    <ArrowDownLeft size={16} /> You Got
                  </button>
                </div>
              </div>

              {/* Transaction list */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                {custTxs.length === 0 ? (
                  <div className="p-10 text-center">
                    <Receipt size={36} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No transactions yet</p>
                    <p className="text-xs text-slate-400 mt-1">Tap &ldquo;You Gave&rdquo; or &ldquo;You Got&rdquo; to add the first entry.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50 dark:divide-slate-700/50 pb-6">
                    {custTxs.map(tx => (
                      <div key={tx.id}
                        className="flex items-center gap-3 px-4 sm:px-5 py-4 group active:bg-slate-50 dark:active:bg-slate-700/30 transition-colors">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                          tx.type === "gave"
                            ? "bg-emerald-100 dark:bg-emerald-900/30"
                            : "bg-blue-100 dark:bg-blue-900/30"
                        )}>
                          {tx.type === "gave"
                            ? <ArrowUpRight size={16} className="text-emerald-600" />
                            : <ArrowDownLeft size={16} className="text-blue-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-bold",
                            tx.type === "gave" ? "text-emerald-700 dark:text-emerald-400" : "text-blue-700 dark:text-blue-400"
                          )}>
                            {tx.type === "gave" ? "+" : "−"}{fmt(tx.amount)}
                          </p>
                          {tx.note && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{tx.note}</p>
                          )}
                          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <Calendar size={9} /> {fmtDate(tx.date)}
                          </p>
                        </div>
                        <button onClick={() => deleteTx(tx.id)}
                          className="w-9 h-9 flex items-center justify-center rounded-full text-red-400 active:text-red-600 active:bg-red-50 dark:active:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100 sm:opacity-100">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════
          Add / Edit Customer Modal
          ════════════════════════════════════════ */}
      <Modal open={custModal} onClose={() => setCustModal(false)}
        title={editingCust ? "Edit Customer" : "Add Customer"}>
        <div className="space-y-4">
          {[
            { label: "Name", key: "name", placeholder: "Customer or business name", required: true },
            { label: "Phone", key: "phone", placeholder: "+91 98765 43210", required: false },
            { label: "City", key: "city", placeholder: "New Delhi", required: false },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">
                {f.label} {f.required && <span className="text-red-500">*</span>}
              </label>
              <input
                autoFocus={f.key === "name"}
                value={custForm[f.key as keyof typeof custForm]}
                onChange={e => { setCustForm(p => ({ ...p, [f.key]: e.target.value })); setCustError(""); }}
                onKeyDown={e => e.key === "Enter" && saveCust()}
                placeholder={f.placeholder}
                className="w-full text-base sm:text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 min-h-[48px]"
              />
            </div>
          ))}
          {custError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5">
              <AlertCircle size={14} className="shrink-0" /> {custError}
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <button onClick={() => setCustModal(false)}
              className="flex-1 text-sm font-semibold px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 active:bg-slate-200 transition-colors min-h-[48px]">
              Cancel
            </button>
            <button onClick={saveCust}
              className="flex-1 text-sm font-bold px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white active:from-violet-700 active:to-purple-700 transition-all shadow-md shadow-violet-200 dark:shadow-violet-900/30 min-h-[48px]">
              {editingCust ? "Save Changes" : "Add Customer"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ════════════════════════════════════════
          Add Transaction Modal
          ════════════════════════════════════════ */}
      <Modal open={txModal} onClose={() => setTxModal(false)}
        title={txForm.type === "gave" ? "You Gave — Add Credit" : "You Got — Record Payment"}>
        <div className="space-y-4">
          {/* Type toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
            {(["gave", "got"] as TxType[]).map(t => (
              <button key={t}
                onClick={() => setTxForm(p => ({ ...p, type: t }))}
                className={cn(
                  "flex-1 text-sm font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all min-h-[44px]",
                  txForm.type === t
                    ? t === "gave" ? "bg-emerald-500 text-white shadow-sm" : "bg-blue-500 text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400"
                )}>
                {t === "gave" ? <><ArrowUpRight size={15} /> You Gave</> : <><ArrowDownLeft size={15} /> You Got</>}
              </button>
            ))}
          </div>
          {[
            { label: "Amount (₹)", key: "amount", placeholder: "0.00", type: "number", required: true },
            { label: "Note / Description", key: "note", placeholder: "e.g. Invoice #42, advance payment…", type: "text", required: false },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">
                {f.label} {f.required && <span className="text-red-500">*</span>}
              </label>
              <input
                autoFocus={f.key === "amount"}
                type={f.type} min={f.key === "amount" ? "1" : undefined} step={f.key === "amount" ? "0.01" : undefined}
                value={txForm[f.key as keyof typeof txForm]}
                onChange={e => { setTxForm(p => ({ ...p, [f.key]: e.target.value })); setTxError(""); }}
                onKeyDown={e => e.key === "Enter" && saveTx()}
                placeholder={f.placeholder}
                className="w-full text-base sm:text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 min-h-[48px]"
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">
              Date <span className="text-red-500">*</span>
            </label>
            <input type="date"
              value={txForm.date}
              onChange={e => { setTxForm(p => ({ ...p, date: e.target.value })); setTxError(""); }}
              className="w-full text-base sm:text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-slate-100 min-h-[48px]"
            />
          </div>
          {txError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5">
              <AlertCircle size={14} className="shrink-0" /> {txError}
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <button onClick={() => setTxModal(false)}
              className="flex-1 text-sm font-semibold px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 active:bg-slate-200 transition-colors min-h-[48px]">
              Cancel
            </button>
            <button onClick={saveTx}
              className={cn(
                "flex-1 text-sm font-bold px-4 py-3 rounded-xl text-white transition-all shadow-md min-h-[48px]",
                txForm.type === "gave"
                  ? "bg-emerald-500 active:bg-emerald-600 shadow-emerald-200 dark:shadow-emerald-900/30"
                  : "bg-blue-500 active:bg-blue-600 shadow-blue-200 dark:shadow-blue-900/30"
              )}>
              Save Entry
            </button>
          </div>
        </div>
      </Modal>

      {/* ════════════════════════════════════════
          Delete Confirm Modal
          ════════════════════════════════════════ */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Customer">
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
              This will permanently delete{" "}
              <strong>{customers.find(c => c.id === deleteTarget)?.name}</strong>{" "}
              and all their transaction history. This cannot be undone.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setDeleteTarget(null)}
              className="flex-1 text-sm font-semibold px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 active:bg-slate-200 transition-colors min-h-[48px]">
              Cancel
            </button>
            <button onClick={() => deleteTarget && deleteCust(deleteTarget)}
              className="flex-1 text-sm font-bold px-4 py-3 rounded-xl bg-red-600 active:bg-red-700 text-white transition-colors shadow-md shadow-red-200 dark:shadow-red-900/30 min-h-[48px]">
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
