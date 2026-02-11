import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import messageService from '../services/messageService';
import signalRService from '../services/signalRService';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [targetUserId, setTargetUserId] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);



    useEffect(() => {
        const total = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        setUnreadCount(total);
    }, [conversations]);

    const loadConversations = React.useCallback(async () => {
        try {
            const response = await messageService.getConversations();
            setConversations(response.data || []);
        } catch (err) {
            console.error('Load conversations error:', err);
        }
    }, []);

    const setupSignalR = React.useCallback(async () => {
        const token = localStorage.getItem('token');
        if (token) {
            await signalRService.start(token);

            signalRService.onReceiveMessage((message) => {
                loadConversations();
            });

            signalRService.onConversationStatusChanged(({ conversationId, status }) => {
                setConversations(prev => prev.map(c =>
                    c.conversationId === conversationId ? { ...c, status } : c
                ));
            });
        }
    }, [loadConversations]);

    useEffect(() => {
        if (isAuthenticated) {
            loadConversations();
            setupSignalR();
        } else {
            // Reset state on logout
            setConversations([]);
            setUnreadCount(0);
            setIsChatOpen(false);
            setTargetUserId(null);
            setTargetUser(null);
        }
        return () => {
            signalRService.off('ReceiveMessage');
            signalRService.off('ConversationStatusChanged');
        };
    }, [isAuthenticated, loadConversations, setupSignalR]);

    const [targetUser, setTargetUser] = useState(null);

    const openChat = (userOrId) => {
        if (!userOrId) {
            setTargetUserId(null);
            setTargetUser(null);
            setIsChatOpen(true);
            return;
        }

        if (typeof userOrId === 'object') {
            setTargetUserId(userOrId.id || userOrId.userId || userOrId.contactUserId);
            setTargetUser(userOrId);
        } else {
            setTargetUserId(userOrId);
            setTargetUser(null); // Reset provided user if only ID is given
        }
        setIsChatOpen(true);
    };

    const closeChat = () => {
        setIsChatOpen(false);
        setTargetUserId(null);
    };

    const getTotalUnreadCount = () => unreadCount;

    return (
        <ChatContext.Provider value={{
            isChatOpen,
            isChatOpen,
            targetUserId,
            targetUser,
            openChat,
            closeChat,
            conversations,
            unreadCount,
            getTotalUnreadCount,
            loadConversations,
            setConversations
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within ChatProvider');
    }
    return context;
};
