import React, { useState } from "react";
import { X, Upload, FileText, Check, AlertTriangle, Sparkles, BookOpen, Clock, Zap } from "lucide-react";
import { AcademicLevel, StudentProfile, StudyMode } from "../types";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onSave: (updated: Partial<StudentProfile>) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [subject, setSubject] = useState(profile.subject);
  const [level, setLevel] = useState<AcademicLevel>(profile.level);
  const [deadline, setDeadline] = useState(profile.deadline);
  const [mode, setMode] = useState<StudyMode>(profile.mode);
  const [notesContext, setNotesContext] = useState(profile.notesContext);
  const [notesFileName, setNotesFileName] = useState(profile.notesFileName || "");

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNotesFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setNotesContext(text);
      }
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    onSave({
      subject,
      level,
      deadline,
      mode,
      notesContext,
      notesFileName: notesFileName || (notesContext.trim() ? "Pasted_Notes.txt" : undefined),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-neutral-200 shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-neutral-900 text-lg">Study Buddy Context</h2>
              <p className="text-xs text-neutral-500">
                Tailor explanations, analogies, and pacing to your specific course
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6 space-y-5 text-sm">
          {/* Subject / Exam */}
          <div>
            <label className="block font-semibold text-neutral-800 text-xs uppercase tracking-wider mb-1.5">
              Subject, Course, or Exam
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. CBSE Class 10 Science, NCERT Class 12 Physics, JEE Maths, NEET Biology"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-neutral-800 placeholder-neutral-400 text-sm transition"
            />
            {/* Quick Presets */}
            <div className="mt-2 flex flex-wrap gap-1.5 items-center text-[11px]">
              <span className="text-neutral-500 font-medium">Quick presets:</span>
              {[
                { label: "CBSE Class 10 Science", lvl: "CBSE / NCERT (Class 9-12)" },
                { label: "CBSE Class 12 Physics", lvl: "CBSE / NCERT (Class 9-12)" },
                { label: "NCERT Class 12 Chemistry", lvl: "CBSE / NCERT (Class 9-12)" },
                { label: "JEE Main / Advanced", lvl: "JEE / NEET / CUET (India)" },
                { label: "NEET Biology & Chem", lvl: "JEE / NEET / CUET (India)" },
                { label: "ICSE Class 10 Maths", lvl: "ICSE / ISC Board" },
                { label: "UPSC Indian Polity", lvl: "UPSC / Indian Competitive Exams" },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setSubject(item.label);
                    setLevel(item.lvl as AcademicLevel);
                  }}
                  className="px-2 py-0.5 rounded-md bg-neutral-100 hover:bg-amber-100 hover:text-amber-900 text-neutral-700 transition cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Academic Level & Deadline Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-neutral-800 text-xs uppercase tracking-wider mb-1.5">
                Academic Level / Board
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as AcademicLevel)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-neutral-800 bg-white text-sm transition"
              >
                <optgroup label="Indian Curriculum & Exams">
                  <option value="CBSE / NCERT (Class 9-12)">CBSE / NCERT (Class 9-12)</option>
                  <option value="ICSE / ISC Board">ICSE / ISC Board</option>
                  <option value="State Board (India)">State Board (India)</option>
                  <option value="JEE / NEET / CUET (India)">JEE / NEET / CUET (India)</option>
                  <option value="UPSC / Indian Competitive Exams">UPSC / Civil Services / State PSC</option>
                </optgroup>
                <optgroup label="Standard / Global">
                  <option value="Middle School">Middle School</option>
                  <option value="High School">High School (AP / IB / Standard)</option>
                  <option value="College / Undergrad">College / Undergraduate</option>
                  <option value="Graduate / Professional">Graduate / Professional (MCAT, GRE, GATE)</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 text-xs uppercase tracking-wider mb-1.5">
                Target Exam / Deadline
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  placeholder="e.g. Tomorrow morning, In 3 days, Final Exam Oct 20"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-neutral-800 placeholder-neutral-400 text-sm transition"
                />
                <Clock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* Study Mode Selection */}
          <div>
            <label className="block font-semibold text-neutral-800 text-xs uppercase tracking-wider mb-2">
              Study Mode Strategy
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode("mastery")}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  mode === "mastery"
                    ? "border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600"
                    : "border-neutral-200 hover:border-neutral-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-neutral-900 text-sm">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Mastery Mode
                  </div>
                  {mode === "mastery" && <Check className="w-4 h-4 text-emerald-600" />}
                </div>
                <p className="text-xs text-neutral-600">
                  Deep conceptual dives, analogies, first-principles logic, and long-term retention.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMode("cram")}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  mode === "cram"
                    ? "border-amber-600 bg-amber-50/50 ring-1 ring-amber-600"
                    : "border-neutral-200 hover:border-neutral-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-neutral-900 text-sm">
                    <Zap className="w-4 h-4 text-amber-600" />
                    Cram Mode
                  </div>
                  {mode === "cram" && <Check className="w-4 h-4 text-amber-600" />}
                </div>
                <p className="text-xs text-neutral-600">
                  Exam is tomorrow/soon: Highest-yield topics, condensed summaries, rapid-fire drills.
                </p>
              </button>
            </div>
          </div>

          {/* Upload Notes / Lecture Slides Section */}
          <div className="pt-2 border-t border-neutral-100">
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-neutral-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-neutral-500" />
                Upload Notes / Lecture Material (Optional)
              </label>
              {notesFileName && (
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {notesFileName}
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-500 mb-2.5">
              Study Buddy will base all quizzes, flashcards, and checks directly on this material, and flag if anything in your notes looks inaccurate or contradictory.
            </p>

            {/* File drop / select button */}
            <div className="mb-2.5 flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-xs font-medium text-neutral-700 transition">
                <Upload className="w-3.5 h-3.5 text-neutral-500" />
                <span>Upload .txt or .md file</span>
                <input
                  type="file"
                  accept=".txt,.md,.text"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {notesContext && (
                <button
                  type="button"
                  onClick={() => {
                    setNotesContext("");
                    setNotesFileName("");
                  }}
                  className="text-xs text-red-600 hover:underline"
                >
                  Clear notes
                </button>
              )}
            </div>

            {/* Paste Area */}
            <textarea
              rows={5}
              value={notesContext}
              onChange={(e) => setNotesContext(e.target.value)}
              placeholder="Or paste your lecture notes, textbook summary, study guide, or key formulas here..."
              className="w-full p-3 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-neutral-800 text-xs font-mono leading-relaxed placeholder-neutral-400 transition"
            />
            <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-1">
              <span>{notesContext.length} characters</span>
              <span className="text-neutral-500 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                AI checks uploaded notes for factual accuracy
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-100 flex items-center justify-end gap-2.5 bg-neutral-50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-white text-xs font-medium transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition"
          >
            Save Context
          </button>
        </div>
      </div>
    </div>
  );
};
