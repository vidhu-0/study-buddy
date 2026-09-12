import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Award,
  AlertCircle,
  FileText,
  Lightbulb,
  BookmarkPlus,
} from "lucide-react";
import { QuizQuestion, StudentProfile } from "../types";

interface QuizViewProps {
  profile: StudentProfile;
  onAddWeakSpot: (topic: string, reason: string) => void;
  onSelectTab: (tab: string) => void;
}

const defaultInitialQuestions: QuizQuestion[] = [
  {
    id: "q-1",
    question: "During cellular respiration, why is oxygen referred to as the 'final electron acceptor'?",
    options: [
      "Because it directly breaks down glucose in the cytoplasm",
      "Because it accepts low-energy electrons at Complex IV of the ETC and combines with H+ to form water",
      "Because it activates ATP synthase directly in the intermembrane space",
      "Because it provides the carbon atoms for the citric acid cycle",
    ],
    correctIndex: 1,
    explanation:
      "Oxygen has high electronegativity. At Complex IV, it pulls electrons through the transport chain, binding with protons to form H₂O and preventing electron traffic jams.",
    topicTag: "Oxidative Phosphorylation",
  },
  {
    id: "q-2",
    question: "What is the net ATP yield produced solely during Glycolysis per molecule of glucose?",
    options: ["4 ATP", "2 ATP", "32 ATP", "0 ATP"],
    correctIndex: 1,
    explanation:
      "Glycolysis consumes 2 ATP in the energy investment phase and generates 4 ATP in the energy payoff phase, resulting in a net yield of 2 ATP.",
    topicTag: "Glycolysis",
  },
  {
    id: "q-3",
    question: "Which compartment of the mitochondrion accumulates high concentrations of H+ to drive chemiosmosis?",
    options: [
      "The Mitochondrial Matrix",
      "The Intermembrane Space",
      "The Outer Membrane Surface",
      "The Cytosol",
    ],
    correctIndex: 1,
    explanation:
      "Protons (H+) are pumped across the inner membrane from the matrix into the narrow intermembrane space, building the high electrochemical gradient (Proton Motive Force).",
    topicTag: "Chemiosmosis",
  },
];

