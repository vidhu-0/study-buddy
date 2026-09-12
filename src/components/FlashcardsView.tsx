import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  Layers,
  RotateCw,
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Brain,
  Award,
  BookOpen,
  FileText,
  Printer,
} from "lucide-react";
import { Flashcard, StudentProfile } from "../types";

interface FlashcardsViewProps {
  profile: StudentProfile;
  flashcards: Flashcard[];
  onUpdateFlashcard: (updated: Flashcard) => void;
  onAddFlashcards: (newCards: Flashcard[]) => void;
  onOpenExport?: () => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  profile,
  flashcards,
  onUpdateFlashcard,
  onAddFlashcards,
  onOpenExport,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateTopic, setGenerateTopic] = useState(profile.subject || "");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [newCategory, setNewCategory] = useState(profile.subject || "General");

  const currentCard = flashcards[currentIndex];

  // Stats
  const masteredCount = flashcards.filter((c) => c.box === 3).length;
  const reviewingCount = flashcards.filter((c) => c.box === 2).length;
  const learningCount = flashcards.filter((c) => c.box === 1).length;
  const masteryPercentage = flashcards.length > 0 ? Math.round((masteredCount / flashcards.length) * 100) : 0;

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(flashcards.length - 1);
    }
  };

  const handleAnswerReview = (understood: boolean) => {
    if (!currentCard) return;

    let newBox = currentCard.box;
    if (understood) {
      newBox = Math.min(3, currentCard.box + 1);
      if (newBox === 3 && currentCard.box !== 3) {
        confetti({
          particleCount: 40,
          spread: 55,
          origin: { y: 0.7 },
        });
      }
    } else {
      newBox = 1; // Spaced repetition reset back to Box 1 for frequent review
    }

    onUpdateFlashcard({
      ...currentCard,
      box: newBox,
      reviewCount: currentCard.reviewCount + 1,
      lastReviewed: new Date().toISOString(),
    });

    handleNext();
  };

  const handleGenerateDeck = async (useNotes: boolean = false) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: generateTopic || profile.subject,
          notes: useNotes ? profile.notesContext : undefined,
          count: 6,
          level: profile.level,
        }),
      });

      const data = await response.json();
      if (data.cards && Array.isArray(data.cards)) {
        const mapped: Flashcard[] = data.cards.map((c: any, index: number) => ({
          id: `fc-gen-${Date.now()}-${index}`,
          front: c.front,
          back: c.back,
          category: c.category || generateTopic || "Core Concepts",
          difficulty: c.difficulty || "medium",
          box: 1,
          reviewCount: 0,
        }));
        onAddFlashcards(mapped);
        setCurrentIndex(flashcards.length);
        setIsFlipped(false);
      }
    } catch (err) {
      console.error("Failed to generate flashcards:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    const newCard: Flashcard = {
      id: `fc-manual-${Date.now()}`,
      front: newFront.trim(),
      back: newBack.trim(),
      category: newCategory.trim() || "General",
      difficulty: "medium",
      box: 1,
      reviewCount: 0,
    };

    onAddFlashcards([newCard]);
    setNewFront("");
    setNewBack("");
    setShowAddModal(false);
    setCurrentIndex(flashcards.length);
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-6 space-y-6">
      {/* Header & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-100 text-teal-800">
              <Layers className="w-4 h-4" />
            </span>
            <h2 className="font-serif font-bold text-neutral-900 text-lg">
              Spaced Repetition Deck
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Leitner 3-Box System: Items you know well are spaced out; items you miss repeat today.
          </p>
        </div>

        {/* Leitner Box Counters */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-red-50 border border-red-200/70 text-red-800 font-medium flex flex-col items-center">
            <span className="text-[10px] text-red-600 font-semibold uppercase">Box 1: Learning</span>
            <span className="text-sm font-bold">{learningCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-800 font-medium flex flex-col items-center">
            <span className="text-[10px] text-amber-600 font-semibold uppercase">Box 2: Review</span>
            <span className="text-sm font-bold">{reviewingCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-800 font-medium flex flex-col items-center">
            <span className="text-[10px] text-emerald-600 font-semibold uppercase">Box 3: Mastered</span>
            <span className="text-sm font-bold">{masteredCount}</span>
          </div>
        </div>
      </div>

      {/* AI Deck Generator Bar */}
      <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <input
            type="text"
            value={generateTopic}
            onChange={(e) => setGenerateTopic(e.target.value)}
            placeholder="Enter subtopic or chapter to generate cards..."
            className="w-full bg-white px-3 py-1.5 rounded-lg border border-neutral-300 text-neutral-800 placeholder-neutral-400 outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleGenerateDeck(false)}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white font-medium transition shadow-xs"
          >
            {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Generate Cards
          </button>

          {profile.notesContext && (
            <button
              onClick={() => handleGenerateDeck(true)}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-medium transition"
              title="Generate cards specifically targeting your uploaded notes"
            >
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              From Uploaded Notes
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="p-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700 transition cursor-pointer"
            title="Create single card manually"
          >
            <Plus className="w-4 h-4" />
          </button>

          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300 font-medium transition cursor-pointer"
              title="Print flashcards or export to offline review sheet"
            >
              <Printer className="w-3.5 h-3.5 text-neutral-500" />
              <span className="hidden sm:inline">Print / Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Card Viewer */}
      {flashcards.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200 p-8 space-y-4">
          <Layers className="w-12 h-12 text-neutral-300 mx-auto" />
          <h3 className="font-semibold text-neutral-800">No flashcards yet!</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Click "Generate Cards" above or ask Study Buddy in the chat to create high-yield cards for your exam.
          </p>
          <button
            onClick={() => handleGenerateDeck(false)}
            className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition"
          >
            Generate First 6 Cards
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Card Meta & Navigation */}
          <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
            <span className="font-medium">
              Card {currentIndex + 1} of {flashcards.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-neutral-100 font-mono text-[11px] text-neutral-700">
                {currentCard.category}
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                  currentCard.box === 3
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : currentCard.box === 2
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-red-50 text-red-800 border-red-200"
                }`}
              >
                Box {currentCard.box}: {currentCard.box === 3 ? "Mastered" : currentCard.box === 2 ? "Reviewing" : "Learning"}
              </span>
            </div>
          </div>

          {/* Interactive Flip Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="relative w-full min-h-[300px] sm:min-h-[340px] rounded-3xl bg-white border border-neutral-200/90 shadow-md p-8 sm:p-12 cursor-pointer flex flex-col justify-between transition-all hover:border-amber-400 group select-none"
          >
            {/* Top Indicator */}
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-mono uppercase tracking-wider font-semibold text-[10px]">
                {isFlipped ? "💡 Answer & Memory Hook" : "❓ Active Recall Question"}
              </span>
              <span className="flex items-center gap-1 group-hover:text-amber-600 transition">
                <RotateCw className="w-3.5 h-3.5" />
                Click anywhere to flip
              </span>
            </div>

            {/* Content Centered */}
            <div className="my-auto py-4 text-center">
              {!isFlipped ? (
                <div className="space-y-3">
                  <p className="text-xl sm:text-2xl font-serif font-bold text-neutral-900 leading-snug">
                    {currentCard.front}
                  </p>
                  <p className="text-xs text-neutral-400">
                    Try to recall the definition, formula, or mechanism out loud before flipping!
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-w-xl mx-auto">
                  <div className="text-base sm:text-lg font-medium text-neutral-900 leading-relaxed">
                    {currentCard.back}
                  </div>
                  <div className="inline-block px-3 py-1 rounded-lg bg-amber-50 border border-amber-200/70 text-amber-900 text-xs font-serif italic">
                    Tip: Explaining this concept in your own words boosts long-term retention by 70%.
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Card Footer */}
            <div className="flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-100 pt-3">
              <span>Reviewed {currentCard.reviewCount} times</span>
              <span className="text-[11px] text-neutral-400">
                Difficulty: <span className="capitalize">{currentCard.difficulty}</span>
              </span>
            </div>
          </div>

          {/* Answer Assessment Buttons (Active Recall Spaced Repetition) */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handleAnswerReview(false)}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white border border-red-200 hover:bg-red-50 text-red-700 font-semibold text-xs sm:text-sm shadow-xs transition"
            >
              <XCircle className="w-4 h-4 text-red-500" />
              <span>Still Learning (Reset to Box 1)</span>
            </button>
            <button
              onClick={() => handleAnswerReview(true)}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Got It! (Move to Box {Math.min(3, currentCard.box + 1)})</span>
            </button>
          </div>

          {/* Prev / Next Controls */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={handlePrev}
              className="p-2 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-600 transition"
              title="Previous card"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-neutral-500 font-medium">
              {currentIndex + 1} / {flashcards.length}
            </span>
            <button
              onClick={handleNext}
              className="p-2 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-600 transition"
              title="Next card"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Manual Add Card Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-neutral-200 shadow-xl space-y-4">
            <h3 className="font-serif font-bold text-neutral-900 text-base">Add New Flashcard</h3>
            <form onSubmit={handleManualAdd} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Subtopic / Category</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 outline-none focus:border-amber-500"
                  placeholder="e.g. Krebs Cycle"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Front (Question or Term)</label>
                <textarea
                  rows={3}
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 outline-none focus:border-amber-500"
                  placeholder="What happens during pyruvate oxidation?"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Back (Answer & Memory Hook)</label>
                <textarea
                  rows={3}
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 outline-none focus:border-amber-500"
                  placeholder="Pyruvate is decarboxylated into Acetyl-CoA, releasing CO2 and 1 NADH."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-neutral-900 text-white font-medium hover:bg-neutral-800"
                >
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
