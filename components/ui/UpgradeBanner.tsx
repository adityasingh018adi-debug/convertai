"use client";

import { Crown, Zap } from "lucide-react";

export function UpgradeBanner() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-5 text-white">
      <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full" />
      <div className="absolute -right-8 -top-4 w-24 h-24 bg-white/5 rounded-full" />
      <div className="flex items-start gap-3">
        <Crown size={24} className="text-amber-300 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold mb-1">Go Premium</h4>
          <p className="text-xs text-blue-100 leading-relaxed">
            Unlock unlimited conversions, AI features, and no watermarks.
          </p>
          <button className="mt-3 flex items-center gap-1.5 bg-white text-blue-700 font-bold text-xs px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
            <Zap size={12} />
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
}
