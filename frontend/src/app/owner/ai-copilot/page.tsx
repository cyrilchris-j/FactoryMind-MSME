'use client';

import { useState, useRef, useEffect } from 'react';
import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Sparkles, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

interface StructuredAIResponse {
  summary: string;
  key_findings: string[];
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommended_actions: string[];
  data_sources: string[];
  confidence: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content?: string;
  structuredData?: StructuredAIResponse;
  timestamp: Date;
  isError?: boolean;
}

const examplePrompts = [
  'What is the current production efficiency?',
  'Are there any machines at risk of failing?',
  'Which customer generates the highest profit?',
  'Predict tomorrow\'s production capacity',
];

export default function AICopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m FactoryMind AI. I can securely analyze your production data and provide deterministic insights based on your database records. What would you like to know?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content || (msg.structuredData ? msg.structuredData.summary : '')
      }));
      
      const response = await fetch(`/api/backend/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput, history })
      });

      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to fetch from backend AI service");
      }
      
      const aiResponse: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        timestamp: new Date(),
      };

      if (data.structured && data.data) {
        aiResponse.structuredData = data.data;
      } else {
        aiResponse.content = data.text || "I processed your request but could not format the output.";
      }
      
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error: any) {
      console.error("AI Error:", error);
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Error: ${error.message}. Please check your backend configuration and Gemini API key.`,
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <OwnerLayout>
      <div className="p-8 h-[calc(100vh-64px)] flex flex-col max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              FactoryMind AI Copilot
            </h1>
            <p className="text-muted">Grounded, deterministic insights powered by Gemini</p>
          </div>
        </div>

        <Card className="flex-1 border-0 shadow-sm rounded-xl bg-white overflow-hidden flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col max-w-[85%] ${
                  message.role === 'user' ? 'ml-auto' : 'mr-auto'
                }`}
              >
                <div
                  className={`p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-foreground text-card rounded-br-sm'
                      : message.isError
                      ? 'bg-red-50 border border-red-100 text-red-900 rounded-bl-sm'
                      : 'bg-background text-foreground rounded-bl-sm border border-border'
                  }`}
                >
                  {message.content && <p className="leading-relaxed">{message.content}</p>}
                  
                  {message.structuredData && (
                    <div className="space-y-4">
                      <p className="font-medium text-lg leading-relaxed">{message.structuredData.summary}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {/* Findings & Risk */}
                        <div className="space-y-4">
                           <div className="bg-white p-4 rounded-lg border border-border shadow-sm">
                             <h4 className="text-sm font-bold text-muted mb-2 flex items-center gap-2">
                               <Activity className="w-4 h-4" /> Key Findings
                             </h4>
                             <ul className="list-disc pl-5 space-y-1 text-sm">
                               {message.structuredData.key_findings.map((finding, idx) => (
                                 <li key={idx}>{finding}</li>
                               ))}
                             </ul>
                           </div>
                           
                           <div className={`p-4 rounded-lg border shadow-sm ${getRiskColor(message.structuredData.risk_level)}`}>
                             <h4 className="text-sm font-bold mb-1 flex items-center gap-2">
                               <AlertTriangle className="w-4 h-4" /> Risk Level: {message.structuredData.risk_level}
                             </h4>
                           </div>
                        </div>

                        {/* Actions & Meta */}
                        <div className="space-y-4">
                           <div className="bg-white p-4 rounded-lg border border-border shadow-sm">
                             <h4 className="text-sm font-bold text-muted mb-2 flex items-center gap-2">
                               <ShieldCheck className="w-4 h-4 text-green-600" /> Recommended Actions
                             </h4>
                             <ul className="list-decimal pl-5 space-y-1 text-sm font-medium">
                               {message.structuredData.recommended_actions.map((action, idx) => (
                                 <li key={idx}>{action}</li>
                               ))}
                             </ul>
                           </div>
                           
                           <div className="flex items-center justify-between text-xs text-muted bg-gray-50 p-3 rounded-lg border border-gray-100">
                             <div>
                               <span className="font-semibold">Sources:</span> {message.structuredData.data_sources.join(', ')}
                             </div>
                             <div>
                               <span className="font-semibold">Confidence:</span> {message.structuredData.confidence}%
                             </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <span className={`text-xs text-muted mt-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex max-w-[80%] mr-auto">
                <div className="bg-background p-4 rounded-2xl rounded-bl-sm border border-border">
                  <div className="flex gap-2 items-center text-muted">
                    <Sparkles className="w-4 h-4 animate-pulse text-purple-600" />
                    <span>Analyzing factory database...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-background">
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {examplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(prompt)}
                    className="text-xs px-3 py-1.5 rounded-full bg-white border border-border text-muted hover:bg-foreground hover:text-white transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
            
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask about production, machines, or inventory..."
                className="flex-1 border-border focus-visible:ring-foreground"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!input.trim() || isLoading}
                className="bg-foreground hover:bg-foreground/90 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </OwnerLayout>
  );
}
