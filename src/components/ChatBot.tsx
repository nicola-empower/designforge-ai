import React, { useState, useEffect, useRef } from 'react';
import { createChatSession } from '../services/geminiService';
import { Chat, GenerateContentResponse, Part } from '@google/genai';
import { ChatMessage, DesignSystem } from '../types';
import { Send, Bot, User, Loader2, Wrench } from 'lucide-react';

interface ChatBotProps {
  design: DesignSystem;
  setDesign: React.Dispatch<React.SetStateAction<DesignSystem>>;
}

export const ChatBot: React.FC<ChatBotProps> = ({ design, setDesign }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessingTool, setIsProcessingTool] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session on mount
    try {
      chatSessionRef.current = createChatSession();
      setMessages([{
        role: 'model',
        text: "Hello! I'm your Web Design Engineer. I monitor your design for WCAG accessibility standards in real-time. If you spot poor contrast, I'll help fix it, or you can ask me to change any part of the UI!",
        timestamp: Date.now()
      }]);
    } catch (e) {
      console.error("Failed to init chat", e);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isProcessingTool]);

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Provide context about current design to the model implicitly
    const contextPrompt = `[Current Design State: ${JSON.stringify(design)}] ${userMsg.text}`;

    try {
      // We use sendMessage (non-streaming) to reliably handle Function Calls in this version
      let response = await chatSessionRef.current.sendMessage({ message: contextPrompt });

      // Handle Function Calls (Tools)
      const functionCalls = response.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        setIsProcessingTool(true);
        setIsTyping(false); // Switch to tool processing state

        const functionResponseParts: Part[] = [];

        for (const call of functionCalls) {
          if (call.name === 'updateDesign') {
            const newSettings = call.args as Partial<DesignSystem>;
            
            // Execute the update
            setDesign(prev => ({ ...prev, ...newSettings }));
            
            functionResponseParts.push({
              functionResponse: {
                id: call.id,
                name: call.name,
                response: { result: "Design updated successfully", updatedFields: Object.keys(newSettings) }
              }
            });
          }
        }
        
        // Send the function response back to the model
        if (functionResponseParts.length > 0) {
             response = await chatSessionRef.current.sendMessage({ message: functionResponseParts });
        }
        setIsProcessingTool(false);
      }

      // Display the final text response
      const text = response.text;
      if (text) {
        setMessages(prev => [...prev, { role: 'model', text: text, timestamp: Date.now() }]);
      }
      
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error processing your request.", timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
      setIsProcessingTool(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto p-6">
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-t-xl overflow-hidden flex flex-col shadow-2xl">
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <div>
              <h2 className="text-white font-medium">Design Engineer</h2>
              <p className="text-xs text-slate-400">Gemini 3 Pro • Access to Playground</p>
            </div>
          </div>
          <div className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] text-blue-300 uppercase tracking-wider font-bold">
            Live Connected
          </div>
        </div>
        
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                {msg.role === 'user' ? <User size={16}/> : <Bot size={16}/>}
              </div>
              <div className={`max-w-[80%] p-4 rounded-xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600/10 border border-blue-600/30 text-blue-100 rounded-tr-none' 
                  : 'bg-slate-800 border border-slate-700 text-slate-300 rounded-tl-none'
              }`}>
                {/* Basic markdown-like rendering for line breaks */}
                {msg.text.split('\n').map((line, i) => (
                  <p key={i} className="min-h-[1em] mb-1 last:mb-0">{line}</p>
                ))}
              </div>
            </div>
          ))}
          
          {(isTyping || isProcessingTool) && (
             <div className="flex gap-4 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg">
                <Bot size={16}/>
              </div>
              <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl rounded-tl-none flex items-center gap-3">
                 <Loader2 className="animate-spin text-emerald-500" size={16} />
                 <span className="text-xs text-slate-400">
                    {isProcessingTool ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                            <Wrench size={12} /> Updating design system...
                        </span>
                    ) : "Thinking..."}
                 </span>
              </div>
             </div>
          )}
        </div>
      </div>

      <div className="bg-slate-800 p-4 rounded-b-xl border border-slate-700 border-t-0 shadow-lg">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me to 'make the primary color blue' or 'critique the contrast'..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping || isProcessingTool}
            className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-lg disabled:opacity-50 transition-colors shadow-lg hover:shadow-emerald-500/20"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};