"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";

// 文章分類
const categories = [
  { id: "all", label: "全部" },
  { id: "startup", label: "創業心法" },
  { id: "digital", label: "數位轉型" },
  { id: "finance", label: "財務管理" },
  { id: "marketing", label: "行銷策略" },
  { id: "case", label: "客戶案例" },
];

// 文章資料 (示範)
const articles = [
  {
    id: 1,
    title: "創業者必讀：如何在競爭激烈的市場中脫穎而出",
    excerpt: "在這個快速變化的商業環境中，創業者需要具備哪些關鍵能力才能在市場中站穩腳步？本文將分享成功創業者的共同特質。",
    date: "2026.02.28",
    category: "startup",
    categoryLabel: "創業心法",
  },
  {
    id: 2,
    title: "小型企業數位轉型：從零開始的實戰指南",
    excerpt: "數位轉型不再是大企業的專利，小型企業也能透過正確的策略，運用數位工具提升營運效率與客戶體驗。",
    date: "2026.02.25",
    category: "digital",
    categoryLabel: "數位轉型",
  },
  {
    id: 3,
    title: "資金規劃全攻略：創業初期的財務管理技巧",
    excerpt: "良好的資金規劃是創業成功的基石，本文將分享實用的財務管理技巧，幫助您建立穩健的企業財務體系。",
    date: "2026.02.20",
    category: "finance",
    categoryLabel: "財務管理",
  },
  {
    id: 4,
    title: "社群行銷完全指南：如何用有限預算創造最大效益",
    excerpt: "在預算有限的情況下，如何善用社群平台進行品牌曝光與客戶經營？本文提供實用的社群行銷策略。",
    date: "2026.02.15",
    category: "marketing",
    categoryLabel: "行銷策略",
  },
  {
    id: 5,
    title: "從傳統產業到數位先驅：某製造業的轉型之路",
    excerpt: "一家擁有30年歷史的傳統製造業，如何在我們的協助下成功完成數位轉型，業績逆勢成長50%？",
    date: "2026.02.10",
    category: "case",
    categoryLabel: "客戶案例",
  },
  {
    id: 6,
    title: "新創團隊必備：打造高效團隊的五大關鍵",
    excerpt: "團隊是創業成功的核心，本文分享如何招募、培訓並留住優秀人才，打造具有戰鬥力的創業團隊。",
    date: "2026.02.05",
    category: "startup",
    categoryLabel: "創業心法",
  },
];

export default function InsightsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const contentRef = useRef<HTMLDivElement>(null);

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const filteredArticles =
    activeCategory === "all"
      ? articles
      : articles.filter((article) => article.category === activeCategory);

  return (
    <div className="bg-[#0a0a0f]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/10 blur-[100px]" />
        </div>

        {/* Marquee Text Background */}
        <div className="absolute inset-0 flex items-center overflow-hidden opacity-5">
          <div className="whitespace-nowrap animate-marquee text-[15vw] font-bold text-white">
            INSIGHTS&nbsp;&nbsp;&nbsp;INSIGHTS&nbsp;&nbsp;&nbsp;INSIGHTS&nbsp;&nbsp;&nbsp;
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-8 h-8 border border-amber-400/50 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-amber-400 rounded-full" />
            </div>
            <p className="text-amber-400 tracking-widest uppercase">Insights</p>
          </div>
          <h1 className="text-5xl md:text-7xl font-light text-white tracking-wider mb-4">
            專欄文章
          </h1>
          <p className="text-lg text-white/50 max-w-md mx-auto">
            分享創業知識、產業趨勢與成功案例
          </p>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToContent}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 hover:text-amber-400 transition-colors cursor-pointer"
        >
          <span className="text-sm tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </button>
      </section>

      {/* Breadcrumb */}
      <div className="bg-[#12121a] py-4">
        <div className="mx-auto max-w-7xl px-6">
          <nav className="flex items-center gap-2 text-sm text-white/50">
            <Link href="/" className="hover:text-amber-400 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-white">Insights</span>
          </nav>
        </div>
      </div>

      {/* Articles Section */}
      <section ref={contentRef} className="py-24 bg-[#f5f5f0]">
        <div className="mx-auto max-w-7xl px-6">
          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-4 mb-12">
            <div>
              <p className="text-sm text-amber-600 tracking-widest uppercase mb-1">CATEGORY</p>
              <h2 className="text-xl font-medium text-gray-900">類別清單</h2>
            </div>
            <div className="flex-1" />
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeCategory === category.id
                      ? "bg-amber-400 text-gray-900"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
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
                      {article.categoryLabel}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-sm text-gray-400 mb-2">{article.date}</p>
                  <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{article.excerpt}</p>

                  {/* Arrow */}
                  <div className="flex items-center gap-2 mt-4 text-gray-400 group-hover:text-amber-600 transition-colors">
                    <span className="text-sm">閱讀更多</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* No Results */}
          {filteredArticles.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500">目前沒有此類別的文章</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
