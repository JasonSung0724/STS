"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { Brain, Plus, AlertCircle } from "lucide-react";
import { getClientSecret } from "@/lib/chatkit";

export default function ChatPage() {
  const t = useTranslations();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0);

  // ChatKit Hook
  const { control } = useChatKit({
    api: {
      getClientSecret: async (existing: string | null | undefined) => {
        try {
          const secret = await getClientSecret(existing ?? undefined);
          setIsReady(true);
          setError(null);
          return secret;
        } catch (err) {
          setError("無法連接到 AI 服務。請確認後端服務正在運行。");
          throw err;
        }
      },
    },
  });

  // 開始新對話 - 透過重新 mount ChatKit 組件
  const startNewChat = useCallback(() => {
    setKey((prev) => prev + 1);
    setError(null);
    setIsReady(false);
  }, []);

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
            <p className="text-sm text-white/50">
              {isReady ? t("chat.ready") : t("chat.thinking")}
            </p>
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
        {error ? (
          <ErrorState message={error} onRetry={startNewChat} />
        ) : (
          <div key={key} className="h-full w-full chatkit-container">
            <ChatKit
              control={control}
              className="h-full w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-400/10 border border-red-400/20">
          <AlertCircle className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">連接失敗</h2>
        <p className="text-white/60 mb-6">{message}</p>
        <button
          onClick={onRetry}
          className="btn-primary inline-flex items-center gap-2"
        >
          重試連接
        </button>
      </div>
    </div>
  );
}
