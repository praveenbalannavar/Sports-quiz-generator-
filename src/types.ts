export interface SportOption {
  name: string;
  factsCount: number;
}

export interface QuizQuestion {
  questionText: string;
  options: string[];
  correctOption: string; // "A", "B", "C", "D"
  explanation: string;
}

export interface QuizResponse {
  success: boolean;
  quizTitle?: string;
  questions?: QuizQuestion[];
  contextUsed?: string;
  error?: string;
}

export interface QuizState {
  sport: string;
  difficulty: "Easy" | "Medium" | "Hard";
  questionCount: number;
  focus: string;
  mode: "practice" | "exam";
}
