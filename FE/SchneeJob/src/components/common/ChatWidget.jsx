import { useState, useEffect, useRef, useCallback } from 'react';
import { FiMessageCircle, FiX, FiSend, FiCheck, FiCheckCircle, FiMinus, FiMoreVertical } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatWidgetContext';
import messageService from '../../services/messageService';
import signalRService from '../../services/signalRService';

const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
        const dateToParse = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
        return formatDistanceToNow(new Date(dateToParse), { addSuffix: true, locale: vi });
    } catch (e) {
        return '';
    }
};

const ChatWidget = () => {
    const { user, isAuthenticated } = useAuth();
    const { isChatOpen, openChat, closeChat, targetUserId, targetUser, conversations, loadConversations, subscribeToMessages } = useChat();
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isMinimized, setIsMinimized] = useState(false);
    const messagesEndRef = useRef(null);



    // Handle targetUserId change (e.g. opening chat with specific user)
    useEffect(() => {
        if (targetUserId) {
            const existingConversation = conversations.find(c => c.otherUser.userId === targetUserId);

            if (existingConversation) {
                handleSelectChat(existingConversation);
            } else if (targetUser) {
                // Create temporary chat object for new conversation
                setActiveChat({
                    conversationId: 'new', // Temporary ID
                    otherUser: {
                        userId: targetUserId,
                        fullName: targetUser.fullName || targetUser.name || targetUser.contactPersonName || 'User',
                        avatar: targetUser.avatar || targetUser.avatarURL || targetUser.logo || targetUser.logoURL || null,
                        companyName: targetUser.companyName || null
                    },
                    status: 'New', // Special status
                    messages: []
                });
                setMessages([]);
                setIsMinimized(false);
            }
        }
    }, [targetUserId, conversations, targetUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Memoize the message handler to allow proper cleanup
    const handleReceiveMessage = useCallback((message) => {
        if (activeChat && message.conversationId === activeChat.conversationId) {
            setMessages(prev => {
                // Determine if this is a message from 'me'
                const currentUserId = user?.id || user?.userId;
                const isMe = message.senderId?.toString() === currentUserId?.toString();

                // If it's from me, look for a pending optimistic message to replace
                if (isMe) {
                    const optimisticMatchIndex = prev.findIndex(m =>
                        m.isOptimistic &&
                        m.content === message.content &&
                        // Optional: check valid time window (e.g. within last 10 seconds)
                        (new Date() - new Date(m.sentAt)) < 10000
                    );

                    if (optimisticMatchIndex !== -1) {
                        const newMessages = [...prev];
                        newMessages[optimisticMatchIndex] = message; // Replace optimistic with real
                        return newMessages;
                    }
                }

                // Prevent duplicates (fallback check by ID)
                if (prev.some(m => m.messageId === message.messageId)) return prev;

                return [...prev, message];
            });
            messageService.markAsRead(message.conversationId);
        }
        // Also trigger conversation reload in context to update snippets/unread
        loadConversations();
    }, [activeChat, loadConversations, user]);

    const handleStatusChange = useCallback(({ conversationId, status }) => {
        if (activeChat?.conversationId === conversationId) {
            setActiveChat(prev => ({ ...prev, status }));
        }
    }, [activeChat]);

    // Handle when the OTHER user reads my messages
    const handleMessageRead = useCallback((conversationId) => {
        if (activeChat && activeChat.conversationId === conversationId) {
            setMessages(prev => prev.map(msg =>
                msg.senderId === user.id ? { ...msg, isRead: true } : msg
            ));
        }
    }, [activeChat, user]);

    useEffect(() => {
        if (isAuthenticated && isChatOpen) {
            const token = localStorage.getItem('token');
            if (token) {
                // Ensure connection is started (idempotent usually)
                signalRService.start(token).then(() => {
                    signalRService.onReceiveMessage(handleReceiveMessage);
                    signalRService.onConversationStatusChanged(handleStatusChange);
                    signalRService.onMessageRead(handleMessageRead);
                });
            }
        }

        return () => {
            // Remove ONLY our specific handlers
            if (signalRService.off.length > 1 || true) {
                signalRService.off('ReceiveMessage', handleReceiveMessage);
                signalRService.off('ConversationStatusChanged', handleStatusChange);
                signalRService.off('MessageRead', handleMessageRead);
            }
        };
    }, [isAuthenticated, isChatOpen, handleReceiveMessage, handleStatusChange, handleMessageRead]);

    // NOTE: Removed local loadConversations in favor of context's loadConversations

    const loadMessages = async (conversationId) => {
        try {
            const response = await messageService.getMessages(conversationId);
            setMessages(response.data || []);
            await messageService.markAsRead(conversationId);
        } catch (err) {
            console.error('Load messages error:', err);
        }
    };

    const handleSelectChat = async (conversation) => {
        setActiveChat(conversation);
        setIsMinimized(false);
        await loadMessages(conversation.conversationId);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        const content = newMessage.trim();
        setNewMessage(''); // Clear input immediately

        // Optimistic update
        const optimisticMessage = {
            messageId: Date.now().toString(), // Temp ID
            senderId: user.id || user.userId, // Use correct ID property
            content: content,
            sentAt: new Date().toISOString(),
            isRead: false,
            conversationId: activeChat.conversationId,
            isOptimistic: true // Mark as optimistic
        };

        setMessages(prev => [...prev, optimisticMessage]);

        try {
            await signalRService.sendMessage(activeChat.otherUser.userId, content);

            // If it was a new conversation, reload to get the real conversation ID created by backend
            if (activeChat.status === 'New') {
                await loadConversations();
            }
        } catch (err) {
            console.error('Send message error:', err);
            // Rollback on error (optional, but good practice)
            setMessages(prev => prev.filter(m => m.messageId !== optimisticMessage.messageId));
            toast.error('Gửi tin nhắn thất bại');
        }
    };

    const handleAccept = async () => {
        try {
            await messageService.acceptConversation(activeChat.conversationId);
            setActiveChat(prev => ({ ...prev, status: 'Accepted' }));
        } catch (err) {
            console.error('Accept error:', err);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

    if (!isAuthenticated) return null;

    return (
        <>
            {/* Main Chat Button */}
            {!isChatOpen && (
                <button
                    onClick={() => openChat()}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-full shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center z-50 group"
                >
                    <FiMessageCircle className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" />
                    {totalUnread > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                            {totalUnread}
                        </span>
                    )}
                </button>
            )}

            {/* Chat Widget Container */}
            {isChatOpen && (
                <div className="fixed bottom-6 right-6 w-[360px] h-[550px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700 font-sans animate-fade-in-up">

                    {/* Header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white flex items-center justify-between shadow-sm shrink-0">
                        <div className="flex items-center gap-3">
                            {activeChat && (
                                <button onClick={() => setActiveChat(null)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
                                    <FiX className="w-5 h-5 rotate-45" /> {/* Back Icon using X rotated or arrow */}
                                </button>
                            )}
                            <h3 className="font-bold text-lg tracking-wide">
                                {activeChat ? activeChat.otherUser.fullName : 'Tin nhắn'}
                            </h3>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={closeChat} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                                <FiMinus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900 relative">

                        {/* Conversation List */}
                        {!activeChat && (
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                                {conversations.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                            <FiMessageCircle className="w-8 h-8 opacity-50" />
                                        </div>
                                        <p className="font-medium">Chưa có cuộc trò chuyện nào</p>
                                        <p className="text-sm mt-1">Hãy kết nối với nhà tuyển dụng ngay!</p>
                                    </div>
                                ) : (
                                    conversations.map((conv) => (
                                        <div
                                            key={conv.conversationId}
                                            onClick={() => handleSelectChat(conv)}
                                            className="group p-3 mb-1 rounded-xl cursor-pointer hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700 flex items-center gap-3 relative"
                                        >
                                            <div className="relative">
                                                <img
                                                    src={conv.otherUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${conv.otherUser.fullName}`}
                                                    alt={conv.otherUser.fullName}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm"
                                                />
                                                {conv.online && (
                                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-0.5">
                                                    <h4 className="font-bold text-gray-800 dark:text-gray-100 truncate group-hover:text-primary-600 transition-colors">
                                                        {conv.otherUser.fullName}
                                                    </h4>
                                                    {conv.lastMessage && (
                                                        <span className="text-[10px] text-gray-400 font-medium">
                                                            {formatTime(conv.lastMessage.sentAt)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className={`text-sm truncate max-w-[180px] ${conv.unreadCount > 0 ? 'font-semibold text-gray-800 dark:text-gray-200' : 'text-gray-500'}`}>
                                                        {conv.lastMessage?.content || <span className="italic opacity-50">Chưa có tin nhắn</span>}
                                                    </p>
                                                    {conv.unreadCount > 0 && (
                                                        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-sm">
                                                            {conv.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Active Chat View */}
                        {activeChat && (
                            <>
                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-[#F0F2F5] dark:bg-gray-900">
                                    {/* Helper to block if pending */}
                                    {activeChat.status === 'Pending' && !activeChat.isInitiator && (
                                        <div className="mx-4 my-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center shadow-sm">
                                            <p className="text-sm text-yellow-800 mb-2 font-medium">
                                                Người này muốn nhắn tin với bạn
                                            </p>
                                            <button
                                                onClick={handleAccept}
                                                className="px-4 py-1.5 bg-yellow-600 text-white rounded-full text-sm font-bold shadow hover:bg-yellow-700 transition"
                                            >
                                                Chấp nhận
                                            </button>
                                        </div>
                                    )}

                                    {messages.map((message) => {
                                        const currentUserId = user?.id || user?.userId;
                                        const isMe = message.senderId?.toString() === currentUserId?.toString();
                                        return (
                                            <div
                                                key={message.messageId}
                                                className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                                                    <div
                                                        className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm break-words relative group ${isMe
                                                            ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white rounded-tr-sm'
                                                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm'
                                                            }`}
                                                    >
                                                        {message.content}
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-1 px-1">
                                                        <span className="text-[10px] text-gray-400 font-medium">
                                                            {formatTime(message.sentAt)}
                                                        </span>
                                                        {isMe && (
                                                            message.isRead ?
                                                                <FiCheckCircle className="w-3 h-3 text-primary-500" title="Đã xem" /> :
                                                                <FiCheck className="w-3 h-3 text-gray-400" title="Đã gửi" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                {activeChat.status !== 'Blocked' && activeChat.status !== 'Rejected' && (
                                    <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shrink-0">
                                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                            <div className="flex-1 relative">
                                                <input
                                                    type="text"
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    placeholder={activeChat.status === 'Pending' && !activeChat.isInitiator ? "Đang chờ chấp nhận..." : "Nhập tin nhắn..."}
                                                    disabled={activeChat.status === 'Pending' && !activeChat.isInitiator}
                                                    className="w-full pl-4 pr-10 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-full border-none focus:ring-2 focus:ring-primary-500/50 text-sm placeholder:text-gray-400 transition-all"
                                                />
                                                {/* Optional: Add emoji button or attachment icon here via absolute positioning */}
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={!newMessage.trim()}
                                                className="p-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:hover:scale-100 disabled:cursor-not-allowed"
                                            >
                                                <FiSend className="w-4 h-4 ml-0.5" />
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWidget;
