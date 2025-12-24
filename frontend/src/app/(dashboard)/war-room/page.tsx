"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { getClientSecret } from "@/lib/chatkit";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Zap,
  CheckCircle2,
  FileText,
  Download,
  BarChart3,
  PieChart,
  Layers,
  Lightbulb,
  ArrowUpRight,
  Settings,
  Plus,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

// Types
interface OnboardingData {
  companyName: string;
  industry: string;
  employeeCount: string;
  annualRevenue: string;
  primaryPainPoint: string;
  painPointDetails: string;
  urgencyLevel: string;
  primaryGoal: string;
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  status: "pending" | "in_progress" | "completed";
}

interface Document {
  id: string;
  title: string;
  type: "pdf" | "excel" | "report";
  size: string;
}

// McKinsey Framework Tools
const FRAMEWORK_TOOLS = [
  {
    id: "pyramid",
    name: "Pyramid Principle",
    icon: Layers,
    description: "Structure your thinking top-down",
  },
  {
    id: "swot",
    name: "SWOT Analysis",
    icon: Target,
    description: "Strengths, Weaknesses, Opportunities, Threats",
  },
  {
    id: "bcg",
    name: "BCG Matrix",
    icon: PieChart,
    description: "Portfolio analysis framework",
  },
  {
    id: "7s",
    name: "McKinsey 7S",
    icon: BarChart3,
    description: "Organizational alignment model",
  },
  {
    id: "horizon",
    name: "Three Horizons",
    icon: TrendingUp,
    description: "Growth planning framework",
  },
  {
    id: "porter",
    name: "Porter's 5 Forces",
    icon: Zap,
    description: "Industry competitive analysis",
  },
];

