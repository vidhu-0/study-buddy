import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  AlertCircle,
  CheckCircle2,
  Brain,
  HelpCircle,
  Sparkles,
  Plus,
  Trash2,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import { StudentProfile, WeakSpot } from "../types";

interface WeakSpotsViewProps {
  profile: StudentProfile;
  onUpdateWeakSpots: (spots: WeakSpot[]) => void;
  onSendMessageInChat: (text: string) => void;
  onSelectTab: (tab: string) => void;
}

export const WeakSpotsView: React.FC<WeakSpotsViewProps> = ({
  profile,
  onUpdateWeakSpots,
  onSendMessageInChat,
  onSelectTab,
}) => {
  const [newTopic, setNewTopic] = useState("");
  const [newReason, setNewReason] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const activeWeakSpots = profile.weakSpots.filter((w) => !w.mastered);
  const masteredWeakSpots = profile.weakSpots.filter((w) => w.mastered);

  const handleToggleMastered = (id: string) => {
    const updated = profile.weakSpots.map((w) => {
      if (w.id === id) {
        const nextMastered = !w.mastered;
        if (nextMastered) {
          confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
        }
        return {
          ...w,
          mastered: nextMastered,
          repetitionCount: w.repetitionCount + 1,
          lastTestedDate: "Just now",
        };
      }
      return w;
    });
    onUpdateWeakSpots(updated);
  };

  const handleDelete = (id: string) => {
    const updated = profile.weakSpots.filter((w) => w.id !== id);
    onUpdateWeakSpots(updated);
  };

  const handleAddSpot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    const newSpot: WeakSpot = {
      id: `ws-${Date.now()}`,
      topic: newTopic.trim(),
      identifiedReason: newReason.trim() || "Added for spaced repetition practice",
      repetitionCount: 0,
      lastTestedDate: "Never",
      mastered: false,
    };

    onUpdateWeakSpots([newSpot, ...profile.weakSpots]);
    setNewTopic("");
    setNewReason("");
    setShowAddForm(false);
  };

  const handleAskToReviewInChat = (topic: string) => {
    onSendMessageInChat(
      `I'm having trouble with "${topic}". Can you walk me through it using simple language and a clear analogy, then give me a check question?`
    );
    onSelectTab("chat");
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <AlertCircle className="w-4 h-4" />
            </span>
            <h2 className="font-serif font-bold text-neutral-900 text-lg">
              Weak Spots & Spaced Repetition Tracker
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1 max-w-lg leading-relaxed">
            Study Buddy remembers topics you hesitated on or got wrong, proactively weaving them into future chats, flashcards, and quizzes.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition self-start sm:self-center"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Weak Spot</span>
        </button>
      </div>

      {/* Manual Add Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddSpot}
          className="bg-white p-5 rounded-2xl border border-neutral-300 shadow-sm space-y-3 text-xs animate-in fade-in"
        >
          <h4 className="font-bold text-neutral-800 text-sm">Add a Concept to Spaced Repetition Tracker</h4>
          <div>
            <label className="block font-semibold text-neutral-700 mb-1">Concept or Problem Area</label>
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="e.g. Krebs Cycle carbon counting, Mitosis vs Meiosis II"
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-neutral-700 mb-1">What was tricky or confusing? (Optional)</label>
            <input
              type="text"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              placeholder="e.g. Always forget how many ATP come from NADH vs FADH2"
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold"
            >
              Save Weak Spot
            </button>
          </div>
        </form>
      )}

      {/* Active Needs-Practice Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            Active Weak Spots ({activeWeakSpots.length})
          </h3>
          <span className="text-[11px] text-neutral-400">
            Click 'Mastered' once you can explain it without notes
          </span>
        </div>

        {activeWeakSpots.length === 0 ? (
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-6 text-center text-xs text-emerald-900 space-y-1">
            <p className="font-semibold text-sm">🎉 No active weak spots!</p>
            <p className="text-emerald-700">
              You have resolved all flagged areas. Try taking another quiz or teaching a concept in "Explain It Back".
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeWeakSpots.map((spot) => (
              <div
                key={spot.id}
                className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900 text-sm font-serif">
                      {spot.topic}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      Tested {spot.repetitionCount}x
                    </span>
                  </div>
                  <p className="text-neutral-500 leading-relaxed max-w-xl">
                    {spot.identifiedReason}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleAskToReviewInChat(spot.topic)}
                    className="px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium transition flex items-center gap-1"
                  >
                    <Brain className="w-3 h-3 text-neutral-500" />
                    Review in Chat
                  </button>
                  <button
                    onClick={() => onSelectTab("quiz")}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-medium transition flex items-center gap-1"
                  >
                    <HelpCircle className="w-3 h-3 text-amber-600" />
                    Quiz
                  </button>
                  <button
                    onClick={() => handleToggleMastered(spot.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark Mastered
                  </button>
                  <button
                    onClick={() => handleDelete(spot.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-500 transition"
                    title="Remove from list"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mastered Items Section */}
      {masteredWeakSpots.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-neutral-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Solidified / Mastered Concepts ({masteredWeakSpots.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {masteredWeakSpots.map((spot) => (
              <div
                key={spot.id}
                className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-neutral-800 line-through text-neutral-500">
                    {spot.topic}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    Mastered • Reviewed {spot.repetitionCount} times
                  </span>
                </div>

                <button
                  onClick={() => handleToggleMastered(spot.id)}
                  className="text-neutral-400 hover:text-neutral-700 p-1"
                  title="Move back to active practice"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
