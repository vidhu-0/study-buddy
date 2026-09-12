import React, { useState, useRef } from "react";
import {
  Printer,
  Download,
  Copy,
  Check,
  X,
  FileText,
  Layers,
  AlertCircle,
  Brain,
  Calendar,
  Sparkles,
  BookOpen,
  Filter,
  CheckCircle2,
  ListOrdered,
  Eye,
} from "lucide-react";
import { ChatMessage, Flashcard, StudentProfile } from "../types";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  flashcards: Flashcard[];
  messages: ChatMessage[];
  defaultFlashcardFilter?: "all" | "need-review" | "mastered";
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  profile,
  flashcards,
  messages,
  defaultFlashcardFilter = "all",
}) => {
  // Inclusion options
  const [includeOverview, setIncludeOverview] = useState(true);
  const [includeWeakSpots, setIncludeWeakSpots] = useState(true);
  const [includeFlashcards, setIncludeFlashcards] = useState(true);
  const [includeChat, setIncludeChat] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(Boolean(profile.notesContext));

  // Flashcard filters & format
  const [cardFilter, setCardFilter] = useState<"all" | "need-review" | "mastered">(
    defaultFlashcardFilter
  );
  const [cardLayout, setCardLayout] = useState<"table" | "cutout">("table");

  // Feedback states
  const [copied, setCopied] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Filter flashcards based on selection
  const filteredFlashcards = flashcards.filter((card) => {
    if (cardFilter === "need-review") return card.box === 1 || card.box === 2;
    if (cardFilter === "mastered") return card.box === 3;
    return true;
  });

  const masteredCount = flashcards.filter((c) => c.box === 3).length;
  const reviewingCount = flashcards.filter((c) => c.box === 2).length;
  const learningCount = flashcards.filter((c) => c.box === 1).length;
  const masteryPercentage =
    flashcards.length > 0 ? Math.round((masteredCount / flashcards.length) * 100) : 0;

  const unresolvedWeakSpots = profile.weakSpots.filter((w) => !w.mastered);
  const meaningfulMessages = messages.filter(
    (m) => m.id !== "msg-init-1" && m.content.trim().length > 0
  );

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Handle direct print
  const handlePrint = () => {
    window.print();
  };

  // Generate self-contained offline HTML
  const handleDownloadHTML = () => {
    const printContent = printAreaRef.current?.innerHTML || "";
    const htmlDocument = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${profile.subject || "Study Session"} - Offline Study Sheet</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      color: #1a1a1a;
      background: #ffffff;
      margin: 0;
      padding: 32px 24px;
      max-width: 900px;
      margin-left: auto;
      margin-right: auto;
    }
    h1, h2, h3, h4 { color: #111; margin-top: 1.5em; margin-bottom: 0.5em; font-family: Georgia, serif; }
    h1 { font-size: 24pt; border-bottom: 2px solid #222; padding-bottom: 8px; margin-top: 0; }
    h2 { font-size: 16pt; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
    h3 { font-size: 13pt; margin-bottom: 4px; }
    p { margin-top: 0; margin-bottom: 0.8em; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 9pt; font-weight: 600; text-transform: uppercase; margin-right: 6px; }
    .badge-mastered { background: #e6f4ea; color: #137333; border: 1px solid #ceead6; }
    .badge-review { background: #fef7e0; color: #b06000; border: 1px solid #fce8b2; }
    .badge-learning { background: #fce8e6; color: #c5221f; border: 1px solid #fad2cf; }
    .meta-bar { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; font-size: 10pt; color: #555; background: #f8f9fa; padding: 12px 16px; border-radius: 8px; border: 1px solid #eee; }
    .stat-box { display: inline-block; padding: 8px 16px; background: #f1f3f4; border-radius: 6px; text-align: center; margin-right: 12px; margin-bottom: 8px; }
    .stat-number { font-size: 16pt; font-weight: bold; color: #202124; display: block; }
    .stat-label { font-size: 8pt; color: #5f6368; text-transform: uppercase; font-weight: 600; }
    .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 16px; margin-top: 16px; }
    .flashcard { border: 1.5px dashed #bbb; border-radius: 8px; padding: 14px; background: #fafafa; page-break-inside: avoid; break-inside: avoid; }
    .flashcard-front { font-weight: 600; font-size: 11pt; color: #111; margin-bottom: 8px; }
    .flashcard-back { font-size: 10pt; color: #333; border-top: 1px solid #eee; padding-top: 8px; }
    .table-view { width: 100%; border-collapse: collapse; margin-top: 16px; }
    .table-view th { text-align: left; background: #f1f3f4; padding: 8px 10px; font-size: 10pt; border: 1px solid #dadce0; }
    .table-view td { padding: 10px; border: 1px solid #dadce0; font-size: 10pt; vertical-align: top; }
    .weak-spot-item { border-left: 3px solid #f2994a; padding-left: 12px; margin-bottom: 12px; }
    .chat-item { margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid #eee; }
    .chat-role { font-weight: bold; font-size: 9pt; text-transform: uppercase; color: #666; margin-bottom: 4px; }
    .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #ccc; font-size: 9pt; color: #888; text-align: center; }
    @media print {
      body { padding: 0; max-width: 100%; }
      .no-print { display: none; }
      .flashcard { page-break-inside: avoid; break-inside: avoid; }
      .table-view tr { page-break-inside: avoid; break-inside: avoid; }
    }
  </style>
</head>
<body>
  ${printContent}
  <div class="footer">
    Exported from Study Buddy • Printed on ${currentDate} • Ready for offline study
  </div>
</body>
</html>`;

    const blob = new Blob([htmlDocument], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(profile.subject || "Study_Buddy").replace(/[^a-z0-9]/gi, "_")}_Study_Sheet_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy Markdown format to clipboard
  const handleCopyMarkdown = async () => {
    let md = `# Study Session Summary: ${profile.subject || "General"}\n\n`;
    md += `- **Date**: ${currentDate}\n`;
    md += `- **Academic Level**: ${profile.level}\n`;
    if (profile.deadline) md += `- **Target Deadline**: ${profile.deadline}\n`;
    md += `- **Study Mode**: ${profile.mode === "cram" ? "⚡ Cram Mode" : "🎯 Mastery Mode"}\n`;
    md += `- **Flashcard Mastery**: ${masteryPercentage}% (${masteredCount}/${flashcards.length} mastered)\n\n`;

    if (includeWeakSpots && unresolvedWeakSpots.length > 0) {
      md += `## ⚠️ Focus Areas & Weak Spots\n\n`;
      unresolvedWeakSpots.forEach((w) => {
        md += `### ${w.topic}\n`;
        md += `- **Why to review**: ${w.identifiedReason}\n`;
        md += `- **Repetition Count**: ${w.repetitionCount} | **Last Tested**: ${w.lastTestedDate}\n\n`;
      });
    }

    if (includeFlashcards && filteredFlashcards.length > 0) {
      md += `## 🗂️ Flashcards (${cardFilter.toUpperCase()})\n\n`;
      filteredFlashcards.forEach((c, idx) => {
        md += `### ${idx + 1}. ${c.front}\n`;
        md += `**Category**: ${c.category} | **Status**: Box ${c.box} (${c.box === 3 ? "Mastered" : c.box === 2 ? "Reviewing" : "Learning"})\n\n`;
        md += `**Answer / Explanation**:\n${c.back}\n\n---\n\n`;
      });
    }

    if (includeChat && meaningfulMessages.length > 0) {
      md += `## 💬 Key Study Discussion\n\n`;
      meaningfulMessages.forEach((m) => {
        md += `**${m.role === "assistant" ? "Study Buddy (Tutor)" : "Student"}**: ${m.content}\n\n`;
      });
    }

    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy markdown", err);
    }
  };

  return (
    <div
      id="export-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Modal Top Bar (Hidden on print) */}
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/80 no-print">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-neutral-900">
                Export & Offline Study Sheet
              </h2>
              <p className="text-xs text-neutral-500">
                Generate a printer-friendly study guide and flashcard sheet to review offline.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-white bg-neutral-100 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Copy study sheet as Markdown for Notion, Obsidian, or Anki"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadHTML}
              className="px-3 py-1.5 rounded-lg border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Download self-contained offline HTML file"
            >
              <Download className="w-3.5 h-3.5 text-teal-600" />
              <span>Offline HTML</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configuration Bar (Hidden on print) */}
        <div className="px-5 py-3 border-b border-neutral-200 bg-white text-xs flex flex-wrap items-center justify-between gap-3 no-print">
          {/* Section Checkboxes */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-neutral-600 uppercase tracking-wider text-[11px]">
              Include:
            </span>
            <label className="flex items-center gap-1.5 cursor-pointer text-neutral-700 hover:text-neutral-900">
              <input
                type="checkbox"
                checked={includeOverview}
                onChange={(e) => setIncludeOverview(e.target.checked)}
                className="rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
              />
              <span>Session Overview</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-neutral-700 hover:text-neutral-900">
              <input
                type="checkbox"
                checked={includeWeakSpots}
                onChange={(e) => setIncludeWeakSpots(e.target.checked)}
                className="rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
              />
              <span>Weak Spots ({unresolvedWeakSpots.length})</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-neutral-700 hover:text-neutral-900">
              <input
                type="checkbox"
                checked={includeFlashcards}
                onChange={(e) => setIncludeFlashcards(e.target.checked)}
                className="rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
              />
              <span>Flashcards ({filteredFlashcards.length})</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-neutral-700 hover:text-neutral-900">
              <input
                type="checkbox"
                checked={includeChat}
                onChange={(e) => setIncludeChat(e.target.checked)}
                className="rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
              />
              <span>Discussion Q&A ({meaningfulMessages.length})</span>
            </label>

            {profile.notesContext && (
              <label className="flex items-center gap-1.5 cursor-pointer text-neutral-700 hover:text-neutral-900">
                <input
                  type="checkbox"
                  checked={includeNotes}
                  onChange={(e) => setIncludeNotes(e.target.checked)}
                  className="rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
                />
                <span>Notes Reference</span>
              </label>
            )}
          </div>

          {/* Flashcard Filters & Layout */}
          {includeFlashcards && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
                <button
                  type="button"
                  onClick={() => setCardFilter("all")}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                    cardFilter === "all" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-600"
                  }`}
                >
                  All ({flashcards.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCardFilter("need-review")}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                    cardFilter === "need-review"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-neutral-600 hover:text-amber-800"
                  }`}
                  title="Box 1 & 2 cards that need more review"
                >
                  Need Review ({learningCount + reviewingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setCardFilter("mastered")}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                    cardFilter === "mastered"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-neutral-600 hover:text-emerald-800"
                  }`}
                  title="Box 3 Mastered cards"
                >
                  Mastered ({masteredCount})
                </button>
              </div>

              <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
                <button
                  type="button"
                  onClick={() => setCardLayout("table")}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                    cardLayout === "table" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-600"
                  }`}
                  title="Table layout: High information density study sheet"
                >
                  Study Sheet
                </button>
                <button
                  type="button"
                  onClick={() => setCardLayout("cutout")}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                    cardLayout === "cutout" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-600"
                  }`}
                  title="Dotted box cutout flashcards for physical paper"
                >
                  Printable Cards
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live Document Preview / Printable Container */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-neutral-100/50">
          <div
            ref={printAreaRef}
            id="printable-study-document"
            className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-xl shadow-xs border border-neutral-200 text-neutral-900 print:p-0 print:border-none print:shadow-none print:max-w-full"
          >
            {/* Document Header */}
            <div className="border-b-2 border-neutral-900 pb-4 mb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 block mb-1">
                    Study Buddy • Offline Review Guide
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-950">
                    {profile.subject || "Study Session Review"}
                  </h1>
                  <p className="text-xs text-neutral-600 mt-1">
                    {profile.level} {profile.deadline ? `• Target: ${profile.deadline}` : ""} • Study Mode:{" "}
                    {profile.mode === "cram" ? "⚡ Cram / High-Yield" : "🎯 Mastery & Deep Understanding"}
                  </p>
                </div>
                <div className="text-right text-xs text-neutral-500 shrink-0">
                  <div className="font-semibold text-neutral-800">{currentDate}</div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">Offline Study Sheet</div>
                </div>
              </div>
            </div>

            {/* Section 1: Session Overview & Leitner Spaced Repetition Stats */}
            {includeOverview && (
              <div className="mb-8 print-page-break-avoid">
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 pb-1.5 mb-3 flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-neutral-600" />
                  Session Progress & Leitner Mastery Stats
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50 text-center">
                    <span className="text-xl sm:text-2xl font-bold font-serif text-neutral-900 block">
                      {masteryPercentage}%
                    </span>
                    <span className="text-[10px] font-semibold uppercase text-neutral-500 tracking-wider">
                      Overall Mastery
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg border border-red-200 bg-red-50/50 text-center">
                    <span className="text-xl sm:text-2xl font-bold font-serif text-red-900 block">
                      {learningCount}
                    </span>
                    <span className="text-[10px] font-semibold uppercase text-red-700 tracking-wider">
                      Box 1 (Learning)
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/50 text-center">
                    <span className="text-xl sm:text-2xl font-bold font-serif text-amber-900 block">
                      {reviewingCount}
                    </span>
                    <span className="text-[10px] font-semibold uppercase text-amber-700 tracking-wider">
                      Box 2 (Reviewing)
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/50 text-center">
                    <span className="text-xl sm:text-2xl font-bold font-serif text-emerald-900 block">
                      {masteredCount}
                    </span>
                    <span className="text-[10px] font-semibold uppercase text-emerald-700 tracking-wider">
                      Box 3 (Mastered)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Section 2: Identified Weak Spots & Focus Areas */}
            {includeWeakSpots && unresolvedWeakSpots.length > 0 && (
              <div className="mb-8 print-page-break-avoid">
                <h2 className="text-sm font-bold uppercase tracking-wider text-amber-800 border-b border-amber-200 pb-1.5 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Priority Focus Areas & Weak Spots ({unresolvedWeakSpots.length})
                  </span>
                  <span className="text-[10px] font-normal text-amber-700 normal-case">
                    Review these before your exam!
                  </span>
                </h2>
                <div className="space-y-2.5">
                  {unresolvedWeakSpots.map((spot, idx) => (
                    <div
                      key={spot.id}
                      className="p-3 rounded-lg border-l-4 border-amber-500 bg-amber-50/40 border border-neutral-200 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-neutral-900 text-sm">
                          {idx + 1}. {spot.topic}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500 shrink-0">
                          Tested: {spot.lastTestedDate} ({spot.repetitionCount}x)
                        </span>
                      </div>
                      <p className="text-neutral-700 mt-1 text-xs">
                        <strong className="text-neutral-900">Why to review:</strong>{" "}
                        {spot.identifiedReason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 3: Flashcards / Core Concept Sheets */}
            {includeFlashcards && (
              <div className="mb-8">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-1.5 mb-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-teal-600" />
                    Key Concept Flashcards ({filteredFlashcards.length} cards •{" "}
                    {cardFilter === "all"
                      ? "All Deck"
                      : cardFilter === "need-review"
                      ? "Needs Review"
                      : "Mastered"}
                    )
                  </h2>
                  <span className="text-[10px] text-neutral-500">
                    Format: {cardLayout === "table" ? "Study Sheet Table" : "Printable Card Cutouts"}
                  </span>
                </div>

                {filteredFlashcards.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic py-3">
                    No flashcards matching the current filter.
                  </p>
                ) : cardLayout === "table" ? (
                  /* Study Sheet Table Format */
                  <div className="overflow-x-auto border border-neutral-300 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-neutral-100 text-neutral-800 border-b border-neutral-300">
                          <th className="py-2.5 px-3 font-bold w-12 text-center">#</th>
                          <th className="py-2.5 px-3 font-bold w-1/3">Prompt / Question (Front)</th>
                          <th className="py-2.5 px-3 font-bold">
                            Direct Answer & Step-by-Step Logic (Back)
                          </th>
                          <th className="py-2.5 px-3 font-bold w-24 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {filteredFlashcards.map((card, idx) => (
                          <tr key={card.id} className="print-page-break-avoid hover:bg-neutral-50/50">
                            <td className="py-3 px-3 font-mono text-neutral-400 text-center align-top">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-3 font-medium text-neutral-950 align-top">
                              <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">
                                {card.category}
                              </span>
                              {card.front}
                            </td>
                            <td className="py-3 px-3 text-neutral-800 align-top whitespace-pre-line leading-relaxed">
                              {card.back}
                            </td>
                            <td className="py-3 px-3 align-top text-center">
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                                  card.box === 3
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : card.box === 2
                                    ? "bg-amber-50 text-amber-800 border-amber-200"
                                    : "bg-red-50 text-red-800 border-red-200"
                                }`}
                              >
                                Box {card.box}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* Printable 2-Column Cutout Cards Format with Dotted Cut Lines */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredFlashcards.map((card, idx) => (
                      <div
                        key={card.id}
                        className="border-2 border-dashed border-neutral-300 rounded-xl p-4 bg-white text-xs print-page-break-avoid flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1.5 pb-1 border-b border-neutral-100">
                            <span className="font-mono uppercase tracking-wider">{card.category}</span>
                            <span className="font-medium">
                              Card {idx + 1} • Box {card.box}
                            </span>
                          </div>
                          <div className="font-bold text-neutral-950 text-sm mb-2">
                            {card.front}
                          </div>
                          <div className="border-t border-neutral-200 pt-2 text-neutral-700 whitespace-pre-line leading-relaxed">
                            {card.back}
                          </div>
                        </div>
                        <div className="mt-3 pt-1 text-[9px] text-neutral-400 text-right italic">
                          ✂️ Cut along dashed border for index card
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Section 4: Study Chat & Q&A Highlights */}
            {includeChat && meaningfulMessages.length > 0 && (
              <div className="mb-8 print-page-break-avoid">
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-200 pb-1.5 mb-3 flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-emerald-600" />
                  Key Discussion & Q&A Highlights ({meaningfulMessages.length} exchanges)
                </h2>
                <div className="space-y-3">
                  {meaningfulMessages.map((msg, idx) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg text-xs print-page-break-avoid ${
                        msg.role === "assistant"
                          ? "bg-neutral-50 border border-neutral-200 text-neutral-800"
                          : "bg-amber-50/40 border border-amber-200/60 text-amber-950 font-medium"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-semibold text-neutral-500 mb-1">
                        <span>{msg.role === "assistant" ? "💡 Study Buddy (Tutor)" : "👤 Student"}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <div className="whitespace-pre-line leading-relaxed text-xs">
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 5: Uploaded Notes / Textbook Excerpt Reference */}
            {includeNotes && profile.notesContext && (
              <div className="mb-6 print-page-break-avoid">
                <h2 className="text-sm font-bold uppercase tracking-wider text-teal-800 border-b border-teal-200 pb-1.5 mb-3 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-teal-600" />
                  Source Notes Reference ({profile.notesFileName || "Uploaded Material"})
                </h2>
                <div className="p-3 bg-teal-50/40 border border-teal-200 rounded-lg text-xs text-neutral-700 font-mono whitespace-pre-line leading-relaxed max-h-60 overflow-hidden">
                  {profile.notesContext.slice(0, 1500)}
                  {profile.notesContext.length > 1500 && "\n... [truncated for print summary]"}
                </div>
              </div>
            )}

            {/* Offline Study Tips Footer */}
            <div className="border-t border-neutral-200 pt-4 text-center text-[10px] text-neutral-400">
              <p>
                Study Buddy Offline Review Sheet • Tip: Cover the answer column with a sheet of paper to test yourself with active recall!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
