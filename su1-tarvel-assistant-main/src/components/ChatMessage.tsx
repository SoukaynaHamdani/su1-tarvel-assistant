
import React from 'react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  isTyping?: boolean;
}

const ChatMessage = ({ message, isUser, isTyping = false }: ChatMessageProps) => {
  return (
    <div className={cn(
      'flex mb-4',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      <div className={cn(
        'max-w-[80%] rounded-2xl px-4 py-3 animate-fade-in',
        isUser 
          ? 'bg-primary text-primary-foreground rounded-tr-none' 
          : 'bg-secondary text-secondary-foreground rounded-tl-none'
      )}>
        {isTyping ? (
          <div className="flex items-center">
            <span>Typing</span>
            <span className="typing-indicator ml-1"></span>
          </div>
        ) : (
          message
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
