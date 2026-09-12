import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  Send,
  Brain,
  Sparkles,
  HelpCircle,
  Layers,
  ArrowRight,
  RefreshCw,
  FileText,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  HeartHandshake,
  MessageSquare,
  Paperclip,
  Upload,
  Check,
  BookOpen,
  Printer,
} from "lucide-react";
import { ChatMessage, StudentProfile } from "../types";

interface ChatViewProps {
  profile: StudentProfile;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onSelectTab: (tab: string) => void;
  onAddWeakSpot: (topic: string, reason: string) => void;
  onCreateFlashcardsFromTopic: (topic: string) => void;
  onStartQuizOnTopic: (topic: string) => void;
  onUploadNotes?: (text: string, fileName: string) => void;
  onOpenProfile?: () => void;
  onOpenExport?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  profile,
  messages,
  onSendMessage,
  isLoading,
  onSelectTab,
  onAddWeakSpot,
  onCreateFlashcardsFromTopic,
  onStartQuizOnTopic,
  onUploadNotes,
  onOpenProfile,
  onOpenExport,
}) => {
  const [inputText, setInputText] = useState("");
  const [quickAnswerText, setQuickAnswerText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText);
    setInputText("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text && onUploadNotes) {
        onUploadNotes(text, file.name);
        onSendMessage(
          `I just attached my notes/material ("${file.name}"). Please ground all explanations, flashcards, and quizzes strictly on this material, and flag if anything in it seems incorrect or unclear!`
        );
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleStarterClick = (starterPrompt: string) => {
    // Fill in subject if placeholder is present
    const prompt = starterPrompt
      .replace("[topic]", profile.subject || "this topic")
      .replace("[concept]", profile.subject ? `the core principles of ${profile.subject}` : "this concept")
      .replace("[subject]", profile.subject || "my course");
    onSendMessage(prompt);
  };

  // Helper to extract Quick Check from message if present
  const extractQuickCheck = (content: string) => {
    const match = content.match(
      /(?:🎯\s*(?:Quick check|Check question|Test your understanding)[^\n]*|Does that (?:step-by-step logic|explanation)?\s*make sense\?)/i
    );
    return match ? match[0] : null;
  };

  const starterOptions = [
    {
      title: "Direct Answer & Steps",
      prompt: `What is the direct answer for ${profile.subject ? `the key problems in ${profile.subject}` : "this topic"}? Give the answer first, paired with step-by-step logic in plain everyday language and a quick check.`,
      desc: "Direct answer + step-by-step logic + quick check",
      icon: CheckCircle2,
      color: "bg-amber-50 text-amber-800 border-amber-200",
    },
    {
      title: "Plain Language & Analogy",
      prompt: `Explain ${profile.subject ? `core ideas of ${profile.subject}` : "this concept"} like I'm a beginner with a simple everyday analogy. Define any technical terms in one simple sentence.`,
      desc: "Everyday language first, zero unnecessary jargon",
      icon: Lightbulb,
      color: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
    {
      title: "Active Quiz",
      prompt: `Quiz me on ${profile.subject || "key concepts"} with active recall`,
      desc: "Test what you know before reviewing",
      icon: HelpCircle,
      color: "bg-teal-50 text-teal-800 border-teal-200",
    },
    {
      title: "Audit Uploaded Material",
      prompt: "Please audit my uploaded material: check if anything seems factually incorrect, contradictory, or unclear, and clarify the accurate facts.",
      desc: "AI fact-check on your notes & slides",
      icon: FileText,
      color: "bg-sky-50 text-sky-800 border-sky-200",
    },
    {
      title: "CBSE / NCERT Board Format",
      prompt: `Give the CBSE / NCERT board exam answer for ${profile.subject ? profile.subject : "this topic"}: point-wise structure with keywords bolded, formulas/derivations, clear step-by-step logic, and a quick check.`,
      desc: "High-scoring point-wise board exam format",
      icon: BookOpen,
      color: "bg-orange-50 text-orange-800 border-orange-200",
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-105px)] max-w-5xl mx-auto w-full px-3 sm:px-6 py-3">
      {/* Top Notification Bar: Notes Grounding Status */}
      {profile.notesContext ? (
        <div className="mb-2 px-3.5 py-2 rounded-xl bg-teal-50/90 border border-teal-200 text-teal-900 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 truncate">
            <FileText className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="font-medium truncate">
              Grounded in uploaded material:{" "}
              <span className="font-semibold underline decoration-teal-300">
                {profile.notesFileName || "Custom Notes/Excerpt"}
              </span>{" "}
              <span className="text-teal-700 text-[11px] hidden sm:inline">(AI actively auditing for mistakes)</span>
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <button
              onClick={() =>
                onSendMessage(
                  "Please review my uploaded notes: flag any mistakes, contradictions, or key omissions, and explain the correct principles!"
                )
              }
              className="text-[11px] font-semibold bg-teal-100/80 hover:bg-teal-200/90 text-teal-900 px-2 py-1 rounded-md transition cursor-pointer"
            >
              🔍 Audit Notes
            </button>
            {onOpenProfile && (
              <button
                onClick={onOpenProfile}
                className="text-[11px] text-teal-700 hover:text-teal-900 hover:underline cursor-pointer"
              >
                Change / Add
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-1.5 px-3 py-1.5 rounded-lg bg-neutral-100/70 border border-neutral-200 text-neutral-600 text-[11px] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            Tip: Upload slides, notes, or textbook excerpts to ground answers directly in your class material.
          </span>
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="text-[11px] font-medium text-neutral-800 hover:underline flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
            >
              <Upload className="w-3 h-3" />
              Upload Material
            </button>
          )}
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scroll-smooth">
        {/* If no user messages yet, show welcome & interactive starters */}
        {messages.length === 0 ? (
          <div className="py-6 sm:py-10 max-w-2xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-100/70 border border-amber-200/80 text-amber-800 shadow-xs">
              <Brain className="w-8 h-8 text-amber-600" />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 tracking-tight">
                Hey! I'm your Study Buddy.
              </h1>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed max-w-lg mx-auto">
                I won't just give you quick answers — I'm here to help you understand deeply, retain for your exam, and stay confident.
              </p>
            </div>

            {/* Quick Context Prompt */}
            <div className="bg-white p-4 rounded-xl border border-neutral-200 text-left shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase text-neutral-500">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                Current Study Context
              </div>
              <div className="text-xs text-neutral-700 flex flex-wrap gap-2">
                <span className="px-2 py-0.5 rounded bg-neutral-100 font-medium">
                  Subject: {profile.subject}
                </span>
                <span className="px-2 py-0.5 rounded bg-neutral-100 font-medium">
                  Level: {profile.level}
                </span>
                <span className="px-2 py-0.5 rounded bg-neutral-100 font-medium">
                  Strategy: {profile.mode === "cram" ? "⚡ Cram Mode" : "🎯 Mastery Mode"}
                </span>
              </div>
            </div>

            {/* Example Starters Grid */}
            <div className="space-y-2 pt-2">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                What do you want to tackle first?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                {starterOptions.map((opt, idx) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleStarterClick(opt.prompt)}
                      className="p-3 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50 transition flex items-start gap-3 text-left group shadow-xs"
                    >
                      <div className={`p-2 rounded-lg ${opt.color} shrink-0 mt-0.5`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-neutral-900 text-xs flex items-center justify-between">
                          {opt.title}
                          <ArrowRight className="w-3 h-3 text-neutral-300 group-hover:text-neutral-600 group-hover:translate-x-0.5 transition" />
                        </div>
                        <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isBuddy = msg.role === "assistant";
            const quickCheck = isBuddy ? extractQuickCheck(msg.content) : null;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-sm ${isBuddy ? "justify-start" : "justify-end"}`}
              >
                {/* Buddy Avatar */}
                {isBuddy && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Brain className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3 shadow-xs ${
                    isBuddy
                      ? "bg-white border border-neutral-200/90 text-neutral-800"
                      : "bg-neutral-900 text-white"
                  }`}
                >
                  {/* Sender Header */}
                  <div className="flex items-center justify-between gap-2 mb-1.5 text-[11px]">
                    <span className={`font-semibold ${isBuddy ? "text-neutral-900" : "text-neutral-200"}`}>
                      {isBuddy ? "Study Buddy" : "You"}
                    </span>
                    <span className={`${isBuddy ? "text-neutral-400" : "text-neutral-400"} text-[10px]`}>
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Markdown Content */}
                  <div className={`prose prose-sm max-w-none leading-relaxed ${isBuddy ? "prose-neutral" : "prose-invert"}`}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>

                  {/* Error recovery button */}
                  {isBuddy && msg.isError && (
                    <div className="mt-2.5 pt-2 border-t border-red-100 flex items-center justify-between text-xs">
                      <span className="text-red-600 font-medium text-[11px]">Encountered a hiccup</span>
                      <button
                        onClick={() => {
                          const lastUser = [...messages].reverse().find((m) => m.role === "user");
                          if (lastUser) {
                            onSendMessage(lastUser.content);
                          }
                        }}
                        className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-md border border-red-200 transition font-medium text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Retry
                      </button>
                    </div>
                  )}

                  {/* Dedicated Quick Understanding Check box */}
                  {isBuddy && !msg.isStreaming && !msg.isError && (
                    <div className="mt-3 pt-2.5 border-t border-neutral-100 bg-amber-50/50 -mx-4 -mb-3 px-4 py-2.5 rounded-b-2xl border-dashed">
                      <div className="flex items-center justify-between gap-1.5 text-xs font-semibold text-amber-900 mb-2">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                          Quick Understanding Check
                        </span>
                        <span className="text-[10px] text-amber-700 font-normal">Confirm you follow the logic</span>
                      </div>

                      {/* Interactive 1-click pills */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <button
                          onClick={() => onSendMessage("Yes, that step-by-step explanation makes complete sense! What's the next key concept?")}
                          className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 hover:bg-amber-100/70 text-amber-900 text-xs font-medium transition flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3 text-emerald-600" />
                          Makes sense! Next concept →
                        </button>
                        <button
                          onClick={() => onSendMessage("Can you break that last step down even further with an everyday example?")}
                          className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 hover:bg-amber-100/70 text-amber-900 text-xs font-medium transition cursor-pointer"
                        >
                          🔍 Break down steps further
                        </button>
                        <button
                          onClick={() => onSendMessage("Give me a quick follow-up question to test if I really understood it!")}
                          className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 hover:bg-amber-100/70 text-amber-900 text-xs font-medium transition cursor-pointer"
                        >
                          ❓ Test me with a check question
                        </button>
                      </div>

                      {/* Custom answer input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Or type your response or question to confirm understanding..."
                          value={quickAnswerText}
                          onChange={(e) => setQuickAnswerText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && quickAnswerText.trim() && !isLoading) {
                              onSendMessage(`My answer / response: "${quickAnswerText.trim()}"`);
                              setQuickAnswerText("");
                            }
                          }}
                          className="flex-1 px-2.5 py-1.5 bg-white rounded-lg border border-amber-200 text-xs text-neutral-800 outline-none focus:ring-1 focus:ring-amber-500"
                        />
                        <button
                          onClick={() => {
                            if (quickAnswerText.trim() && !isLoading) {
                              onSendMessage(`My answer / response: "${quickAnswerText.trim()}"`);
                              setQuickAnswerText("");
                            }
                          }}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition shrink-0 cursor-pointer"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Assistant Follow-up Action Shortcuts */}
                  {isBuddy && !msg.isStreaming && !msg.isError && (
                    <div className="mt-3 pt-2 border-t border-neutral-100 flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-600">
                      <span className="text-neutral-400 font-medium">Quick actions:</span>
                      <button
                        onClick={() => onSendMessage("Give me the direct answer and full breakdown for this.")}
                        className="px-2 py-0.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium transition"
                      >
                        🎯 Direct answer
                      </button>
                      <button
                        onClick={() => onSendMessage("Can you give me a simple real-world analogy for that?")}
                        className="px-2 py-0.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition"
                      >
                        💡 Give me an analogy
                      </button>
                      <button
                        onClick={() => onSendMessage("Now quiz me on this to test my active recall!")}
                        className="px-2 py-0.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition"
                      >
                        ❓ Quiz me on this
                      </button>
                      <button
                        onClick={() => onSelectTab("explain")}
                        className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 transition border border-purple-200/50"
                      >
                        ✨ Let me explain it back
                      </button>
                      <button
                        onClick={() => {
                          const topic = profile.subject || "this concept";
                          onAddWeakSpot(topic, "Marked for spaced repetition review from chat");
                        }}
                        className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 hover:bg-amber-100 transition border border-amber-200/50"
                        title="Save to Weak Spots for spaced repetition"
                      >
                        📌 Flag as weak spot
                      </button>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {!isBuddy && (
                  <div className="w-8 h-8 rounded-xl bg-neutral-200 text-neutral-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    ME
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading / Streaming Skeleton */}
        {isLoading && (
          <div className="flex gap-3 text-sm justify-start items-center">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-600 text-white flex items-center justify-center shrink-0 animate-pulse">
              <Brain className="w-4 h-4" />
            </div>
            <div className="bg-white border border-neutral-200 rounded-2xl px-4 py-3 text-neutral-500 flex items-center gap-2 shadow-xs">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
              <span className="text-xs">Study Buddy is thinking & formulating guidance...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Starters Bar (sticky above input) */}
      <div className="pt-2 pb-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
        <button
          onClick={() => onSendMessage("Give me the direct answer and full step-by-step explanation for this.")}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 shrink-0 transition font-medium cursor-pointer"
        >
          <CheckCircle2 className="w-3 h-3 text-amber-600" />
          Direct answer + steps
        </button>
        <button
          onClick={() => onSendMessage("Use plain everyday language with a simple analogy and define any technical terms in one simple sentence.")}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 shrink-0 transition font-medium cursor-pointer"
        >
          <Lightbulb className="w-3 h-3 text-emerald-600" />
          Plain language & analogy
        </button>
        <button
          onClick={() => onSendMessage("Give the answer in CBSE / NCERT board exam format: point-wise points with keywords bolded, formulas/derivations if applicable, step-by-step logic, and a quick check.")}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 text-orange-900 border border-orange-200 hover:bg-orange-100 shrink-0 transition font-medium cursor-pointer"
        >
          <BookOpen className="w-3 h-3 text-orange-600" />
          CBSE / NCERT Board Format
        </button>
        {profile.notesContext && (
          <button
            onClick={() => onSendMessage("Check my uploaded material for any inaccuracies, confusion, or misconceptions.")}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 shrink-0 transition font-medium cursor-pointer"
          >
            <FileText className="w-3 h-3 text-teal-600" />
            Check notes for errors
          </button>
        )}
        <button
          onClick={() => onSendMessage("Quiz me on my weak spots using spaced repetition")}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200 hover:bg-neutral-200 shrink-0 transition cursor-pointer"
        >
          <HelpCircle className="w-3 h-3 text-neutral-600" />
          Quiz my weak spots
        </button>
        {onOpenExport && (
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 shrink-0 transition font-medium cursor-pointer"
            title="Export this study session to a printer-friendly format for offline review"
          >
            <Printer className="w-3 h-3 text-amber-600" />
            Export & Print Sheet
          </button>
        )}
      </div>

      {/* Input Form with File Attachment */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center bg-white rounded-2xl border border-neutral-300 shadow-sm focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-200 transition px-1"
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.text,.pdf,.docx,.doc"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 text-neutral-400 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition shrink-0 cursor-pointer"
          title="Attach notes, lecture slides, or textbook excerpt (.txt, .md, etc.)"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <textarea
          rows={1}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder={`Ask anything, attach notes, or say "Explain [concept] step-by-step"...`}
          className="w-full px-2 py-3 text-sm text-neutral-800 placeholder-neutral-400 bg-transparent outline-none resize-none max-h-32"
        />

        <div className="flex items-center pr-2 gap-1">
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-neutral-900 text-white transition shadow-xs cursor-pointer"
            title="Send message (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
