"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ArrowRight } from "lucide-react";

// 服務項目
const services = [
  {
    id: "reliable",
    titleEn: "RELIABLE",
    titleZh: "專業可靠",
    subtitle: "Professional Trust",
    description:
      "我們的顧問團隊擁有豐富的創業輔導經驗，包含會計師、律師、行銷專家、技術顧問等專業人士，致力於為每一位創業者提供最專業的諮詢服務。",
  },
  {
    id: "tailored",
    titleEn: "TAILORED",
    titleZh: "量身打造",
    subtitle: "Customized Solutions",
    description:
      "我們深知每個創業項目都是獨一無二的。我們會根據您的商業模式、市場定位和發展階段，為您量身打造最適合的成長策略。",
  },
  {
    id: "growth",
    titleEn: "GROWTH",
    titleZh: "持續成長",
    subtitle: "Sustainable Development",
    description:
      "從創業初期的商業計畫書撰寫，到成熟期的規模擴張，我們陪伴您走過每一個關鍵階段，助您實現企業的永續經營與成長。",
  },
];

// 文章資料 (示範)
const insights = [
  {
    id: 1,
    title: "創業者必讀：如何在競爭激烈的市場中脫穎而出",
    excerpt: "在這個快速變化的商業環境中，創業者需要具備哪些關鍵能力...",
    date: "2026.02.28",
    category: "創業心法",
    image: "/images/landing/insight-1.jpg",
  },
  {
    id: 2,
    title: "小型企業數位轉型：從零開始的實戰指南",
    excerpt: "數位轉型不再是大企業的專利，小型企業也能透過正確的策略...",
    date: "2026.02.25",
    category: "數位轉型",
    image: "/images/landing/insight-2.jpg",
  },
  {
    id: 3,
    title: "資金規劃全攻略：創業初期的財務管理技巧",
    excerpt: "良好的資金規劃是創業成功的基石，本文將分享實用的財務管理...",
    date: "2026.02.20",
    category: "財務管理",
    image: "/images/landing/insight-3.jpg",
  },
];

export default function MarketingHomePage() {
  const [activeService, setActiveService] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const [isAboutVisible, setIsAboutVisible] = useState(false);

  // 滾動到下一區塊
  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsAboutVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (aboutRef.current) {
      observer.observe(aboutRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-[#0a0a0f]">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Yellow/Orange gradient blobs */}
          <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-amber-400/30 to-orange-500/20 blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-orange-400/20 to-amber-500/10 blur-[100px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-white tracking-wider mb-6">
            <span className="block">WITH STS</span>
            <span className="block text-amber-400">YOU SCALE UP</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/70 mb-4">
            選擇 STS 成就規模
          </p>
          <p className="text-base text-white/50 max-w-xl mx-auto">
            專業創業輔導顧問團隊，陪伴小型企業從起步到規模化
          </p>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToAbout}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 hover:text-amber-400 transition-colors cursor-pointer group"
        >
          <span className="text-sm tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </button>
      </section>

      {/* About Section */}
      <section
        ref={aboutRef}
        className="relative py-24 md:py-32 bg-gradient-to-b from-[#0a0a0f] to-[#12121a]"
      >
        <div className="mx-auto max-w-7xl px-6">
          {/* Section Header */}
          <div
            className={`flex items-center gap-4 mb-16 transition-all duration-1000 ${
              isAboutVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="w-8 h-8 border border-amber-400/50 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-amber-400 rounded-full" />
            </div>
            <div>
              <p className="text-sm text-amber-400 tracking-widest uppercase">About Us</p>
              <h2 className="text-2xl font-medium text-white">關於我們</h2>
            </div>
          </div>

          {/* Tagline */}
          <div
            className={`text-center mb-20 transition-all duration-1000 delay-200 ${
              isAboutVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <p className="text-2xl md:text-4xl text-white/90 font-light italic leading-relaxed">
              <span className="text-amber-400">Reliable</span> Trust,{" "}
              <span className="text-amber-400">Tailored</span> For You,
              <br />
              Built For <span className="text-amber-400">Growth</span>.
            </p>
            <p className="text-lg text-white/50 mt-6">
              專業可靠 · 量身打造 · 持續成長
            </p>
            <p className="text-base text-white/40 mt-2">所以你選擇 STS</p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={service.id}
                className={`group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-amber-400/30 transition-all duration-500 ${
                  isAboutVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${300 + index * 100}ms` }}
              >
                {/* Service Icon/Number */}
                <div className="text-6xl font-light text-white/10 group-hover:text-amber-400/20 transition-colors absolute top-4 right-4">
                  {String(index + 1).padStart(2, "0")}
                </div>

                {/* Content */}
                <div className="relative">
                  <p className="text-amber-400 text-sm tracking-widest mb-2">
                    {service.titleEn}
                  </p>
                  <h3 className="text-2xl font-medium text-white mb-2">
                    {service.titleZh}
                  </h3>
                  <p className="text-sm text-white/40 italic mb-4">{service.subtitle}</p>
                  <p className="text-white/60 leading-relaxed mb-6">
                    {service.description}
                  </p>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-amber-400 transition-colors group/link"
                  >
                    <span>VIEW MORE</span>
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Insights Section */}
      <section className="py-24 md:py-32 bg-[#f5f5f0]">
        <div className="mx-auto max-w-7xl px-6">
          {/* Section Header */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-8 h-8 border border-amber-600/50 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-amber-600 rounded-full" />
            </div>
            <div>
              <p className="text-sm text-amber-600 tracking-widest uppercase">
                Insights
              </p>
              <h2 className="text-2xl font-medium text-gray-900">專欄文章</h2>
            </div>
          </div>

          {/* Articles Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {insights.map((article, index) => (
              <Link
                key={article.id}
                href={`/insights/${article.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
              >
                {/* Image Placeholder */}
                <div className="aspect-[16/10] bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-amber-400 text-white text-xs font-medium rounded-full">
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-sm text-gray-400 mb-2">{article.date}</p>
                  <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {article.excerpt}
                  </p>

                  {/* Arrow */}
                  <div className="flex items-center gap-2 mt-4 text-gray-400 group-hover:text-amber-600 transition-colors">
                    <span className="text-sm">閱讀更多</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-12">
            <Link
              href="/insights"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-full transition-all duration-300"
            >
              <span>查看所有文章</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="relative py-24 md:py-32 bg-[#1a1a2e] overflow-hidden">
        {/* Decorations */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-amber-400/10 blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-orange-400/10 blur-[80px]" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* LINE CTA */}
            <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-[#00B900]/50 transition-all duration-500">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#00B900] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">LINE</p>
                  <p className="text-sm text-white/60">加入官方帳號，快速諮詢</p>
                </div>
              </div>
              <a
                href="https://line.me"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-8 right-8 w-12 h-12 bg-white/10 hover:bg-[#00B900] rounded-full flex items-center justify-center transition-all duration-300"
              >
                <ArrowRight className="w-5 h-5 text-white" />
              </a>
            </div>

            {/* Contact CTA */}
            <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-amber-400/50 transition-all duration-500">
              <div className="mb-4">
                <p className="text-2xl font-light text-white mb-2">Contact</p>
                <p className="text-sm text-white/60">
                  如需諮詢及詢問，請點擊這裡
                </p>
              </div>
              <Link
                href="/contact"
                className="absolute bottom-8 right-8 w-12 h-12 bg-white/10 hover:bg-amber-400 rounded-full flex items-center justify-center transition-all duration-300"
              >
                <ArrowRight className="w-5 h-5 text-white" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
