import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  Calendar,
  CheckSquare,
  Square,
  Clock,
  Coffee,
  Sparkles,
  RefreshCw,
  Award,
  BookOpen,
  ArrowRight,
  Flame,
  Zap,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  Target,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { StudyPlan, StudentProfile } from "../types";

interface StudyPlanViewProps {
  profile: StudentProfile;
  onUpdateCompletedCount: (count: number) => void;
  onSendMessageInChat: (text: string) => void;
  onSelectTab: (tab: string) => void;
}

const defaultInitialPlan: StudyPlan = {
  title: "Cellular Respiration & Bioenergetics Mastery Plan",
  summary: "A balanced 3-day structured roadmap prioritizing active recall, spaced repetition on weak spots, and realistic rest intervals.",
  totalDays: 3,
  dailyTargetHours: 2,
  days: [
    {
      dayNumber: 1,
      dayTitle: "Glycolysis & Pyruvate Oxidation Fundamentals",
      focusArea: "High-yield pathway steps, net ATP vs gross ATP, and cytoplasm vs matrix geography.",
      estimatedMinutes: 110,
      tasks: [
        {
          id: "task-1-1",
          text: "Review Glycolysis steps (Energy Investment vs Payoff phase) & definition list",
          type: "study",
          durationMin: 30,
          completed: true,
        },
        {
          id: "task-1-2",
          text: "Active recall check: Explain why 2 ATP are invested to get 4 ATP out",
          type: "recall",
          durationMin: 15,
          completed: true,
        },
        {
          id: "task-1-3",
          text: "Short restorative break: Hydrate and walk away from screen",
          type: "break",
          durationMin: 10,
          completed: true,
        },
        {
          id: "task-1-4",
          text: "Pyruvate Oxidation & Acetyl-CoA formation drill (10 flashcards)",
          type: "quiz",
          durationMin: 25,
          completed: false,
        },
        {
          id: "task-1-5",
          text: "Quick self-quiz: 5 practice multiple-choice questions on Day 1 concepts",
          type: "quiz",
          durationMin: 30,
          completed: false,
        },
      ],
      recommendedBreak: "10-minute stretch & water break after session 2",
    },
    {
      dayNumber: 2,
      dayTitle: "Krebs Cycle & Electron Transport Chain Mechanics",
      focusArea: "Mitochondrial matrix reactions, electron carriers (NADH, FADH2), and complexes I-IV.",
      estimatedMinutes: 120,
      tasks: [
        {
          id: "task-2-1",
          text: "Krebs Cycle pathway map: Inputs, turns per glucose, and carbon releases as CO2",
          type: "study",
          durationMin: 35,
          completed: false,
        },
        {
          id: "task-2-2",
          text: "5-min Pomodoro recharge break",
          type: "break",
          durationMin: 5,
          completed: false,
        },
        {
          id: "task-2-3",
          text: "Explain it Back: Teach the proton motive force and ATP synthase mechanism to Study Buddy",
          type: "recall",
          durationMin: 25,
          completed: false,
        },
        {
          id: "task-2-4",
          text: "Weak Spots drill: Spaced repetition on proton concentration gradient differences",
          type: "quiz",
          durationMin: 30,
          completed: false,
        },
        {
          id: "task-2-5",
          text: "Card review: Complete Box 1 flashcard review deck",
          type: "review",
          durationMin: 25,
          completed: false,
        },
      ],
      recommendedBreak: "15-minute healthy snack & eye rest break",
    },
    {
      dayNumber: 3,
      dayTitle: "Full Exam Simulation & Weak Spot Buffer",
      focusArea: "Comprehensive synthesis, time-pressured practice questions, and confident consolidation.",
      estimatedMinutes: 90,
      tasks: [
        {
          id: "task-3-1",
          text: "Rapid-fire 15-question cumulative practice quiz across all chapters",
          type: "quiz",
          durationMin: 35,
          completed: false,
        },
        {
          id: "task-3-2",
          text: "10-min relaxation and breathing break",
          type: "break",
          durationMin: 10,
          completed: false,
        },
        {
          id: "task-3-3",
          text: "Target remaining unmastered weak spots with targeted flashcard run",
          type: "review",
          durationMin: 25,
          completed: false,
        },
        {
          id: "task-3-4",
          text: "Final confidence check: Summarize overall respiration equation and net ATP numbers",
          type: "recall",
          durationMin: 20,
          completed: false,
        },
      ],
      recommendedBreak: "Post-study celebration walk — get good rest before exam!",
    },
  ],
  finalTip: "Don't cram late into the night before your exam. Sleep is when your brain transfers active recall memories from the hippocampus into long-term cortical storage!",
};

