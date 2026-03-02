import { useState } from 'react';
import { MessageSquare, X, Send, Minimize2, Maximize2 } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');

  const [messages, setMessages] = useState([
    { id: 1, text: 'Chào bạn, mình có thể giúp gì cho bạn?', sender: 'them', time: '10:00' },
    { id: 2, text: 'Mình muốn hỏi về vị trí Frontend Developer', sender: 'me', time: '10:05' },
    { id: 3, text: 'Vị trí này yêu cầu kinh nghiệm React ít nhất 2 năm nhé.', sender: 'them', time: '10:06' },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setMessages([...messages, {
      id: Date.now(),
      text: message,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setMessage('');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => { setIsOpen(true); setIsMinimized(false); }}
        className="fixed bottom-6 right-6 h-14 w-14 bg-brand text-white rounded-full shadow-xl flex items-center justify-center hover:bg-brand-hover hover:scale-105 transition-all z-50 cursor-pointer"
      >
        <MessageSquare className="h-6 w-6" />
        <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
      </button>
    );
  }

  return (
    <div className={`fixed right-6 z-50 flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 ${isMinimized ? 'bottom-6 h-14 w-72' : 'bottom-6 h-[500px] w-80 sm:w-96'}`}>
      {/* Header */}
      <div 
        className="bg-brand text-white p-3 flex items-center justify-between cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar src="https://picsum.photos/seed/techcorp/100/100" className="h-8 w-8 border border-white/20" />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-400 rounded-full border-2 border-brand"></span>
          </div>
          <div>
            <h4 className="font-bold text-sm">TechCorp HR</h4>
            <p className="text-[10px] text-white/80">Đang hoạt động</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            <div className="text-center text-xs text-gray-400 my-2">Hôm nay</div>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'them' && (
                  <Avatar src="https://picsum.photos/seed/techcorp/100/100" className="h-6 w-6 mr-2 mt-auto" />
                )}
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  msg.sender === 'me' 
                    ? 'bg-brand text-white rounded-br-sm' 
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${msg.sender === 'me' ? 'text-white/70 text-right' : 'text-gray-400'}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100">
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 bg-gray-100 border-transparent rounded-full px-4 py-2 text-sm focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
              />
              <Button type="submit" size="icon" className="rounded-full shrink-0 h-9 w-9 cursor-pointer" disabled={!message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
