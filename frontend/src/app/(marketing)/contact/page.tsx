"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ChevronDown, Send, Check } from "lucide-react";

const inquiryTypes = [
  { value: "", label: "請選擇" },
  { value: "startup", label: "創業諮詢" },
  { value: "finance", label: "財務規劃" },
  { value: "marketing", label: "行銷策略" },
  { value: "tech", label: "技術顧問" },
  { value: "legal", label: "法律諮詢" },
  { value: "other", label: "其他" },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    inquiryType: "",
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
    agreeTerms: false,
    agreePrivacy: false,
  });

  const contentRef = useRef<HTMLDivElement>(null);

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
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
            CONTACT US&nbsp;&nbsp;&nbsp;CONTACT US&nbsp;&nbsp;&nbsp;CONTACT US&nbsp;&nbsp;&nbsp;
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-8 h-8 border border-amber-400/50 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-amber-400 rounded-full" />
            </div>
            <p className="text-amber-400 tracking-widest uppercase">Contact Us</p>
          </div>
          <h1 className="text-5xl md:text-7xl font-light text-white tracking-wider mb-4">
            聯絡我們
          </h1>
          <p className="text-lg text-white/50 max-w-md mx-auto">
            有任何問題或需要諮詢，歡迎與我們聯繫
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
            <span className="text-white">Contact Us</span>
          </nav>
        </div>
      </div>

      {/* Contact Form Section */}
      <section ref={contentRef} className="py-24 bg-[#f5f5f0]">
        <div className="mx-auto max-w-4xl px-6">
          {/* Intro Text */}
          <div className="text-center mb-12">
            <h2 className="text-2xl font-medium text-gray-900 mb-4">
              感謝您對我們公司的關注
            </h2>
            <p className="text-gray-600">
              如果您對我們的服務項目有任何疑問，請隨時與我們聯繫。
              <br />
              在確認您的詢問內容後，我們的工作人員將與您聯繫。
            </p>
          </div>

          {/* Form Header */}
          <div className="flex items-center gap-4 mb-8">
            <div>
              <p className="text-sm text-amber-600 tracking-widest uppercase">CONTACT FORM</p>
              <h3 className="text-xl font-medium text-gray-900">聯絡表單</h3>
            </div>
            <span className="text-amber-600 text-sm">* 表示必填欄位</span>
          </div>

          {isSubmitted ? (
            /* Success Message */
            <div className="bg-white rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-medium text-gray-900 mb-4">
                感謝您的來信！
              </h3>
              <p className="text-gray-600 mb-8">
                我們已收到您的詢問，將盡快與您聯繫。
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-500 text-gray-900 font-medium rounded-full transition-all duration-300"
              >
                返回首頁
              </Link>
            </div>
          ) : (
            /* Contact Form */
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 md:p-12">
              <div className="space-y-6">
                {/* Inquiry Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    詢問項目 <span className="text-amber-600">*</span>
                  </label>
                  <select
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
                  >
                    {inquiryTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name & Email Row */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      姓名 <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="請輸入您的姓名"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      電子郵件 <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="請輸入您的電子郵件"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    手機號碼 <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="請輸入您的手機號碼"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    公司名稱
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="請輸入您的公司名稱"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    諮詢內容 <span className="text-amber-600">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="請輸入詢問或諮詢的具體細節說明。"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all resize-none"
                  />
                </div>

                {/* Agreements */}
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      required
                      className="mt-1 w-4 h-4 text-amber-400 border-gray-300 rounded focus:ring-amber-400"
                    />
                    <span className="text-sm text-gray-600">
                      我已閱讀並同意遵守網站{" "}
                      <Link href="/terms" className="text-amber-600 hover:underline">
                        使用條款
                      </Link>
                      ，並了解我的詢問內容將按照規定處理。
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreePrivacy"
                      checked={formData.agreePrivacy}
                      onChange={handleChange}
                      required
                      className="mt-1 w-4 h-4 text-amber-400 border-gray-300 rounded focus:ring-amber-400"
                    />
                    <span className="text-sm text-gray-600">
                      我已閱讀並同意遵守{" "}
                      <Link href="/privacy" className="text-amber-600 hover:underline">
                        隱私權聲明
                      </Link>
                      。
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-6 text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-12 py-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-full transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>送出中...</span>
                      </>
                    ) : (
                      <>
                        <span>送出</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
