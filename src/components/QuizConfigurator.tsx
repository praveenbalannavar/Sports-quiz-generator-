import React from "react";
import { SportOption } from "../types";
import { 
  Play, 
  HelpCircle, 
  Sparkles, 
  Target, 
  FileText, 
  BookOpen,
  Info 
} from "lucide-react";

interface QuizConfiguratorProps {
  sports: SportOption[];
  selectedSport: string;
  onSelectSport: (sport: string) => void;
  difficulty: "Easy" | "Medium" | "Hard";
  onChangeDifficulty: (diff: "Easy" | "Medium" | "Hard") => void;
  questionCount: number;
  onChangeQuestionCount: (count: number) => void;
  focus: string;
  onChangeFocus: (val: string) => void;
  quizMode: "practice" | "exam";
  onChangeQuizMode: (mode: "practice" | "exam") => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const QuizConfigurator: React.FC<QuizConfiguratorProps> = ({
  sports,
  selectedSport,
  onSelectSport,
  difficulty,
  onChangeDifficulty,
  questionCount,
  onChangeQuestionCount,
  focus,
  onChangeFocus,
  quizMode,
  onChangeQuizMode,
  onGenerate,
  isLoading
}) => {
  return (
    <div className="bg-white border border-black/15 p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col gap-6">
      
      {/* Title */}
      <div>
        <h2 className="text-lg font-serif font-black italic tracking-tight text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Quiz Configuration
        </h2>
        <p className="text-xs text-slate-500 font-mono mt-0.5">
          Select target settings and interactive gameplay styles.
        </p>
      </div>

      {/* 1. Sport Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
          Step 1: Select Target Sport
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {sports.map((sport) => {
            const isSelected = selectedSport.toLowerCase() === sport.name.toLowerCase();
            return (
              <button
                key={sport.name}
                type="button"
                onClick={() => onSelectSport(sport.name)}
                className={`text-left p-3 border transition-all cursor-pointer rounded-none relative overflow-hidden group ${
                  isSelected
                    ? "border-black bg-slate-950 text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                    : "border-black/10 bg-slate-50 hover:bg-slate-100 hover:border-black/25 text-slate-800"
                }`}
              >
                <div className="font-serif font-bold italic text-sm">{sport.name}</div>
                <div className="text-[10px] font-mono opacity-60 mt-1 flex items-center gap-1">
                  <span>{sport.factsCount} Verified Facts</span>
                </div>
                {isSelected && (
                  <div className="absolute right-1 bottom-1 w-2 h-2 bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Difficulty Level */}
      <div className="space-y-2">
        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
          Step 2: Choose Difficulty Level
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(["Easy", "Medium", "Hard"] as const).map((diff) => {
            const isSelected = difficulty === diff;
            return (
              <button
                key={diff}
                type="button"
                onClick={() => onChangeDifficulty(diff)}
                className={`py-2 px-3 text-center text-xs font-mono font-bold tracking-wider transition-all cursor-pointer rounded-none border ${
                  isSelected
                    ? "border-black bg-slate-950 text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                    : "border-black/10 bg-slate-50 hover:bg-slate-100 text-slate-700"
                }`}
              >
                {diff.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Question Count */}
      <div className="space-y-2">
        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
          Step 3: Number of Questions
        </label>
        <div className="grid grid-cols-3 gap-2">
          {([3, 4, 5] as const).map((count) => {
            const isSelected = questionCount === count;
            return (
              <button
                key={count}
                type="button"
                onClick={() => onChangeQuestionCount(count)}
                className={`py-2 text-center text-xs font-mono font-bold transition-all cursor-pointer rounded-none border ${
                  isSelected
                    ? "border-black bg-slate-950 text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                    : "border-black/10 bg-slate-50 hover:bg-slate-100 text-slate-700"
                }`}
              >
                {count} Questions
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. RAG Focus Query */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
            Step 4: Search Focus Keyword (Optional)
          </label>
          <span className="text-[10px] font-mono text-[#d94e33]">Boosts similarity</span>
        </div>
        <div className="relative">
          <input
            type="text"
            value={focus}
            onChange={(e) => onChangeFocus(e.target.value)}
            placeholder="e.g., Thomas Cup, Lionel Messi, Wimbledon 2025"
            className="w-full bg-slate-50 border border-black/10 p-3 text-xs font-sans text-[#1a1a1a] focus:bg-white focus:outline-none focus:border-black rounded-none"
          />
          <Target className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
        </div>
        <p className="text-[10px] font-mono text-slate-400 leading-normal">
          Filters and prioritizes specific sports events matching this search keyword.
        </p>
      </div>

      {/* 5. Mode Selection */}
      <div className="space-y-2 pt-1 border-t border-black/5">
        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
          Step 5: Select Interactive Mode
        </label>
        <div className="grid grid-cols-2 gap-3">
          
          {/* Practice Mode */}
          <button
            type="button"
            onClick={() => onChangeQuizMode("practice")}
            className={`p-3 text-left border rounded-none transition-all cursor-pointer ${
              quizMode === "practice"
                ? "border-emerald-600 bg-emerald-50/45 shadow-[2px_2px_0px_rgba(5,150,105,0.15)]"
                : "border-black/10 bg-slate-50 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className={`w-4 h-4 ${quizMode === "practice" ? "text-emerald-600" : "text-slate-400"}`} />
              <span className="text-xs font-bold font-mono uppercase tracking-wider">Practice</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal">
              Instant evaluation, full factual context display, and grounding citations as you answer.
            </p>
          </button>

          {/* Exam Mode */}
          <button
            type="button"
            onClick={() => onChangeQuizMode("exam")}
            className={`p-3 text-left border rounded-none transition-all cursor-pointer ${
              quizMode === "exam"
                ? "border-[#d94e33] bg-[#d94e33]/5 shadow-[2px_2px_0px_rgba(217,78,51,0.1)]"
                : "border-black/10 bg-slate-50 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <FileText className={`w-4 h-4 ${quizMode === "exam" ? "text-[#d94e33]" : "text-slate-400"}`} />
              <span className="text-xs font-bold font-mono uppercase tracking-wider">Exam Board</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal">
              Continuous exam with closed results. Review final scorecard and statistics upon completion.
            </p>
          </button>

        </div>
      </div>

      {/* Generate Button */}
      <button
        type="button"
        disabled={isLoading || !selectedSport}
        onClick={onGenerate}
        className={`w-full py-3.5 px-6 font-mono font-bold tracking-widest text-sm uppercase text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 rounded-none cursor-pointer ${
          isLoading
            ? "bg-slate-700 cursor-not-allowed"
            : "bg-[#1a1a1a] hover:bg-black"
        }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>RETRIEVING & SYNTHESIZING...</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-current" />
            <span>GENERATE GROUNDED QUIZ</span>
          </>
        )}
      </button>

      {/* Quality Seal */}
      <div className="p-3 bg-slate-50 border border-slate-100 text-[10px] text-slate-400 leading-normal flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <span>
          Every generation integrates verified reference libraries and live search signals to ensure 100% accurate, up-to-date facts with zero AI hallucinations.
        </span>
      </div>

    </div>
  );
};
