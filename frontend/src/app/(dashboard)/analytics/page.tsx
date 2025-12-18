"use client";

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Placeholder data - will be fetched from API
const kpiData = [
  {
    title: "Monthly Revenue",
    value: "$125,430",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "Active Customers",
    value: "2,543",
    change: "+8.2%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Conversion Rate",
    value: "3.24%",
    change: "-0.4%",
    trend: "down",
    icon: Target,
  },
  {
    title: "Avg. Order Value",
    value: "$89.50",
    change: "+5.1%",
    trend: "up",
    icon: BarChart3,
  },
];

const recentActivities = [
  {
    id: 1,
    action: "Revenue target achieved",
    description: "Q4 revenue exceeded target by 15%",
    time: "2 hours ago",
    type: "success",
  },
  {
    id: 2,
    action: "Cost alert triggered",
    description: "Marketing spend exceeded budget by 8%",
    time: "5 hours ago",
    type: "warning",
  },
  {
    id: 3,
    action: "New customer milestone",
    description: "Reached 2,500 active customers",
    time: "1 day ago",
    type: "success",
  },
  {
    id: 4,
    action: "Churn rate increased",
    description: "Monthly churn rate up to 2.1%",
    time: "2 days ago",
    type: "warning",
  },
];

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor your key performance indicators and business metrics
          </p>
        </div>

        {/* KPI Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiData.map((kpi) => (
            <div
              key={kpi.title}
              className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-primary-100 p-2 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
                  <kpi.icon className="h-5 w-5" />
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-sm font-medium",
                    kpi.trend === "up" ? "text-green-600" : "text-red-600"
                  )}
                >
                  {kpi.trend === "up" ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {kpi.change}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {kpi.value}
                </p>
                <p className="text-sm text-slate-500">{kpi.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Revenue Chart Placeholder */}
          <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Revenue Trend
            </h2>
            <div className="flex h-64 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800">
              <p className="text-sm text-slate-400">
                Chart will be rendered here with Recharts
              </p>
            </div>
          </div>

          {/* Customer Chart Placeholder */}
          <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Customer Growth
            </h2>
            <div className="flex h-64 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800">
              <p className="text-sm text-slate-400">
                Chart will be rendered here with Recharts
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Recent AI Insights
          </h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 rounded-lg border p-4 dark:border-slate-700"
              >
                <div
                  className={cn(
                    "mt-0.5 h-2 w-2 shrink-0 rounded-full",
                    activity.type === "success"
                      ? "bg-green-500"
                      : "bg-yellow-500"
                  )}
                />
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">
                    {activity.action}
                  </p>
                  <p className="text-sm text-slate-500">
                    {activity.description}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
