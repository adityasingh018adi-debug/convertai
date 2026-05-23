"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { Clipboard, Plus, Trash2, Download, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface LineItem {
  id: number;
  desc: string;
  qty: number;
  unit: string;
}

const initialItems: LineItem[] = [
  { id: 1, desc: "Cotton Fabric - Blue", qty: 50, unit: "metres" },
  { id: 2, desc: "Silk Thread - White", qty: 200, unit: "spools" },
];

export default function ChallanPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState<LineItem[]>(initialItems);
  const [form, setForm] = useState({
    challanNo: "CH-0192",
    date: "2025-05-24",
    deliverTo: "Delhi Supplies Co.\n456, Karol Bagh\nNew Delhi - 110005",
    vehicle: "DL 1C 1234",
  });

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { id: Date.now(), desc: "", qty: 1, unit: "pcs" },
    ]);

  const removeItem = (id: number) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const updateItem = (id: number, field: keyof LineItem, value: string | number) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );

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
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <Clipboard size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
                    AI Challan Maker
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Create delivery and payment challans instantly
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
                    Challan Details
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">
                        Challan No.
                      </label>
                      <input
                        value={form.challanNo}
                        onChange={(e) => setForm({ ...form, challanNo: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-amber-500 transition-colors"
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
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">
                      Deliver To
                    </label>
                    <textarea
                      value={form.deliverTo}
                      onChange={(e) => setForm({ ...form, deliverTo: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-amber-500 transition-colors resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">
                      Vehicle No.
                    </label>
                    <input
                      value={form.vehicle}
                      onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-amber-500 transition-colors font-mono uppercase"
                    />
                  </div>
                </div>

                {/* Items */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Items</h3>
                    <button
                      onClick={addItem}
                      className="flex items-center gap-1 text-xs text-amber-600 font-semibold hover:text-amber-700"
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
                          placeholder="Item description"
                          className="col-span-6 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-amber-500"
                        />
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => updateItem(item.id, "qty", +e.target.value)}
                          className="col-span-2 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-amber-500 text-center"
                        />
                        <input
                          value={item.unit}
                          onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                          className="col-span-3 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-amber-500"
                        />
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
                      DELIVERY CHALLAN
                    </h2>
                    <p className="text-xs text-slate-400">#{form.challanNo}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                    CH
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
                  <div>
                    <p className="text-slate-400 mb-1">From:</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">Your Business Name</p>
                    <p className="text-slate-500">Mumbai, Maharashtra</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Deliver To:</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200 whitespace-pre-line">{form.deliverTo}</p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg px-3 py-2 mb-4 flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold">Vehicle:</span> {form.vehicle}
                  <span className="font-semibold ml-4">Date:</span> {form.date}
                </div>

                <table className="w-full text-xs mb-6">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700">
                      <th className="text-left text-slate-400 py-2 font-medium">Item</th>
                      <th className="text-center text-slate-400 py-2 font-medium">Qty</th>
                      <th className="text-right text-slate-400 py-2 font-medium">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-slate-50 dark:border-slate-800">
                        <td className="py-2 text-slate-700 dark:text-slate-300">{item.desc || "—"}</td>
                        <td className="py-2 text-center text-slate-500">{item.qty}</td>
                        <td className="py-2 text-right text-slate-500">{item.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="border-t border-slate-100 dark:border-slate-700 pt-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-400">Receiver&apos;s Signature</p>
                    <div className="w-28 h-8 border-b border-slate-300 mt-3" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Authorised Signatory</p>
                    <div className="w-28 h-8 border-b border-slate-300 mt-3" />
                  </div>
                </div>

                <button className="mt-5 w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm py-3 rounded-xl transition-colors">
                  <Download size={15} />
                  Download Challan PDF
                </button>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
