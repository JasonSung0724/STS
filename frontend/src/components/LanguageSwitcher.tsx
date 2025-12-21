"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Globe, Check, ChevronDown } from "lucide-react";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { setLocale } from "@/i18n/client";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  currentLocale: string;
  variant?: "dropdown" | "inline";
  className?: string;
}

export function LanguageSwitcher({
  currentLocale,
  variant = "dropdown",
  className,
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  // 確保在客戶端渲染
  useEffect(() => {
    setMounted(true);
  }, []);

  // 計算下拉選單位置
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  // 點擊外部關閉
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleLocaleChange = (locale: Locale) => {
    setIsOpen(false);
    if (locale !== currentLocale) {
      // 延遲執行以確保選單已關閉
      setTimeout(() => {
        setLocale(locale);
      }, 100);
    }
  };

  if (variant === "inline") {
    return (
      <div className={cn("flex gap-2", className)}>
        {locales.map((locale) => (
          <button
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg transition-colors",
              locale === currentLocale
                ? "bg-accent-cyan/20 text-accent-cyan"
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            {localeNames[locale]}
          </button>
        ))}
      </div>
    );
  }

  const dropdownMenu = isOpen && mounted ? (
    <div
      ref={dropdownRef}
      className="fixed w-44 py-2 rounded-xl bg-slate-900 border border-white/10 shadow-2xl"
      style={{
        top: dropdownPosition.top,
        right: dropdownPosition.right,
        zIndex: 99999,
      }}
    >
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => handleLocaleChange(locale)}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3 text-sm transition-colors cursor-pointer hover:bg-white/10",
            locale === currentLocale
              ? "text-accent-cyan bg-accent-cyan/10"
              : "text-white/70 hover:text-white"
          )}
        >
          <span>{localeNames[locale]}</span>
          {locale === currentLocale && <Check className="h-4 w-4" />}
        </button>
      ))}
    </div>
  ) : null;

  return (
    <div className={cn("relative", className)}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
        type="button"
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm">{localeNames[currentLocale as Locale]}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {mounted && dropdownMenu && createPortal(dropdownMenu, document.body)}
    </div>
  );
}
