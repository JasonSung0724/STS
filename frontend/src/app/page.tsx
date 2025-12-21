"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  Brain,
  BarChart3,
  Target,
  TrendingUp,
  Zap,
  Shield,
  Globe,
  ChevronRight,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLocale } from "next-intl";

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* 背景效果 */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-accent-cyan/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-indigo/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-cyan to-accent-blue">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">{t("common.appName")}</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">
              {t("nav.features")}
            </a>
            <a href="#how-it-works" className="text-sm text-white/60 hover:text-white transition-colors">
              {t("nav.howItWorks")}
            </a>
            <a href="#pricing" className="text-sm text-white/60 hover:text-white transition-colors">
              {t("nav.pricing")}
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <LanguageSwitcher currentLocale={locale} />
            <Link
              href="/login"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              {t("common.signIn")}
            </Link>
            <Link href="/register" className="btn-primary text-sm py-2.5">
              {t("common.getStarted")}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="mx-auto max-w-7xl px-6 pt-24 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <span className="glow-dot" />
              <span className="text-sm text-white/70">{t("common.tagline")}</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-8">
              {t("landing.hero.title")}{" "}
              <span className="text-gradient">{t("landing.hero.titleHighlight")}</span>
              <br />
              {t("landing.hero.titleEnd")}
            </h1>

            <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
              {t("landing.hero.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="btn-primary inline-flex items-center gap-2 text-base"
              >
                {t("common.startFreeTrial")}
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="btn-secondary inline-flex items-center gap-2 text-base"
              >
                {t("common.viewDemo")}
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatItem value="500+" label={t("landing.stats.clients")} />
              <StatItem value="$2.5B" label={t("landing.stats.revenue")} />
              <StatItem value="40%" label={t("landing.stats.costReduction")} />
              <StatItem value="99.9%" label={t("landing.stats.uptime")} />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 border-t border-white/5">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                {t("landing.features.title")}
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                {t("landing.features.subtitle")}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<TrendingUp className="h-6 w-6" />}
                title={t("landing.features.revenueGrowth.title")}
                description={t("landing.features.revenueGrowth.description")}
                gradient="from-emerald-500/20 to-cyan-500/20"
              />
              <FeatureCard
                icon={<Target className="h-6 w-6" />}
                title={t("landing.features.kpiMonitoring.title")}
                description={t("landing.features.kpiMonitoring.description")}
                gradient="from-cyan-500/20 to-blue-500/20"
              />
              <FeatureCard
                icon={<BarChart3 className="h-6 w-6" />}
                title={t("landing.features.costOptimization.title")}
                description={t("landing.features.costOptimization.description")}
                gradient="from-blue-500/20 to-indigo-500/20"
              />
              <FeatureCard
                icon={<Brain className="h-6 w-6" />}
                title={t("landing.features.aiAssistant.title")}
                description={t("landing.features.aiAssistant.description")}
                gradient="from-indigo-500/20 to-purple-500/20"
              />
              <FeatureCard
                icon={<Zap className="h-6 w-6" />}
                title={t("landing.features.automatedReports.title")}
                description={t("landing.features.automatedReports.description")}
                gradient="from-purple-500/20 to-pink-500/20"
              />
              <FeatureCard
                icon={<Shield className="h-6 w-6" />}
                title={t("landing.features.security.title")}
                description={t("landing.features.security.description")}
                gradient="from-pink-500/20 to-rose-500/20"
              />
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-32 border-t border-white/5">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                {t("landing.howItWorks.title")}
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                {t("landing.howItWorks.subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <StepCard
                number="01"
                title={t("landing.howItWorks.step1.title")}
                description={t("landing.howItWorks.step1.description")}
              />
              <StepCard
                number="02"
                title={t("landing.howItWorks.step2.title")}
                description={t("landing.howItWorks.step2.description")}
              />
              <StepCard
                number="03"
                title={t("landing.howItWorks.step3.title")}
                description={t("landing.howItWorks.step3.description")}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 border-t border-white/5">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <div className="glass-card p-12 md:p-16 glow-border">
              <Globe className="h-12 w-12 text-accent-cyan mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("landing.cta.title")}
              </h2>
              <p className="text-lg text-white/60 mb-8 max-w-xl mx-auto">
                {t("landing.cta.subtitle")}
              </p>
              <Link
                href="/register"
                className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4"
              >
                {t("common.startFreeTrial")}
                <ArrowRight className="h-5 w-5" />
              </Link>
              <p className="text-sm text-white/40 mt-4">
                {t("common.noCardRequired")}
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-cyan to-accent-blue">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">{t("common.appName")}</span>
              <span className="text-white/40">|</span>
              <span className="text-sm text-white/40">{t("common.appFullName")}</span>
            </div>
            <p className="text-sm text-white/40">
              &copy; {new Date().getFullYear()} {t("common.appName")}. {t("footer.copyright")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-gradient mb-1">{value}</div>
      <div className="text-sm text-white/50">{label}</div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="glass-card p-6 group hover:bg-white/[0.08] transition-all duration-300">
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} mb-4`}>
        <div className="text-white">{icon}</div>
      </div>
      <h3 className="text-lg font-semibold mb-2 group-hover:text-accent-cyan transition-colors">
        {title}
      </h3>
      <p className="text-sm text-white/60 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative">
      <div className="text-7xl font-bold text-white/5 absolute -top-4 -left-2">{number}</div>
      <div className="relative glass-card p-6 pt-10">
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-white/60">{description}</p>
      </div>
    </div>
  );
}
