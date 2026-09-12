import React, { useState, useEffect } from "react";
import {
  Brain,
  Sparkles,
  Zap,
  BookOpen,
  HelpCircle,
  Calendar,
  Flame,
  FileText,
  AlertCircle,
  Layers,
  Settings,
  Target,
  Printer,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { StudentProfile, StudyMode } from "../types";

interface HeaderProps {
  profile: StudentProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onToggleMode: (mode: StudyMode) => void;
  onOpenProfile: () => void;
  onOpenExport?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  activeTab,
  setActiveTab,
  onToggleMode,
  onOpenProfile,
  onOpenExport,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const weakSpotCount = profile.weakSpots.filter((w) => !w.mastered).length;

  // Close mobile menu when active tab changes or on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const tabs = [
    { id: "chat", label: "Study Chat", icon: Brain, badge: null, desc: "Interactive tutoring & step-by-step guidance" },
    { id: "flashcards", label: "Flashcards", icon: Layers, badge: null, desc: "Leitner 3-box spaced repetition" },
    { id: "quiz", label: "Active Recall Quiz", icon: HelpCircle, badge: null, desc: "Test memory retrieval without hints" },
    { id: "explain", label: "Explain It Back", icon: Sparkles, badge: "New", desc: "Feynman technique concept evaluation" },
    { id: "plan", label: "Study Plan", icon: Calendar, badge: null, desc: "Personalized schedule & timeline" },
    {
      id: "weakspots",
      label: "Weak Spots",
      icon: AlertCircle,
      badge: weakSpotCount > 0 ? `${weakSpotCount}` : null,
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      desc: "Targeted error analysis & focus areas",
    },
  ];

  const activeTabItem = tabs.find((t) => t.id === activeTab) || tabs[0];
  const ActiveIcon = activeTabItem.icon;

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#faf9f6]/95 backdrop-blur-md border-b border-neutral-200/80 transition-colors">
      {/* Top Banner with Context & Adaptive Controls */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 text-sm">
        {/* Left: Logo & Mobile Active Tab Pill */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-tr from-amber-500 via-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-xs shrink-0 ring-1 ring-black/5">
            <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-neutral-900 tracking-tight text-sm sm:text-base font-serif">
                Study Buddy
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200/60 hidden xs:inline">
                AI Tutor
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 hidden sm:block truncate">
              Deep understanding • Active recall • Spaced repetition
            </p>
          </div>
        </div>

        {/* Center: Context Summary Button (Compact on small mobile) */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-700 hover:text-neutral-900 transition shadow-xs text-xs group max-w-[130px] xs:max-w-[180px] sm:max-w-[240px] md:max-w-[320px] shrink cursor-pointer"
          title="Click to change subject, level, exam date, or uploaded notes"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform shrink-0" />
          <span className="font-medium truncate text-left">
            {profile.subject || "Set Subject"}
          </span>
          <span className="text-neutral-300 hidden sm:inline">|</span>
          <span className="text-neutral-500 hidden md:inline truncate">{profile.level}</span>
          {profile.notesFileName && (
            <span className="hidden lg:inline-flex items-center gap-1 text-[10px] bg-teal-50 text-teal-700 px-1 py-0.2 rounded border border-teal-200/60 shrink-0">
              <FileText className="w-2.5 h-2.5" />
              Notes
            </span>
          )}
          <Settings className="w-3 h-3 text-neutral-400 group-hover:rotate-45 transition-transform shrink-0" />
        </button>

        {/* Right: Controls & Hamburger Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mode Switcher (Desktop / Tablet) */}
          <div className="hidden sm:flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200 text-xs">
            <button
              onClick={() => onToggleMode("mastery")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                profile.mode === "mastery"
                  ? "bg-white text-emerald-900 shadow-xs border border-neutral-200/60"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
              title="Mastery Mode: Deep conceptual dives, analogies, long-term retention"
            >
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mastery</span>
            </button>
            <button
              onClick={() => onToggleMode("cram")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                profile.mode === "cram"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
              title="Cram Mode: High-yield facts and rapid fire review"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Cram</span>
            </button>
          </div>

          {/* Streak Indicator */}
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold"
            title="Daily study consistency streak"
          >
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            <span>{profile.streakDays}d</span>
          </div>

          {/* Export & Print Button (Desktop) */}
          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 text-xs font-semibold transition shadow-xs cursor-pointer group"
              title="Export study session summary & key flashcards to printer-friendly format"
            >
              <Printer className="w-3.5 h-3.5 text-neutral-500 group-hover:text-amber-600 transition-colors" />
              <span className="hidden md:inline">Export & Print</span>
            </button>
          )}

          {/* Collapsible Hamburger Menu Button for Mobile (< md) */}
          <button
            id="mobile-nav-toggle"
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden flex items-center justify-center p-2 rounded-xl border transition-all cursor-pointer min-w-[40px] min-h-[40px] ${
              isMobileMenuOpen
                ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                : "bg-white hover:bg-neutral-100 text-neutral-700 border-neutral-300 shadow-2xs"
            }`}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-4 h-4 text-white" />
            ) : (
              <div className="relative flex items-center justify-center">
                <Menu className="w-4 h-4" />
                {weakSpotCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
                )}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Desktop Navigation Tabs Bar (Visible on md and up) */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex space-x-1 overflow-x-auto no-scrollbar py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold whitespace-nowrap rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? "bg-neutral-900 text-white shadow-xs"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-neutral-500"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full border font-bold ${
                      tab.badgeColor ||
                      (isActive
                        ? "bg-neutral-800 text-amber-300 border-neutral-700"
                        : "bg-neutral-200 text-neutral-700 border-neutral-300")
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Collapsible Navigation Menu Drawer (< md) */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white/98 backdrop-blur-lg shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-3">
            {/* Quick Status / Mode in Mobile Menu */}
            <div className="flex items-center justify-between pb-2.5 border-b border-neutral-100 gap-2">
              <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                <span className="font-semibold text-neutral-900">Active View:</span>
                <span className="font-medium text-amber-700 flex items-center gap-1">
                  <ActiveIcon className="w-3.5 h-3.5" />
                  {activeTabItem.label}
                </span>
              </div>

              {/* Mobile Mode Switcher */}
              <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200 text-xs">
                <button
                  onClick={() => onToggleMode("mastery")}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                    profile.mode === "mastery"
                      ? "bg-white text-emerald-900 shadow-2xs font-semibold"
                      : "text-neutral-600"
                  }`}
                >
                  🎯 Mastery
                </button>
                <button
                  onClick={() => onToggleMode("cram")}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                    profile.mode === "cram"
                      ? "bg-amber-600 text-white shadow-2xs font-semibold"
                      : "text-neutral-600"
                  }`}
                >
                  ⚡ Cram
                </button>
              </div>
            </div>

            {/* Navigation Tab Links (Large 44px+ touch targets) */}
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleSelectTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-colors cursor-pointer min-h-[44px] ${
                      isActive
                        ? "bg-neutral-900 text-white font-semibold shadow-xs"
                        : "text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isActive
                            ? "bg-neutral-800 text-amber-400"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm leading-tight flex items-center gap-2">
                          <span>{tab.label}</span>
                          {tab.badge && (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full border font-bold ${
                                tab.badgeColor ||
                                (isActive
                                  ? "bg-neutral-800 text-amber-300 border-neutral-700"
                                  : "bg-amber-100 text-amber-800 border-amber-200")
                              }`}
                            >
                              {tab.badge}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-[11px] mt-0.5 line-clamp-1 ${
                            isActive ? "text-neutral-300" : "text-neutral-500"
                          }`}
                        >
                          {tab.desc}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-amber-400" : "text-neutral-400"
                      }`}
                    />
                  </button>
                );
              })}
            </nav>

            {/* Bottom Actions for Mobile */}
            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  onOpenProfile();
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 py-2 px-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-xs font-semibold text-neutral-700 flex items-center justify-center gap-1.5 transition cursor-pointer min-h-[40px]"
              >
                <Settings className="w-3.5 h-3.5 text-neutral-500" />
                <span>Subject & Syllabus</span>
              </button>

              {onOpenExport && (
                <button
                  onClick={() => {
                    onOpenExport();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-semibold text-amber-900 flex items-center justify-center gap-1.5 transition cursor-pointer min-h-[40px]"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-600" />
                  <span>Export & Print</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