export const StudyPlanView: React.FC<StudyPlanViewProps> = ({
  profile,
  onUpdateCompletedCount,
  onSendMessageInChat,
  onSelectTab,
}) => {
  const [plan, setPlan] = useState<StudyPlan>(defaultInitialPlan);
  const [isGenerating, setIsGenerating] = useState(false);
  const [targetDeadline, setTargetDeadline] = useState(profile.deadline || "3 days");
  const [dailyHours, setDailyHours] = useState(2);

  // Chart configuration state - defaults to study hours for the Weekly Summary
  const [chartView, setChartView] = useState<"week" | "plan">("week");
  const [chartMetric, setChartMetric] = useState<"hours" | "minutes" | "tasks">("hours");

  const totalTasks = plan.days.reduce((acc, d) => acc + d.tasks.length, 0);
  const completedTasks = plan.days.reduce(
    (acc, d) => acc + d.tasks.filter((t) => t.completed).length,
    0
  );
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Day-by-day plan metrics
  const planDaysData = plan.days.map((day) => {
    const dayTotalTasks = day.tasks.length;
    const dayCompletedTasks = day.tasks.filter((t) => t.completed).length;
    const dayPendingTasks = Math.max(0, dayTotalTasks - dayCompletedTasks);
    const dayTotalMinutes = day.tasks.reduce((acc, t) => acc + (t.durationMin || 0), 0);
    const dayCompletedMinutes = day.tasks
      .filter((t) => t.completed)
      .reduce((acc, t) => acc + (t.durationMin || 0), 0);
    const dayPendingMinutes = Math.max(0, dayTotalMinutes - dayCompletedMinutes);
    const dayCompletedHours = Number((dayCompletedMinutes / 60).toFixed(1));
    const dayTotalHours = Number((dayTotalMinutes / 60).toFixed(1));
    const dayPendingHours = Math.max(0, Number((dayTotalHours - dayCompletedHours).toFixed(1)));
    const rate = dayTotalTasks > 0 ? Math.round((dayCompletedTasks / dayTotalTasks) * 100) : 0;

    let completedVal = dayCompletedHours;
    let pendingVal = dayPendingHours;
    let totalVal = dayTotalHours;
    if (chartMetric === "minutes") {
      completedVal = dayCompletedMinutes;
      pendingVal = dayPendingMinutes;
      totalVal = dayTotalMinutes;
    } else if (chartMetric === "tasks") {
      completedVal = dayCompletedTasks;
      pendingVal = dayPendingTasks;
      totalVal = dayTotalTasks;
    }

    return {
      name: `Day ${day.dayNumber}`,
      fullDay: day.dayTitle,
      completed: completedVal,
      pending: pendingVal,
      total: totalVal,
      completedHours: dayCompletedHours,
      totalHours: dayTotalHours,
      completedTasks: dayCompletedTasks,
      totalTasks: dayTotalTasks,
      completedMinutes: dayCompletedMinutes,
      totalMinutes: dayTotalMinutes,
      completionRate: rate,
      targetHours: Number(dailyHours.toFixed(1)),
    };
  });

  // Calculate 7-day weekly trend (Monday - Sunday) with accurate study hours
  // Integrates live active plan progress into today's (Saturday) and upcoming (Sunday) bars
  const day1CompletedTasks = plan.days[0]?.tasks.filter((t) => t.completed).length ?? 0;
  const day1TotalTasks = plan.days[0]?.tasks.length ?? 0;
  const day1CompletedMin =
    plan.days[0]?.tasks.filter((t) => t.completed).reduce((acc, t) => acc + t.durationMin, 0) ?? 0;
  const day1TotalMin = plan.days[0]?.tasks.reduce((acc, t) => acc + t.durationMin, 0) ?? 0;
  const day1CompletedHours = Number((day1CompletedMin / 60).toFixed(1));

  const day2CompletedTasks = plan.days[1]?.tasks.filter((t) => t.completed).length ?? 0;
  const day2TotalTasks = plan.days[1]?.tasks.length ?? 0;
  const day2CompletedMin =
    plan.days[1]?.tasks.filter((t) => t.completed).reduce((acc, t) => acc + t.durationMin, 0) ?? 0;
  const day2TotalMin = plan.days[1]?.tasks.reduce((acc, t) => acc + t.durationMin, 0) ?? 0;
  const day2CompletedHours = Number((day2CompletedMin / 60).toFixed(1));

  const weeklyTrendData = [
    {
      name: "Mon",
      fullDay: "Monday: Foundational Review",
      completedHours: 1.8,
      targetHours: dailyHours,
      totalHours: dailyHours,
      completedTasks: 4,
      totalTasks: 4,
      completedMinutes: 108,
      totalMinutes: 120,
      completionRate: 90,
    },
    {
      name: "Tue",
      fullDay: "Tuesday: Biochemical Pathways",
      completedHours: 1.5,
      targetHours: dailyHours,
      totalHours: dailyHours,
      completedTasks: 4,
      totalTasks: 5,
      completedMinutes: 90,
      totalMinutes: 120,
      completionRate: 75,
    },
    {
      name: "Wed",
      fullDay: "Wednesday: Active Recall Sprint",
      completedHours: 2.2,
      targetHours: dailyHours,
      totalHours: dailyHours,
      completedTasks: 5,
      totalTasks: 5,
      completedMinutes: 132,
      totalMinutes: 120,
      completionRate: 110,
    },
    {
      name: "Thu",
      fullDay: "Thursday: Weak Spots Drill",
      completedHours: 1.4,
      targetHours: dailyHours,
      totalHours: dailyHours,
      completedTasks: 3,
      totalTasks: 4,
      completedMinutes: 84,
      totalMinutes: 120,
      completionRate: 70,
    },
    {
      name: "Fri",
      fullDay: "Friday: Mechanism Synthesis",
      completedHours: 1.9,
      targetHours: dailyHours,
      totalHours: dailyHours,
      completedTasks: 4,
      totalTasks: 4,
      completedMinutes: 114,
      totalMinutes: 120,
      completionRate: 95,
    },
    {
      name: "Sat (Today)",
      fullDay: plan.days[0]?.dayTitle || "Today's Active Session",
      completedHours: day1CompletedHours,
      targetHours: dailyHours,
      totalHours: dailyHours,
      completedTasks: day1CompletedTasks,
      totalTasks: day1TotalTasks,
      completedMinutes: day1CompletedMin,
      totalMinutes: Math.max(day1TotalMin, dailyHours * 60),
      completionRate:
        dailyHours > 0 ? Math.round((day1CompletedHours / dailyHours) * 100) : 0,
      isToday: true,
    },
    {
      name: "Sun",
      fullDay: plan.days[1]?.dayTitle || "Sunday Upcoming Session",
      completedHours: day2CompletedHours,
      targetHours: dailyHours,
      totalHours: dailyHours,
      completedTasks: day2CompletedTasks,
      totalTasks: day2TotalTasks,
      completedMinutes: day2CompletedMin,
      totalMinutes: Math.max(day2TotalMin, dailyHours * 60),
      completionRate:
        dailyHours > 0 ? Math.round((day2CompletedHours / dailyHours) * 100) : 0,
    },
  ].map((d) => {
    let completedVal = d.completedHours;
    let pendingVal = Math.max(0, Number((d.targetHours - d.completedHours).toFixed(1)));
    let totalVal = d.targetHours;

    if (chartMetric === "minutes") {
      completedVal = d.completedMinutes;
      pendingVal = Math.max(0, d.totalMinutes - d.completedMinutes);
      totalVal = d.totalMinutes;
    } else if (chartMetric === "tasks") {
      completedVal = d.completedTasks;
      pendingVal = Math.max(0, d.totalTasks - d.completedTasks);
      totalVal = d.totalTasks;
    }

    return {
      ...d,
      completed: completedVal,
      pending: pendingVal,
      total: totalVal,
    };
  });

  const activeChartData = chartView === "week" ? weeklyTrendData : planDaysData;

  // Aggregate weekly stats for the past 7 days
  const totalWeeklyStudyHours = Number(
    weeklyTrendData.reduce((acc, d) => acc + d.completedHours, 0).toFixed(1)
  );
  const targetWeeklyStudyHours = Number((dailyHours * 7).toFixed(1));
  const weeklyHoursProgressPct = Math.min(
    100,
    Math.round((totalWeeklyStudyHours / targetWeeklyStudyHours) * 100)
  );
  const averageDailyStudyHours = Number((totalWeeklyStudyHours / 7).toFixed(1));
  const bestStudyDay = [...weeklyTrendData].sort(
    (a, b) => b.completedHours - a.completedHours
  )[0];
  const targetMetDaysCount = weeklyTrendData.filter(
    (d) => d.completedHours >= d.targetHours
  ).length;

  const weekCompletedMins = weeklyTrendData.reduce((acc, d) => acc + d.completedMinutes, 0);
  const weekCompletedTasks = weeklyTrendData.reduce((acc, d) => acc + d.completedTasks, 0);
  const weekTotalTasks = weeklyTrendData.reduce((acc, d) => acc + d.totalTasks, 0);
  const weekOverallRate =
    weekTotalTasks > 0 ? Math.round((weekCompletedTasks / weekTotalTasks) * 100) : 0;

  const handleToggleTask = (dayIdx: number, taskIdx: number) => {
    const updatedDays = [...plan.days];
    const task = updatedDays[dayIdx].tasks[taskIdx];
    const wasCompleted = task.completed;
    task.completed = !wasCompleted;

    setPlan({ ...plan, days: updatedDays });

    const newCompletedTotal = updatedDays.reduce(
      (acc, d) => acc + d.tasks.filter((t) => t.completed).length,
      0
    );
    onUpdateCompletedCount(newCompletedTotal);

    if (!wasCompleted) {
      confetti({ particleCount: 25, spread: 45, origin: { y: 0.8 } });
    }
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: profile.subject,
          deadline: targetDeadline,
          hoursPerDay: dailyHours,
          level: profile.level,
          mode: profile.mode,
          topics: profile.notesContext || profile.subject,
        }),
      });

      const data = await response.json();
      if (data.plan && data.plan.days) {
        setPlan(data.plan);
      }
    } catch (err) {
      console.error("Failed to generate plan:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-6 space-y-6">
      {/* Plan Header */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-100 text-sky-800">
              <Calendar className="w-4 h-4" />
            </span>
            <h2 className="font-serif font-bold text-neutral-900 text-lg">
              {plan.title || "Targeted Study Plan"}
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1 max-w-xl leading-relaxed">
            {plan.summary}
          </p>
        </div>

        {/* Progress Circle & Stats */}
        <div className="flex items-center gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-200/80 shrink-0">
          <div>
            <div className="text-[10px] uppercase font-bold text-neutral-400">Roadmap Progress</div>
            <div className="text-sm font-bold text-neutral-800">
              {completedTasks} / {totalTasks} Tasks ({progressPct}%)
            </div>
          </div>
          <div className="w-10 h-10 rounded-full border-4 border-sky-200 border-t-sky-600 flex items-center justify-center font-bold text-xs text-sky-800">
            {progressPct}%
          </div>
        </div>
      </div>

      {/* Plan Generator Controls */}
      <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-neutral-700">Deadline:</span>
            <input
              type="text"
              value={targetDeadline}
              onChange={(e) => setTargetDeadline(e.target.value)}
              placeholder="e.g. 3 days, Tomorrow, Next Friday"
              className="bg-white px-2.5 py-1.5 rounded-lg border border-neutral-300 text-neutral-800 text-xs w-36 outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-neutral-700">Hours/day:</span>
            <select
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              className="bg-white px-2.5 py-1.5 rounded-lg border border-neutral-300 text-neutral-800 text-xs outline-none"
            >
              <option value={1}>1 hour</option>
              <option value={1.5}>1.5 hours</option>
              <option value={2}>2 hours</option>
              <option value={3}>3 hours</option>
              <option value={4}>4 hours (Intensive)</option>
            </select>
          </div>

          <span className="text-neutral-400 hidden sm:inline">|</span>
          <span className="text-neutral-600">
            Mode: <span className="font-semibold capitalize">{profile.mode}</span>
          </span>
        </div>

        <button
          onClick={handleGeneratePlan}
          disabled={isGenerating}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white font-semibold shadow-xs transition"
        >
          {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          Generate Custom Plan
        </button>
      </div>

      {/* Weekly Summary: Total Study Hours & Consistency (Past 7 Days) */}
      <div id="weekly-summary" className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-5">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
          <div className="flex items-start sm:items-center gap-3">
            <span className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0 mt-0.5 sm:mt-0">
              <BarChart3 className="w-5 h-5 text-emerald-700" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-serif font-bold text-neutral-900 text-lg">
                  Weekly Summary
                </h3>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  Past 7 Days Study Hours
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                  Recharts
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Detailed breakdown of total study hours, daily pacing, and progress toward your weekly target.
              </p>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* View Mode Toggle: Week vs Plan */}
            <div className="flex items-center bg-neutral-100 p-1 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setChartView("week")}
                className={`px-3 py-1 rounded-lg transition ${
                  chartView === "week"
                    ? "bg-white text-neutral-900 shadow-xs font-semibold"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                7-Day Week
              </button>
              <button
                type="button"
                onClick={() => setChartView("plan")}
                className={`px-3 py-1 rounded-lg transition ${
                  chartView === "plan"
                    ? "bg-white text-neutral-900 shadow-xs font-semibold"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                Plan Breakdown
              </button>
            </div>

            {/* Metric Mode Toggle: Hours vs Minutes vs Tasks */}
            <div className="flex items-center bg-neutral-100 p-1 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setChartMetric("hours")}
                className={`px-3 py-1 rounded-lg transition ${
                  chartMetric === "hours"
                    ? "bg-white text-neutral-900 shadow-xs font-semibold"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                Hours (hrs)
              </button>
              <button
                type="button"
                onClick={() => setChartMetric("minutes")}
                className={`px-3 py-1 rounded-lg transition ${
                  chartMetric === "minutes"
                    ? "bg-white text-neutral-900 shadow-xs font-semibold"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                Minutes (mins)
              </button>
              <button
                type="button"
                onClick={() => setChartMetric("tasks")}
                className={`px-3 py-1 rounded-lg transition ${
                  chartMetric === "tasks"
                    ? "bg-white text-neutral-900 shadow-xs font-semibold"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                Tasks
              </button>
            </div>
          </div>
        </div>

        {/* Primary Weekly Total Progress Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">
              Weekly Study Volume
            </span>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl sm:text-4xl font-serif font-bold text-neutral-900">
                {totalWeeklyStudyHours}
              </span>
              <span className="text-sm sm:text-base font-semibold text-neutral-600">
                Total Study Hours Logged
              </span>
              <span className="text-xs font-medium text-neutral-500">
                (Goal: {targetWeeklyStudyHours} hrs / 7 days)
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              You've accomplished {weeklyHoursProgressPct}% of your weekly study hour commitment.
            </p>
          </div>

          <div className="w-full md:w-64 space-y-1.5 shrink-0">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-neutral-600">Weekly Target Progress</span>
              <span className="text-emerald-700 font-bold">{weeklyHoursProgressPct}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-neutral-200 overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, weeklyHoursProgressPct)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
              <span>{totalWeeklyStudyHours} hrs actual</span>
              <span>{targetWeeklyStudyHours} hrs target</span>
            </div>
          </div>
        </div>

        {/* 4 KPI Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-white border border-neutral-200/80 shadow-2xs space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              Total Hours
            </span>
            <div className="text-lg font-bold text-neutral-900">
              {totalWeeklyStudyHours} hrs
            </div>
            <span className="text-[11px] text-neutral-500 font-mono">
              {weekCompletedMins} mins completed
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-neutral-200/80 shadow-2xs space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-sky-600" />
              Daily Average
            </span>
            <div className="text-lg font-bold text-neutral-900">
              {averageDailyStudyHours} hrs/day
            </div>
            <span className="text-[11px] text-neutral-500 font-mono">
              Target: {dailyHours}h / day
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-neutral-200/80 shadow-2xs space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              Peak Study Day
            </span>
            <div className="text-lg font-bold text-neutral-900 truncate">
              {bestStudyDay ? `${bestStudyDay.name} (${bestStudyDay.completedHours}h)` : "Wed (2.2h)"}
            </div>
            <span className="text-[11px] text-amber-700 font-medium truncate block">
              Highest focus session
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-neutral-200/80 shadow-2xs space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Days Target Met
            </span>
            <div className="text-lg font-bold text-neutral-900">
              {targetMetDaysCount} / 7 Days
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">
              {profile.streakDays || 4}-day active streak
            </span>
          </div>
        </div>

        {/* Recharts Bar Chart: Daily Study Hours Breakdown */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
            <span className="font-semibold text-neutral-700 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              {chartView === "week" ? "Daily Study Hours (Past 7 Days)" : "Study Plan Road Map Hours"}
            </span>
            <span className="text-[11px] text-neutral-400">
              {chartMetric === "hours" ? "Metric: Hours" : chartMetric === "minutes" ? "Metric: Minutes" : "Metric: Tasks"} • Goal Line: {dailyHours}h/day
            </span>
          </div>

          <div className="w-full h-72 pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activeChartData}
                margin={{ top: 18, right: 12, left: -16, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => {
                    if (chartMetric === "hours") return `${val}h`;
                    if (chartMetric === "minutes") return `${val}m`;
                    return `${val}`;
                  }}
                />
                {chartMetric === "hours" && (
                  <ReferenceLine
                    y={dailyHours}
                    stroke="#0284c7"
                    strokeDasharray="4 4"
                    label={{
                      value: `Target: ${dailyHours}h`,
                      position: "top",
                      fill: "#0369a1",
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  />
                )}
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      const unit = chartMetric === "hours" ? "hrs" : chartMetric === "minutes" ? "mins" : "tasks";
                      const isMet = (item.completedHours || 0) >= (item.targetHours || dailyHours);
                      return (
                        <div className="bg-white/95 backdrop-blur-xs p-3.5 rounded-xl border border-neutral-200 shadow-md text-xs space-y-2 z-50 min-w-[210px]">
                          <div className="flex items-center justify-between gap-2 border-b border-neutral-100 pb-1.5">
                            <span className="font-bold text-neutral-900">{label}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                                isMet
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                                  : "bg-amber-50 text-amber-700 border border-amber-200/50"
                              }`}
                            >
                              {isMet ? "Goal Met" : `${item.completionRate}% Met`}
                            </span>
                          </div>
                          {item.fullDay && (
                            <p className="text-[11px] text-neutral-500 line-clamp-1">{item.fullDay}</p>
                          )}
                          <div className="space-y-1.5 pt-0.5">
                            <div className="flex items-center justify-between text-emerald-700 font-semibold">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                                Completed Study Time:
                              </span>
                              <span>
                                {item.completedHours} hrs ({item.completedMinutes}m)
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-neutral-500">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-neutral-300 inline-block" />
                                Remaining to Daily Goal:
                              </span>
                              <span>
                                {item.pending} {unit}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-neutral-800 font-semibold pt-1 border-t border-neutral-100">
                              <span>Daily Target:</span>
                              <span>
                                {item.targetHours || dailyHours} hrs ({item.totalMinutes || dailyHours * 60}m)
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                  cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  formatter={(value) => (
                    <span className="text-neutral-700 font-medium">{value}</span>
                  )}
                />
                <Bar
                  dataKey="completed"
                  name={
                    chartMetric === "hours"
                      ? "Completed Hours (hrs)"
                      : chartMetric === "minutes"
                      ? "Completed Minutes (mins)"
                      : "Completed Tasks"
                  }
                  fill="#059669"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={38}
                />
                <Bar
                  dataKey="pending"
                  name={
                    chartMetric === "hours"
                      ? "Remaining to Goal (hrs)"
                      : chartMetric === "minutes"
                      ? "Remaining Minutes"
                      : "Remaining Tasks"
                  }
                  fill="#e2e8f0"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={38}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Insights Footnote */}
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-emerald-950 text-xs flex items-start gap-2.5">
          <Zap className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Weekly Performance Insight: </span>
            <span>
              You have logged <strong>{totalWeeklyStudyHours} total study hours</strong> over the past 7 days across{" "}
              <strong>{weekCompletedTasks} completed tasks</strong>. Your daily average is{" "}
              <strong>{averageDailyStudyHours} hrs/day</strong> compared to your <strong>{dailyHours}h/day</strong>{" "}
              target ({weeklyHoursProgressPct}% achieved). Checking off tasks in today's session updates these hours in real time!
            </span>
          </div>
        </div>
      </div>

      {/* Daily Sessions List */}
      <div className="space-y-5">
        {plan.days.map((day, dayIdx) => (
          <div
            key={dayIdx}
            className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs overflow-hidden"
          >
            {/* Day Header */}
            <div className="px-5 py-4 bg-neutral-50/70 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center">
                  D{day.dayNumber}
                </span>
                <div>
                  <h3 className="font-bold text-neutral-900 text-sm">{day.dayTitle}</h3>
                  <p className="text-xs text-neutral-500">{day.focusArea}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>Est. {day.estimatedMinutes} mins</span>
              </div>
            </div>

            {/* Task List */}
            <div className="p-4 sm:p-5 space-y-2.5">
              {day.tasks.map((task, taskIdx) => {
                const isBreak = task.type === "break";

                return (
                  <div
                    key={task.id || taskIdx}
                    onClick={() => handleToggleTask(dayIdx, taskIdx)}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer select-none text-xs sm:text-sm ${
                      task.completed
                        ? "bg-neutral-50/80 border-neutral-200 text-neutral-400 line-through"
                        : isBreak
                        ? "bg-amber-50/50 border-amber-200/70 text-amber-900"
                        : "bg-white border-neutral-200 hover:border-neutral-300 text-neutral-800"
                    }`}
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-neutral-400 hover:text-sky-600 transition shrink-0"
                    >
                      {task.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4 text-neutral-400" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isBreak && <Coffee className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                        <span className={task.completed ? "line-through text-neutral-400" : "font-medium"}>
                          {task.text}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 shrink-0">
                      {task.durationMin}m
                    </span>
                  </div>
                );
              })}

              {/* Recommended Break Notice */}
              {day.recommendedBreak && (
                <div className="mt-3 pt-2 text-[11px] text-neutral-500 flex items-center gap-1.5 italic">
                  <Coffee className="w-3.5 h-3.5 text-amber-600" />
                  <span>Break strategy: {day.recommendedBreak}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Motivational Advice Banner */}
      {plan.finalTip && (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 text-xs flex items-start gap-2.5 leading-relaxed">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Study Buddy's Success Tip: </span>
            <span>{plan.finalTip}</span>
          </div>
        </div>
      )}
    </div>
  );
};
