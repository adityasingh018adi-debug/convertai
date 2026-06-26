"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { Building2, CheckCircle, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  getCompanies, addCompany, updateCompany, deleteCompany,
  getLastUsedCompanyId, setLastUsedCompanyId, type CompanyProfile,
} from "@/lib/companyProfile";
import { SignaturePad } from "@/components/ui/SignaturePad";
import { showToast } from "@/lib/toast";

const EMPTY: Omit<CompanyProfile, "id"> = {
  name: "", address: "", logo: "", gst: "", pan: "", fssai: "",
  phone: "", email: "", website: "", bankDetails: "", upiId: "", signature: "", stamp: "",
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function CompanyProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [form, setForm] = useState<Omit<CompanyProfile, "id">>(EMPTY);
  const [saved, setSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const list = getCompanies();
    setCompanies(list);
    const last = getLastUsedCompanyId();
    const id = last && list.some((c) => c.id === last) ? last : list[0]?.id ?? "";
    setSelectedId(id);
    const c = list.find((c) => c.id === id);
    if (c) setForm(c);
    setHydrated(true);
  }, []);

  const selectCompany = (id: string) => {
    setSelectedId(id);
    setLastUsedCompanyId(id);
    const c = companies.find((c) => c.id === id);
    if (c) setForm(c);
  };

  const handleNew = () => {
    setSelectedId("");
    setForm(EMPTY);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (selectedId) {
      updateCompany(selectedId, form);
    } else {
      const created = addCompany(form);
      setSelectedId(created.id);
    }
    const list = getCompanies();
    setCompanies(list);
    setSaved(true);
    showToast("Company profile saved.", "success");
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    deleteCompany(selectedId);
    const list = getCompanies();
    setCompanies(list);
    setSelectedId(list[0]?.id ?? "");
    setForm(list[0] ?? EMPTY);
    showToast("Company profile deleted.", "success");
  };

  const handleFileField = async (field: "logo" | "signature" | "stamp", file: File | undefined) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setForm((f) => ({ ...f, [field]: dataUrl }));
  };

  if (!hydrated) return <PageSkeleton sidebarOpen={sidebarOpen} onCloseSidebar={() => setSidebarOpen(false)} />;

  const fields: { key: keyof Omit<CompanyProfile, "id" | "logo" | "signature" | "stamp">; label: string; placeholder: string }[] = [
    { key: "name", label: "Company Name *", placeholder: "Sharma Electronics Pvt. Ltd." },
    { key: "address", label: "Address", placeholder: "123, MG Road, Mumbai, Maharashtra" },
    { key: "gst", label: "GST Number", placeholder: "27AABCS1234F1ZN" },
    { key: "pan", label: "PAN", placeholder: "AABCS1234F" },
    { key: "fssai", label: "FSSAI License", placeholder: "12345678901234" },
    { key: "phone", label: "Phone", placeholder: "+91 98765 43210" },
    { key: "email", label: "Email", placeholder: "billing@company.com" },
    { key: "website", label: "Website", placeholder: "https://company.com" },
    { key: "upiId", label: "UPI ID", placeholder: "company@upi" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-3xl mx-auto space-y-6">

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                  <Building2 size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Company Profile</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Auto-fills your invoices &amp; challans</p>
                </div>
              </div>
              <button onClick={handleNew}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors">
                <Plus size={13} /> New Profile
              </button>
            </motion.div>

            {companies.length > 1 && (
              <div className="flex items-center gap-2 flex-wrap">
                {companies.map((c) => (
                  <button key={c.id} onClick={() => selectCompany(c.id)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                      selectedId === c.id
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}>
                    {c.name || "Untitled"}
                  </button>
                ))}
              </div>
            )}

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">

              {/* Logo */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                  {form.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.logo} alt={"Company logo"} loading="lazy" className="w-full h-full object-contain" />
                  ) : (
                    <Building2 size={24} className="text-slate-300" />
                  )}
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Company Logo</label>
                  <input type="file" accept="image/*" onChange={(e) => handleFileField("logo", e.target.files?.[0])}
                    className="text-xs text-slate-600 dark:text-slate-300 file:mr-2 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-indigo-100 dark:file:bg-indigo-900/30 file:text-indigo-700 dark:file:text-indigo-400 file:text-xs file:font-semibold" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fields.map((f) => (
                  <div key={f.key} className={f.key === "name" || f.key === "address" ? "sm:col-span-2" : ""}>
                    <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">{f.label}</label>
                    <input
                      value={form[f.key] ?? ""}
                      onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Bank Details</label>
                <textarea value={form.bankDetails ?? ""} onChange={(e) => setForm((p) => ({ ...p, bankDetails: e.target.value }))}
                  rows={2} placeholder="Bank Name, Account No, IFSC Code"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 transition-colors resize-none" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Signature</label>
                  <SignaturePad value={form.signature || null} onChange={(dataUrl) => setForm((p) => ({ ...p, signature: dataUrl || "" }))} />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Company Stamp</label>
                  <div className="w-full h-24 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                    {form.stamp ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.stamp} alt={"Company stamp"} loading="lazy" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-xs text-slate-400">No stamp uploaded</span>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={(e) => handleFileField("stamp", e.target.files?.[0])}
                    className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 file:mr-2 file:px-3 file:py-1 file:rounded-lg file:border-0 file:bg-indigo-100 dark:file:bg-indigo-900/30 file:text-indigo-700 dark:file:text-indigo-400 file:text-xs file:font-semibold" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button onClick={handleSave} disabled={!form.name.trim()}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm py-3 rounded-xl transition-colors">
                  Save Profile
                </button>
                {selectedId && companies.length > 1 && (
                  <button onClick={handleDelete} aria-label="Delete this company profile"
                    className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              {saved && (
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle size={13} /> Saved — this will now auto-fill your invoices &amp; challans.
                </div>
              )}
            </motion.div>

          </div>
        </main>
      </div>
    </div>
  );
}