export const QuizView: React.FC<QuizViewProps> = ({
  profile,
  onAddWeakSpot,
  onSelectTab,
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(defaultInitialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizTopic, setQuizTopic] = useState(profile.subject || "");
  const [showHint, setShowHint] = useState(false);
  const [missedQuestions, setMissedQuestions] = useState<QuizQuestion[]>([]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (hasSubmitted) return;
    setSelectedOption(idx);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null || hasSubmitted) return;
    setHasSubmitted(true);

    const isCorrect = selectedOption === currentQ.correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    } else {
      setMissedQuestions((prev) => [...prev, currentQ]);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setHasSubmitted(false);
      setShowHint(false);
    } else {
      setQuizFinished(true);
      if (score + (selectedOption === currentQ.correctIndex ? 1 : 0) >= questions.length * 0.7) {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      }
    }
  };

  const handleGenerateQuiz = async (onlyWeakSpots: boolean = false, fromNotes: boolean = false) => {
    setIsGenerating(true);
    try {
      const weakSpotNames = profile.weakSpots.filter((w) => !w.mastered).map((w) => w.topic);

      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: onlyWeakSpots ? weakSpotNames.join(", ") : quizTopic || profile.subject,
          notes: fromNotes ? profile.notesContext : undefined,
          count: 5,
          level: profile.level,
          weakSpots: onlyWeakSpots ? weakSpotNames : [],
        }),
      });

      const data = await response.json();
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentIndex(0);
        setSelectedOption(null);
        setHasSubmitted(false);
        setScore(0);
        setMissedQuestions([]);
        setQuizFinished(false);
      }
    } catch (err) {
      console.error("Failed to generate quiz:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setHasSubmitted(false);
    setScore(0);
    setQuizFinished(false);
    setMissedQuestions([]);
  };

  const handleRetryMissed = () => {
    if (missedQuestions.length === 0) return;
    setQuestions(missedQuestions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setHasSubmitted(false);
    setScore(0);
    setQuizFinished(false);
    setMissedQuestions([]);
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-6 space-y-6">
      {/* Quiz Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <HelpCircle className="w-4 h-4" />
            </span>
            <h2 className="font-serif font-bold text-neutral-900 text-lg">
              Active Recall Quizzer
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Quizzing forces memory retrieval, creating stronger neural pathways than re-reading notes.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {profile.weakSpots.some((w) => !w.mastered) && (
            <button
              onClick={() => handleGenerateQuiz(true, false)}
              disabled={isGenerating}
              className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition flex items-center gap-1.5"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              Drill Weak Spots ({profile.weakSpots.filter((w) => !w.mastered).length})
            </button>
          )}

          {profile.notesContext && (
            <button
              onClick={() => handleGenerateQuiz(false, true)}
              disabled={isGenerating}
              className="px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold hover:bg-teal-100 transition flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              Quiz From Notes
            </button>
          )}

          <button
            onClick={() => handleGenerateQuiz(false, false)}
            disabled={isGenerating}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition shadow-xs flex items-center gap-1.5"
          >
            {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            New 5-Question Quiz
          </button>
        </div>
      </div>

      {/* Quiz Runner */}
      {!quizFinished && currentQ ? (
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Progress Bar & Tag */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
              <span>
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 font-mono text-[11px]">
                {currentQ.topicTag}
              </span>
              <span>Score: {score}</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-serif font-bold text-neutral-900 leading-snug">
              {currentQ.question}
            </h3>

            {/* Socratic Hint Button */}
            {!hasSubmitted && (
              <button
                onClick={() => setShowHint(!showHint)}
                className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 font-medium"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                {showHint ? "Hide thinking hint" : "Need a hint to guide your thinking?"}
              </button>
            )}

            {showHint && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                💡 Think about: What is the core biochemical role or location being asked? Eliminate choices that confuse products with inputs.
              </div>
            )}
          </div>

          {/* Options Grid */}
          <div className="space-y-2.5">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctIndex;

              let optionStyle = "border-neutral-200 hover:border-neutral-300 bg-white text-neutral-800";
              if (isSelected && !hasSubmitted) {
                optionStyle = "border-amber-500 bg-amber-50/50 ring-2 ring-amber-200 text-neutral-900 font-medium";
              }
              if (hasSubmitted) {
                if (isCorrect) {
                  optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-medium ring-1 ring-emerald-400";
                } else if (isSelected && !isCorrect) {
                  optionStyle = "border-red-500 bg-red-50 text-red-900 font-medium";
                } else {
                  optionStyle = "border-neutral-200 opacity-50 bg-neutral-50 text-neutral-500";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={hasSubmitted}
                  className={`w-full text-left p-4 rounded-2xl border transition flex items-start gap-3 text-xs sm:text-sm ${optionStyle}`}
                >
                  <span className="w-6 h-6 rounded-lg bg-neutral-100 font-mono text-xs font-semibold text-neutral-600 flex items-center justify-center shrink-0 mt-0.5">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 leading-relaxed">{option}</span>
                  {hasSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
                  {hasSubmitted && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box on Submit */}
          {hasSubmitted && (
            <div
              className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed space-y-2 ${
                selectedOption === currentQ.correctIndex
                  ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                  : "bg-red-50/80 border-red-200 text-red-950"
              }`}
            >
              <div className="font-semibold flex items-center gap-1.5 text-xs">
                {selectedOption === currentQ.correctIndex ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Spot on! Excellent retention.
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-600" />
                    Not quite, but this is how we learn!
                  </>
                )}
              </div>
              <p className="text-neutral-700">{currentQ.explanation}</p>

              {/* Offer to add to weak spots if incorrect */}
              {selectedOption !== currentQ.correctIndex && (
                <div className="pt-2 border-t border-red-200/60 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-red-800">
                    Would you like Study Buddy to track "{currentQ.topicTag}" as a weak spot?
                  </span>
                  <button
                    onClick={() =>
                      onAddWeakSpot(
                        currentQ.topicTag,
                        `Missed question during quiz: "${currentQ.question.slice(0, 60)}..."`
                      )
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-red-300 hover:bg-red-50 text-red-800 text-xs font-semibold transition shrink-0"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5 text-red-600" />
                    Save Weak Spot
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
            <span className="text-xs text-neutral-400">
              {profile.mode === "cram" ? "⚡ Rapid-fire active recall" : "🎯 Deep conceptual recall"}
            </span>

            {!hasSubmitted ? (
              <button
                onClick={handleCheckAnswer}
                disabled={selectedOption === null}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white text-xs font-semibold transition shadow-xs"
              >
                Confirm Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition shadow-xs"
              >
                <span>{currentIndex < questions.length - 1 ? "Next Question" : "View Results"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Quiz Finished Score Screen */
        <div className="bg-white rounded-3xl border border-neutral-200 p-8 sm:p-12 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
            <Award className="w-8 h-8 text-amber-600" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-serif font-bold text-neutral-900">Quiz Completed!</h3>
            <p className="text-sm text-neutral-500">
              You scored <span className="font-bold text-neutral-900">{score}</span> out of{" "}
              <span className="font-bold text-neutral-900">{questions.length}</span> (
              {Math.round((score / questions.length) * 100)}%)
            </p>
          </div>

          {/* Feedback badge */}
          <div className="max-w-md mx-auto p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-700 leading-relaxed">
            {score === questions.length ? (
              <p className="text-emerald-800 font-medium">
                🌟 Outstanding! You showed flawless active recall on all concepts. Ready for higher-difficulty challenges!
              </p>
            ) : score >= questions.length * 0.7 ? (
              <p className="text-neutral-800">
                👏 Solid foundation! You're retaining the majority of key concepts. Review the {missedQuestions.length} missed question(s) to hit 100%.
              </p>
            ) : (
              <p className="text-amber-900">
                💪 Great practice attempt. Testing what you don't know is the fastest way to learn. Let's review the missed topics together!
              </p>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {missedQuestions.length > 0 && (
              <button
                onClick={handleRetryMissed}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition"
              >
                Retry Missed ({missedQuestions.length})
              </button>
            )}
            <button
              onClick={handleRestart}
              className="px-4 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold transition"
            >
              Retake Entire Quiz
            </button>
            <button
              onClick={() => onSelectTab("explain")}
              className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Teach a concept in "Explain It Back"
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
