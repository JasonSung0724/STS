"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Facebook, Instagram, Menu, X, ChevronUp } from "lucide-react";

const navItems = [
  { href: "/about", label: "About Us", labelZh: "關於我們" },
  { href: "/insights", label: "Insights", labelZh: "專欄文章" },
  { href: "/contact", label: "Contact Us", labelZh: "聯絡我們" },
  { href: "/offices", label: "Our Offices", labelZh: "服務據點" },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      setShowBackToTop(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-[#0a0a0f]/90 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="text-2xl font-bold text-white tracking-wider">
                <span className="text-amber-400">S</span>TS
              </div>
            </Link>

            {/* Social Links - Desktop */}
            <div className="hidden md:flex items-center gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-400/50 transition-all duration-300"
              >
                <Facebook className="w-4 h-4 text-white/70 hover:text-amber-400" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-400/50 transition-all duration-300"
              >
                <Instagram className="w-4 h-4 text-white/70 hover:text-amber-400" />
              </a>
              <a
                href="https://line.me"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-400/50 transition-all duration-300"
              >
                <svg className="w-4 h-4 text-white/70" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
              </a>

              {/* Hamburger Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 ml-2"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <Menu className="w-5 h-5 text-white" />
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Full Screen Menu */}
      <div
        className={`fixed inset-0 bg-[#0a0a0f]/98 backdrop-blur-xl z-40 transition-all duration-500 ${
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <nav className="flex flex-col items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`group text-center transition-all duration-300 ${
                  pathname === item.href ? "text-amber-400" : "text-white/70 hover:text-white"
                }`}
              >
                <span className="block text-sm tracking-widest uppercase">{item.label}</span>
                <span className="block text-lg font-medium">{item.labelZh}</span>
              </Link>
            ))}
            <a
              href="https://www.104.com.tw"
              target="_blank"
              rel="noopener noreferrer"
              className="group text-center text-white/70 hover:text-white transition-all duration-300"
            >
              <span className="block text-sm tracking-widest uppercase">Careers</span>
              <span className="block text-lg font-medium">人才招募</span>
            </a>
          </nav>

          {/* Social Links in Menu */}
          <div className="flex items-center gap-4 mt-12">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-amber-400 hover:border-amber-400 transition-all duration-300 group"
            >
              <Facebook className="w-5 h-5 text-white/70 group-hover:text-white" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-amber-400 hover:border-amber-400 transition-all duration-300 group"
            >
              <Instagram className="w-5 h-5 text-white/70 group-hover:text-white" />
            </a>
            <a
              href="https://line.me"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-[#00B900] hover:border-[#00B900] transition-all duration-300 group"
            >
              <svg className="w-5 h-5 text-white/70 group-hover:text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
            </a>
          </div>

          {/* Footer Links in Menu */}
          <div className="flex items-center gap-6 mt-8 text-xs text-white/40">
            <Link href="/privacy" onClick={() => setIsMenuOpen(false)} className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>|</span>
            <Link href="/terms" onClick={() => setIsMenuOpen(false)} className="hover:text-white transition-colors">
              Terms of Use
            </Link>
          </div>

          <p className="text-xs text-white/30 mt-4">
            Copyright &copy; {new Date().getFullYear()} STS CO., LTD.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-[#1a1a2e] border-t border-white/5">
        {/* LINE CTA Section */}
        <div className="bg-gradient-to-r from-[#00B900]/20 to-transparent">
          <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#00B900] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">LINE@</p>
                  <p className="text-sm text-white/60">加入官方 LINE，獲得即時諮詢服務</p>
                </div>
              </div>
              <a
                href="https://line.me"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#00B900] hover:bg-[#00A000] text-white font-medium rounded-full transition-all duration-300 flex items-center gap-2"
              >
                立即加入
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Main Footer */}
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo & Info */}
            <div className="md:col-span-1">
              <div className="text-2xl font-bold text-white tracking-wider mb-4">
                <span className="text-amber-400">S</span>TS
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                Start To Scale<br />
                創業輔導顧問團隊
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-medium mb-4">快速連結</h4>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-white/60 hover:text-amber-400 transition-colors"
                    >
                      {item.labelZh}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-white font-medium mb-4">聯絡資訊</h4>
              <ul className="space-y-3 text-sm text-white/60">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>台北市中山區</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>02-XXXX-XXXX</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>service@sts.tw</span>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="text-white font-medium mb-4">Follow Us</h4>
              <div className="flex items-center gap-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-amber-400 hover:border-amber-400 transition-all duration-300 group"
                >
                  <Facebook className="w-4 h-4 text-white/70 group-hover:text-white" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-amber-400 hover:border-amber-400 transition-all duration-300 group"
                >
                  <Instagram className="w-4 h-4 text-white/70 group-hover:text-white" />
                </a>
                <a
                  href="https://line.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-[#00B900] hover:border-[#00B900] transition-all duration-300 group"
                >
                  <svg className="w-4 h-4 text-white/70 group-hover:text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/5 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/40">
              Copyright &copy; {new Date().getFullYear()} STS CO., LTD.
            </p>
            <div className="flex items-center gap-4 text-sm text-white/40">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <span>|</span>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Use
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 w-12 h-12 bg-amber-400 hover:bg-amber-500 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 z-30 ${
          showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <ChevronUp className="w-6 h-6" />
      </button>
    </div>
  );
}
