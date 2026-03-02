import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Search, Send, Paperclip, MoreVertical, Check, CheckCheck } from "lucide-react";

const MOCK_CONVERSATIONS = [
  { id: 1, name: "TechCorp HR", role: "Employer", avatar: "https://picsum.photos/seed/techcorp/100/100", lastMessage: "When are you available for an interview?", time: "10:30 AM", unread: 2, online: true },
  { id: 2, name: "DataFlow Recruiter", role: "Employer", avatar: "https://picsum.photos/seed/dataflow/100/100", lastMessage: "Thanks for your application.", time: "Yesterday", unread: 0, online: false },
  { id: 3, name: "Creative Studio", role: "Employer", avatar: "https://picsum.photos/seed/creative/100/100", lastMessage: "We'd like to offer you the position.", time: "Oct 24", unread: 0, online: true },
];

const MOCK_MESSAGES = [
  { id: 1, senderId: 1, text: "Hi Nguyen, thanks for applying to the Senior Frontend Developer position.", time: "10:00 AM", isMine: false, status: "read" },
  { id: 2, senderId: 1, text: "Your profile looks great. We'd love to schedule a technical interview.", time: "10:05 AM", isMine: false, status: "read" },
  { id: 3, senderId: "me", text: "Hello! Thank you for getting back to me. I'm very interested in the role.", time: "10:15 AM", isMine: true, status: "read" },
  { id: 4, senderId: "me", text: "I'm available this Thursday or Friday afternoon.", time: "10:16 AM", isMine: true, status: "read" },
  { id: 5, senderId: 1, text: "Great! Let's do Thursday at 2 PM. I'll send a calendar invite.", time: "10:25 AM", isMine: false, status: "unread" },
  { id: 6, senderId: 1, text: "When are you available for an interview?", time: "10:30 AM", isMine: false, status: "unread" },
];

export function Messages() {
  const [activeConv, setActiveConv] = useState(MOCK_CONVERSATIONS[0]);
  const [message, setMessage] = useState("");

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl h-[calc(100vh-120px)]">
        <Card className="h-full flex overflow-hidden">
          
          {/* Sidebar */}
          <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col bg-white">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search messages..." className="pl-9 bg-gray-50" />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {MOCK_CONVERSATIONS.map((conv) => (
                <div 
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-gray-100 last:border-0 ${
                    activeConv.id === conv.id ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="relative">
                    <Avatar src={conv.avatar} alt={conv.name} className="h-12 w-12" />
                    {conv.online && <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{conv.name}</h3>
                      <span className="text-xs text-gray-500 shrink-0">{conv.time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className={`text-sm truncate ${conv.unread > 0 ? "font-semibold text-gray-900" : "text-gray-500"}`}>
                        {conv.lastMessage}
                      </p>
                      {conv.unread > 0 && (
                        <span className="ml-2 h-5 w-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center shrink-0">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="hidden md:flex flex-1 flex-col bg-gray-50">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar src={activeConv.avatar} alt={activeConv.name} className="h-10 w-10" />
                <div>
                  <h3 className="font-bold text-gray-900">{activeConv.name}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    {activeConv.online ? (
                      <><span className="h-2 w-2 rounded-full bg-green-500 inline-block"></span> Online</>
                    ) : "Offline"}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-gray-500">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="text-center my-4">
                <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full">Today</span>
              </div>
              
              {MOCK_MESSAGES.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    msg.isMine ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white border border-gray-200 text-gray-900 rounded-tl-sm"
                  }`}>
                    <p className="text-sm">{msg.text}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${msg.isMine ? "text-blue-200" : "text-gray-400"}`}>
                      <span>{msg.time}</span>
                      {msg.isMine && (
                        msg.status === "read" ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-gray-500 shrink-0">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input 
                  placeholder="Type a message..." 
                  className="flex-1 bg-gray-50 border-transparent focus-visible:ring-blue-500"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && setMessage("")}
                />
                <Button 
                  className="shrink-0 bg-blue-600 hover:bg-blue-700" 
                  size="icon"
                  onClick={() => setMessage("")}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
