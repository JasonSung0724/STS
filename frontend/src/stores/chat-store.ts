import { create } from "zustand";
import type { Conversation, Message } from "@/types";

interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoading: boolean;

  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  setIsLoading: (isLoading: boolean) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  conversations: [],
  currentConversation: null,
  isLoading: false,

  setConversations: (conversations) => set({ conversations }),

  setCurrentConversation: (conversation) =>
    set({ currentConversation: conversation }),

  addMessage: (message) =>
    set((state) => {
      if (!state.currentConversation) return state;

      const updatedConversation = {
        ...state.currentConversation,
        messages: [...state.currentConversation.messages, message],
      };

      return {
        currentConversation: updatedConversation,
        conversations: state.conversations.map((c) =>
          c.id === updatedConversation.id ? updatedConversation : c
        ),
      };
    }),

  updateMessage: (messageId, updates) =>
    set((state) => {
      if (!state.currentConversation) return state;

      const updatedMessages = state.currentConversation.messages.map((m) =>
        m.id === messageId ? { ...m, ...updates } : m
      );

      const updatedConversation = {
        ...state.currentConversation,
        messages: updatedMessages,
      };

      return {
        currentConversation: updatedConversation,
        conversations: state.conversations.map((c) =>
          c.id === updatedConversation.id ? updatedConversation : c
        ),
      };
    }),

  setIsLoading: (isLoading) => set({ isLoading }),

  clearChat: () =>
    set({
      currentConversation: null,
      conversations: [],
    }),
}));
