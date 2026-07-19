import React from "react";
import { QuizQuestion } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  Award, 
  BookOpen, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  HelpCircle, 
  RefreshCw, 
  RotateCcw, 
  Send, 
  ShieldAlert, 
  Sparkles, 
  Trophy, 
  XCircle 
} from "lucide-react";

interface QuizPlayerProps {
  questions: QuizQuestion[];
  quizTitle: string;
  mode: "practice" | "exam";
  currentQuestionIndex: number;
  selectedAnswers: Record<number, string>;
  submittedAnswers: Record<number, boolean>;
  examSubmitted: boolean;
  score: number;
  onSelectAnswer: (questionIndex: number, optionLetter: string) => void;
  onSubmitAnswer: (questionIndex: number) => void;
  onSubmitExam: () => void;
  onNavigate: (index: number) => void;
  onReset: () => void;
  contextUsed?: string;
  triggerToast: (msg: string) => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({
  questions,
  quizTitle,
  mode,
  currentQuestionIndex,
  selectedAnswers,
  submittedAnswers,
  examSubmitted,
  score,
  onSelectAnswer,
  onSubmitAnswer,
  onSubmitExam,
  onNavigate,
  onReset,
  contextUsed,
  triggerToast
}) => {
  if (questions.length === 0) return null;

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const hasSelectedCurrent = selectedAnswers[currentQuestionIndex] !== undefined;
  const isCurrentSubmitted = submittedAnswers[currentQuestionIndex] === true;

  // Handler for option clicks
  const handleOptionClick = (optionStr: string) => {
    if (mode === "practice" && isCurrentSubmitted) return; // Locked once submitted
    if (mode === "exam" && examSubmitted) return; // Locked once exam submitted

    // Options are expected to start with "A) ", "B) ", "C) ", "D) "
    const letter = optionStr.trim().charAt(0);
    onSelectAnswer(currentQuestionIndex, letter);
  };

  // Render option card styling dynamically
  const getOptionStyles = (optionStr: string) => {
    const letter = optionStr.trim().charAt(0);
    const isSelected = selectedAnswers[currentQuestionIndex] === letter;

    if (mode === "practice") {
      if (isCurrentSubmitted) {
        const isCorrect = letter === currentQuestion.correctOption;
        const wasSelected = isSelected;

        if (isCorrect) {
          return "border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold shadow-sm";
        }
        if (wasSelected && !isCorrect) {
          return "border-rose-500 bg-rose-50 text-rose-950";
        }
        return "border-slate-200 bg-white opacity-55";
      }
    } else if (mode === "exam") {
      if (examSubmitted) {
        const isCorrect = letter === currentQuestion.correctOption;
        const wasSelected = isSelected;

        if (isCorrect) {
          return "border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold";
        }
        if (wasSelected && !isCorrect) {
          return "border-rose-500 bg-rose-50 text-rose-950";
        }
        return "border-slate-200 bg-white opacity-55";
      }
    }

    // Normal selectable state
    return isSelected
      ? "border-black bg-slate-900 text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] translate-y-[-1px]"
      : "border-black/10 bg-white hover:border-black/35 hover:bg-slate-50 text-slate-800";
  };

  // Exam-wide submission checks
  const allExamQuestionsAnswered = Object.keys(selectedAnswers).length === totalQuestions;

  return (
    <div className="space-y-6">
      
      {/* Quiz Progress & Information Header */}
      <div className="bg-white border border-black/15 p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 border ${
                mode === "practice" 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
                {mode === "practice" ? "Practice Sandbox" : "Certified Exam Board"}
              </span>
              <span className="text-xs text-slate-400 font-mono">•</span>
              <span className="text-xs text-slate-500 font-mono">
                {totalQuestions} Questions Total
              </span>
            </div>
            <h2 className="text-2xl font-serif font-black italic tracking-tight text-slate-950 mt-1 leading-tight">
              {quizTitle || "Grounded Sports Challenge"}
            </h2>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            {mode === "practice" ? (
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Correct Matches</span>
                <span className="text-xl font-serif font-black italic text-emerald-600">
                  {Object.keys(submittedAnswers).filter(
                    (idx) => selectedAnswers[Number(idx)] === questions[Number(idx)].correctOption
                  ).length} / {Object.keys(submittedAnswers).length || 0}
                </span>
              </div>
            ) : (
              !examSubmitted && (
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Completion</span>
                  <span className="text-sm font-mono font-bold text-slate-800">
                    {Object.keys(selectedAnswers).length} of {totalQuestions} Answered
                  </span>
                </div>
              )
            )}
            
            <button
              onClick={onReset}
              className="p-2 border border-black/15 hover:border-black/40 hover:bg-slate-50 rounded-none cursor-pointer transition-colors"
              title="Reset configuration and start fresh"
            >
              <RotateCcw className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Global Progress Line Bar */}
        <div className="w-full bg-slate-100 h-1.5 mt-6 relative overflow-hidden">
          <div 
            className="bg-black h-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Board View: Quiz or Scorecard */}
      <AnimatePresence mode="wait">
        {mode === "exam" && examSubmitted ? (
          
          /* ========================================================
             EXAM MODE COMPLETED SCOREBOARD CARD
             ======================================================== */
          <motion.div
            key="scoreboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white border border-black/15 p-6 sm:p-8 shadow-[4px_4px_0px_rgba(0,0,0,1)] text-center space-y-6"
          >
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 bg-slate-100 border border-black/15 text-slate-900 mx-auto flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] animate-bounce">
                <Trophy className="w-8 h-8 text-amber-500" />
              </div>
              
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-600 tracking-widest uppercase block">
                  EXAM VERIFIED COMPLETE
                </span>
                <h3 className="text-3xl font-serif font-black italic tracking-tighter text-slate-950 mt-1">
                  Your Performance Summary
                </h3>
              </div>

              {/* Centered Big Score Badge */}
              <div className="bg-slate-50 border border-black/5 p-6 rounded-none relative overflow-hidden">
                <div className="text-5xl font-serif font-black italic text-[#1a1a1a]">
                  {score} <span className="text-xl text-slate-400 not-italic font-normal font-sans">/ {totalQuestions}</span>
                </div>
                <div className="text-xs font-mono text-slate-500 uppercase mt-1">
                  Final Grounded score ({(score / totalQuestions) * 100}%)
                </div>

                {/* Score rating messages */}
                <div className="mt-3 text-xs font-serif italic text-slate-700 font-bold">
                  {score === totalQuestions ? (
                    "🏆 Flawless performance! You are an absolute Grandmaster."
                  ) : score >= totalQuestions / 2 ? (
                    "🔥 Outstanding trivia execution. Factual accuracy confirmed!"
                  ) : (
                    "📚 Excellent attempt. Keep reviewing grounding notes to improve!"
                  )}
                </div>
              </div>

              {/* Action Rows */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={onReset}
                  className="px-6 py-3 bg-[#1a1a1a] hover:bg-black text-white font-mono font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all rounded-none cursor-pointer flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  RESTART EXAM
                </button>
                <button
                  onClick={() => {
                    const formatted = questions.map((q, idx) => {
                      return `Q${idx + 1}: ${q.questionText}\n${q.options.map(opt => `  [ ] ${opt}`).join("\n")}\n\n👉 Correct Answer: ${q.correctOption}\n💡 Fact Justification: ${q.explanation}\n\n`;
                    }).join("-----------------------------------\n\n");
                    const finalOutput = `🏆 ATHLETA SPORTS TRIVIA: ${quizTitle.toUpperCase()}\n===================================\nDifficulty: ${mode === "exam" ? "Certified Exam" : "Practice"}\n\n${formatted}Created using Athleta Pro.`;
                    navigator.clipboard.writeText(finalOutput);
                    triggerToast("Full trivia quiz copied to clipboard!");
                  }}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all rounded-none cursor-pointer flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  COPY QUIZ FOR SHARING
                </button>
              </div>
            </div>

            {/* Answer audit/inspect block */}
            <div className="border-t border-black/10 pt-6 text-left space-y-4">
              <h4 className="text-xs font-mono font-bold text-slate-600 uppercase tracking-widest">
                Comprehensive Question Audit
              </h4>
              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const userAnswer = selectedAnswers[idx];
                  const isUserCorrect = userAnswer === q.correctOption;

                  return (
                    <div key={idx} className="p-4 bg-slate-50 border border-black/5 flex flex-col gap-2 relative">
                      <div className="flex items-start gap-2.5">
                        {isUserCorrect ? (
                          <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="text-xs font-mono text-slate-400">Question {idx + 1}</div>
                          <h5 className="text-sm font-bold text-slate-900 mt-0.5">{q.questionText}</h5>
                        </div>
                      </div>

                      {/* Options breakdown */}
                      <div className="grid grid-cols-2 gap-2 mt-2 pl-7 text-[11px] font-sans">
                        {q.options.map((opt, oIdx) => {
                          const letter = opt.trim().charAt(0);
                          const isCorrect = letter === q.correctOption;
                          const isUserSel = letter === userAnswer;

                          return (
                            <div 
                              key={oIdx} 
                              className={`p-2 border rounded-none ${
                                isCorrect 
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold"
                                  : isUserSel 
                                    ? "bg-rose-50 border-rose-300 text-rose-950"
                                    : "bg-white border-slate-200"
                              }`}
                            >
                              {opt}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation box */}
                      <div className="mt-2 pl-7 text-xs font-mono bg-white p-2.5 border border-black/5 text-slate-600">
                        <strong className="text-slate-800">Factual Explanation:</strong> {q.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </motion.div>
        ) : (
          
          /* ========================================================
             ACTIVE TRIVIA QUESTION CARD VIEW
             ======================================================== */
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="bg-white border border-black/15 p-6 sm:p-8 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-6"
          >
            {/* Index badge row */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400">
                QUESTION {currentQuestionIndex + 1} OF {totalQuestions}
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 px-2.5 py-1">
                INDEX #{currentQuestionIndex + 100}
              </span>
            </div>

            {/* Question Text */}
            <h3 className="text-lg sm:text-xl font-serif font-black text-slate-950 leading-snug">
              {currentQuestion.questionText}
            </h3>

            {/* Answer Options list */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              {currentQuestion.options.map((option, index) => {
                return (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(option)}
                    className={`w-full p-4 text-left text-xs sm:text-sm font-sans tracking-wide transition-all duration-150 cursor-pointer border rounded-none flex items-center justify-between relative group ${getOptionStyles(option)}`}
                  >
                    <span>{option}</span>
                    {/* Tick icon indicator for correct matches */}
                    {mode === "practice" && isCurrentSubmitted && option.trim().charAt(0) === currentQuestion.correctOption && (
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Practice mode instant answer confirmation panel */}
            {mode === "practice" && hasSelectedCurrent && !isCurrentSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-amber-50 border border-amber-200/50 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="text-xs font-mono text-amber-900">
                    Option <strong className="font-black text-[#1a1a1a]">"{selectedAnswers[currentQuestionIndex]}"</strong> selected. Ready to lock in your answer?
                  </p>
                </div>
                <button
                  onClick={() => onSubmitAnswer(currentQuestionIndex)}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-mono font-bold text-[10px] uppercase tracking-wider rounded-none cursor-pointer shrink-0 transition-colors"
                >
                  SUBMIT ANSWER
                </button>
              </motion.div>
            )}

            {/* Practice mode explanation box once checked */}
            {mode === "practice" && isCurrentSubmitted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className={`p-4 border ${
                  selectedAnswers[currentQuestionIndex] === currentQuestion.correctOption
                    ? "bg-emerald-50/45 border-emerald-500/20"
                    : "bg-rose-50/45 border-rose-500/20"
                } space-y-2`}
              >
                <div className="flex items-center gap-2">
                  {selectedAnswers[currentQuestionIndex] === currentQuestion.correctOption ? (
                    <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-mono font-black uppercase">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Correct Answer Match
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-rose-700 text-xs font-mono font-black uppercase">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      Incorrect Choice
                    </div>
                  )}
                  <span className="text-xs text-slate-300 font-mono">|</span>
                  <span className="text-xs font-mono text-slate-500">
                    Correct option is <strong className="text-black font-extrabold">"{currentQuestion.correctOption}"</strong>
                  </span>
                </div>

                <div className="text-xs font-sans text-slate-700 leading-relaxed bg-white border border-black/5 p-3 rounded-none">
                  <p className="font-semibold text-slate-900 mb-1 font-mono text-[11px] uppercase tracking-wider">
                    Factual Context Justification:
                  </p>
                  {currentQuestion.explanation}
                </div>
              </motion.div>
            )}

            {/* Navigation and Exam Submission button rows */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-black/5">
              
              {/* Prev / Next buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => onNavigate(currentQuestionIndex - 1)}
                  className="px-4 py-2 border border-black/15 hover:border-black/30 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent rounded-none transition-all flex items-center justify-center gap-1 cursor-pointer font-mono text-xs w-full sm:w-auto"
                >
                  <ChevronLeft className="w-4 h-4" />
                  PREV
                </button>
                
                {isLastQuestion ? (
                  mode === "exam" && !examSubmitted && (
                    <button
                      type="button"
                      disabled={!allExamQuestionsAnswered}
                      onClick={onSubmitExam}
                      className="px-5 py-2.5 bg-[#d94e33] hover:bg-[#c2422a] text-white font-mono font-bold text-xs uppercase tracking-widest shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all rounded-none cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      SUBMIT FINAL BOARD EXAM
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => onNavigate(currentQuestionIndex + 1)}
                    className="px-4 py-2 border border-black/15 hover:border-black/30 hover:bg-slate-50 rounded-none transition-all flex items-center justify-center gap-1 cursor-pointer font-mono text-xs w-full sm:w-auto"
                  >
                    NEXT
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status indicators */}
              <div className="text-xs font-mono text-slate-400">
                {mode === "exam" && !allExamQuestionsAnswered && (
                  <span className="text-[#d94e33] font-bold">
                    * Answer all questions before board submission
                  </span>
                )}
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
