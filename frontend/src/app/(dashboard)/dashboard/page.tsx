"use client";

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Zap,
} from "lucide-react";
import Link from "next/link";

// 模擬 KPI 數據
const kpiData = [
  {
    title: "Total Revenue",
    value: "$2.4M",
    change: "+12.5%",
    trend: "up" as const,
    icon: DollarSign,
    color: "from-emerald-500/20 to-cyan-500/20",
    iconColor: "text-emerald-400",
  },
  {
    title: "Active Users",
    value: "24,521",
    change: "+8.2%",
    trend: "up" as const,
    icon: Users,
    color: "from-cyan-500/20 to-blue-500/20",
    iconColor: "text-cyan-400",
  },
  {
    title: "Conversion Rate",
    value: "3.24%",
    change: "-0.8%",
    trend: "down" as const,
    icon: Target,
    color: "from-blue-500/20 to-indigo-500/20",
    iconColor: "text-blue-400",
  },
  {
    title: "Avg. Order Value",
    value: "$142",
    change: "+5.3%",
    trend: "up" as const,
    icon: Activity,
    color: "from-indigo-500/20 to-purple-500/20",
    iconColor: "text-indigo-400",
  },
];

// 模擬 AI 洞察
const aiInsights = [
  {
    type: "opportunity",
    title: "Revenue Growth Opportunity",
    description: "Customer segment A shows 23% higher LTV. Consider targeted campaigns.",
    impact: "+$120K potential",
  },
  {
    type: "alert",
    title: "Conversion Rate Declining",
    description: "Mobile checkout abandonment increased 15% this week.",
    impact: "Needs attention",
  },
  {
    type: "success",
    title: "Cost Reduction Achieved",
    description: "Cloud infrastructure optimization saved $45K this month.",
    impact: "$45K saved",
  },
];

// 模擬最近活動
const recentActivities = [
  { action: "AI analyzed Q4 revenue projections", time: "2 minutes ago" },
  { action: "New KPI alert: Customer churn rate increased", time: "15 minutes ago" },
  { action: "Monthly report generated automatically", time: "1 hour ago" },
  { action: "Cost optimization recommendation applied", time: "3 hours ago" },
];

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Welcome back, Demo User
          </h1>
          <p className="text-white/60 mt-1">
            Here&apos;s what&apos;s happening with your business today.
          </p>
        </div>
        <Link
          href="/chat"
          className="btn-primary inline-flex items-center gap-2 w-fit"
        >
          <Brain className="h-5 w-5" />
          Ask AI Assistant
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <div
            key={kpi.title}
            className="glass-card p-6 group hover:bg-white/[0.08] transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${kpi.color}`}>
                <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  kpi.trend === "up" ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {kpi.trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                {kpi.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{kpi.value}</div>
            <div className="text-sm text-white/50">{kpi.title}</div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* AI Insights */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-cyan/20 to-accent-blue/20">
                <Zap className="h-5 w-5 text-accent-cyan" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">AI Insights</h2>
                <p className="text-sm text-white/50">Real-time recommendations</p>
              </div>
            </div>
            <Link
              href="/chat"
              className="text-sm text-accent-cyan hover:text-accent-cyan/80 transition-colors"
            >
              View all
            </Link>
          </div>

          <div className="space-y-4">
            {aiInsights.map((insight, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          insight.type === "opportunity"
                            ? "bg-emerald-400"
                            : insight.type === "alert"
                            ? "bg-amber-400"
                            : "bg-accent-cyan"
                        }`}
                      />
                      <h3 className="font-medium text-white">{insight.title}</h3>
                    </div>
                    <p className="text-sm text-white/60">{insight.description}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      insight.type === "opportunity"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : insight.type === "alert"
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-accent-cyan/10 text-accent-cyan"
                    }`}
                  >
                    {insight.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-indigo/20 to-accent-purple/20">
              <Activity className="h-5 w-5 text-accent-indigo" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
              <p className="text-sm text-white/50">Latest updates</p>
            </div>
          </div>

          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 pb-4 border-b border-white/5 last:border-0 last:pb-0"
              >
                <div className="w-2 h-2 rounded-full bg-accent-cyan mt-2 shrink-0" />
                <div>
                  <p className="text-sm text-white/80">{activity.action}</p>
                  <p className="text-xs text-white/40 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats Chart Placeholder */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Revenue Overview</h2>
            <p className="text-sm text-white/50">Monthly revenue trend</p>
          </div>
          <div className="flex gap-2">
            {["7D", "30D", "90D", "1Y"].map((period) => (
              <button
                key={period}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  period === "30D"
                    ? "bg-accent-cyan/20 text-accent-cyan"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="h-64 flex items-center justify-center rounded-xl bg-white/5 border border-white/5">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">Chart visualization coming soon</p>
            <p className="text-xs text-white/30 mt-1">Connect to backend for real data</p>
          </div>
        </div>
      </div>
    </div>
  );
}