export default function WarRoomPage() {
  const router = useRouter();
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [activeFramework, setActiveFramework] = useState<string | null>(null);
  const [chatKey, setChatKey] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ChatKit Hook with context
  const { control } = useChatKit({
    api: {
      getClientSecret: async (existing: string | null | undefined) => {
        try {
          const secret = await getClientSecret(existing ?? undefined);
          setIsReady(true);
          setError(null);
          return secret;
        } catch (err) {
          setError("無法連接到 AI 服務");
          throw err;
        }
      },
    },
  });

  // Sample action items
  const [actionItems, setActionItems] = useState<ActionItem[]>([
    {
      id: "1",
      title: "Complete Customer Journey Mapping",
      description: "Map all touchpoints from awareness to retention",
      impact: "high",
      effort: "medium",
      status: "pending",
    },
    {
      id: "2",
      title: "Set Up Weekly KPI Dashboard",
      description: "Track North Star metrics in real-time",
      impact: "high",
      effort: "low",
      status: "in_progress",
    },
    {
      id: "3",
      title: "Conduct Competitor Analysis",
      description: "Benchmark against top 5 competitors",
      impact: "medium",
      effort: "medium",
      status: "pending",
    },
  ]);

  // Sample documents
  const documents: Document[] = [
    { id: "1", title: "Strategic Diagnosis Report", type: "pdf", size: "2.4 MB" },
    { id: "2", title: "KPI Tracker Template", type: "excel", size: "156 KB" },
  ];

  // Load onboarding data
  useEffect(() => {
    const savedData = localStorage.getItem("onboarding_data");
    const completed = localStorage.getItem("onboarding_completed");

    if (!completed) {
      router.push("/onboarding");
      return;
    }

    if (savedData) {
      setOnboardingData(JSON.parse(savedData) as OnboardingData);
    }
  }, [router]);

  const getPainPointLabel = (id: string) => {
    const labels: Record<string, string> = {
      cashflow: "Cash Flow Management",
      customer: "Customer Acquisition",
      efficiency: "Operational Efficiency",
      growth: "Revenue Growth",
      talent: "Talent & Team",
      strategy: "Strategic Direction",
    };
    return labels[id] || "Strategic Planning";
  };

  const handleFrameworkClick = useCallback((frameworkId: string) => {
    setActiveFramework(frameworkId);
    // Reset chat with framework context
    setChatKey((prev) => prev + 1);
  }, []);

  const toggleActionStatus = (id: string) => {
    setActionItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                item.status === "pending"
                  ? "in_progress"
                  : item.status === "in_progress"
                    ? "completed"
                    : "pending",
            }
          : item
      )
    );
  };

  const resetOnboarding = () => {
    localStorage.removeItem("onboarding_data");
    localStorage.removeItem("onboarding_completed");
    router.push("/onboarding");
  };

  // KPI Data
  const kpis = [
    { label: "Revenue Target", value: "78%", trend: "+12%", positive: true, icon: DollarSign },
    { label: "Cash Position", value: "$2.4M", trend: "-5%", positive: false, icon: TrendingUp },
    { label: "Team Efficiency", value: "67%", trend: "+8%", positive: true, icon: Users },
  ];

  if (!onboardingData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-pulse text-cyan-400">Loading War Room...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 lg:px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-semibold">
                {onboardingData.companyName} War Room
              </h1>
              <p className="text-xs text-slate-500">
                {isReady ? "AI Strategy Partner Active" : "Connecting..."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetOnboarding}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Reset Onboarding"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* KPI Bar */}
        <div className="px-4 lg:px-6 py-3 border-t border-slate-800/50 overflow-x-auto">
          <div className="flex items-center gap-6 min-w-max">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="flex items-center gap-3 bg-slate-800/30 rounded-lg px-4 py-2"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center">
                  <kpi.icon className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{kpi.label}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{kpi.value}</span>
                    <span
                      className={`text-xs flex items-center ${
                        kpi.positive ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {kpi.positive ? (
                        <TrendingUp className="w-3 h-3 mr-0.5" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-0.5" />
                      )}
                      {kpi.trend}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <button className="flex items-center gap-1 text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
              <Plus className="w-4 h-4" />
              Add KPI
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Frameworks */}
        <aside className="hidden lg:block w-64 border-r border-slate-800 bg-slate-900/30 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Strategy Frameworks
            </h2>
            <div className="space-y-2">
              {FRAMEWORK_TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleFrameworkClick(tool.id)}
                  className={`w-full p-3 rounded-lg text-left transition-all group ${
                    activeFramework === tool.id
                      ? "bg-cyan-500/10 border border-cyan-500/50"
                      : "hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        activeFramework === tool.id
                          ? "bg-cyan-500/20"
                          : "bg-slate-700/50 group-hover:bg-slate-700"
                      }`}
                    >
                      <tool.icon
                        className={`w-4 h-4 ${
                          activeFramework === tool.id ? "text-cyan-400" : "text-slate-400"
                        }`}
                      />
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          activeFramework === tool.id ? "text-white" : "text-slate-300"
                        }`}
                      >
                        {tool.name}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-1">{tool.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Company Context */}
            <div className="mt-6 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Context Loaded
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-500">Industry:</span>
                  <span className="text-white ml-2">{onboardingData.industry}</span>
                </div>
                <div>
                  <span className="text-slate-500">Focus:</span>
                  <span className="text-white ml-2">
                    {getPainPointLabel(onboardingData.primaryPainPoint)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Team:</span>
                  <span className="text-white ml-2">{onboardingData.employeeCount}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Center - Chat Area with OpenAI ChatKit */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Framework Quick Access (Mobile) */}
          <div className="lg:hidden border-b border-slate-800 p-3 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {FRAMEWORK_TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleFrameworkClick(tool.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeFramework === tool.id
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <tool.icon className="w-3 h-3" />
                  {tool.name}
                </button>
              ))}
            </div>
          </div>

          {/* ChatKit Container */}
          <div className="flex-1 overflow-hidden">
            {error ? (
              <div className="flex h-full items-center justify-center">
                <div className="max-w-md text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-400/10 border border-red-400/20">
                    <AlertCircle className="h-8 w-8 text-red-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">連接失敗</h2>
                  <p className="text-white/60 mb-6">{error}</p>
                  <button
                    onClick={() => setChatKey((prev) => prev + 1)}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    重試連接
                  </button>
                </div>
              </div>
            ) : (
              <div key={chatKey} className="h-full w-full chatkit-container">
                <ChatKit control={control} className="h-full w-full" />
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar - Actions & Documents */}
        <aside className="hidden xl:block w-80 border-l border-slate-800 bg-slate-900/30 overflow-y-auto">
          {/* Priority Actions */}
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Priority Actions
              </h2>
              <button className="text-cyan-400 hover:text-cyan-300">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-pointer"
                  onClick={() => toggleActionStatus(item.id)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        item.status === "completed"
                          ? "bg-green-500 border-green-500"
                          : item.status === "in_progress"
                            ? "border-cyan-500"
                            : "border-slate-600"
                      }`}
                    >
                      {item.status === "completed" && (
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      )}
                      {item.status === "in_progress" && (
                        <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          item.status === "completed"
                            ? "text-slate-500 line-through"
                            : "text-white"
                        }`}
                      >
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            item.impact === "high"
                              ? "bg-green-500/20 text-green-400"
                              : item.impact === "medium"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-slate-500/20 text-slate-400"
                          }`}
                        >
                          {item.impact} impact
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            item.effort === "low"
                              ? "bg-green-500/20 text-green-400"
                              : item.effort === "medium"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {item.effort} effort
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Generated Documents
              </h2>
            </div>
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-pointer group"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      doc.type === "pdf"
                        ? "bg-red-500/20"
                        : doc.type === "excel"
                          ? "bg-green-500/20"
                          : "bg-blue-500/20"
                    }`}
                  >
                    <FileText
                      className={`w-5 h-5 ${
                        doc.type === "pdf"
                          ? "text-red-400"
                          : doc.type === "excel"
                            ? "text-green-400"
                            : "text-blue-400"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{doc.title}</p>
                    <p className="text-xs text-slate-500">{doc.size}</p>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Insights */}
            <div className="mt-6">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Quick Insights
              </h2>
              <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">Industry Benchmark</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Your {getPainPointLabel(onboardingData.primaryPainPoint).toLowerCase()}{" "}
                      metrics are in the top 40% of {onboardingData.industry} companies your
                      size.
                    </p>
                    <button className="flex items-center gap-1 text-cyan-400 text-xs mt-2 hover:text-cyan-300">
                      View full analysis
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
