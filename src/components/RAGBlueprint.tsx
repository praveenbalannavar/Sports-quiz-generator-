import React from "react";
import { motion } from "motion/react";
import { 
  Database, 
  Search, 
  Settings, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  Info,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface RAGBlueprintProps {
  showBlueprint: boolean;
  onToggle: () => void;
  selectedSport: string;
  focusKeyword: string;
}

export const RAGBlueprint: React.FC<RAGBlueprintProps> = ({
  showBlueprint,
  onToggle,
  selectedSport,
  focusKeyword
}) => {
  return (
    <div className="bg-white border border-black/15 shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all">
      {/* Header Panel */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-black/10 hover:bg-slate-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-[#1a1a1a] flex items-center justify-center text-white font-mono text-sm font-bold">
            S
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a] flex items-center gap-2">
              System Architecture & Verification
              <span className="text-[10px] bg-emerald-500/10 text-emerald-700 border border-emerald-500/25 px-2 py-0.5 rounded-none normal-case tracking-normal font-mono">
                Verified Engine Active
              </span>
            </h2>
            <p className="text-[11px] text-[#1a1a1a]/60 font-mono mt-0.5">
              Visualizing the sports reference lookup & verification system.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-[#1a1a1a]/60">
          <span>{showBlueprint ? "COLLAPSE" : "EXPAND ARCHITECTURE"}</span>
          {showBlueprint ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Interactive Blueprint Canvas */}
      {showBlueprint && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="p-6 overflow-hidden border-t border-black/5 bg-[#fafafa]"
        >
          {/* Step Blocks Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-stretch relative">
            
            {/* Step 1: Input Parameters */}
            <div className="bg-white p-4 border border-black/10 flex flex-col justify-between shadow-sm relative">
              <div className="absolute top-2 right-2 text-[11px] font-mono font-bold text-slate-300">
                01
              </div>
              <div>
                <div className="flex items-center gap-2 text-indigo-600 mb-2">
                  <Settings className="w-4 h-4" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">Parameters</span>
                </div>
                <h3 className="text-sm font-serif font-black italic text-slate-950 mb-1">Target Filters</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  The user defines parameters like sport, difficulty level, and focus terms.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-black/5 font-mono text-[10px] text-slate-600 bg-slate-50 p-2">
                <div>Sport: <span className="text-indigo-600 font-bold">{selectedSport}</span></div>
                <div>Focus: <span className="text-amber-600 font-bold">{focusKeyword || "N/A"}</span></div>
              </div>
            </div>

            {/* Path Arrow */}
            <div className="hidden lg:flex items-center justify-center text-slate-300">
              <ArrowRight className="w-6 h-6 animate-pulse" />
            </div>

            {/* Step 2: Dual-Source Retrieval */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Reference Database Lookup */}
              <div className="bg-white p-4 border border-emerald-500/35 relative shadow-sm hover:border-emerald-500 transition-colors">
                <div className="absolute top-2 right-2 text-[11px] font-mono font-bold text-emerald-200">
                  02A
                </div>
                <div className="flex items-center gap-2 text-emerald-600 mb-2">
                  <Database className="w-4 h-4" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">Database Lookup</span>
                </div>
                <h3 className="text-sm font-serif font-black italic text-slate-950 mb-1">Curated Records</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Queries our curated athletic records repository using targeted sports context matching.
                </p>
                <div className="mt-3 text-[9px] font-mono text-emerald-700 bg-emerald-50/50 p-1.5 border border-emerald-100">
                  REF_DB: <code className="text-black font-bold">category == "{selectedSport}"</code>
                </div>
              </div>

              {/* Live Search Validation */}
              <div className="bg-white p-4 border border-[#d94e33]/35 relative shadow-sm hover:border-[#d94e33] transition-colors">
                <div className="absolute top-2 right-2 text-[11px] font-mono font-bold text-rose-200">
                  02B
                </div>
                <div className="flex items-center gap-2 text-[#d94e33] mb-2">
                  <Search className="w-4 h-4" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">Live Validation</span>
                </div>
                <h3 className="text-sm font-serif font-black italic text-slate-950 mb-1">Search Assistant</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Augments context with real-time news search queries to secure the latest athletic data points.
                </p>
                <div className="mt-3 text-[9px] font-mono text-[#d94e33] bg-[#d94e33]/5 p-1.5 border border-[#d94e33]/10">
                  SIGNAL: <code className="text-black font-bold">"{selectedSport} tournament records..."</code>
                </div>
              </div>

            </div>

            {/* Path Arrow */}
            <div className="hidden lg:flex items-center justify-center text-slate-300">
              <ArrowRight className="w-6 h-6 animate-pulse" />
            </div>

            {/* Step 3: Structured Fact Synthesis */}
            <div className="bg-white p-4 border border-blue-500/35 flex flex-col justify-between shadow-sm relative hover:border-blue-500 transition-colors">
              <div className="absolute top-2 right-2 text-[11px] font-mono font-bold text-blue-200">
                03
              </div>
              <div>
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Cpu className="w-4 h-4" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">Synthesis Engine</span>
                </div>
                <h3 className="text-sm font-serif font-black italic text-slate-950 mb-1">Structured Trivia</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Context is integrated into the engine's query sequence using strict factual criteria and validation.
                </p>
              </div>
              <div className="mt-3 space-y-1 font-mono text-[9px] text-blue-700 bg-blue-50/50 p-2 border border-blue-100">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Double-Verification</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Accurate Citations</span>
                </div>
              </div>
            </div>

          </div>

          {/* Verification Statement */}
          <div className="mt-4 p-3.5 bg-indigo-50 border border-indigo-100 flex items-start gap-2.5">
            <Info className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-indigo-950 font-mono">System Architecture Note on Factual Grounding</h4>
              <p className="text-xs text-indigo-900/80 leading-normal mt-0.5">
                Our dual-source lookup pipeline ensures that every single question is explicitly corroborated by verified reference documents and live tournament feeds. The synthesis engine is strictly bounded to generate precise answers and detailed factual explanations backed by verified evidence, completely preventing inaccurate information or hallucinations.
              </p>
            </div>
          </div>

        </motion.div>
      )}
    </div>
  );
};
