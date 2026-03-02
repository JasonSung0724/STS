"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronDown, MapPin, Phone, Mail, ExternalLink } from "lucide-react";

const offices = [
  {
    id: "taipei",
    name: "STS TAIPEI",
    nameZh: "台北總部",
    address: "台北市中山區南京東路三段XXX號X樓",
    addressEn: "X F., No. XXX, Sec. 3, Nanjing E. Rd., Zhongshan Dist., Taipei City",
    phone: "02-XXXX-XXXX",
    email: "taipei@sts.tw",
    mapUrl: "https://maps.google.com",
    hours: "週一至週五 09:00 - 18:00",
  },
];

export default function OfficesPage() {
  const contentRef = useRef<HTMLDivElement>(null);

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
          <div className="whitespace-nowrap animate-marquee text-[20vw] font-bold text-white">
            OUR OFFICES&nbsp;&nbsp;&nbsp;OUR OFFICES&nbsp;&nbsp;&nbsp;OUR OFFICES&nbsp;&nbsp;&nbsp;
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-8 h-8 border border-amber-400/50 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-amber-400 rounded-full" />
            </div>
            <p className="text-amber-400 tracking-widest uppercase">Our Offices</p>
          </div>
          <h1 className="text-5xl md:text-7xl font-light text-white tracking-wider mb-4">
            服務據點
          </h1>
          <p className="text-lg text-white/50 max-w-md mx-auto">
            歡迎預約諮詢，我們期待與您見面
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
            <span className="text-white">Our Offices</span>
          </nav>
        </div>
      </div>

      {/* Offices List */}
      <section ref={contentRef} className="py-24 bg-[#f5f5f0]">
        <div className="mx-auto max-w-7xl px-6">
          {offices.map((office) => (
            <div
              key={office.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
            >
              <div className="grid md:grid-cols-2">
                {/* Map Placeholder */}
                <div className="aspect-[4/3] md:aspect-auto bg-gradient-to-br from-gray-200 to-gray-300 relative group">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                      <p className="text-gray-600">地圖載入中...</p>
                    </div>
                  </div>
                  {/* Google Maps Embed would go here */}
                  <a
                    href={office.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-4 right-4 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-gray-900 text-sm font-medium rounded-full flex items-center gap-2 transition-all duration-300"
                  >
                    <span>ROUTE</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Office Info */}
                <div className="p-8 md:p-12">
                  <div className="mb-6">
                    <p className="text-amber-600 text-sm tracking-widest uppercase mb-1">
                      {office.name}
                    </p>
                    <h2 className="text-2xl font-medium text-gray-900">{office.nameZh}</h2>
                  </div>

                  <div className="space-y-6">
                    {/* Address */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-gray-900 font-medium">{office.address}</p>
                        <p className="text-sm text-gray-500 mt-1">{office.addressEn}</p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-amber-600" />
                      </div>
                      <a
                        href={`tel:${office.phone.replace(/-/g, "")}`}
                        className="text-gray-900 hover:text-amber-600 transition-colors"
                      >
                        {office.phone}
                      </a>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-amber-600" />
                      </div>
                      <a
                        href={`mailto:${office.email}`}
                        className="text-gray-900 hover:text-amber-600 transition-colors"
                      >
                        {office.email}
                      </a>
                    </div>

                    {/* Hours */}
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500">
                        <span className="text-amber-600">營業時間：</span>
                        {office.hours}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#1a1a2e]">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-medium text-white mb-4">
            有任何問題嗎？
          </h2>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto">
            歡迎透過線上表單與我們聯繫，或直接撥打電話預約諮詢
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-amber-400 hover:bg-amber-500 text-gray-900 font-medium rounded-full transition-all duration-300"
          >
            <span>聯絡我們</span>
            <Mail className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
