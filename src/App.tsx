import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { ProfileModal } from "./components/ProfileModal";
import { ChatView } from "./components/ChatView";
import { FlashcardsView } from "./components/FlashcardsView";
import { QuizView } from "./components/QuizView";
import { ExplainBackView } from "./components/ExplainBackView";
import { StudyPlanView } from "./components/StudyPlanView";
import { WeakSpotsView } from "./components/WeakSpotsView";
import { ExportModal } from "./components/ExportModal";
import { initialProfile, defaultFlashcards } from "./data/defaultData";
import { ChatMessage, Flashcard, StudentProfile, StudyMode, WeakSpot } from "./types";

export default function App() {
  // Load profile from localStorage or fallback
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem("study_buddy_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved profile", e);
      }
    }
    return initialProfile;
  });

  // Load flashcards
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem("study_buddy_flashcards");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved flashcards", e);
      }
    }
    return defaultFlashcards;
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportCardFilter, setExportCardFilter] = useState<"all" | "need-review" | "mastered">("all");

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("study_buddy_messages");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved messages", e);
      }
    }
    return [
      {
        id: "msg-init-1",
        role: "assistant",
        content: `👋 Hi! I'm your **Study Buddy**. I'm here to help you truly learn, retain information long-term for your exams, and stay motivated — not just give you answers!

We're currently focusing on **${initialProfile.subject}** (${initialProfile.level}, ${initialProfile.deadline}).

Here's how we can work together:
- **Active Recall**: Test yourself with quick check questions before looking at notes.
- **Analogies & Clear Explanations**: Simple language first, adding depth when you ask.
- **Explain It Back**: Teach a concept back to me, and I'll confirm what you got right and gently point out any gaps.

How can I help you start today? You can choose one of the starters below or ask anything!`,
        timestamp: "Just now",
      },
    ];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persistence to localStorage
  useEffect(() => {
    localStorage.setItem("study_buddy_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("study_buddy_flashcards", JSON.stringify(flashcards));
  }, [flashcards]);

  useEffect(() => {
    localStorage.setItem("study_buddy_messages", JSON.stringify(messages));
  }, [messages]);

  // Show transient toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Toggle study mode (Mastery vs Cram)
  const handleToggleMode = (newMode: StudyMode) => {
    setProfile((prev) => ({ ...prev, mode: newMode }));
    showToast(
      newMode === "cram"
        ? "⚡ Cram Mode activated: Prioritizing high-yield summaries & rapid-fire quizzes!"
        : "🎯 Mastery Mode activated: Prioritizing deep understanding, analogies, and connections!"
    );
  };

  // Save profile updates
  const handleSaveProfile = (updated: Partial<StudentProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
    showToast("Study context updated successfully!");
  };

  // Add Weak Spot
  const handleAddWeakSpot = (topic: string, reason: string) => {
    const existing = profile.weakSpots.find((w) => w.topic.toLowerCase() === topic.toLowerCase());
    if (existing) {
      const updated = profile.weakSpots.map((w) =>
        w.id === existing.id ? { ...w, repetitionCount: w.repetitionCount + 1, mastered: false } : w
      );
      setProfile((prev) => ({ ...prev, weakSpots: updated }));
      showToast(`Re-flagged "${topic}" in your Weak Spots tracker.`);
    } else {
      const newSpot: WeakSpot = {
        id: `ws-${Date.now()}`,
        topic,
        identifiedReason: reason,
        repetitionCount: 1,
        lastTestedDate: "Today",
        mastered: false,
      };
      setProfile((prev) => ({ ...prev, weakSpots: [newSpot, ...prev.weakSpots] }));
      showToast(`Added "${topic}" to Weak Spots tracker.`);
    }
  };

  // Mark Weak Spot as Mastered
  const handleMarkWeakSpotMastered = (topic: string) => {
    const updated = profile.weakSpots.map((w) =>
      w.topic.toLowerCase().includes(topic.toLowerCase()) || topic.toLowerCase().includes(w.topic.toLowerCase())
        ? { ...w, mastered: true }
        : w
    );
    setProfile((prev) => ({ ...prev, weakSpots: updated }));
  };

  // Update weak spots directly
  const handleUpdateWeakSpots = (spots: WeakSpot[]) => {
    setProfile((prev) => ({ ...prev, weakSpots: spots }));
  };

  // Flashcards updates
  const handleUpdateFlashcard = (updated: Flashcard) => {
    setFlashcards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleAddFlashcards = (newCards: Flashcard[]) => {
    setFlashcards((prev) => [...prev, ...newCards]);
    showToast(`Added ${newCards.length} flashcards to your deck!`);
  };

  // Chat message sending with Server-Sent Events (SSE) streaming
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    const assistantMsgId = `ast-${Date.now()}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isStreaming: true,
    };

    // Optimistically add assistant placeholder
    setMessages([...newHistory, initialAssistantMsg]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          context: {
            subject: profile.subject,
            level: profile.level,
            deadline: profile.deadline,
            mode: profile.mode,
            weakSpots: profile.weakSpots.filter((w) => !w.mastered).map((w) => w.topic),
            notesContext: profile.notesContext,
          },
        }),
      });

      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `HTTP error ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulatedText = "";
      let streamHasError = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (dataStr === "[DONE]") continue;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulatedText += parsed.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, content: accumulatedText, isStreaming: true } : m
                  )
                );
              } else if (parsed.error) {
                streamHasError = true;
                accumulatedText = `⚠️ **Connection Note**: ${parsed.error}`;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, content: accumulatedText, isStreaming: false, isError: true } : m
                  )
                );
              }
            } catch {
              // Non-JSON line or keepalive
            }
          }
        }
      }

      // If accumulated text is empty or blank, provide clear fallback
      if (!accumulatedText.trim()) {
        accumulatedText = "I'm right here! It looks like there was a momentary network pause while generating the answer. Please try asking again or click one of the quick starters below.";
        streamHasError = true;
      }

      // Mark streaming as done
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId ? { ...m, content: accumulatedText, isStreaming: false, isError: streamHasError } : m
        )
      );
    } catch (err: any) {
      console.error("Chat request failed:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content:
                  "I had a slight hiccup connecting to the tutor engine. Please check your connection and click retry!",
                isStreaming: false,
                isError: true,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-neutral-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Top Header */}
      <Header
        profile={profile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onToggleMode={handleToggleMode}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenExport={() => {
          setExportCardFilter("all");
          setIsExportModalOpen(true);
        }}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col">
        {activeTab === "chat" && (
          <ChatView
            profile={profile}
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onSelectTab={setActiveTab}
            onAddWeakSpot={handleAddWeakSpot}
            onCreateFlashcardsFromTopic={(topic) => {
              setActiveTab("flashcards");
            }}
            onStartQuizOnTopic={(topic) => {
              setActiveTab("quiz");
            }}
            onUploadNotes={(text, fileName) => {
              handleSaveProfile({
                ...profile,
                notesContext: text,
                notesFileName: fileName,
              });
            }}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onOpenExport={() => {
              setExportCardFilter("all");
              setIsExportModalOpen(true);
            }}
          />
        )}

        {activeTab === "flashcards" && (
          <FlashcardsView
            profile={profile}
            flashcards={flashcards}
            onUpdateFlashcard={handleUpdateFlashcard}
            onAddFlashcards={handleAddFlashcards}
            onOpenExport={() => {
              setExportCardFilter("all");
              setIsExportModalOpen(true);
            }}
          />
        )}

        {activeTab === "quiz" && (
          <QuizView
            profile={profile}
            onAddWeakSpot={handleAddWeakSpot}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === "explain" && (
          <ExplainBackView
            profile={profile}
            onAddWeakSpot={handleAddWeakSpot}
            onMarkWeakSpotMastered={handleMarkWeakSpotMastered}
            onSendMessageInChat={handleSendMessage}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === "plan" && (
          <StudyPlanView
            profile={profile}
            onUpdateCompletedCount={(count) =>
              setProfile((prev) => ({ ...prev, completedTasksCount: count }))
            }
            onSendMessageInChat={handleSendMessage}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === "weakspots" && (
          <WeakSpotsView
            profile={profile}
            onUpdateWeakSpots={handleUpdateWeakSpots}
            onSendMessageInChat={handleSendMessage}
            onSelectTab={setActiveTab}
          />
        )}
      </main>

      {/* Context Setup Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />

      {/* Offline Export & Printable Study Sheet Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        profile={profile}
        flashcards={flashcards}
        messages={messages}
        defaultFlashcardFilter={exportCardFilter}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-neutral-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg border border-neutral-700 animate-in fade-in slide-in-from-bottom-2 flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
