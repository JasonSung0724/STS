"use client";

import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { useAuthStore } from "@/stores/auth-store";
import { Bot } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ChatKitWrapperProps {
  className?: string;
}

export function ChatKitWrapper({ className }: ChatKitWrapperProps) {
  const { user } = useAuthStore();

  const { control } = useChatKit({
    api: {
      // Get client secret from our backend
      async getClientSecret() {
        const token = localStorage.getItem("access_token");

        const res = await fetch(`${API_URL}/api/v1/chatkit/session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to create ChatKit session");
        }

        const data = await res.json();
        return data.client_secret;
      },

      // Custom respond endpoint (uses our backend instead of OpenAI hosted)
      async respond(messages) {
        const token = localStorage.getItem("access_token");

        const res = await fetch(`${API_URL}/api/v1/chatkit/respond`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ messages }),
        });

        if (!res.ok) {
          throw new Error("Failed to get response");
        }

        return res;
      },
    },

    // Event handlers
    onResponseStart: () => {
      console.log("ChatKit: Response started");
    },
    onResponseEnd: () => {
      console.log("ChatKit: Response ended");
    },
    onError: (error) => {
      console.error("ChatKit error:", error);
    },
  });

  return (
    <div className={className}>
      <ChatKit
        control={control}
        className="h-full w-full"
        branding={{
          name: "STS AI CEO",
          logo: (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white">
              <Bot className="h-4 w-4" />
            </div>
          ),
        }}
        placeholder="Ask about revenue, KPIs, costs, or any business insights..."
        welcomeMessage={`Hello${user?.name ? `, ${user.name}` : ""}! I'm your AI CEO assistant. I can help you analyze business data, track KPIs, optimize costs, and provide strategic insights. How can I assist you today?`}
      />
    </div>
  );
}
