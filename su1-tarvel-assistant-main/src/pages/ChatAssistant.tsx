
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BottomNavigation from '@/components/BottomNavigation';
import ChatMessage from '@/components/ChatMessage';
import { Send, Plane } from 'lucide-react';
import { toast } from 'sonner';
import { sendMessageToGemini } from '@/services/GeminiService';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearchParams } from "react-router-dom";

interface ChatMessageType {
  id: string;
  text: string;
  isUser: boolean;
}

const ChatAssistant = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    { id: '1', text: "Hi there! I'm your travel assistant. I can help you plan your next adventure, recommend destinations, create itineraries, and share travel tips. What's your dream destination?", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestionHidden, setSuggestionHidden] = useState(false);
  const [suggestionFadeOut, setSuggestionFadeOut] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();

  const systemPrompt = `You are TravelMate, a friendly and knowledgeable travel assistant that helps users plan their trips.
  
Your expertise includes:
- Creating customized travel itineraries
- Recommending destinations based on interests, budget, and travel style
- Sharing cultural insights and local customs
- Providing practical travel tips and packing advice
- Suggesting must-see attractions and hidden gems
- Answering questions about transportation, accommodations, and activities

Be friendly, enthusiastic, and personable. Use travel-related emojis to add personality to your responses. 
Always be specific and detailed in your recommendations, and try to personalize your suggestions based on the user's preferences.
Keep your responses concise but informative. When suggesting an itinerary, organize it by days with specific activities.
Do NOT mention that you are an AI - just be a helpful, knowledgeable travel expert.`;

  useEffect(() => {
    // Scroll to latest message when messages change
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => {
    if (
      messages.length > 1 &&
      messages.some(msg => msg.isUser)
    ) {
      setSuggestionFadeOut(true);
      const timer = setTimeout(() => {
        setSuggestionHidden(true);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  // Auto-chat when coming from dashboard/culture
  useEffect(() => {
    const cultureParam = searchParams.get("place");
    if (cultureParam) {
      // If the place was set by Dashboard, trigger a chat immediately
      setSuggestionFadeOut(true);
      setTimeout(() => setSuggestionHidden(true), 350);

      // If this is the only message, send auto-question
      if (
        messages.length === 1 &&
        !messages[0].isUser
      ) {
        setIsTyping(true);
        // Compose a message as if the user is asking about that cultural/historic spot
        const userQ = `Tell me about the cultural and historical significance of ${cultureParam}, and why it is a must-visit place.`;
        setMessages([
          messages[0],
          { id: String(Date.now()), text: userQ, isUser: true }
        ]);
        sendMessageToGemini([
          { role: "user", content: userQ }
        ], systemPrompt)
          .then((response) => {
            setTimeout(() => {
              setIsTyping(false);
              setMessages(prev => [
                ...prev,
                { id: String(Date.now() + 1), text: response, isUser: false }
              ]);
            }, 1000);
          })
          .catch(() => {
            setIsTyping(false);
            setMessages(prev => [
              ...prev,
              { id: String(Date.now() + 1), text: "Sorry, I couldn't get information about that site right now.", isUser: false }
            ]);
          });
      }
    }
    // eslint-disable-next-line
  }, [searchParams]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { id: Date.now().toString(), text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const messageHistory = messages
        .filter(msg => messages.indexOf(msg) !== 0)
        .map(msg => ({
          role: msg.isUser ? 'user' : 'model' as 'user' | 'model',
          content: msg.text
        }));
      messageHistory.push({ role: 'user', content: input });

      const response = await sendMessageToGemini(messageHistory, systemPrompt);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: response,
          isUser: false
        }]);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting to my travel database right now. Please try again in a moment.",
        isUser: false
      }]);
      toast.error("Network error. Please check your connection and try again.");
    }
  };

  return (
    <div className="flex flex-col h-screen pb-16 animate-fade-in">
      <div className="bg-primary text-primary-foreground p-6">
        <h1 className="text-xl font-semibold">Travel Assistant</h1>
        <p className="text-sm opacity-90">Your personal travel planner & guide</p>
      </div>

      {!suggestionHidden && (
        <div
          className={
            `bg-sky-50/50 p-4 transition-all duration-500
             ${suggestionFadeOut ? 'opacity-0 pointer-events-none -mt-20 mb-0 h-0' : 'opacity-100 mb-6'}`
          }
          style={{
            maxHeight: suggestionFadeOut ? 0 : undefined,
            overflow: 'hidden',
          }}
        >
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-4 animate-fade-in">
            <div className="flex items-center gap-3 border-b pb-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 flex items-center justify-center">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-medium text-slate-800">TravelMate</h2>
                <p className="text-xs text-slate-500">Ask me anything about travel planning</p>
              </div>
            </div>
            <div className="text-sm space-y-2 mb-4">
              <p className="bg-blue-50 text-blue-800 p-2 rounded-md inline-block">
                💡 Try asking:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <button
                  onClick={() => setInput("Help me plan a 3-day trip to Tokyo")}
                  className="text-left bg-slate-50 hover:bg-slate-100 p-2 rounded text-slate-700 text-xs"
                >
                  "Help me plan a 3-day trip to Tokyo"
                </button>
                <button
                  onClick={() => setInput("What should I pack for a beach vacation?")}
                  className="text-left bg-slate-50 hover:bg-slate-100 p-2 rounded text-slate-700 text-xs"
                >
                  "What should I pack for a beach vacation?"
                </button>
                <button
                  onClick={() => setInput("Recommend me some hidden gems in Paris")}
                  className="text-left bg-slate-50 hover:bg-slate-100 p-2 rounded text-slate-700 text-xs"
                >
                  "Recommend me some hidden gems in Paris"
                </button>
                <button
                  onClick={() => setInput("What's the best time to visit Bali?")}
                  className="text-left bg-slate-50 hover:bg-slate-100 p-2 rounded text-slate-700 text-xs"
                >
                  "What's the best time to visit Bali?"
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className={`flex-1 overflow-hidden p-4 bg-muted/20 transition-all duration-500 max-w-full
         ${suggestionHidden ? 'pt-6' : ''}`}
      >
        <div className="max-w-3xl mx-auto h-full">
          <ScrollArea ref={scrollAreaRef} className="h-full pr-2" type="always">
            <div className="flex flex-col gap-2 pb-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message.text}
                  isUser={message.isUser}
                />
              ))}
              {isTyping && <ChatMessage message="" isUser={false} isTyping={true} />}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>
      </div>

      <div className="p-4 bg-background border-t">
        <form className="flex gap-2 max-w-3xl mx-auto" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about destinations, planning tips, etc."
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="text-base"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default ChatAssistant;
