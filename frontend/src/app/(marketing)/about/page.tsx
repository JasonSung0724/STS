"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";

// 團隊成員
const teamMembers = [
  {
    name: "王小明",
    nameEn: "MING",
    title: "CEO / 創辦人",
    description:
      "擁有超過15年的企業管理經驗，曾協助超過200家新創企業成功起步。專精於商業模式設計與市場策略規劃。",
    image: "/images/team/member-1.jpg",
  },
  {
    name: "李小華",
    nameEn: "SARAH",
    title: "財務長 / 合夥人",
    description:
      "資深會計師，專精於新創企業財務規劃與投資評估。協助客戶建立健全的財務體系與資金管理策略。",
    image: "/images/team/member-2.jpg",
  },
  {
    name: "張大偉",
    nameEn: "DAVID",
    title: "技術長 / 合夥人",
    description:
      "前科技公司技術總監，專精於數位轉型與技術架構規劃。協助傳統產業導入現代化技術解決方案。",
    image: "/images/team/member-3.jpg",
  },
  {
    name: "陳美玲",
    nameEn: "EMILY",
    title: "行銷總監",
    description:
      "品牌行銷專家，擅長數位行銷策略與品牌定位。協助新創企業建立市場能見度與客戶關係。",
    image: "/images/team/member-4.jpg",
  },
];

// 服務項目詳情
const serviceDetails = [
  {
    id: "reliable",
    titleEn: "RELIABLE TEAM",
    titleZh: "專業團隊",
    tagline: "Reliable Trust",
    description:
      "我們的顧問團隊由各領域專家組成，包含會計師、律師、行銷專家、技術顧問等專業人士。每位成員都擁有豐富的實戰經驗，致力於為創業者提供最專業的諮詢服務，協助您做出最有利的商業決策。",
    highlights: ["資深會計師團隊", "法律顧問支援", "行銷策略專家", "技術開發顧問"],
  },
  {
    id: "tailored",
    titleEn: "TAILORED SERVICES",
    titleZh: "量身打造",
    tagline: "Tame the risks, with STS's assist.",
    description:
      "我們深知每個創業項目都是獨一無二的。透過深入了解您的商業模式、市場定位和發展階段，我們會為您量身打造最適合的成長策略，確保每一步都走在正確的道路上。",
    highlights: ["客製化商業計畫", "市場分析報告", "競爭策略規劃", "營運模式優化"],
  },
  {
    id: "growth",
    titleEn: "BUILT FOR GROWTH",
    titleZh: "持續成長",
    tagline: "Tailored for you",
    description:
      "從創業初期的商業計畫書撰寫，到成熟期的規模擴張，我們陪伴您走過每一個關鍵階段。我們的目標不僅是幫助您成功創業，更是協助您建立永續經營的企業基礎。",
    highlights: ["階段性輔導計畫", "資金募集協助", "規模擴張策略", "永續經營規劃"],
  },
];

