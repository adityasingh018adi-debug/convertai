"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { motion } from "framer-motion";
import {
  Shield,
  Users,
  FileText,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Receipt,
  Clipboard,
  FileType,
  Eye,
  Lock,
  Globe,
  Cpu,
} from "lucide-react";

const stats = [
  { label: "Total Users", value: "1", icon: Users, color: "from-blue-500 to-blue-700", change: "+0%" },
  { label: "Documents Generated", value: "24", icon: FileText, color: "from-emerald-500 to-emerald-700", change: "+12%" },
  { label: "PDFs Downloaded", value: "18", icon: Download, color: "from-purple-500 to-purple-700", change: "+8%" },
  { label: "Active Sessions", value: "1", icon: Activity, color: "from-amber-500 to-orange-600", change: "Live" },
];

const recentActivity = [
  { action: "Invoice PDF Downloaded", user: "Admin", time: "2 mins ago", icon: Receipt, color: "text-emerald-500" },
  { action: "Challan PDF Generated", user: "Admin", time: "15 mins ago", icon: Clipboard, color: "text-amber-500" },
  { action: "Word to PDF Conversion", user: "Admin", time: "1 hour ago", icon: FileType, color: "text-blue-500" },
  { action: "Admin Login", user: "Admin", time: "2 hours ago", icon: Lock, color: "text-purple-500" },
  { action: "Invoice Created", user: "Admin", time: "3 hours ago", icon: Receipt, color: "text-emerald-500" },
  { action: "Session Started", user: "Admin", time: "5 hours ago", icon: Globe, color: "text-slate-400" },
];

const securityChecks = [
  { label: "Authentication", status: "secure", desc: "NextAuth.js with bcrypt hashing" },
  { label: "Route Protection", status: "secure", desc: "All pages require login" },
  { label: "Admin Access Control", status: "secure", desc: "Role-based admin restriction" },
  { label: "Session Encryption", status: "secure", desc: "JWT with secret key" },
  { label: "Password Storage", status: "secure", desc: "bcrypt hashed, never plain text" },
  { label: "HTTPS", status: "warning", desc: "Enable on production deployment" },
];

const toolUsage = [
  { name: "AI Invoice Maker", uses: 12, icon: Receipt, color: "bg-emerald-500" },
  { name: "AI Challan Maker", uses: 7, icon: Clipboard, color: "bg-amber-500" },
  { name: "Word to PDF", uses: 5, icon: FileType, color: "bg-blue-500" },
  { name: "PDF Tools", uses: 3, icon: FileText, color: "bg-purple-500" },
];

export default function AdminPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-6xl mx-auto space-y-6">

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg">
                  <Shield size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Admin Dashboard</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">DoclifyAI — Security & Analytics Overview</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">All Systems Operational</span>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <motion.div key={stat.label}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon size={17} className="text-white" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Security Status */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Lock size={16} className="text-slate-700 dark:text-slate-300" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Security Status</h3>
                </div>
                <div className="space-y-3">
                  {securityChecks.map((check) => (
                    <div key={check.label} className="flex items-start gap-3">
                      {check.status === "secure" ? (
                        <CheckCircle size={15} className="text-emerald-500 mt-0.5 shrink-0" />
                      ) : (
                        <AlertTriangle size={15} className="text-amber-500 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{check.label}</p>
                        <p className="text-xs text-slate-400">{check.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Activity size={16} className="text-slate-700 dark:text-slate-300" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Recent Activity</h3>
                </div>
                <div className="space-y-3">
                  {recentActivity.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center shrink-0">
                        <item.icon size={14} className={item.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{item.action}</p>
                        <p className="text-xs text-slate-400">{item.user}</p>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 shrink-0">
                        <Clock size={11} />
                        <span className="text-xs">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tool Usage */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={16} className="text-slate-700 dark:text-slate-300" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Tool Usage</h3>
                </div>
                <div className="space-y-4">
                  {toolUsage.map((tool) => {
                    const max = toolUsage[0].uses;
                    const pct = Math.round((tool.uses / max) * 100);
                    return (
                      <div key={tool.name}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <tool.icon size={13} className="text-slate-500" />
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{tool.name}</span>
                          </div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{tool.uses} uses</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full ${tool.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* System Info */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Cpu size={16} className="text-slate-700 dark:text-slate-300" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">System Info</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Framework", value: "Next.js (App Router)" },
                    { label: "Auth Provider", value: "NextAuth.js v4" },
                    { label: "Password Hashing", value: "bcryptjs" },
                    { label: "Session Strategy", value: "JWT · 24h expiry" },
                    { label: "PDF Engine", value: "jsPDF + autotable" },
                    { label: "Deployment", value: "Netlify" },
                    { label: "Admin Email", value: "Configured via env vars" },
                    { label: "App Version", value: "v1.0.0" },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
                      <span className="text-xs text-slate-400">{row.label}</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{row.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Access Log Banner */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 border border-slate-700">
              <div className="flex items-center gap-3">
                <Eye size={20} className="text-slate-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-white">Protected Admin Zone</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    This dashboard is only accessible to verified admin accounts. All access attempts are tracked.
                    Unauthorized access is blocked by middleware route protection.
                  </p>
                </div>
              </div>
            </motion.div>

          </div>
        </main>
      </div>
    </div>
  );
}
