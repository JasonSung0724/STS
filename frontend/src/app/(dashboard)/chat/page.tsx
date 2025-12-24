"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { Brain, Plus, AlertCircle, Loader2 } from "lucide-react";
import { getChatKitApiConfig } from "@/lib/chatkit";

export default function ChatPage() {
  const t = useTranslations();
  const [key, setKey] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const apiConfig = getChatKitApiConfig();

  useEffect(() => {
    setIsLoading(false);
  }, []);

  // ChatKit Hook - Self-hosted mode with api.url and domainKey
  const chatkit = useChatKit({
    api: apiConfig,
    theme: "dark",
  });

  // 開始新對話 - 透過重新 mount ChatKit 組件
  const startNewChat = useCallback(() => {
    setKey((prev) => prev + 1);
    setHasError(false);
  }, []);

  // Handle errors from ChatKit
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Global error:", event.message);
      if (event.message?.includes("ChatKit") || event.message?.includes("chatkit")) {
        console.error("ChatKit error:", event);
        setHasError(true);
      }
    };
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-cyan to-accent-blue">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">{t("chat.title")}</h1>
            <p className="text-sm text-white/50">{t("chat.subtitle")}</p>
          </div>
        </div>
        <button
          onClick={startNewChat}
          className="btn-secondary inline-flex items-center gap-2 py-2 text-sm"
        >
          <Plus className="h-4 w-4" />
          {t("chat.newChat")}
        </button>
      </div>

      {/* ChatKit Container */}
      <div className="flex-1 overflow-hidden">
        {hasError ? (
          <ErrorState onRetry={startNewChat} />
        ) : (
          <div key={key} className="h-full w-full chatkit-container">
            <ChatKit
              control={chatkit.control}
              className="h-full w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations();
  return (
    <div className="flex h-full items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-400/10 border border-red-400/20">
          <AlertCircle className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{t("chat.connectionFailed")}</h2>
        <p className="text-white/60 mb-6">{t("chat.connectionFailedDesc")}</p>
        <button
          onClick={onRetry}
          className="btn-primary inline-flex items-center gap-2"
        >
          {t("chat.retry")}
        </button>
      </div>
    </div>
  );
}
