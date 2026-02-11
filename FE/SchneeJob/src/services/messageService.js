import api from './api';

const messageService = {
    // Get all conversations
    getConversations: async () => {
        return await api.get('/api/messages/conversations');
    },

    // Get conversation by ID
    getConversation: async (id) => {
        return await api.get(`/api/messages/conversations/${id}`);
    },

    // Get messages in a conversation
    getMessages: async (conversationId) => {
        return await api.get(`/api/messages/conversations/${conversationId}/messages`);
    },

    // Send a message
    sendMessage: async (receiverId, content) => {
        return await api.post('/api/messages', { receiverId, content });
    },

    // Accept conversation request
    acceptConversation: async (conversationId) => {
        return await api.post(`/api/messages/conversations/${conversationId}/accept`);
    },

    // Reject conversation request
    rejectConversation: async (conversationId) => {
        return await api.post(`/api/messages/conversations/${conversationId}/reject`);
    },

    // Block conversation
    blockConversation: async (conversationId) => {
        return await api.post(`/api/messages/conversations/${conversationId}/block`);
    },

    // Mark messages as read
    markAsRead: async (conversationId) => {
        return await api.put(`/api/messages/conversations/${conversationId}/read`);
    }
};

export default messageService;
