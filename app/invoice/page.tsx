"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { Receipt, Plus, Trash2, Download, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface LineItem {
  id: number;
  desc: string;
  qty: number;
  rate: number;
}

const initialItems: LineItem[] = [
  { id: 1, desc: "Web Development Services", qty: 1, rate: 45000 },
  { id: 2, desc: "UI/UX Design", qty: 1, rate: 20000 },
];

export default function InvoicePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState<LineItem[]>(initialItems);
  const [form, setForm] = useState({
    invoiceNo: "INV-2847",
    date: "2025-05-24",
    billTo: "Sharma Electronics\n123, MG Road\nNew Delhi - 110001",
    gstin: "07AABCS1234F1ZN",
  });

  const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0);
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { id: Date.now(), desc: "", qty: 1, rate: 0 },
    ]);

  const removeItem = (id: number) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const updateItem = (id: number, field: keyof LineItem, value: string | number) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );

  const fmt = (n: number) =>
    "₹" + new Intl.NumberFormat("en-IN").format(n);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-4xl mx-auto space-y-6">

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                  <Receipt size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
                    AI Invoice Maker
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Generate professional GST invoices instantly
                  </p>
                </div>
              </div>
              <button className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-4 py-2.5 rounded-xl transition-colors">
                <Sparkles size={13} />
                AI Fill
              </button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Invoice Details
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">
                        Invoice No.
                      </label>
                      <input
                        value={form.invoiceNo}
                        onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">
                        Date
                      </label>
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">
                      Bill To
                    </label>
                    <textarea
                      value={form.billTo}
                      onChange={(e) => setForm({ ...form, billTo: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500 transition-colors resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">
                      GSTIN
                    </label>
                    <input
                      value={form.gstin}
                      onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500 transition-colors font-mono"
                    />
                  </div>
                </div>

                {/* Line Items */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      Items
                    </h3>
                    <button
                      onClick={addItem}
                      className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:text-blue-700"
                    >
                      <Plus size={13} /> Add Item
                    </button>
                  </div>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                        <input
                          value={item.desc}
                          onChange={(e) => updateItem(item.id, "desc", e.target.value)}
                          placeholder="Description"
                          className="col-span-5 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500"
                        />
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => updateItem(item.id, "qty", +e.target.value)}
                          className="col-span-2 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500 text-center"
                        />
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => updateItem(item.id, "rate", +e.target.value)}
                          className="col-span-3 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500"
                        />
                        <div className="col-span-1 text-xs font-semibold text-slate-500 dark:text-slate-400 text-right truncate">
                          {fmt(item.qty * item.rate)}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="col-span-1 text-red-400 hover:text-red-600 flex items-center justify-center"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Preview */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-800 dark:text-white">
                      INVOICE
                    </h2>
                    <p className="text-xs text-slate-400">#{form.invoiceNo}</p>
                  </div>
                  <div className="text-right">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      CA
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
                  <div>
                    <p className="text-slate-400 mb-1">From:</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                      Your Business Name
                    </p>
                    <p className="text-slate-500">Mumbai, Maharashtra</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Bill To:</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200 whitespace-pre-line">
                      {form.billTo}
                    </p>
                  </div>
                </div>

                <table className="w-full text-xs mb-4">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700">
                      <th className="text-left text-slate-400 py-2 font-medium">Item</th>
                      <th className="text-center text-slate-400 py-2 font-medium">Qty</th>
                      <th className="text-right text-slate-400 py-2 font-medium">Rate</th>
                      <th className="text-right text-slate-400 py-2 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-slate-50 dark:border-slate-800">
                        <td className="py-2 text-slate-700 dark:text-slate-300">
                          {item.desc || "—"}
                        </td>
                        <td className="py-2 text-center text-slate-500">{item.qty}</td>
                        <td className="py-2 text-right text-slate-500">{fmt(item.rate)}</td>
                        <td className="py-2 text-right font-semibold text-slate-700 dark:text-slate-200">
                          {fmt(item.qty * item.rate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="space-y-1 text-xs mb-6">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>{fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>GST (18%)</span>
                    <span>{fmt(gst)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-slate-800 dark:text-white text-sm border-t border-slate-100 dark:border-slate-700 pt-2 mt-2">
                    <span>Total</span>
                    <span className="text-emerald-600">{fmt(total)}</span>
                  </div>
                </div>

                <button className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-3 rounded-xl transition-colors">
                  <Download size={15} />
                  Download Invoice PDF
                </button>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
