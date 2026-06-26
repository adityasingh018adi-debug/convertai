"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { RightPanel } from "@/components/layout/RightPanel";
import { HeroBanner } from "@/components/dashboard/HeroBanner";
import { ToolCard } from "@/components/dashboard/ToolCard";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RevenueChart, type RevenuePoint } from "@/components/dashboard/RevenueChart";
import { DragDropZone } from "@/components/ui/DragDropZone";
import { getHistory } from "@/lib/history";
import {
  FileText,
  FileOutput,
  Receipt,
  Clipboard,
  ScanText,
  BookOpen,
  IndianRupee,
  Users,
  BarChart3,
  Users2,
  Star,
  Shield,
} from "lucide-react";

// Same localStorage keys as app/ledger/page.tsx — read-only here.
const LS_CUSTOMERS = "kh_customers_v2";
const LS_TRANSACTIONS = "kh_transactions_v2";

type LedgerCustomer = { id: string; name: string };
type LedgerTx = { customerId: string; type: "gave" | "got"; amount: number; date: string };

function loadLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const r = localStorage.getItem(key);
    return r ? (JSON.parse(r) as T) : fallback;
  } catch {
    return fallback;
  }
}

const toolCards = [
  {
    icon: FileText,
    title: "Word to PDF",
    description:
      "Convert Word documents to PDF instantly with perfect formatting preserved.",
    href: "/word-to-pdf",
    gradient: "bg-gradient-to-br from-blue-500 to-blue-700",
  },
  {
    icon: FileOutput,
    title: "PDF to Word",
    description:
      "Extract and edit PDF content as a fully editable Word document.",
    href: "/pdf-to-word",
    gradient: "bg-gradient-to-br from-purple-500 to-purple-700",
  },
  {
    icon: Receipt,
    title: "AI Invoice Maker",
    description:
      "Generate professional GST invoices in seconds with AI assistance.",
    href: "/invoice",
    gradient: "bg-gradient-to-br from-emerald-500 to-emerald-700",
  },
  {
    icon: Clipboard,
    title: "AI Challan Maker",
    description:
      "Create delivery challans and payment challans with ease.",
    href: "/challan",
    gradient: "bg-gradient-to-br from-amber-500 to-orange-600",
  },
];

// Real, verifiable facts about the product — not invented usage metrics.
const statsBar = [
  { icon: Star, value: "100% Free", label: "No hidden costs" },
  { icon: Shield, value: "No Sign-up", label: "Use instantly" },
  { icon: FileText, value: "6", label: "Tools in one place" },
  { icon: Users2, value: "Local-first", label: "Files never stored" },
];

