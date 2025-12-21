"use client";

import { useTranslations as useNextIntlTranslations } from "next-intl";

export const useTranslations = useNextIntlTranslations;

export function setLocale(locale: string) {
  // 設定 cookie，確保 SameSite 屬性正確
  document.cookie = `locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  // 強制刷新頁面以應用新語言
  window.location.href = window.location.pathname;
}
