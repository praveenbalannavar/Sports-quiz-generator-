import React from "react";
import { Award, Search, ShieldCheck, Zap } from "lucide-react";

interface HeaderProps {
  sportsCount: number;
}

export const Header: React.FC<HeaderProps> = ({ sportsCount }) => {
  return (
    <header className="border-b border-[#1a1a1a]/10 bg-white/85 backdrop-blur-md sticky top-0 z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1a1a1a] flex items-center justify-center border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:scale-105">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-black uppercase tracking-[0.25em] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200/50">
                  VERIFIED SPORTS NETWORK
                </span>
              </div>
              <h1 className="text-2xl font-serif font-black italic tracking-tighter text-[#1a1a1a] flex items-center gap-2">
                ATHLETA
                <span className="text-xs font-mono font-normal not-italic px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200/50">
                  PRO
                </span>
              </h1>
            </div>
          </div>

          {/* Real-time Metrics */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] font-mono text-[#1a1a1a]/70">
            
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/40 px-3 py-1.5 rounded-none shadow-sm">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>
                Engine: <strong className="text-black font-semibold">Active</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/40 px-3 py-1.5 rounded-none shadow-sm">
              <Search className="w-3.5 h-3.5 text-[#d94e33]" />
              <span>
                Search-Assisted: <strong className="text-black font-semibold">Enabled</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/40 px-3 py-1.5 rounded-none shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                Accuracy Guard: <strong className="text-black font-semibold">Verified</strong>
              </span>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