const AVATAR_COLORS = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [customers, setCustomers] = useState<LedgerCustomer[]>([]);
  const [totalReceivable, setTotalReceivable] = useState(0);
  const [docsCreated, setDocsCreated] = useState(0);
  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);

  useEffect(() => {
    const ledgerCustomers = loadLS<LedgerCustomer[]>(LS_CUSTOMERS, []);
    const ledgerTxs = loadLS<LedgerTx[]>(LS_TRANSACTIONS, []);
    setCustomers(ledgerCustomers);

    const receivable = ledgerCustomers.reduce((sum, c) => {
      const bal = ledgerTxs
        .filter((t) => t.customerId === c.id)
        .reduce((s, t) => s + (t.type === "gave" ? t.amount : -t.amount), 0);
      return sum + Math.max(0, bal);
    }, 0);
    setTotalReceivable(receivable);

    setDocsCreated(getHistory().length);

    const gotTxs = ledgerTxs.filter((t) => t.type === "got").sort((a, b) => a.date.localeCompare(b.date));
    const byDay = new Map<string, number>();
    for (const t of gotTxs) {
      const day = new Date(t.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      byDay.set(day, (byDay.get(day) || 0) + t.amount);
    }
    setRevenueData(Array.from(byDay, ([date, revenue]) => ({ date, revenue })).slice(-11));

    setHydrated(true);
  }, []);

  const metrics = [
    { icon: IndianRupee, iconBg: "bg-blue-50 dark:bg-blue-900/30", iconColor: "text-blue-600",
      label: "Receivable (Ledger)", value: `₹${new Intl.NumberFormat("en-IN").format(totalReceivable)}`,
      rawValue: totalReceivable, prefix: "₹", changeLabel: "from Khatabook ledger" },
    { icon: Users, iconBg: "bg-emerald-50 dark:bg-emerald-900/30", iconColor: "text-emerald-600",
      label: "Ledger Customers", value: String(customers.length), rawValue: customers.length, prefix: "",
      changeLabel: "tracked in your ledger" },
    { icon: BarChart3, iconBg: "bg-purple-50 dark:bg-purple-900/30", iconColor: "text-purple-600",
      label: "Documents on this device", value: String(docsCreated), rawValue: docsCreated, prefix: "",
      changeLabel: "converted, scanned or generated" },
  ];

  if (!hydrated) return <PageSkeleton sidebarOpen={sidebarOpen} onCloseSidebar={() => setSidebarOpen(false)} />;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />

        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 space-y-6">

              <HeroBanner />

              {/* Tool Cards */}
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-white mb-4">
                  Document Tools
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {toolCards.map((card, i) => (
                    <ToolCard key={card.href} {...card} delay={i * 0.08} />
                  ))}
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* OCR */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center mb-3 sm:mb-4">
                    <ScanText size={22} className="text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
                    OCR Scanner
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 flex-1">
                    Extract text from images and scanned PDFs using advanced AI OCR.
                  </p>
                  <a href="/ocr" className="w-full text-xs font-semibold text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-700 rounded-xl py-3 active:bg-cyan-50 dark:active:bg-cyan-900/30 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 transition-all text-center min-h-[44px] flex items-center justify-center">
                    Open Scanner →
                  </a>
                </div>

                <DragDropZone />

                {/* Khatabook */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col sm:col-span-2 md:col-span-1">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center mb-3 sm:mb-4">
                    <BookOpen size={22} className="text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
                    Khatabook Ledger
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3 flex-1">
                    Manage customers, track credits &amp; debits, and maintain your business ledger.
                  </p>
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    {customers.length === 0 ? (
                      <span className="text-xs text-slate-400">No customers yet — add one in the ledger</span>
                    ) : (
                      <>
                        <div className="flex -space-x-2">
                          {customers.slice(0, 4).map((c, i) => (
                            <div
                              key={c.id}
                              title={c.name}
                              className={`w-7 h-7 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} border-2 border-white dark:border-slate-800 flex items-center justify-center text-white text-xs font-bold`}
                            >
                              {c.name.slice(0, 1).toUpperCase()}
                            </div>
                          ))}
                          {customers.length > 4 && (
                            <div className="w-7 h-7 rounded-full bg-slate-400 border-2 border-white dark:border-slate-800 flex items-center justify-center text-white text-xs font-bold">
                              +{customers.length - 4}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">customer{customers.length !== 1 ? "s" : ""}</span>
                      </>
                    )}
                  </div>
                  <a href="/ledger" className="w-full text-xs font-semibold text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-700 rounded-xl py-3 active:bg-violet-50 dark:active:bg-violet-900/30 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-all text-center min-h-[44px] flex items-center justify-center">
                    Open Ledger →
                  </a>
                </div>
              </div>

              {/* Business Overview */}
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-white mb-4">
                  Business Overview
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  {metrics.map((m) => (
                    <MetricCard key={m.label} {...m} />
                  ))}
                </div>

                <RevenueChart data={revenueData} />
              </div>

              {/* Stats Footer */}
              <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-2xl p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {statsBar.map((stat) => (
                    <div
                      key={stat.label}
                      className="flex flex-col items-center gap-1 text-center"
                    >
                      <stat.icon size={20} className="text-amber-400 mb-1" />
                      <span className="text-xl font-extrabold text-white">
                        {stat.value}
                      </span>
                      <span className="text-xs text-slate-400">
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </main>

          <RightPanel />
        </div>
      </div>
    </div>
  );
}
