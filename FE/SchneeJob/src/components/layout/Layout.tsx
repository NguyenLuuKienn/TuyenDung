import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ChatWidget } from "../chat/ChatWidget";
import { useNotification } from "../../hooks/useNotification";
import { Toaster } from "sonner";

export function Layout() {
  useNotification(); // Initialize SignalR listener
  
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
