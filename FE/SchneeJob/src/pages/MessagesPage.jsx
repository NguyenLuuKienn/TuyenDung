import { useState, useEffect, useRef } from 'react';
import { FiSend, FiMoreVertical, FiCheck, FiCheckCircle, FiX, FiShield } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import Swal from 'sweetalert2';
import { useAuth } from '../contexts/AuthContext';
import messageService from '../services/messageService';
import signalRService from '../services/signalRService';

const MessagesPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
    setupSignalR();

    return () => {
      signalRService.off('ReceiveMessage');
      signalRService.off('ConversationStatusChanged');
      signalRService.off('MessageRead');
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupSignalR = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await signalRService.start(token);

      signalRService.onReceiveMessage((message) => {
        if (selectedConversation && message.conversationId === selectedConversation.conversationId) {
          setMessages(prev => [...prev, message]);
          messageService.markAsRead(message.conversationId);
        }
        loadConversations();
      });

      signalRService.onConversationStatusChanged(({ conversationId, status }) => {
        setConversations(prev => prev.map(c =>
          c.conversationId === conversationId ? { ...c, status } : c
        ));
        if (selectedConversation?.conversationId === conversationId) {
          setSelectedConversation(prev => ({ ...prev, status }));
        }
      });

      signalRService.onMessageRead(({ conversationId }) => {
        if (selectedConversation?.conversationId === conversationId) {
          setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
        }
      });
    }
  };

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const response = await messageService.getConversations();
      setConversations(response.data || []);
    } catch (err) {
      console.error('Load conversations error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await messageService.getMessages(conversationId);
      setMessages(response.data || []);
      await messageService.markAsRead(conversationId);
    } catch (err) {
      console.error('Load messages error:', err);
    }
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    await loadMessages(conversation.conversationId);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setIsSending(true);
    try {
      await signalRService.sendMessage(selectedConversation.otherUser.userId, newMessage);
      setNewMessage('');
    } catch (err) {
      console.error('Send message error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể gửi tin nhắn'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleAccept = async () => {
    try {
      await messageService.acceptConversation(selectedConversation.conversationId);
      setSelectedConversation(prev => ({ ...prev, status: 'Accepted' }));
      Swal.fire({
        icon: 'success',
        title: 'Đã chấp nhận',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('Accept error:', err);
    }
  };

  const handleReject = async () => {
    const result = await Swal.fire({
      title: 'Từ chối cuộc trò chuyện?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Từ chối',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await messageService.rejectConversation(selectedConversation.conversationId);
        setSelectedConversation(null);
        loadConversations();
      } catch (err) {
        console.error('Reject error:', err);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="h-[calc(100vh-80px)] flex bg-gray-50 dark:bg-gray-900">
      {/* Conversations List */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tin nhắn</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Chưa có cuộc trò chuyện nào
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.conversationId}
                onClick={() => handleSelectConversation(conv)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 ${selectedConversation?.conversationId === conv.conversationId ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
              >
                <img
                  src={conv.otherUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${conv.otherUser.fullName}`}
                  alt={conv.otherUser.fullName}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {conv.otherUser.fullName}
                    </h3>
                    {conv.lastMessage && (
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(conv.lastMessage.sentAt), { addSuffix: true, locale: vi })}
                      </span>
                    )}
                  </div>
                  {conv.lastMessage && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {conv.lastMessage.content}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {conv.status === 'Pending' && (
                      <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                        Chờ chấp nhận
                      </span>
                    )}
                    {conv.unreadCount > 0 && (
                      <span className="text-xs px-2 py-0.5 bg-primary-600 text-white rounded-full">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedConversation.otherUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedConversation.otherUser.fullName}`}
                  alt={selectedConversation.otherUser.fullName}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {selectedConversation.otherUser.fullName}
                  </h3>
                  {selectedConversation.otherUser.companyName && (
                    <p className="text-sm text-gray-500">{selectedConversation.otherUser.companyName}</p>
                  )}
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <FiMoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Pending Request Banner */}
            {selectedConversation.status === 'Pending' && !selectedConversation.isInitiator && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                  {selectedConversation.otherUser.fullName} muốn nhắn tin với bạn
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleAccept}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                  >
                    Chấp nhận
                  </button>
                  <button
                    onClick={handleReject}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
              {messages.map((message) => (
                <div
                  key={message.messageId}
                  className={`flex ${message.senderId === user?.userId ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${message.senderId === user?.userId ? 'order-2' : 'order-1'}`}>
                    <div className={`px-4 py-2 rounded-2xl ${message.senderId === user?.userId
                      ? 'bg-primary-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                      }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${message.senderId === user?.userId ? 'justify-end' : 'justify-start'
                      }`}>
                      <span>{formatDistanceToNow(new Date(message.sentAt), { addSuffix: true, locale: vi })}</span>
                      {message.senderId === user?.userId && (
                        message.isRead ? <FiCheckCircle className="w-3 h-3 text-primary-600" /> : <FiCheck className="w-3 h-3" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            {selectedConversation.status !== 'Blocked' && selectedConversation.status !== 'Rejected' && (
              <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    disabled={selectedConversation.status === 'Pending' && !selectedConversation.isInitiator}
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full border-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="px-6 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSend className="w-5 h-5" />
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Chọn một cuộc trò chuyện để bắt đầu
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
