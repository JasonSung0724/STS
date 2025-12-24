"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Brain,
  Building2,
  Target,
  Database,
  Rocket,
  ChevronRight,
  ChevronLeft,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";

// Types for onboarding data
interface OnboardingData {
  // Step 1: Company Profile
  companyName: string;
  industry: string;
  employeeCount: string;
  annualRevenue: string;
  foundedYear: string;

  // Step 2: Pain Points
  primaryPainPoint: string;
  painPointDetails: string;
  urgencyLevel: string;

  // Step 3: Data & Goals
  currentTools: string[];
  dataReadiness: string;
  primaryGoal: string;
  targetMetric: string;
}

const INDUSTRIES = [
  "Technology / SaaS",
  "Manufacturing",
  "Retail / E-commerce",
  "Healthcare",
  "Financial Services",
  "Professional Services",
  "Education",
  "Real Estate",
  "Food & Beverage",
  "Other",
];

const EMPLOYEE_RANGES = [
  "1-10 (Startup)",
  "11-50 (Small)",
  "51-200 (Medium)",
  "201-500 (Growth)",
  "500+ (Enterprise)",
];

const REVENUE_RANGES = [
  "< $500K",
  "$500K - $2M",
  "$2M - $10M",
  "$10M - $50M",
  "$50M+",
];

const PAIN_POINTS = [
  {
    id: "cashflow",
    icon: DollarSign,
    title: "Cash Flow Management",
    description: "Difficulty predicting and managing working capital",
  },
  {
    id: "customer",
    icon: Users,
    title: "Customer Acquisition",
    description: "High CAC or struggling to find new customers",
  },
  {
    id: "efficiency",
    icon: Clock,
    title: "Operational Efficiency",
    description: "Low productivity or manual processes slowing growth",
  },
  {
    id: "growth",
    icon: TrendingUp,
    title: "Revenue Growth",
    description: "Plateaued growth or unclear path to scale",
  },
  {
    id: "talent",
    icon: Users,
    title: "Talent & Team",
    description: "Hiring, retention, or team performance issues",
  },
  {
    id: "strategy",
    icon: Target,
    title: "Strategic Direction",
    description: "Unclear priorities or too many opportunities",
  },
];

const URGENCY_LEVELS = [
  { id: "critical", label: "Critical - Needs immediate action", color: "red" },
  { id: "high", label: "High - Within 30 days", color: "orange" },
  { id: "medium", label: "Medium - Within 90 days", color: "yellow" },
  { id: "low", label: "Low - Strategic planning", color: "green" },
];

const TOOLS = [
  "ERP System",
  "CRM (Salesforce, HubSpot)",
  "Accounting Software",
  "BI/Analytics Tools",
  "Project Management",
  "HR System",
  "E-commerce Platform",
  "Custom Internal Tools",
];

