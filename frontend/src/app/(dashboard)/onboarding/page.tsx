"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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

// Industry keys for translation
const INDUSTRY_KEYS = [
  "technology",
  "manufacturing",
  "retail",
  "healthcare",
  "financial",
  "professional",
  "education",
  "realEstate",
  "foodBeverage",
  "other",
] as const;

// Employee range keys
const EMPLOYEE_RANGE_KEYS = [
  "startup",
  "small",
  "medium",
  "growth",
  "enterprise",
] as const;

// Revenue range keys
const REVENUE_RANGE_KEYS = [
  "under500k",
  "500kTo2m",
  "2mTo10m",
  "10mTo50m",
  "over50m",
] as const;

// Pain point keys
const PAIN_POINT_KEYS = [
  "cashflow",
  "customer",
  "efficiency",
  "growth",
  "talent",
  "strategy",
] as const;

const PAIN_POINT_ICONS = {
  cashflow: DollarSign,
  customer: Users,
  efficiency: Clock,
  growth: TrendingUp,
  talent: Users,
  strategy: Target,
} as const;

// Urgency level keys
const URGENCY_LEVEL_KEYS = ["critical", "high", "medium", "low"] as const;
const URGENCY_COLORS = {
  critical: "red",
  high: "orange",
  medium: "yellow",
  low: "green",
} as const;

// Tool keys
const TOOL_KEYS = [
  "erp",
  "crm",
  "accounting",
  "biAnalytics",
  "projectManagement",
  "hr",
  "ecommerce",
  "customTools",
] as const;