// 時間軸
const timeline = [
  { year: "2018", event: "公司成立", description: "創立 STS，開始創業輔導服務" },
  { year: "2019", event: "服務擴展", description: "新增財務顧問與法律諮詢服務" },
  { year: "2020", event: "數位轉型", description: "推出線上諮詢平台，服務範圍擴大" },
  { year: "2021", event: "團隊擴編", description: "引進技術顧問團隊" },
  { year: "2022", event: "百家里程碑", description: "成功輔導超過100家新創企業" },
  { year: "2023", event: "策略夥伴", description: "與多家投資機構建立合作關係" },
  { year: "2024", event: "品牌升級", description: "全新品牌識別與服務體系" },
  { year: "2025", event: "持續成長", description: "服務版圖持續擴展中" },
];

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (contentRef.current) {
      observer.observe(contentRef.current);
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
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/10 blur-[100px]" />
        </div>

        {/* Marquee Text Background */}
        <div className="absolute inset-0 flex items-center overflow-hidden opacity-5">
          <div className="whitespace-nowrap animate-marquee text-[20vw] font-bold text-white">
            ABOUT US&nbsp;&nbsp;&nbsp;ABOUT US&nbsp;&nbsp;&nbsp;ABOUT US&nbsp;&nbsp;&nbsp;
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-8 h-8 border border-amber-400/50 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-amber-400 rounded-full" />
            </div>
            <p className="text-amber-400 tracking-widest uppercase">About Us</p>
          </div>
          <h1 className="text-5xl md:text-7xl font-light text-white tracking-wider mb-4">
            關於我們
          </h1>
          <p className="text-lg text-white/50 max-w-md mx-auto">
            專業創業輔導顧問團隊，陪伴您從起步到規模化
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
            <span className="text-white">About Us</span>
          </nav>
        </div>
      </div>

      {/* Team Section */}
      <section ref={contentRef} className="py-24 bg-gradient-to-b from-[#12121a] to-[#0a0a0f]">
        <div className="mx-auto max-w-7xl px-6">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <p className="text-sm text-amber-400 tracking-widest uppercase mb-2">
                STEADFAST TEAM
              </p>
              <h2 className="text-3xl font-medium text-white">團隊介紹</h2>
            </div>
            <p className="text-xl text-white/40 italic hidden md:block">Reliable Trust</p>
          </div>

          {/* Team Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <div
                key={member.nameEn}
                className={`group relative transition-all duration-700 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Image Placeholder */}
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden mb-4 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-amber-400 text-sm font-medium">{member.nameEn}</p>
                  </div>
                </div>

                {/* Info */}
                <div className="text-center">
                  <h3 className="text-lg font-medium text-white">{member.name}</h3>
                  <p className="text-sm text-amber-400">{member.title}</p>
                </div>

                {/* Hover Tooltip */}
                <div className="absolute left-0 right-0 bottom-full mb-2 p-4 bg-white rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10 transform group-hover:-translate-y-2">
                  <p className="text-sm text-gray-600">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Detail Section */}
      <section className="py-24 bg-[#f5f5f0]">
        <div className="mx-auto max-w-7xl px-6">
          {serviceDetails.map((service, index) => (
            <div
              key={service.id}
              className={`py-16 ${index !== serviceDetails.length - 1 ? "border-b border-gray-200" : ""}`}
            >
              <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Text Content */}
                <div className={index % 2 === 1 ? "md:order-2" : ""}>
                  <p className="text-sm text-amber-600 tracking-widest uppercase mb-2">
                    {service.titleEn}
                  </p>
                  <h3 className="text-3xl font-medium text-gray-900 mb-4">{service.titleZh}</h3>
                  <p className="text-xl text-gray-400 italic mb-6">{service.tagline}</p>
                  <p className="text-gray-600 leading-relaxed mb-8">{service.description}</p>

                  {/* Highlights */}
                  <ul className="grid grid-cols-2 gap-3">
                    {service.highlights.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 mt-8 text-amber-600 hover:text-amber-700 transition-colors group"
                  >
                    <span>了解更多</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Image Placeholder */}
                <div className={index % 2 === 1 ? "md:order-1" : ""}>
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-gradient-to-b from-[#0a0a0f] to-[#1a1a2e]">
        <div className="mx-auto max-w-7xl px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="text-sm text-amber-400 tracking-widest uppercase mb-2">
              OUR JOURNEY
            </p>
            <h2 className="text-3xl font-medium text-white">成長歷程</h2>
            <p className="text-xl text-white/40 italic mt-4">Built For Growth</p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Center Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 hidden md:block" />

            {/* Timeline Items */}
            <div className="space-y-8">
              {timeline.map((item, index) => (
                <div
                  key={item.year}
                  className={`flex items-center gap-8 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Content */}
                  <div
                    className={`flex-1 ${
                      index % 2 === 0 ? "md:text-right md:pr-12" : "md:text-left md:pl-12"
                    }`}
                  >
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 inline-block">
                      <p className="text-amber-400 font-bold text-2xl mb-1">{item.year}</p>
                      <h4 className="text-white font-medium mb-2">{item.event}</h4>
                      <p className="text-white/50 text-sm">{item.description}</p>
                    </div>
                  </div>

                  {/* Center Dot */}
                  <div className="hidden md:flex w-4 h-4 bg-amber-400 rounded-full flex-shrink-0 relative z-10" />

                  {/* Spacer */}
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#1a1a2e]">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-medium text-white mb-4">
            準備好開始您的創業旅程了嗎？
          </h2>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto">
            立即與我們聯繫，讓專業顧問團隊為您規劃最適合的成長策略
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-amber-400 hover:bg-amber-500 text-gray-900 font-medium rounded-full transition-all duration-300"
          >
            <span>聯絡我們</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
