import Link from "next/link";
import { ArrowRight, Bot, BarChart3, Target, TrendingUp } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold">STS</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
            Your AI-Powered
            <span className="block text-primary-600">Business Partner</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            STS is an intelligent AI CEO platform that helps enterprises boost
            revenue, manage KPIs, reduce costs, and improve operational
            efficiency through data-driven insights.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-base font-medium text-white hover:bg-primary-700"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-32 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<TrendingUp className="h-6 w-6" />}
            title="Revenue Growth"
            description="AI-driven strategies to identify growth opportunities and optimize revenue streams."
          />
          <FeatureCard
            icon={<Target className="h-6 w-6" />}
            title="KPI Management"
            description="Real-time monitoring and intelligent alerts for all your key performance indicators."
          />
          <FeatureCard
            icon={<BarChart3 className="h-6 w-6" />}
            title="Cost Optimization"
            description="Automated cost analysis and actionable recommendations to reduce expenses."
          />
          <FeatureCard
            icon={<Bot className="h-6 w-6" />}
            title="AI Assistant"
            description="Natural language interface to query data and get instant business insights."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} STS - Smart Total Solution. All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-slate-900">
      <div className="mb-4 inline-flex rounded-lg bg-primary-100 p-3 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  );
}
