"use client";

import { useState } from "react";
import { Bot, ToggleLeft, ToggleRight } from "lucide-react";
import { ChatKitWrapper } from "@/components/chat";
import { CustomChat } from "./CustomChat";

export default function ChatPage() {
  // Toggle between ChatKit and custom implementation
  const [useChatKit, setUseChatKit] = useState(true);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-white px-6 py-4 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
              AI CEO Assistant
            </h1>
            <p className="text-sm text-slate-500">
              Powered by {useChatKit ? "OpenAI ChatKit" : "Custom Chat"}
            </p>
          </div>
        </div>

        {/* ChatKit Toggle */}
        <button
          onClick={() => setUseChatKit(!useChatKit)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          title={useChatKit ? "Switch to Custom Chat" : "Switch to ChatKit"}
        >
          {useChatKit ? (
            <ToggleRight className="h-4 w-4 text-primary-600" />
          ) : (
            <ToggleLeft className="h-4 w-4" />
          )}
          {useChatKit ? "ChatKit" : "Custom"}
        </button>
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-hidden">
        {useChatKit ? (
          <ChatKitWrapper className="h-full" />
        ) : (
          <CustomChat />
        )}
      </div>

      {/* Footer */}
      <div className="border-t bg-slate-50 px-6 py-2 dark:bg-slate-900/50">
        <p className="text-center text-xs text-slate-400">
          AI responses are generated and may not always be accurate. Verify
          important information.
        </p>
      </div>
    </div>
  );
}
