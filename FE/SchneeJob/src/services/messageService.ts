/**
 * Message Service
 * Handles direct messaging and conversations
 */

import api from './api';

export interface Message {
  id: string;
  messageId?: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead?: boolean;
  createdAt?: string;
  [key: string]: any;
}

export interface Conversation {
  id: string;
  conversationId?: string;
  participants?: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  createdAt?: string;
  [key: string]: any;
}

export interface MessageCreateRequest {
  conversationId: string;
  content: string;
}

const messageService = {
  /**
   * Get all conversations
   */
  getConversations: async () => {
    try {
      const res = await api.get<Conversation[]>('/messages/conversations');
      const data = res.data?.data || res.data || [];
      return { ...res, data };
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      throw error;
    }
  },

  /**
   * Get conversation by ID with messages
   */
  getConversation: async (conversationId: string) => {
    try {
      const res = await api.get<Conversation>(`/messages/conversations/${conversationId}`);
      return res;
    } catch (error) {
      console.error(`Failed to fetch conversation ${conversationId}:`, error);
      throw error;
    }
  },

  /**
   * Get messages for a conversation
   */
  getMessages: async (conversationId: string, limit?: number, offset?: number) => {
    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());

      const res = await api.get<Message[]>(
        `/messages/conversations/${conversationId}/messages`,
        { params: Object.fromEntries(params) }
      );
      const data = res.data?.data || res.data || [];
      return { ...res, data };
    } catch (error) {
      console.error(`Failed to fetch messages for conversation ${conversationId}:`, error);
      throw error;
    }
  },

  /**
   * Send message
   */
  send: async (conversationId: string, content: string) => {
    try {
      const res = await api.post<Message>(`/messages/conversations/${conversationId}`, {
        content,
      });
      return res;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },

  /**
   * Start conversation with user
   */
  startConversation: async (userId: string) => {
    try {
      const res = await api.post<Conversation>('/messages/conversations', { userId });
      return res;
    } catch (error) {
      console.error('Failed to start conversation:', error);
      throw error;
    }
  },

  /**
   * Mark message as read
   */
  markAsRead: async (messageId: string) => {
    try {
      const res = await api.put(`/messages/${messageId}/read`);
      return res;
    } catch (error) {
      console.error(`Failed to mark message as read:`, error);
      throw error;
    }
  },

  /**
   * Mark conversation as read
   */
  markConversationAsRead: async (conversationId: string) => {
    try {
      const res = await api.put(`/messages/conversations/${conversationId}/read`);
      return res;
    } catch (error) {
      console.error(`Failed to mark conversation as read:`, error);
      throw error;
    }
  },

  /**
   * Delete message
   */
  deleteMessage: async (messageId: string) => {
    try {
      const res = await api.delete(`/messages/${messageId}`);
      return res;
    } catch (error) {
      console.error(`Failed to delete message:`, error);
      throw error;
    }
  },

  /**
   * Delete conversation
   */
  deleteConversation: async (conversationId: string) => {
    try {
      const res = await api.delete(`/messages/conversations/${conversationId}`);
      return res;
    } catch (error) {
      console.error(`Failed to delete conversation:`, error);
      throw error;
    }
  },

  /**
   * Get unread messages count
   */
  getUnreadCount: async () => {
    try {
      const res = await api.get<number>('/messages/unread/count');
      return res;
    } catch (error) {
      return { data: 0 };
    }
  },

  /**
   * Search messages
   */
  search: async (query: string, conversationId?: string) => {
    try {
      const params: Record<string, string> = { q: query };
      if (conversationId) params.conversationId = conversationId;

      const res = await api.get<Message[]>('/messages/search', { params });
      const data = res.data?.data || res.data || [];
      return { ...res, data };
    } catch (error) {
      console.error('Failed to search messages:', error);
      throw error;
    }
  },
};

export default messageService;
