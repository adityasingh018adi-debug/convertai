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
  id: string;
  name: string;
  phone: string;
  city: string;
  createdAt: string;
};

type TxType = "gave" | "got";

type Transaction = {
  id: string;
  customerId: string;
  type: TxType;
  amount: number;
  note: string;
  date: string; // ISO string
};

// ─────────────────────────────────────────────
// Utils
// ─────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (n: number) => "₹" + new Intl.NumberFormat("en-IN").format(n);
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const LS_CUSTOMERS    = "kh_customers_v2";
const LS_TRANSACTIONS = "kh_transactions_v2";

// Seed data shown on first visit
const SEED_CUSTOMERS: Customer[] = [
  { id: "c1", name: "Sharma Electronics", phone: "+91 98765 43210", city: "New Delhi",  createdAt: "2025-01-15T10:00:00Z" },
  { id: "c2", name: "Gupta Traders",       phone: "+91 87654 32109", city: "Mumbai",    createdAt: "2025-02-10T10:00:00Z" },
  { id: "c3", name: "Kumar Wholesale",     phone: "+91 76543 21098", city: "Jaipur",    createdAt: "2025-03-05T10:00:00Z" },
  { id: "c4", name: "Singh & Co.",         phone: "+91 65432 10987", city: "Bangalore", createdAt: "2025-04-01T10:00:00Z" },
];

const SEED_TRANSACTIONS: Transaction[] = [
  { id: "t1", customerId: "c1", type: "gave", amount: 125000, note: "Electronics stock supplied",  date: "2025-04-02T10:00:00Z" },
  { id: "t2", customerId: "c1", type: "got",  amount: 45000,  note: "Partial payment received",    date: "2025-05-02T10:00:00Z" },
  { id: "t3", customerId: "c2", type: "gave", amount: 98500,  note: "Goods delivered",             date: "2025-04-18T10:00:00Z" },
  { id: "t4", customerId: "c2", type: "got",  amount: 98500,  note: "Full payment — account cleared", date: "2025-05-18T10:00:00Z" },
  { id: "t5", customerId: "c3", type: "gave", amount: 67200,  note: "Wholesale order dispatched",  date: "2025-04-22T10:00:00Z" },
  { id: "t6", customerId: "c3", type: "got",  amount: 12000,  note: "Advance payment received",    date: "2025-05-22T10:00:00Z" },
  { id: "t7", customerId: "c4", type: "gave", amount: 45000,  note: "Monthly supply",              date: "2025-05-01T10:00:00Z" },
  { id: "t8", customerId: "c4", type: "got",  amount: 45000,  note: "Payment received",            date: "2025-05-10T10:00:00Z" },
];

function loadLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function saveLS<T>(key: string, val: T) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* ignore */ }
}