const DATA_READINESS = [
  {
    id: "advanced",
    title: "Advanced",
    description: "We have centralized data with regular reporting",
  },
  {
    id: "developing",
    title: "Developing",
    description: "Some data exists but in multiple systems",
  },
  {
    id: "basic",
    title: "Basic",
    description: "Mostly spreadsheets and manual tracking",
  },
  {
    id: "starting",
    title: "Just Starting",
    description: "Limited data collection in place",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    companyName: "",
    industry: "",
    employeeCount: "",
    annualRevenue: "",
    foundedYear: "",
    primaryPainPoint: "",
    painPointDetails: "",
    urgencyLevel: "",
    currentTools: [],
    dataReadiness: "",
    primaryGoal: "",
    targetMetric: "",
  });

  const updateData = (field: keyof OnboardingData, value: string | string[]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleTool = (tool: string) => {
    setData((prev) => ({
      ...prev,
      currentTools: prev.currentTools.includes(tool)
        ? prev.currentTools.filter((t) => t !== tool)
        : [...prev.currentTools, tool],
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true; // Welcome step
      case 1:
        return data.companyName && data.industry && data.employeeCount;
      case 2:
        return data.primaryPainPoint && data.urgencyLevel;
      case 3:
        return data.dataReadiness && data.primaryGoal;
      case 4:
        return true; // Analysis step
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      startAnalysis();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simulate AI analysis progress
    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Save onboarding data and redirect
          localStorage.setItem("onboarding_data", JSON.stringify(data));
          localStorage.setItem("onboarding_completed", "true");
          setTimeout(() => {
            router.push("/war-room");
          }, 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 300);
  };

  const steps = [
    { title: "Welcome", icon: Sparkles },
    { title: "Company Profile", icon: Building2 },
    { title: "Pain Points", icon: Target },
    { title: "Data & Goals", icon: Database },
    { title: "Launch", icon: Rocket },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-800 z-50">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
          style={{ width: `${(currentStep / 4) * 100}%` }}
        />
      </div>

      {/* Step Indicators */}
      <div className="pt-8 pb-4 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.title} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    index < currentStep
                      ? "bg-cyan-500 border-cyan-500 text-white"
                      : index === currentStep
                        ? "border-cyan-500 text-cyan-500"
                        : "border-slate-700 text-slate-600"
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`hidden sm:block w-16 lg:w-24 h-0.5 mx-2 transition-all duration-300 ${
                      index < currentStep ? "bg-cyan-500" : "bg-slate-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step, index) => (
              <span
                key={step.title}
                className={`text-xs sm:text-sm transition-colors ${
                  index <= currentStep ? "text-white" : "text-slate-600"
                }`}
              >
                {step.title}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Step 0: Welcome */}
          {currentStep === 0 && (
            <div className="text-center animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Welcome to Your AI Strategy Partner
              </h1>
              <p className="text-lg text-slate-400 mb-8 max-w-lg mx-auto">
                Start to Scale is now officially your strategic advisor.
                Like McKinsey consultants, we&apos;ll first understand your business
                before delivering insights.
              </p>
              <div className="glass-card p-6 text-left mb-8">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  What happens next:
                </h3>
                <ul className="space-y-3 text-slate-300">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm flex-shrink-0">
                      1
                    </span>
                    <span>
                      <strong>Company Scan</strong> - We&apos;ll understand your business DNA
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm flex-shrink-0">
                      2
                    </span>
                    <span>
                      <strong>Pain Point Focus</strong> - Identify the critical 20% that matters
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm flex-shrink-0">
                      3
                    </span>
                    <span>
                      <strong>Data Connection</strong> - Prepare for data-driven decisions
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm flex-shrink-0">
                      4
                    </span>
                    <span>
                      <strong>Launch War Room</strong> - Your personalized command center
                    </span>
                  </li>
                </ul>
              </div>
              <p className="text-sm text-slate-500">
                Estimated time: 3-5 minutes
              </p>
            </div>
          )}

          {/* Step 1: Company Profile */}
          {currentStep === 1 && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Company Health Scan
                </h2>
                <p className="text-slate-400">
                  Just like a doctor checks vitals, we need to understand your baseline.
                </p>
              </div>

              <div className="space-y-6">
                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={data.companyName}
                    onChange={(e) => updateData("companyName", e.target.value)}
                    className="input-field w-full"
                    placeholder="Enter your company name"
                  />
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Industry
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {INDUSTRIES.map((industry) => (
                      <button
                        key={industry}
                        onClick={() => updateData("industry", industry)}
                        className={`p-3 rounded-lg border text-left text-sm transition-all ${
                          data.industry === industry
                            ? "border-cyan-500 bg-cyan-500/10 text-white"
                            : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                        }`}
                      >
                        {industry}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Employee Count */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Team Size
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {EMPLOYEE_RANGES.map((range) => (
                      <button
                        key={range}
                        onClick={() => updateData("employeeCount", range)}
                        className={`p-3 rounded-lg border text-center text-sm transition-all ${
                          data.employeeCount === range
                            ? "border-cyan-500 bg-cyan-500/10 text-white"
                            : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Annual Revenue */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Annual Revenue (Optional)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {REVENUE_RANGES.map((range) => (
                      <button
                        key={range}
                        onClick={() => updateData("annualRevenue", range)}
                        className={`p-3 rounded-lg border text-center text-sm transition-all ${
                          data.annualRevenue === range
                            ? "border-cyan-500 bg-cyan-500/10 text-white"
                            : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Pain Points */}
          {currentStep === 2 && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  The McKinsey Principle
                </h2>
                <p className="text-slate-400">
                  Focus on the critical 20% that drives 80% of results.
                  What&apos;s keeping you up at night?
                </p>
              </div>

              <div className="space-y-6">
                {/* Pain Point Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Select your primary challenge
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PAIN_POINTS.map((point) => (
                      <button
                        key={point.id}
                        onClick={() => updateData("primaryPainPoint", point.id)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          data.primaryPainPoint === point.id
                            ? "border-cyan-500 bg-cyan-500/10"
                            : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              data.primaryPainPoint === point.id
                                ? "bg-cyan-500/20"
                                : "bg-slate-700"
                            }`}
                          >
                            <point.icon
                              className={`w-5 h-5 ${
                                data.primaryPainPoint === point.id
                                  ? "text-cyan-400"
                                  : "text-slate-400"
                              }`}
                            />
                          </div>
                          <div>
                            <h4
                              className={`font-medium ${
                                data.primaryPainPoint === point.id
                                  ? "text-white"
                                  : "text-slate-300"
                              }`}
                            >
                              {point.title}
                            </h4>
                            <p className="text-sm text-slate-500 mt-1">
                              {point.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pain Point Details */}
                {data.primaryPainPoint && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Tell us more (optional)
                    </label>
                    <textarea
                      value={data.painPointDetails}
                      onChange={(e) =>
                        updateData("painPointDetails", e.target.value)
                      }
                      className="input-field w-full h-24 resize-none"
                      placeholder="What specific aspects of this challenge are most pressing?"
                    />
                  </div>
                )}

                {/* Urgency Level */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    How urgent is this?
                  </label>
                  <div className="space-y-2">
                    {URGENCY_LEVELS.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => updateData("urgencyLevel", level.id)}
                        className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${
                          data.urgencyLevel === level.id
                            ? "border-cyan-500 bg-cyan-500/10"
                            : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                        }`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${
                            level.color === "red"
                              ? "bg-red-500"
                              : level.color === "orange"
                                ? "bg-orange-500"
                                : level.color === "yellow"
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                          }`}
                        />
                        <span
                          className={
                            data.urgencyLevel === level.id
                              ? "text-white"
                              : "text-slate-400"
                          }
                        >
                          {level.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Data & Goals */}
          {currentStep === 3 && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Database className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Data is Decision Fuel
                </h2>
                <p className="text-slate-400">
                  Understanding your data landscape helps us provide better insights.
                </p>
              </div>

              <div className="space-y-6">
                {/* Current Tools */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    What tools do you currently use? (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {TOOLS.map((tool) => (
                      <button
                        key={tool}
                        onClick={() => toggleTool(tool)}
                        className={`p-3 rounded-lg border text-left text-sm transition-all ${
                          data.currentTools.includes(tool)
                            ? "border-cyan-500 bg-cyan-500/10 text-white"
                            : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                        }`}
                      >
                        {tool}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Data Readiness */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    How would you describe your data readiness?
                  </label>
                  <div className="space-y-2">
                    {DATA_READINESS.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => updateData("dataReadiness", level.id)}
                        className={`w-full p-4 rounded-lg border text-left transition-all ${
                          data.dataReadiness === level.id
                            ? "border-cyan-500 bg-cyan-500/10"
                            : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                        }`}
                      >
                        <h4
                          className={`font-medium ${
                            data.dataReadiness === level.id
                              ? "text-white"
                              : "text-slate-300"
                          }`}
                        >
                          {level.title}
                        </h4>
                        <p className="text-sm text-slate-500 mt-1">
                          {level.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Goal */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    What&apos;s your #1 goal for using STS?
                  </label>
                  <input
                    type="text"
                    value={data.primaryGoal}
                    onChange={(e) => updateData("primaryGoal", e.target.value)}
                    className="input-field w-full"
                    placeholder="e.g., Increase revenue by 30%, Reduce operational costs..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Launch Analysis */}
          {currentStep === 4 && (
            <div className="animate-fade-in text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Rocket className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Ready to Launch Your War Room
              </h2>
              <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                Our AI will now analyze your business profile and prepare
                personalized strategic frameworks and recommendations.
              </p>

              {!isAnalyzing ? (
                <div className="glass-card p-6 mb-8">
                  <h3 className="text-white font-semibold mb-4">
                    Summary of Your Profile
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-left text-sm">
                    <div>
                      <span className="text-slate-500">Company</span>
                      <p className="text-white">{data.companyName || "—"}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Industry</span>
                      <p className="text-white">{data.industry || "—"}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Team Size</span>
                      <p className="text-white">{data.employeeCount || "—"}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Primary Challenge</span>
                      <p className="text-white">
                        {PAIN_POINTS.find((p) => p.id === data.primaryPainPoint)
                          ?.title || "—"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500">Goal</span>
                      <p className="text-white">{data.primaryGoal || "—"}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-card p-8 mb-8">
                  <div className="flex items-center justify-center mb-6">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  </div>
                  <h3 className="text-white font-semibold mb-4">
                    AI Strategy Engine Activating...
                  </h3>
                  <div className="space-y-3 text-left text-sm">
                    <div
                      className={`flex items-center gap-2 ${analysisProgress > 20 ? "text-cyan-400" : "text-slate-500"}`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Analyzing industry benchmarks</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 ${analysisProgress > 40 ? "text-cyan-400" : "text-slate-500"}`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mapping strategic frameworks</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 ${analysisProgress > 60 ? "text-cyan-400" : "text-slate-500"}`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Generating priority roadmap</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 ${analysisProgress > 80 ? "text-cyan-400" : "text-slate-500"}`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Preparing your War Room</span>
                    </div>
                  </div>
                  <div className="mt-6 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                      style={{ width: `${Math.min(analysisProgress, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-slate-400 hover:text-white transition-colors ${
                currentStep === 0 ? "invisible" : ""
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed() || isAnalyzing}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-all ${
                canProceed() && !isAnalyzing
                  ? "btn-primary"
                  : "bg-slate-700 text-slate-500 cursor-not-allowed"
              }`}
            >
              {currentStep === 4 ? (
                isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Launch War Room
                    <Rocket className="w-4 h-4" />
                  </>
                )
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
