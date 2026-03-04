import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";
import ReactDOM from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Trigger animation
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
      // Small delay to ensure animation completes
      const timer = setTimeout(() => {
        document.body.style.overflow = "unset";
      }, 150);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Keyboard escape support
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300 ease-out ${
        isAnimating 
          ? "bg-black/50 opacity-100" 
          : "bg-black/0 opacity-0 pointer-events-none"
      }`}
      style={{
        backdropFilter: isAnimating ? "blur(4px)" : "none",
        WebkitBackdropFilter: isAnimating ? "blur(4px)" : "none",
      }}
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-2xl shadow-2xl w-[90%] sm:w-full sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden transition-all duration-300 ease-out transform ${
          isAnimating
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white flex-shrink-0">
          <h2 className="text-xl font-bold font-display text-gray-900">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 cursor-pointer hover:scale-110 flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
        {footer && (
          <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}



