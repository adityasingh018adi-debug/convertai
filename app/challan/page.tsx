"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { useRouter } from "next/navigation";
import {
  Clipboard, Plus, Trash2, Download, Camera, FileText as FileTextIcon,
  Loader2, CheckCircle, AlertCircle, ChevronDown, X, ArrowRightLeft,
} from "lucide-react";
import { motion } from "framer-motion";
import { downloadChallanPdf } from "@/lib/generatePdf";
import { addHistoryItem } from "@/lib/history";
import { parseChallanText } from "@/lib/parseChallanText";
import { getCompanies, addCompany, getLastUsedCompanyId, setLastUsedCompanyId, type CompanyProfile } from "@/lib/companyProfile";
import { SignaturePad } from "@/components/ui/SignaturePad";
import { CHALLAN_TYPES, saveChallan, nextChallanNumber, type ChallanType } from "@/lib/challans";

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

const OCR_API_KEY = process.env.NEXT_PUBLIC_OCR_API_KEY || "helloworld";
const LS_SIGNATURE = "doclify_signature_v1";
const INVOICE_PREFILL_KEY = "doclify_invoice_prefill";

export default function ChallanPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState<LineItem[]>(initialItems);
  const [challanId, setChallanId] = useState<string | undefined>(undefined);
  const [form, setForm] = useState({
    challanNo: "CH-0192",
    type: "Delivery Challan" as ChallanType,
    date: "2025-05-24",
    deliverTo: "Delhi Supplies Co.\n456, Karol Bagh\nNew Delhi - 110005",
    vehicle: "DL 1C 1234",
  });

  // ── Company profiles ──
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("default");
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: "", address: "" });

  useEffect(() => {
    const list = getCompanies();
    setCompanies(list);
    const lastUsed = getLastUsedCompanyId();
    if (lastUsed && list.some((c) => c.id === lastUsed)) setSelectedCompanyId(lastUsed);
    else setSelectedCompanyId(list[0]?.id ?? "default");
    setForm((f) => ({ ...f, challanNo: nextChallanNumber() }));
  }, []);

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId) ?? companies[0];

  const handleAddCompany = () => {
    if (!newCompany.name.trim()) return;
    const created = addCompany({ name: newCompany.name, address: newCompany.address });
    setCompanies(getCompanies());
    setSelectedCompanyId(created.id);
    setLastUsedCompanyId(created.id);
    setNewCompany({ name: "", address: "" });
    setShowAddCompany(false);
  };

  // ── Signature ──
  const [signature, setSignature] = useState<string | null>(null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_SIGNATURE);
      if (saved) setSignature(saved);
    } catch { /* ignore */ }
  }, []);
  const handleSignatureChange = (dataUrl: string | null) => {
    setSignature(dataUrl);
    try {
      if (dataUrl) localStorage.setItem(LS_SIGNATURE, dataUrl);
      else localStorage.removeItem(LS_SIGNATURE);
    } catch { /* ignore */ }
  };

  // ── Quick Fill (Scan Photo / Paste Text) ──
  const [quickFillTab, setQuickFillTab] = useState<"photo" | "text">("text");
  const [pastedText, setPastedText] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [fillError, setFillError] = useState("");
  const [fillSuccess, setFillSuccess] = useState("");

  const applyParsedResult = (raw: string) => {
    const parsed = parseChallanText(raw);
    if (parsed.items.length === 0 && !parsed.deliverTo && !parsed.vehicle) {
      setFillError("Couldn't find any challan details in that text. Try a clearer format like \"5 boxes of steel rods\" per line.");
      return;
    }
    if (parsed.deliverTo) setForm((f) => ({ ...f, deliverTo: parsed.deliverTo! }));
    if (parsed.vehicle) setForm((f) => ({ ...f, vehicle: parsed.vehicle! }));
    if (parsed.items.length > 0) {
      setItems(parsed.items.map((i, idx) => ({ id: Date.now() + idx, ...i })));
    }
    setFillSuccess(`Filled ${parsed.items.length} item${parsed.items.length !== 1 ? "s" : ""} from your ${quickFillTab === "photo" ? "photo" : "text"}.`);
    setTimeout(() => setFillSuccess(""), 4000);
  };

  const handleParseText = () => {
    setFillError("");
    if (!pastedText.trim()) { setFillError("Paste some text first."); return; }
    applyParsedResult(pastedText);
  };

  const handleScanPhoto = async () => {
    if (!photoFile) { setFillError("Choose a photo first."); return; }
    setScanning(true); setFillError("");
    try {
      const body = new FormData();
      body.append("file", photoFile);
      body.append("apikey", OCR_API_KEY);
      body.append("language", "eng");
      body.append("isOverlayRequired", "false");
      body.append("scale", "true");
      body.append("OCREngine", "2");
      const resp = await fetch("https://api.ocr.space/parse/image", { method: "POST", body });
      const data = await resp.json();
      if (data.IsErroredOnProcessing) throw new Error(data.ErrorMessage?.[0] ?? "OCR failed");
      const text = data.ParsedResults?.map((r: { ParsedText: string }) => r.ParsedText).join("\n").trim();
      if (!text) throw new Error("No text found in that photo. Try a clearer image.");
      applyParsedResult(text);
    } catch (err) {
      setFillError(err instanceof Error ? err.message : "Scan failed. Try a clearer photo.");
    } finally {
      setScanning(false);
    }
  };

  const addItem = () =>
    setItems((prev) => [...prev, { id: Date.now(), desc: "", qty: 1, unit: "pcs" }]);
  const removeItem = (id: number) => setItems((prev) => prev.filter((i) => i.id !== id));
  const updateItem = (id: number, field: keyof LineItem, value: string | number) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

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
            </motion.div>

            {/* ── Quick Fill: Scan Photo / Paste Text ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                  <button
                    onClick={() => { setQuickFillTab("photo"); setFillError(""); }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      quickFillTab === "photo" ? "bg-amber-500 text-black shadow-sm" : "text-slate-500 dark:text-slate-400"
                    }`}>
                    <Camera size={13} /> Scan Photo
                  </button>
                  <button
                    onClick={() => { setQuickFillTab("text"); setFillError(""); }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      quickFillTab === "text" ? "bg-amber-500 text-black shadow-sm" : "text-slate-500 dark:text-slate-400"
                    }`}>
                    <FileTextIcon size={13} /> Paste Text
                  </button>
                </div>
              </div>

              {quickFillTab === "photo" ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Snap a photo of a handwritten note or printed list — we&apos;ll extract the items, delivery address and vehicle number automatically.
                  </p>
                  <div className="flex items-center gap-2">
                    <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                      className="flex-1 text-xs text-slate-600 dark:text-slate-300 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-amber-100 dark:file:bg-amber-900/30 file:text-amber-700 dark:file:text-amber-400 file:text-xs file:font-semibold" />
                    <button onClick={handleScanPhoto} disabled={!photoFile || scanning}
                      className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-700 text-black font-bold text-xs px-4 py-2 rounded-xl transition-colors shrink-0">
                      {scanning ? <><Loader2 size={13} className="animate-spin" /> Scanning…</> : <><Camera size={13} /> Scan &amp; Fill</>}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Paste a quick note like &ldquo;Deliver to: Sharma Traders, Delhi&rdquo; on one line and items like &ldquo;5 boxes of steel rods&rdquo; on others.
                  </p>
                  <textarea value={pastedText} onChange={(e) => setPastedText(e.target.value)} rows={4}
                    placeholder={"Deliver to: Sharma Traders, Delhi\nVehicle: DL 1C 1234\n5 boxes of steel rods\n10 kg cotton fabric"}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-amber-500 transition-colors resize-none" />
                  <button onClick={handleParseText}
                    className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-4 py-2 rounded-xl transition-colors">
                    <FileTextIcon size={13} /> Parse &amp; Fill
                  </button>
                </div>
              )}

              {fillError && (
                <div className="mt-3 flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle size={13} className="shrink-0 mt-0.5" /> {fillError}
                </div>
              )}
              {fillSuccess && (
                <div className="mt-3 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle size={13} className="shrink-0" /> {fillSuccess}
                </div>
              )}
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

                  {/* Company select */}
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">From (Company)</label>
                    {!showAddCompany ? (
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <select
                            value={selectedCompanyId}
                            onChange={(e) => { setSelectedCompanyId(e.target.value); setLastUsedCompanyId(e.target.value); }}
                            className="w-full appearance-none px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-amber-500 transition-colors pr-8">
                            {companies.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                        <button onClick={() => setShowAddCompany(true)}
                          className="flex items-center gap-1 text-xs text-amber-600 font-semibold hover:text-amber-700 shrink-0 px-2">
                          <Plus size={13} /> New
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 border border-slate-200 dark:border-slate-600">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Add company</p>
                          <button onClick={() => setShowAddCompany(false)} aria-label="Cancel adding company" className="text-slate-400 hover:text-slate-600">
                            <X size={14} />
                          </button>
                        </div>
                        <input value={newCompany.name} onChange={(e) => setNewCompany((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Company name" autoFocus
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-amber-500" />
                        <input value={newCompany.address} onChange={(e) => setNewCompany((p) => ({ ...p, address: e.target.value }))}
                          placeholder="Address (e.g. Mumbai, Maharashtra)"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-amber-500" />
                        <button onClick={handleAddCompany} disabled={!newCompany.name.trim()}
                          className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 disabled:text-slate-400 text-black font-bold text-xs py-2 rounded-lg transition-colors">
                          Save Company
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Challan Type</label>
                    <div className="relative">
                      <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ChallanType })}
                        className="w-full appearance-none px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-amber-500 transition-colors pr-8">
                        {CHALLAN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

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
                          aria-label="Remove line item"
                          className="col-span-1 text-red-400 hover:text-red-600 flex items-center justify-center"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Signature */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">Authorised Signature</h3>
                  <SignaturePad value={signature} onChange={handleSignatureChange} />
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
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{selectedCompany?.name ?? "DoclifyAI Business"}</p>
                    <p className="text-slate-500">{selectedCompany?.address ?? "Mumbai"}</p>
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
                    {signature ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={signature} alt="Your signature" className="w-28 h-8 object-contain mt-1" />
                    ) : (
                      <div className="w-28 h-8 border-b border-slate-300 mt-3" />
                    )}
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => {
                      downloadChallanPdf({
                        challanNo: form.challanNo,
                        date: form.date,
                        deliverTo: form.deliverTo,
                        vehicle: form.vehicle,
                        items: items.map(({ desc, qty, unit }) => ({ desc, qty, unit })),
                        fromName: selectedCompany?.name,
                        fromAddress: selectedCompany?.address,
                        signatureDataUrl: signature,
                      });
                      const record = saveChallan({
                        id: challanId, challanNo: form.challanNo, type: form.type, date: form.date,
                        companyId: selectedCompanyId, deliverTo: form.deliverTo, vehicle: form.vehicle,
                        items: items.map(({ id, desc, qty, unit }) => ({ id: String(id), desc, qty, unit })),
                      });
                      setChallanId(record.id);
                      addHistoryItem("challan", `Challan ${form.challanNo}.pdf`, `${items.length} item${items.length !== 1 ? "s" : ""}`);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm py-3 rounded-xl transition-colors shadow-md shadow-amber-200 dark:shadow-amber-900/30">
                    <Download size={15} />
                    Download Challan PDF
                  </button>
                  <button
                    onClick={() => {
                      localStorage.setItem(INVOICE_PREFILL_KEY, JSON.stringify({
                        billTo: form.deliverTo,
                        items: items.map(({ desc, qty }) => ({ desc, qty })),
                      }));
                      router.push("/invoice");
                    }}
                    title="Convert this challan into an invoice"
                    className="flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-semibold text-xs px-4 rounded-xl transition-colors shrink-0">
                    <ArrowRightLeft size={14} /> To Invoice
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
