import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Send,
  HelpCircle,
  Award,
  BookOpen,
} from "lucide-react";
import { ExplainBackEvaluation, StudentProfile } from "../types";

interface ExplainBackViewProps {
  profile: StudentProfile;
  onAddWeakSpot: (topic: string, reason: string) => void;
  onMarkWeakSpotMastered: (topic: string) => void;
  onSendMessageInChat: (text: string) => void;
  onSelectTab: (tab: string) => void;
}

export const ExplainBackView: React.FC<ExplainBackViewProps> = ({
  profile,
  onAddWeakSpot,
  onMarkWeakSpotMastered,
  onSendMessageInChat,
  onSelectTab,
}) => {
  const [concept, setConcept] = useState(
    profile.weakSpots.find((w) => !w.mastered)?.topic || "The Electron Transport Chain and ATP Synthase"
  );
  const [studentExplanation, setStudentExplanation] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<ExplainBackEvaluation | null>(null);
  const [followUpAnswer, setFollowUpAnswer] = useState("");

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim() || !studentExplanation.trim() || isEvaluating) return;

    setIsEvaluating(true);
    try {
      const res = await fetch("/api/evaluate-explain-back", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept: concept.trim(),
          studentExplanation: studentExplanation.trim(),
          level: profile.level,
        }),
      });

      const data = await res.json();
      if (data.evaluation) {
        setEvaluation(data.evaluation);
        if (data.evaluation.masteryScore >= 80) {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
          // If this concept was in weak spots, mark it mastered
          onMarkWeakSpotMastered(concept.trim());
        } else if (data.evaluation.gapsAndCorrections?.length > 0) {
          // If there are gaps, encourage adding to weak spots
          onAddWeakSpot(concept.trim(), data.evaluation.gapsAndCorrections[0]);
        }
      }
    } catch (err) {
      console.error("Failed to evaluate explanation:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleFollowUpSubmit = () => {
    if (!followUpAnswer.trim()) return;
    onSendMessageInChat(
      `In 'Explain it Back' mode for "${concept}", Study Buddy asked: "${evaluation?.followUpQuestion}". My answer is: "${followUpAnswer.trim()}"`
    );
    onSelectTab("chat");
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-100 text-purple-800">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="font-serif font-bold text-neutral-900 text-lg">
              "Explain It Back" Mode (Feynman Technique)
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            The best way to know if you truly understand something is to teach it. Study Buddy will celebrate what you nailed, catch subtle gaps, and gently clarify mistakes.
          </p>
        </div>

        {/* Quick Pick from Weak Spots */}
        {profile.weakSpots.some((w) => !w.mastered) && (
          <div className="text-xs shrink-0 flex items-center gap-1.5 bg-amber-50 border border-amber-200 p-2 rounded-xl text-amber-800">
            <span className="font-semibold">Suggested topic:</span>
            <button
              onClick={() => {
                const ws = profile.weakSpots.find((w) => !w.mastered);
                if (ws) setConcept(ws.topic);
              }}
              className="px-2 py-0.5 rounded bg-white font-medium hover:bg-amber-100 transition truncate max-w-[160px] border border-amber-300"
            >
              {profile.weakSpots.find((w) => !w.mastered)?.topic}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form */}
        <div className="lg:col-span-6 space-y-4">
          <form onSubmit={handleEvaluate} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <div>
              <label className="block font-semibold text-neutral-800 text-xs uppercase tracking-wider mb-1.5">
                Concept or Question You Are Explaining
              </label>
              <input
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="e.g. How does ATP Synthase generate ATP?"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-neutral-800 text-sm transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-neutral-800 text-xs uppercase tracking-wider">
                  Your Explanation (Teach Study Buddy)
                </label>
                <span className="text-[11px] text-neutral-400">
                  {studentExplanation.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                rows={9}
                value={studentExplanation}
                onChange={(e) => setStudentExplanation(e.target.value)}
                placeholder="Teach it as if you're explaining it to a classmate. What are the key steps, why does it happen, and what is the outcome? Don't worry about being perfect — speak naturally!"
                className="w-full p-3.5 rounded-xl border border-neutral-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-neutral-800 text-sm leading-relaxed placeholder-neutral-400 transition"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                AI provides gentle, non-condescending coaching
              </span>
              <button
                type="submit"
                disabled={!concept.trim() || !studentExplanation.trim() || isEvaluating}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white text-xs font-semibold shadow-xs transition"
              >
                {isEvaluating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing your explanation...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Evaluate My Teaching</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right: AI Feedback & Breakdown */}
        <div className="lg:col-span-6 space-y-4">
          {!evaluation ? (
            <div className="bg-neutral-50 rounded-2xl border border-neutral-200/80 p-8 text-center space-y-3 h-full flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-neutral-800 text-base">
                Ready to Hear Your Explanation
              </h3>
              <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                Type your understanding on the left and submit. Study Buddy will highlight your strengths, fill in gaps, and offer a mental model analogy.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-5 animate-in fade-in duration-200">
              {/* Score & Verdict Header */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shadow-xs ${
                      evaluation.masteryScore >= 80
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : evaluation.masteryScore >= 60
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-red-100 text-red-800 border border-red-200"
                    }`}
                  >
                    {evaluation.masteryScore}%
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                      Mastery Assessment
                    </span>
                    <h4 className="font-bold text-neutral-900 text-sm">{evaluation.verdict}</h4>
                  </div>
                </div>

                <span className="text-xs px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-semibold border border-purple-200/60">
                  Concept: {concept}
                </span>
              </div>

              {/* Celebration */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 text-xs sm:text-sm leading-relaxed">
                <p className="font-medium">{evaluation.celebration}</p>
              </div>

              {/* What You Nailed */}
              <div className="space-y-1.5">
                <h5 className="text-xs font-bold text-neutral-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  What you explained correctly:
                </h5>
                <ul className="space-y-1 text-xs text-neutral-700 pl-2">
                  {evaluation.whatTheyGotRight.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Gaps & Corrections */}
              {evaluation.gapsAndCorrections?.length > 0 && (
                <div className="space-y-1.5">
                  <h5 className="text-xs font-bold text-neutral-800 flex items-center gap-1.5 uppercase tracking-wide">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Nuances or gaps to tighten:
                  </h5>
                  <ul className="space-y-1 text-xs text-neutral-700 pl-2">
                    {evaluation.gapsAndCorrections.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Memory Analogy Hook */}
              {evaluation.analogyTip && (
                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                    Memory Hook & Analogy:
                  </div>
                  <p className="text-neutral-700">{evaluation.analogyTip}</p>
                </div>
              )}

              {/* Follow-up Probe Question */}
              {evaluation.followUpQuestion && (
                <div className="p-4 rounded-xl bg-neutral-900 text-white text-xs space-y-2.5">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Quick Follow-up Probe:
                  </div>
                  <p className="text-neutral-200 text-xs sm:text-sm">{evaluation.followUpQuestion}</p>
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={followUpAnswer}
                      onChange={(e) => setFollowUpAnswer(e.target.value)}
                      placeholder="Answer here to continue discussion in Study Chat..."
                      className="flex-1 px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-white placeholder-neutral-500 outline-none focus:border-amber-400"
                    />
                    <button
                      onClick={handleFollowUpSubmit}
                      disabled={!followUpAnswer.trim()}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-neutral-900 font-bold text-xs transition"
                    >
                      Discuss in Chat
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
