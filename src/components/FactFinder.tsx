import React, { useState, useEffect } from "react";
import { Database, Search, Sparkles, Filter, CheckCircle2 } from "lucide-react";

interface Fact {
  sport: string;
  fact: string;
}

interface FactFinderProps {
  selectedSport: string;
  triggerToast: (msg: string) => void;
}

export const FactFinder: React.FC<FactFinderProps> = ({ selectedSport, triggerToast }) => {
  const [facts, setFacts] = useState<Fact[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Load all facts once to inspect
  useEffect(() => {
    const fetchFacts = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/sports");
        const data = await response.json();
        
        // We can fetch from local file directly or query sports_facts
        const fResp = await fetch("/data/sports_facts.json");
        const fData = await fResp.json();
        setFacts(fData);
      } catch (err) {
        console.error("Failed to load fact finder data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFacts();
  }, []);

  // Filter sports categories
  const categories: string[] = ["All", ...Array.from(new Set<string>(facts.map((f) => f.sport)))];

  // Filtering based on active category and search term
  const filteredFacts = facts.filter((f) => {
    const matchesCategory = activeCategory === "All" || f.sport.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = f.fact.toLowerCase().includes(searchTerm.toLowerCase()) || f.sport.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white border border-black/15 p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-5">
      <div>
        <h2 className="text-lg font-serif font-black italic text-slate-950 flex items-center gap-2">
          <Database className="w-4.5 h-4.5 text-emerald-600" />
          Verified Sports Fact Library
        </h2>
        <p className="text-xs text-slate-500 font-mono mt-0.5">
          Browse and search the verified sports fact collections stored in our reference library.
        </p>
      </div>

      {/* Control Row: Search and Filters */}
      <div className="space-y-3">
        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search verified facts by keyword (e.g. Thomas, Steffi, Bradman)..."
            className="w-full bg-slate-50 border border-black/10 p-2.5 pl-9 text-xs font-sans text-slate-900 focus:outline-none focus:border-black rounded-none transition-colors"
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        </div>

        {/* Categories pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {categories.map((cat) => {
            const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider rounded-none border transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-950 border-black text-white"
                    : "bg-slate-50 border-black/15 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* List container */}
      <div className="border border-black/5 bg-slate-50/50 p-1.5 max-h-[300px] overflow-y-auto space-y-2">
        {loading ? (
          <div className="text-center py-8 text-xs font-mono text-slate-400">
            LOADING VERIFIED FACTS...
          </div>
        ) : filteredFacts.length === 0 ? (
          <div className="text-center py-8 text-xs font-mono text-slate-400">
            NO FACTS MATCHING THE CURRENT SEARCH CRITERIA.
          </div>
        ) : (
          filteredFacts.map((f, i) => (
            <div
              key={i}
              className="p-3 bg-white border border-black/5 hover:border-black/15 transition-all text-xs flex flex-col gap-1.5 relative group"
            >
              {/* Fact tag */}
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-[9px] uppercase px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-100">
                  {f.sport}
                </span>
                <span className="font-mono text-[9px] text-slate-300">
                  RECORD #{i + 101}
                </span>
              </div>

              {/* Fact Text */}
              <p className="text-slate-700 leading-relaxed font-sans">{f.fact}</p>
            </div>
          ))
        )}
      </div>

      {/* RAG Footer disclaimer */}
      <div className="text-[10px] font-mono text-slate-400 leading-normal flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span>Verified facts library compiled and synchronized with game engine controller.</span>
      </div>
    </div>
  );
};
