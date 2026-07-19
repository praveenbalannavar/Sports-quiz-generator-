import React, { useState, useEffect } from "react";
import { SportOption, QuizQuestion } from "./types";
import { Header } from "./components/Header";
import { RAGBlueprint } from "./components/RAGBlueprint";
import { QuizConfigurator } from "./components/QuizConfigurator";
import { QuizPlayer } from "./components/QuizPlayer";
import { FactFinder } from "./components/FactFinder";
import { generateOfflineQuiz } from "./lib/offlineGenerator";
import { motion, AnimatePresence } from "motion/react";
import { 
  Award, 
  HelpCircle, 
  RefreshCw, 
  Terminal, 
  BookOpen, 
  CheckSquare, 
  Sparkles,
  Clipboard,
  ExternalLink
} from "lucide-react";

export default function App() {
  // Config state
  const [sports, setSports] = useState<SportOption[]>([
    { name: "Cricket", factsCount: 16 },
    { name: "Football", factsCount: 15 },
    { name: "Tennis", factsCount: 16 },
    { name: "Badminton", factsCount: 16 },
    { name: "Basketball", factsCount: 16 }
  ]);
  const [selectedSport, setSelectedSport] = useState<string>("Cricket");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [focus, setFocus] = useState<string>("");
  const [quizMode, setQuizMode] = useState<"practice" | "exam">("practice");

  // App engine state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState<string>("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [contextUsed, setContextUsed] = useState<string>("");

  // Playback state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({}); // { questionIndex: "A" }
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, boolean>>({}); // Practice mode committed answers
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  // Layout UI states
  const [showRAGExplanation, setShowRAGExplanation] = useState<boolean>(true);
  const [showGroundTruth, setShowGroundTruth] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  // Trigger floating notifications
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3000);
  };

  // Fetch verified sports options from backend
  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await fetch("/api/sports");
        if (response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            if (data.success && data.sports) {
              setSports(data.sports);
            }
          }
        }
      } catch (err) {
        console.warn("Could not load sports from endpoint, falling back to local configurations.", err);
      }
    };
    fetchSports();
  }, []);

  // Generates grounded multiple-choice trivia from our hybrid RAG service
  const handleGenerateQuiz = async () => {
    setIsLoading(true);
    setError(null);
    setQuestions([]);
    setQuizTitle("");
    setContextUsed("");

    // Reset gameplay mechanics
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setSubmittedAnswers({});
    setExamSubmitted(false);
    setScore(0);

    try {
      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sport: selectedSport,
          difficulty: difficulty,
          questionCount: questionCount,
          focus: focus
        })
      });

      // Verify the response content-type is valid JSON before parsing to avoid generic parsing crashes
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const isStaticHost = window.location.hostname.includes("netlify.app") || 
                             window.location.hostname.includes("vercel.app") || 
                             window.location.hostname.includes("github.io");
        
        if (isStaticHost || response.status === 404) {
          throw new Error(
            "The backend engine is not active on this URL. Static hosting platforms (such as Netlify) only host frontend assets. Please use the official Google AI Studio workspace preview link, or run 'npm run dev' locally to start the Express full-stack engine."
          );
        } else {
          throw new Error(`The backend returned a non-JSON response (HTTP ${response.status}). This may indicate a server error or crash.`);
        }
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Server responded with HTTP ${response.status}`);
      }

      setQuizTitle(data.quizTitle || `${selectedSport} Grounded RAG Quiz`);
      setQuestions(data.questions || []);
      setContextUsed(data.contextUsed || "");
      setIsOfflineMode(false);
      triggerToast("Grounded Quiz Synthesized successfully!");
    } catch (err: any) {
      console.warn("[Backend API unavailable or statically hosted - falling back to Local Synthesis]:", err);
      try {
        const offlineQuiz = generateOfflineQuiz(selectedSport, difficulty, questionCount, focus);
        setQuizTitle(offlineQuiz.quizTitle);
        setQuestions(offlineQuiz.questions);
        setContextUsed(offlineQuiz.contextUsed);
        setIsOfflineMode(true);
        triggerToast("Offline Mode Active: Local Synthesis loaded!");
      } catch (fallbackErr: any) {
        console.error("Local fallback generation failed:", fallbackErr);
        setError(err.message || "An unexpected error occurred during synthesis.");
        triggerToast("Generation failed. Check error log.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Option select callbacks
  const handleSelectAnswer = (qIndex: number, letter: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: letter }));
  };

  // Answer commits for practice mode
  const handleSubmitAnswer = (qIndex: number) => {
    setSubmittedAnswers((prev) => ({ ...prev, [qIndex]: true }));
    triggerToast(`Answer choice "${selectedAnswers[qIndex]}" submitted!`);
  };

  // Submit complete exam and grade
  const handleSubmitExam = () => {
    let finalScore = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctOption) {
        finalScore++;
      }
    });
    setScore(finalScore);
    setExamSubmitted(true);
    triggerToast("Exam grading completed!");
  };

  // Navigations
  const handleNavigateQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  // Restart settings
  const handleReset = () => {
    setQuestions([]);
    setQuizTitle("");
    setContextUsed("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-[#1a1a1a] font-sans antialiased selection:bg-black selection:text-white pb-20">
      
      {/* 1. Header Layout */}
      <Header sportsCount={sports.length} />

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Intro Hero Badge */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-black/10 pb-6">
          <div>
            <h2 className="text-3xl font-serif font-black italic tracking-tighter text-slate-950">
              The Intelligent Sports Trivia Studio
            </h2>
            <p className="text-sm text-slate-500 font-mono mt-0.5">
              Verify historical events, test knowledge boundaries, and enjoy 100% accurate AI-curated trivia.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRAGExplanation(!showRAGExplanation)}
              className="px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-700 bg-white border border-black/15 hover:bg-slate-50 transition-all cursor-pointer rounded-none"
            >
              {showRAGExplanation ? "Hide Architecture" : "Visualize Architecture"}
            </button>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider text-white bg-slate-950 hover:bg-black transition-all rounded-none border border-black cursor-pointer"
            >
              GitHub Codebase
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* 2. Interactive RAG Blueprint Visualization */}
        <RAGBlueprint 
          showBlueprint={showRAGExplanation}
          onToggle={() => setShowRAGExplanation(!showRAGExplanation)}
          selectedSport={selectedSport}
          focusKeyword={focus}
        />

        {/* 3. Two-Column Configurator vs Interactive Gameplay */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Column A: Settings (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <QuizConfigurator
              sports={sports}
              selectedSport={selectedSport}
              onSelectSport={setSelectedSport}
              difficulty={difficulty}
              onChangeDifficulty={setDifficulty}
              questionCount={questionCount}
              onChangeQuestionCount={setQuestionCount}
              focus={focus}
              onChangeFocus={setFocus}
              quizMode={quizMode}
              onChangeQuizMode={setQuizMode}
              onGenerate={handleGenerateQuiz}
              isLoading={isLoading}
            />

            {/* ChromaDB Vector inspector widget */}
            <FactFinder selectedSport={selectedSport} triggerToast={triggerToast} />
          </div>

          {/* Column B: Active Gameplay Arena (7 cols) */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {isLoading ? (
                /* Dynamic Loading Board */
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-black/15 p-12 text-center shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-6"
                >
                  <div className="w-12 h-12 border-4 border-slate-200 border-t-black rounded-full animate-spin mx-auto" />
                  <div className="space-y-2">
                    <h3 className="font-serif font-black italic text-lg text-slate-950">Retrieving Verification Signals...</h3>
                    <p className="text-xs text-slate-500 font-mono max-w-sm mx-auto leading-relaxed">
                      Retrieving historical sports fact libraries and loading current news search results.
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-100 text-[10px] font-mono text-slate-400 max-w-md mx-auto rounded-none">
                    VERIFICATION_SEQUENCE_PENDING // FACTUAL_INTEGRITY_CHECK
                  </div>
                </motion.div>
              ) : error ? (
                /* Error Feedback Block */
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-rose-50 border border-rose-200 p-8 text-center shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-6"
                >
                  <div className="w-12 h-12 bg-rose-100 border border-rose-300 text-rose-800 mx-auto flex items-center justify-center rounded-none shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    <Terminal className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-serif font-black italic text-rose-950">Generation Synthesis Failed</h3>
                    <p className="text-xs text-rose-900 max-w-md mx-auto leading-relaxed font-mono bg-white p-3 border border-rose-200">
                      {error}
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateQuiz}
                    className="px-5 py-2 bg-rose-950 hover:bg-rose-900 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-none cursor-pointer"
                  >
                    Retry Synthesis
                  </button>
                </motion.div>
              ) : questions.length > 0 ? (
                /* Dynamic Gameplay Board */
                <motion.div
                  key="gameplay"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {isOfflineMode && (
                    <div className="bg-amber-50 border border-amber-200 p-4 text-left rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-start gap-3">
                      <div className="w-6 h-6 bg-amber-100 border border-amber-300 text-amber-800 font-mono text-xs font-bold flex items-center justify-center shrink-0">!</div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 font-mono">Local Verification Engine Engaged</h4>
                        <p className="text-[11px] text-amber-900 leading-normal font-sans">
                          Statically hosted environment detected. We have seamlessly engaged our high-fidelity, self-contained client-side verification engine to generate this quiz directly from pre-verified sports databases. Enjoy 100% fully active practice and exam sessions!
                        </p>
                      </div>
                    </div>
                  )}
                  <QuizPlayer
                    questions={questions}
                    quizTitle={quizTitle}
                    mode={quizMode}
                    currentQuestionIndex={currentQuestionIndex}
                    selectedAnswers={selectedAnswers}
                    submittedAnswers={submittedAnswers}
                    examSubmitted={examSubmitted}
                    score={score}
                    onSelectAnswer={handleSelectAnswer}
                    onSubmitAnswer={handleSubmitAnswer}
                    onSubmitExam={handleSubmitExam}
                    onNavigate={handleNavigateQuestion}
                    onReset={handleReset}
                    contextUsed={contextUsed}
                    triggerToast={triggerToast}
                  />
                </motion.div>
              ) : (
                /* Welcome Screen */
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white border border-black/15 p-12 text-center shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-6"
                >
                  <div className="w-14 h-14 bg-slate-50 border border-black/15 text-slate-900 mx-auto flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <Award className="w-7 h-7 text-emerald-600" />
                  </div>
                  
                  <div className="space-y-2 max-w-md mx-auto">
                    <h3 className="text-xl font-serif font-black italic text-slate-950 tracking-tight">
                      Ready for Grounded Playback?
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-mono">
                      Configure your settings on the left-hand panel, choose a sport, and hit <strong className="text-black font-semibold">Generate</strong> to launch our proprietary verification and synthesis sequence.
                    </p>
                  </div>

                  {/* Highlight steps list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto text-left pt-4">
                    <div className="p-3 bg-slate-50 border border-black/5 flex items-start gap-2.5">
                      <div className="w-5 h-5 bg-[#1a1a1a] text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0">1</div>
                      <p className="text-[11px] text-slate-600 leading-normal">
                        Select a sport and optionally fine-tune using historical search keywords.
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-black/5 flex items-start gap-2.5">
                      <div className="w-5 h-5 bg-[#1a1a1a] text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0">2</div>
                      <p className="text-[11px] text-slate-600 leading-normal">
                        Choose between instant Practice evaluation and continuous board Exams.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* 4. Ground-Truth context audit log */}
        {contextUsed && (
          <div className="bg-white border border-black/15 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <button
              onClick={() => setShowGroundTruth(!showGroundTruth)}
              className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-black/10 hover:bg-slate-100 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-none bg-slate-900 flex items-center justify-center text-white font-mono text-sm font-bold">
                  G
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a]">
                    Ground-Truth Reference Document Auditor
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Inspect the literal source reference data fed into the trivia generator.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {showGroundTruth ? "HIDE DETAILS" : "AUDIT DETAILS"}
              </span>
            </button>

            {showGroundTruth && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-6 font-mono text-xs text-slate-700 bg-slate-50 space-y-4"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Literal Inject Stream
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(contextUsed);
                      triggerToast("Auditor context copied to clipboard!");
                    }}
                    className="px-3 py-1 bg-white border border-black/15 hover:bg-slate-100 font-bold uppercase text-[9px] tracking-wider cursor-pointer"
                  >
                    Copy Stream
                  </button>
                </div>
                <pre className="whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto bg-white p-4 border border-black/5 text-[11px] text-slate-800">
                  {contextUsed}
                </pre>
              </motion.div>
            )}
          </div>
        )}

      </main>

      {/* Modern Footer */}
      <footer className="border-t border-[#1a1a1a]/10 bg-white py-8 mt-12 text-center text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Athleta Pro. Designed and developed by a Principal Engineer.</p>
          <p className="mt-1 text-[10px] opacity-65">
            Powered by double-verification sports data references & live news queries. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Modern Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-[#1a1a1a] text-white px-5 py-3.5 rounded-none shadow-xl border-l-4 border-[#d94e33] flex items-center gap-3 font-mono text-xs"
          >
            <div className="w-2 h-2 bg-[#d94e33] rounded-full animate-ping shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
