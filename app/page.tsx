"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { RightPanel } from "@/components/layout/RightPanel";
import { HeroBanner } from "@/components/dashboard/HeroBanner";
import { ToolCard } from "@/components/dashboard/ToolCard";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { DragDropZone } from "@/components/ui/DragDropZone";
import {
  FileText,
  FileOutput,
  Receipt,
  Clipboard,
  ScanText,
  BookOpen,
  IndianRupee,
  Clock,
  Users,
  BarChart3,
  ChevronDown,
  Users2,
  Star,
  Shield,
} from "lucide-react";

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

const metrics = [
  {
    icon: IndianRupee,
    iconBg: "bg-blue-50 dark:bg-blue-900/30",
    iconColor: "text-blue-600",
    label: "Total Revenue",
    value: "₹2,48,750",
    rawValue: 248750,
    prefix: "₹",
    change: 12.5,
    changeLabel: "vs last month",
  },
  {
    icon: Clock,
    iconBg: "bg-amber-50 dark:bg-amber-900/30",
    iconColor: "text-amber-600",
    label: "Pending Payments",
    value: "₹78,650",
    rawValue: 78650,
    prefix: "₹",
    change: 8.4,
    changeLabel: "vs last month",
  },
  {
    icon: Users,
    iconBg: "bg-emerald-50 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600",
    label: "Total Customers",
    value: "356",
    rawValue: 356,
    prefix: "",
    change: 10.2,
    changeLabel: "new this month",
  },
  {
    icon: BarChart3,
    iconBg: "bg-purple-50 dark:bg-purple-900/30",
    iconColor: "text-purple-600",
    label: "Invoices Created",
    value: "158",
    rawValue: 158,
    prefix: "",
    change: 15.3,
    changeLabel: "vs last month",
  },
];

const statsBar = [
  { icon: Users2, value: "50K+", label: "Happy Users" },
  { icon: FileText, value: "1M+", label: "Docs Converted" },
  { icon: Shield, value: "99.9%", label: "Uptime" },
  { icon: Star, value: "4.9/5", label: "User Rating" },
];

const khatabookCustomers = [
  { name: "Rahul Sharma", initials: "RS", color: "bg-blue-500" },
  { name: "Priya Gupta", initials: "PG", color: "bg-purple-500" },
  { name: "Amit Singh", initials: "AS", color: "bg-emerald-500" },
  { name: "Neha Kumar", initials: "NK", color: "bg-amber-500" },
  { name: "+352 more", initials: "+352", color: "bg-slate-400" },
];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
                    <div className="flex -space-x-2">
                      {khatabookCustomers.map((c) => (
                        <div
                          key={c.name}
                          title={c.name}
                          className={`w-7 h-7 rounded-full ${c.color} border-2 border-white dark:border-slate-800 flex items-center justify-center text-white text-xs font-bold`}
                        >
                          {c.initials}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-slate-500">customers</span>
                  </div>
                  <a href="/ledger" className="w-full text-xs font-semibold text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-700 rounded-xl py-3 active:bg-violet-50 dark:active:bg-violet-900/30 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-all text-center min-h-[44px] flex items-center justify-center">
                    Open Ledger →
                  </a>
                </div>
              </div>

              {/* Business Overview */}
              <div>
                <div className="flex items-center justify-between mb-4 gap-3">
                  <h2 className="text-base font-bold text-slate-800 dark:text-white shrink-0">
                    Business Overview
                  </h2>
                  <button className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 active:bg-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap min-h-[36px]">
                    This Month <ChevronDown size={13} />
                  </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {metrics.map((m) => (
                    <MetricCard key={m.label} {...m} />
                  ))}
                </div>

                <RevenueChart />
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