// ─────────────────────────────────────────────
// Reusable Modal wrapper
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
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative z-10 w-full sm:max-w-md bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="font-black text-slate-800 dark:text-white text-base">{title}</h2>
              <button onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-700 transition-colors">
                <X size={14} />
              </button>
            </div>
            <div className="px-5 py-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function LedgerPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customers,    setCustomers]   = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hydrated,     setHydrated]    = useState(false);
  const [search,       setSearch]      = useState("");

  // Customer detail panel
  const [selected, setSelected] = useState<Customer | null>(null);

  // Add / Edit customer modal
  const [custModal,  setCustModal]  = useState(false);
  const [editingCust, setEditingCust] = useState<Customer | null>(null);
  const [custForm,   setCustForm]   = useState({ name: "", phone: "", city: "" });
  const [custError,  setCustError]  = useState("");

  // Add transaction modal
  const [txModal,  setTxModal]  = useState(false);
  const [txForm,   setTxForm]   = useState({ type: "gave" as TxType, amount: "", note: "", date: "" });
  const [txError,  setTxError]  = useState("");

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // ── Load from localStorage on mount ──
  useEffect(() => {
    const savedC = loadLS<Customer[]>(LS_CUSTOMERS, []);
    const savedT = loadLS<Transaction[]>(LS_TRANSACTIONS, []);
    if (savedC.length === 0) {
      setCustomers(SEED_CUSTOMERS);
      setTransactions(SEED_TRANSACTIONS);
      saveLS(LS_CUSTOMERS, SEED_CUSTOMERS);
      saveLS(LS_TRANSACTIONS, SEED_TRANSACTIONS);
    } else {
      setCustomers(savedC);
      setTransactions(savedT);
    }
    setHydrated(true);
  }, []);

  // ── Computed helpers ──
  const balanceFor = useCallback((cid: string) =>
    transactions
      .filter(t => t.customerId === cid)
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
    setEditingCust(null);
    setCustForm({ name: "", phone: "", city: "" });
    setCustError("");
    setCustModal(true);
  };

  const openEditCust = (c: Customer) => {
    setEditingCust(c);
    setCustForm({ name: c.name, phone: c.phone, city: c.city });
    setCustError("");
    setSelected(null);
    setCustModal(true);
  };

  const saveCust = () => {
    const name = custForm.name.trim();
    if (!name) { setCustError("Customer name is required."); return; }
    if (custForm.phone && !/^[\d\s+\-()\\.]{7,16}$/.test(custForm.phone.trim())) {
      setCustError("Enter a valid phone number."); return;
    }
    if (editingCust) {
      const updated = customers.map(c =>
        c.id === editingCust.id ? { ...c, name, phone: custForm.phone.trim(), city: custForm.city.trim() } : c
      );
      setCustomers(updated);
      saveLS(LS_CUSTOMERS, updated);
    } else {
      const newC: Customer = {
        id: uid(), name, phone: custForm.phone.trim(), city: custForm.city.trim(),
        createdAt: new Date().toISOString(),
      };
      const updated = [newC, ...customers];
      setCustomers(updated);
      saveLS(LS_CUSTOMERS, updated);
    }
    setCustModal(false);
  };

  const deleteCust = (id: string) => {
    const updC = customers.filter(c => c.id !== id);
    const updT = transactions.filter(t => t.customerId !== id);
    setCustomers(updC); setTransactions(updT);
    saveLS(LS_CUSTOMERS, updC); saveLS(LS_TRANSACTIONS, updT);
    setDeleteTarget(null); setSelected(null);
  };

  // ── Transaction CRUD ──
  const openAddTx = (type: TxType = "gave") => {
    setTxForm({ type, amount: "", note: "", date: new Date().toISOString().slice(0, 10) });
    setTxError("");
    setTxModal(true);
  };

  const saveTx = () => {
    if (!selected) return;
    const amt = parseFloat(txForm.amount);
    if (!txForm.amount || isNaN(amt) || amt <= 0) {
      setTxError("Enter a valid amount greater than ₹0."); return;
    }
    if (!txForm.date) { setTxError("Please select a date."); return; }
    const newTx: Transaction = {
      id: uid(), customerId: selected.id, type: txForm.type,
      amount: amt, note: txForm.note.trim(),
      date: new Date(txForm.date).toISOString(),
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    saveLS(LS_TRANSACTIONS, updated);
    setTxModal(false);
  };

  const deleteTx = (txId: string) => {
    const updated = transactions.filter(t => t.id !== txId);
    setTransactions(updated);
    saveLS(LS_TRANSACTIONS, updated);
  };

  // ── Keep selected customer in sync after edits ──
  useEffect(() => {
    if (selected) {
      const refreshed = customers.find(c => c.id === selected.id);
      if (refreshed) setSelected(refreshed);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customers]);

  if (!hydrated) return null; // avoid hydration mismatch

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-6">
            <div className="max-w-5xl mx-auto space-y-6">

              {/* ── Header ── */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-violet-900/40">
                    <BookOpen size={26} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white">
                      Khatabook <span className="text-violet-500">Ledger</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                      <Sparkles size={11} className="text-violet-400" />
                      Track customer credits &amp; payments
                    </p>
                  </div>
                </div>
                <button onClick={openAddCust}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-violet-200 dark:shadow-violet-900/40">
                  <Plus size={14} /> Add Customer
                </button>
              </motion.div>

              {/* ── Stats ── */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="grid grid-cols-3 gap-3 sm:gap-4">
                {[
                  { icon: IndianRupee, label: "Total Receivable", value: fmt(totalReceivable),
                    bg: "bg-violet-50 dark:bg-violet-900/20", border: "border-violet-100 dark:border-violet-800", color: "text-violet-600" },
                  { icon: TrendingUp, label: "Active Customers", value: activeCount.toString(),
                    bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-100 dark:border-emerald-800", color: "text-emerald-600" },
                  { icon: TrendingDown, label: "Cleared Accounts", value: clearedCount.toString(),
                    bg: "bg-slate-100 dark:bg-slate-800", border: "border-slate-200 dark:border-slate-700", color: "text-slate-500" },
                ].map((stat) => (
                  <div key={stat.label} className={`rounded-2xl p-4 ${stat.bg} border ${stat.border}`}>
                    <stat.icon size={18} className={`${stat.color} mb-2`} />
                    <p className="text-lg font-extrabold text-slate-800 dark:text-white leading-tight">{stat.value}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </motion.div>

              {/* ── Search ── */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 max-w-sm shadow-sm">
                  <Search size={15} className="text-slate-400 shrink-0" />
                  <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name, city, phone…"
                    className="flex-1 text-sm bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                  />
                  {search && (
                    <button onClick={() => setSearch("")}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                      <X size={13} />
                    </button>
                  )}
                </div>
              </motion.div>

              {/* ── Table / Empty States ── */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                {customers.length === 0 ? (
                  /* No customers at all */
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-14 text-center">
                    <BookOpen size={44} className="text-violet-200 dark:text-violet-800 mx-auto mb-3" />
                    <p className="font-black text-slate-700 dark:text-slate-200 text-base mb-1">No customers yet</p>
                    <p className="text-sm text-slate-400 mb-6">Add your first customer to start tracking their ledger.</p>
                    <button onClick={openAddCust}
                      className="inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-md shadow-violet-200 dark:shadow-violet-900/30">
                      <Plus size={15} /> Add First Customer
                    </button>
                  </div>
                ) : filtered.length === 0 ? (
                  /* No search results */
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-10 text-center">
                    <Search size={34} className="text-slate-300 mx-auto mb-3" />
                    <p className="font-bold text-slate-600 dark:text-slate-300">No results for &ldquo;{search}&rdquo;</p>
                    <p className="text-sm text-slate-400 mt-1">Try a different name, city, or phone number.</p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                        <tr>
                          <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Customer</th>
                          <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 hidden sm:table-cell">City</th>
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
                                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-black shrink-0">
                                    {c.name.slice(0, 1).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{c.name}</p>
                                    <p className="text-xs text-slate-400">{c.phone || "—"}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400 hidden sm:table-cell">{c.city || "—"}</td>
                              <td className="px-4 py-3.5 text-right text-xs text-slate-400 hidden md:table-cell">
                                {last ? fmtDate(last) : "No entries"}
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                <span className={cn(
                                  "font-bold text-sm",
                                  bal > 0 ? "text-emerald-600" : bal < 0 ? "text-red-500" : "text-slate-400"
                                )}>
                                  {bal === 0 ? "Settled" : bal > 0 ? fmt(bal) : `-${fmt(Math.abs(bal))}`}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-center">
                                <span className={cn(
                                  "inline-flex text-xs font-semibold px-2 py-0.5 rounded-full",
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
                )}
              </motion.div>

              <Footer />
            </div>
          </div>
        </main>
      </div>

      {/* ════════════════════════════════════════
          Customer Detail Sheet
          ════════════════════════════════════════ */}
      <AnimatePresence>
        {selected && (
          <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)} />
            <motion.div
              className="relative z-10 w-full sm:max-w-lg bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
              initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}>

              {/* Sheet header */}
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 shrink-0">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-lg font-black shrink-0">
                      {selected.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 dark:text-white text-base leading-tight">{selected.name}</h3>
                      <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
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
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => openEditCust(selected)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-violet-600 transition-colors"
                      title="Edit customer">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => setDeleteTarget(selected.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-red-600 transition-colors"
                      title="Delete customer">
                      <Trash2 size={13} />
                    </button>
                    <button onClick={() => setSelected(null)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-700 transition-colors">
                      <X size={13} />
                    </button>
                  </div>
                </div>

                {/* Balance summary card */}
                {(() => {
                  const bal = balanceFor(selected.id);
                  return (
                    <div className={cn(
                      "rounded-xl px-4 py-3 flex items-center justify-between mb-3",
                      bal > 0  ? "bg-emerald-50 dark:bg-emerald-900/20"
                      : bal < 0 ? "bg-red-50 dark:bg-red-900/20"
                      : "bg-slate-50 dark:bg-slate-700/40"
                    )}>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                          {bal > 0 ? "Customer owes you" : bal < 0 ? "You owe customer" : "All settled up!"}
                        </p>
                        <p className={cn(
                          "text-2xl font-black",
                          bal > 0 ? "text-emerald-600" : bal < 0 ? "text-red-600" : "text-slate-400"
                        )}>
                          {bal === 0 ? "₹0" : fmt(Math.abs(bal))}
                        </p>
                      </div>
                      {bal === 0 && <CheckCircle size={26} className="text-emerald-400" />}
                    </div>
                  );
                })()}

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button onClick={() => openAddTx("gave")}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold py-2.5 rounded-xl transition-colors shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30">
                    <ArrowUpRight size={14} /> You Gave
                  </button>
                  <button onClick={() => openAddTx("got")}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold py-2.5 rounded-xl transition-colors shadow-sm shadow-blue-200 dark:shadow-blue-900/30">
                    <ArrowDownLeft size={14} /> You Got
                  </button>
                </div>
              </div>

              {/* Transaction list */}
              <div className="flex-1 overflow-y-auto">
                {custTxs.length === 0 ? (
                  <div className="p-10 text-center">
                    <Receipt size={34} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No transactions yet</p>
                    <p className="text-xs text-slate-400 mt-1">Tap &ldquo;You Gave&rdquo; or &ldquo;You Got&rdquo; to add the first entry.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                    {custTxs.map(tx => (
                      <div key={tx.id}
                        className="flex items-start gap-3 px-5 py-3.5 group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                          tx.type === "gave"
                            ? "bg-emerald-100 dark:bg-emerald-900/30"
                            : "bg-blue-100 dark:bg-blue-900/30"
                        )}>
                          {tx.type === "gave"
                            ? <ArrowUpRight size={14} className="text-emerald-600" />
                            : <ArrowDownLeft size={14} className="text-blue-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={cn(
                              "text-sm font-bold",
                              tx.type === "gave" ? "text-emerald-700 dark:text-emerald-400" : "text-blue-700 dark:text-blue-400"
                            )}>
                              {tx.type === "gave" ? "+" : "−"}{fmt(tx.amount)}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                                <Calendar size={9} /> {fmtDate(tx.date)}
                              </span>
                              <button onClick={() => deleteTx(tx.id)}
                                className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                title="Delete entry">
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>
                          {tx.note && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{tx.note}</p>
                          )}
                        </div>
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
        <div className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              value={custForm.name}
              onChange={e => { setCustForm(p => ({ ...p, name: e.target.value })); setCustError(""); }}
              onKeyDown={e => e.key === "Enter" && saveCust()}
              placeholder="Customer or business name"
              className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">Phone</label>
            <input
              value={custForm.phone}
              onChange={e => { setCustForm(p => ({ ...p, phone: e.target.value })); setCustError(""); }}
              onKeyDown={e => e.key === "Enter" && saveCust()}
              placeholder="+91 98765 43210"
              className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">City</label>
            <input
              value={custForm.city}
              onChange={e => setCustForm(p => ({ ...p, city: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && saveCust()}
              placeholder="New Delhi"
              className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>
          {custError && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
              <AlertCircle size={12} className="shrink-0" /> {custError}
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <button onClick={() => setCustModal(false)}
              className="flex-1 text-sm font-semibold px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              Cancel
            </button>
            <button onClick={saveCust}
              className="flex-1 text-sm font-bold px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white transition-all shadow-md shadow-violet-200 dark:shadow-violet-900/30">
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
        <div className="space-y-3.5">
          {/* Type toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
            {(["gave", "got"] as TxType[]).map(t => (
              <button key={t}
                onClick={() => setTxForm(p => ({ ...p, type: t }))}
                className={cn(
                  "flex-1 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all",
                  txForm.type === t
                    ? t === "gave"
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "bg-blue-500 text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                )}>
                {t === "gave"
                  ? <><ArrowUpRight size={12} /> You Gave</>
                  : <><ArrowDownLeft size={12} /> You Got</>}
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">
              Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus type="number" min="1" step="0.01"
              value={txForm.amount}
              onChange={e => { setTxForm(p => ({ ...p, amount: e.target.value })); setTxError(""); }}
              onKeyDown={e => e.key === "Enter" && saveTx()}
              placeholder="0.00"
              className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">Note / Description</label>
            <input
              value={txForm.note}
              onChange={e => setTxForm(p => ({ ...p, note: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && saveTx()}
              placeholder="e.g. Invoice #42, advance payment…"
              className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={txForm.date}
              onChange={e => { setTxForm(p => ({ ...p, date: e.target.value })); setTxError(""); }}
              className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          {txError && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
              <AlertCircle size={12} className="shrink-0" /> {txError}
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <button onClick={() => setTxModal(false)}
              className="flex-1 text-sm font-semibold px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              Cancel
            </button>
            <button onClick={saveTx}
              className={cn(
                "flex-1 text-sm font-bold px-4 py-2.5 rounded-xl text-white transition-all shadow-md",
                txForm.type === "gave"
                  ? "bg-emerald-500 hover:bg-emerald-400 shadow-emerald-200 dark:shadow-emerald-900/30"
                  : "bg-blue-500 hover:bg-blue-400 shadow-blue-200 dark:shadow-blue-900/30"
              )}>
              Save Entry
            </button>
          </div>
        </div>
      </Modal>

      {/* ════════════════════════════════════════
          Delete Customer Confirm Modal
          ════════════════════════════════════════ */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Customer">
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3.5">
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
              This will permanently delete{" "}
              <strong>{customers.find(c => c.id === deleteTarget)?.name}</strong>{" "}
              and all their transaction history. This cannot be undone.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setDeleteTarget(null)}
              className="flex-1 text-sm font-semibold px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              Cancel
            </button>
            <button onClick={() => deleteTarget && deleteCust(deleteTarget)}
              className="flex-1 text-sm font-bold px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-colors shadow-md shadow-red-200 dark:shadow-red-900/30">
              Delete Customer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