// Data readiness keys
const DATA_READINESS_KEYS = ["advanced", "developing", "basic", "starting"] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const t = useTranslations("onboarding");
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
    { title: t("steps.welcome"), icon: Sparkles },
    { title: t("steps.companyProfile"), icon: Building2 },
    { title: t("steps.painPoints"), icon: Target },
    { title: t("steps.dataGoals"), icon: Database },
    { title: t("steps.launch"), icon: Rocket },
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
                {t("welcome.title")}
              </h1>
              <p className="text-lg text-slate-400 mb-8 max-w-lg mx-auto">
                {t("welcome.subtitle")}
              </p>
              <div className="glass-card p-6 text-left mb-8">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  {t("welcome.whatHappensNext")}
                </h3>
                <ul className="space-y-3 text-slate-300">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm flex-shrink-0">
                      1
                    </span>
                    <span>
                      <strong>{t("welcome.step1Title")}</strong> - {t("welcome.step1Desc")}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm flex-shrink-0">
                      2
                    </span>
                    <span>
                      <strong>{t("welcome.step2Title")}</strong> - {t("welcome.step2Desc")}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm flex-shrink-0">
                      3
                    </span>
                    <span>
                      <strong>{t("welcome.step3Title")}</strong> - {t("welcome.step3Desc")}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm flex-shrink-0">
                      4
                    </span>
                    <span>
                      <strong>{t("welcome.step4Title")}</strong> - {t("welcome.step4Desc")}
                    </span>
                  </li>
                </ul>
              </div>
              <p className="text-sm text-slate-500">
                {t("welcome.estimatedTime")}
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
                  {t("companyProfile.title")}
                </h2>
                <p className="text-slate-400">
                  {t("companyProfile.subtitle")}
                </p>
              </div>

              <div className="space-y-6">
                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t("companyProfile.companyName")}
                  </label>
                  <input
                    type="text"
                    value={data.companyName}
                    onChange={(e) => updateData("companyName", e.target.value)}
                    className="input-field w-full"
                    placeholder={t("companyProfile.companyNamePlaceholder")}
                  />
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t("companyProfile.industry")}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {INDUSTRY_KEYS.map((key) => (
                      <button
                        key={key}
                        onClick={() => updateData("industry", key)}
                        className={`p-3 rounded-lg border text-left text-sm transition-all ${
                          data.industry === key
                            ? "border-cyan-500 bg-cyan-500/10 text-white"
                            : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                        }`}
                      >
                        {t(`industries.${key}`)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Employee Count */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t("companyProfile.teamSize")}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {EMPLOYEE_RANGE_KEYS.map((key) => (
                      <button
                        key={key}
                        onClick={() => updateData("employeeCount", key)}
                        className={`p-3 rounded-lg border text-center text-sm transition-all ${
                          data.employeeCount === key
                            ? "border-cyan-500 bg-cyan-500/10 text-white"
                            : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                        }`}
                      >
                        {t(`employeeRanges.${key}`)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Annual Revenue */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t("companyProfile.annualRevenue")}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {REVENUE_RANGE_KEYS.map((key) => (
                      <button
                        key={key}
                        onClick={() => updateData("annualRevenue", key)}
                        className={`p-3 rounded-lg border text-center text-sm transition-all ${
                          data.annualRevenue === key
                            ? "border-cyan-500 bg-cyan-500/10 text-white"
                            : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                        }`}
                      >
                        {t(`revenueRanges.${key}`)}
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
                  {t("painPoints.title")}
                </h2>
                <p className="text-slate-400">
                  {t("painPoints.subtitle")}
                </p>
              </div>

              <div className="space-y-6">
                {/* Pain Point Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    {t("painPoints.selectChallenge")}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PAIN_POINT_KEYS.map((key) => {
                      const Icon = PAIN_POINT_ICONS[key];
                      return (
                        <button
                          key={key}
                          onClick={() => updateData("primaryPainPoint", key)}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            data.primaryPainPoint === key
                              ? "border-cyan-500 bg-cyan-500/10"
                              : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                data.primaryPainPoint === key
                                  ? "bg-cyan-500/20"
                                  : "bg-slate-700"
                              }`}
                            >
                              <Icon
                                className={`w-5 h-5 ${
                                  data.primaryPainPoint === key
                                    ? "text-cyan-400"
                                    : "text-slate-400"
                                }`}
                              />
                            </div>
                            <div>
                              <h4
                                className={`font-medium ${
                                  data.primaryPainPoint === key
                                    ? "text-white"
                                    : "text-slate-300"
                                }`}
                              >
                                {t(`painPoints.${key}.title`)}
                              </h4>
                              <p className="text-sm text-slate-500 mt-1">
                                {t(`painPoints.${key}.description`)}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Pain Point Details */}
                {data.primaryPainPoint && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {t("painPoints.tellUsMore")}
                    </label>
                    <textarea
                      value={data.painPointDetails}
                      onChange={(e) =>
                        updateData("painPointDetails", e.target.value)
                      }
                      className="input-field w-full h-24 resize-none"
                      placeholder={t("painPoints.tellUsMorePlaceholder")}
                    />
                  </div>
                )}

                {/* Urgency Level */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    {t("painPoints.howUrgent")}
                  </label>
                  <div className="space-y-2">
                    {URGENCY_LEVEL_KEYS.map((key) => (
                      <button
                        key={key}
                        onClick={() => updateData("urgencyLevel", key)}
                        className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${
                          data.urgencyLevel === key
                            ? "border-cyan-500 bg-cyan-500/10"
                            : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                        }`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${
                            URGENCY_COLORS[key] === "red"
                              ? "bg-red-500"
                              : URGENCY_COLORS[key] === "orange"
                                ? "bg-orange-500"
                                : URGENCY_COLORS[key] === "yellow"
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                          }`}
                        />
                        <span
                          className={
                            data.urgencyLevel === key
                              ? "text-white"
                              : "text-slate-400"
                          }
                        >
                          {t(`urgencyLevels.${key}`)}
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
                  {t("dataGoals.title")}
                </h2>
                <p className="text-slate-400">
                  {t("dataGoals.subtitle")}
                </p>
              </div>

              <div className="space-y-6">
                {/* Current Tools */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    {t("dataGoals.currentTools")}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {TOOL_KEYS.map((key) => (
                      <button
                        key={key}
                        onClick={() => toggleTool(key)}
                        className={`p-3 rounded-lg border text-left text-sm transition-all ${
                          data.currentTools.includes(key)
                            ? "border-cyan-500 bg-cyan-500/10 text-white"
                            : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                        }`}
                      >
                        {t(`tools.${key}`)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Data Readiness */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    {t("dataGoals.dataReadiness")}
                  </label>
                  <div className="space-y-2">
                    {DATA_READINESS_KEYS.map((key) => (
                      <button
                        key={key}
                        onClick={() => updateData("dataReadiness", key)}
                        className={`w-full p-4 rounded-lg border text-left transition-all ${
                          data.dataReadiness === key
                            ? "border-cyan-500 bg-cyan-500/10"
                            : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                        }`}
                      >
                        <h4
                          className={`font-medium ${
                            data.dataReadiness === key
                              ? "text-white"
                              : "text-slate-300"
                          }`}
                        >
                          {t(`dataReadinessLevels.${key}.title`)}
                        </h4>
                        <p className="text-sm text-slate-500 mt-1">
                          {t(`dataReadinessLevels.${key}.description`)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Goal */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t("dataGoals.primaryGoal")}
                  </label>
                  <input
                    type="text"
                    value={data.primaryGoal}
                    onChange={(e) => updateData("primaryGoal", e.target.value)}
                    className="input-field w-full"
                    placeholder={t("dataGoals.primaryGoalPlaceholder")}
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
                {t("launch.title")}
              </h2>
              <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                {t("launch.subtitle")}
              </p>

              {!isAnalyzing ? (
                <div className="glass-card p-6 mb-8">
                  <h3 className="text-white font-semibold mb-4">
                    {t("launch.profileSummary")}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-left text-sm">
                    <div>
                      <span className="text-slate-500">{t("launch.company")}</span>
                      <p className="text-white">{data.companyName || "—"}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">{t("launch.industry")}</span>
                      <p className="text-white">
                        {data.industry ? t(`industries.${data.industry}`) : "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">{t("launch.teamSize")}</span>
                      <p className="text-white">
                        {data.employeeCount ? t(`employeeRanges.${data.employeeCount}`) : "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">{t("launch.primaryChallenge")}</span>
                      <p className="text-white">
                        {data.primaryPainPoint
                          ? t(`painPoints.${data.primaryPainPoint}.title`)
                          : "—"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500">{t("launch.goal")}</span>
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
                    {t("launch.aiActivating")}
                  </h3>
                  <div className="space-y-3 text-left text-sm">
                    <div
                      className={`flex items-center gap-2 ${analysisProgress > 20 ? "text-cyan-400" : "text-slate-500"}`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t("launch.analyzingBenchmarks")}</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 ${analysisProgress > 40 ? "text-cyan-400" : "text-slate-500"}`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t("launch.mappingFrameworks")}</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 ${analysisProgress > 60 ? "text-cyan-400" : "text-slate-500"}`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t("launch.generatingRoadmap")}</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 ${analysisProgress > 80 ? "text-cyan-400" : "text-slate-500"}`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t("launch.preparingWarRoom")}</span>
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
              {t("navigation.back")}
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
                    {t("navigation.analyzing")}
                  </>
                ) : (
                  <>
                    {t("navigation.launchWarRoom")}
                    <Rocket className="w-4 h-4" />
                  </>
                )
              ) : (
                <>
                  {t("navigation.continue")}
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
