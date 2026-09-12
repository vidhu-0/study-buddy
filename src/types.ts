export type StudyMode = "mastery" | "cram";

export type AcademicLevel =
  | "Middle School"
  | "High School"
  | "College / Undergrad"
  | "Graduate / Professional"
  | "CBSE / NCERT (Class 9-12)"
  | "ICSE / ISC Board"
  | "State Board (India)"
  | "JEE / NEET / CUET (India)"
  | "UPSC / Indian Competitive Exams";

export interface WeakSpot {
  id: string;
  topic: string;
  identifiedReason: string;
  repetitionCount: number;
  lastTestedDate: string;
  mastered: boolean;
}

export interface StudentProfile {
  subject: string;
  level: AcademicLevel;
  deadline: string;
  mode: StudyMode;
  notesContext: string;
  notesFileName?: string;
  weakSpots: WeakSpot[];
  completedTasksCount: number;
  streakDays: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  quickCheck?: string;
  suggestedPill?: string;
  isStreaming?: boolean;
  isError?: boolean;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  box: number; // 1 = Learning (interval 1d), 2 = Reviewing (interval 3d), 3 = Mastered (interval 7d)
  reviewCount: number;
  lastReviewed?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topicTag: string;
}

export interface ExplainBackEvaluation {
  celebration: string;
  whatTheyGotRight: string[];
  gapsAndCorrections: string[];
  analogyTip: string;
  masteryScore: number;
  verdict: string;
  followUpQuestion: string;
}

export interface StudyPlanTask {
  id: string;
  text: string;
  type: "study" | "quiz" | "recall" | "break" | "review";
  durationMin: number;
  completed?: boolean;
}

export interface StudyPlanDay {
  dayNumber: number;
  dayTitle: string;
  focusArea: string;
  estimatedMinutes: number;
  tasks: StudyPlanTask[];
  recommendedBreak?: string;
}

export interface StudyPlan {
  title: string;
  summary: string;
  totalDays: number;
  dailyTargetHours: number;
  days: StudyPlanDay[];
  finalTip: string;
}
