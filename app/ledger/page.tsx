"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { BookOpen, Plus, Search, TrendingUp, TrendingDown, IndianRupee } from "lucide-react";
import { motion } from "framer-motion";

const customers = [
  { id: 1, name: "Sharma Electronics", phone: "+91 98765 43210", city: "New Delhi", credit: 125000, debit: 45000, lastTx: "2 May 2025", status: "active" },
  { id: 2, name: "Gupta Traders", phone: "+91 87654 32109", city: "Mumbai", credit: 98500, debit: 98500, lastTx: "18 May 2025", status: "cleared" },
  { id: 3, name: "Kumar Wholesale", phone: "+91 76543 21098", city: "Jaipur", credit: 67200, debit: 12000, lastTx: "22 May 2025", status: "active" },
  { id: 4, name: "Singh & Co.", phone: "+91 65432 10987", city: "Bangalore", credit: 45000, debit: 45000, lastTx: "10 May 2025", status: "cleared" },
  { id: 5, name: "Delhi Supplies Co.", phone: "+91 54321 09876", city: "New Delhi", credit: 189000, debit: 75000, lastTx: "23 May 2025", status: "active" },
  { id: 6, name: "Patel Enterprises", phone: "+91 43210 98765", city: "Ahmedabad", credit: 32500, debit: 8000, lastTx: "15 May 2025", status: "active" },
];

const fmt = (n: number) => "₹" + new Intl.NumberFormat("en-IN").format(n);

export default function LedgerPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  const totalReceivable = customers.reduce(
    (s, c) => s + Math.max(0, c.credit - c.debit),
    0
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-5xl mx-auto space-y-6">

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                  <BookOpen size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
                    Khatabook Ledger
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Manage customers and track payments
                  </p>
                </div>
              </div>
              <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-blue-200 dark:shadow-blue-900/40">
                <Plus size={14} />
                Add Customer
              </button>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: IndianRupee, label: "Total Receivable", value: fmt(totalReceivable), bg: "bg-blue-50 dark:bg-blue-900/20", color: "text-blue-600" },
                { icon: TrendingUp, label: "Active Customers", value: customers.filter(c => c.status === "active").length.toString(), bg: "bg-emerald-50 dark:bg-emerald-900/20", color: "text-emerald-600" },
                { icon: TrendingDown, label: "Cleared Accounts", value: customers.filter(c => c.status === "cleared").length.toString(), bg: "bg-slate-100 dark:bg-slate-800", color: "text-slate-600" },
              ].map((stat) => (
                <div key={stat.label} className={`rounded-2xl p-4 ${stat.bg} border border-slate-100 dark:border-slate-700`}>
                  <stat.icon size={18} className={`${stat.color} mb-2`} />
                  <p className="text-lg font-extrabold text-slate-800 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 max-w-sm">
              <Search size={15} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customers..."
                className="flex-1 text-sm bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
              />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Customer</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 hidden sm:table-cell">City</th>
                    <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3">Credit</th>
                    <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3">Debit</th>
                    <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3 hidden md:table-cell">Balance</th>
                    <th className="text-center text-xs font-semibold text-slate-500 px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => {
                    const balance = c.credit - c.debit;
                    return (
                      <motion.tr
                        key={c.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {c.name.slice(0, 1)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                                {c.name}
                              </p>
                              <p className="text-xs text-slate-400">{c.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500 hidden sm:table-cell">
                          {c.city}
                        </td>
                        <td className="px-4 py-3.5 text-right font-semibold text-emerald-600 text-xs">
                          {fmt(c.credit)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-semibold text-red-500 text-xs">
                          {fmt(c.debit)}
                        </td>
                        <td className="px-4 py-3.5 text-right hidden md:table-cell">
                          <span className={`font-bold text-xs ${balance > 0 ? "text-blue-600" : "text-slate-500"}`}>
                            {balance > 0 ? fmt(balance) : "Settled"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full ${
                            c.status === "active"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                          }`}>
                            {c.status === "active" ? "Active" : "Cleared"}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
