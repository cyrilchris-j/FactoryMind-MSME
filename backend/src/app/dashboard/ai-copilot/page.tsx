'use client';

import { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Sparkles, TrendingUp, AlertTriangle, DollarSign, Zap } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'chart' | 'table' | 'recommendation';
}

const examplePrompts = [
  'Which machine is underutilized?',
  'Predict tomorrow\'s production',
  'Why is electricity consumption high?',
  'Which customer generates the highest profit?',
  'Which worker is overloaded?',
  'How can I reduce production costs?',
];

export default function AICopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI Factory Copilot. I can help you analyze production data, predict outcomes, and provide actionable insights. What would you like to know?',
      timestamp: new Date(),
      type: 'text',
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
      type: 'text',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(input);
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (query: string): Message => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('underutilized') || lowerQuery.includes('machine')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Based on current data, **Machine CNC-05** is the most underutilized at 42% capacity. 

**Recommendations:**
- Consider reallocating orders from CNC-03 (95% capacity) to CNC-05
- Schedule maintenance during low-demand periods
- Review production scheduling efficiency

**Potential Savings:** ₹45,000/month by optimizing machine allocation`,
        timestamp: new Date(),
        type: 'recommendation',
      };
    }
    
    if (lowerQuery.includes('predict') || lowerQuery.includes('production')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `**Tomorrow's Production Prediction: 2,680 units**

**Confidence Level:** 94%

**Factors:**
- Current order backlog: 23 orders
- Machine availability: 48/50 machines
- Worker attendance forecast: 96%
- Raw material inventory: Sufficient

**Risk Level:** Low`,
        timestamp: new Date(),
        type: 'text',
      };
    }
    
    if (lowerQuery.includes('electricity') || lowerQuery.includes('energy')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `**Electricity consumption is 18% higher than usual.**

**Root Causes:**
1. **Machine HVAC-02** running at 100% continuously (maintenance needed)
2. **Peak hour usage** between 2-4 PM (consider shifting non-critical operations)
3. **Lighting system** in Warehouse B inefficient

**Suggested Actions:**
- Schedule HVAC-02 maintenance within 48 hours
- Implement staggered shift timing
- Upgrade to LED lighting (estimated savings: ₹12,000/month)

**Estimated Monthly Savings:** ₹28,000`,
        timestamp: new Date(),
        type: 'recommendation',
      };
    }
    
    if (lowerQuery.includes('customer') || lowerQuery.includes('profit')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `**Top Customer by Profit: Apex Industries Ltd.**

**Metrics:**
- Total Revenue: ₹12.5L (this quarter)
- Profit Margin: 28.5%
- Order Frequency: 15 orders/month
- Payment Terms: Net 30 (excellent)

**Insight:** This customer contributes 22% of total profit. Consider offering volume discounts to increase order frequency.`,
        timestamp: new Date(),
        type: 'text',
      };
    }
    
    if (lowerQuery.includes('worker') || lowerQuery.includes('overloaded')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `**Worker Ramesh Kumar (ID: W-023) is overloaded.**

**Current Status:**
- Shift hours: 12 hours/day (exceeds limit)
- Tasks assigned: 8 (average: 5)
- Overtime this week: 14 hours

**Recommendation:**
- Redistribute 3 tasks to available workers
- Consider hiring temporary staff
- Review workload distribution policy

**Risk:** Fatigue-related errors may increase by 35%`,
        timestamp: new Date(),
        type: 'recommendation',
      };
    }
    
    if (lowerQuery.includes('cost') || lowerQuery.includes('reduce')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `**Cost Reduction Opportunities Identified:**

**1. Energy Optimization**
- Potential savings: ₹28,000/month
- Implementation: 2 weeks

**2. Inventory Management**
- Reduce holding costs: ₹35,000/month
- Implement JIT for top 20 SKUs

**3. Maintenance Scheduling**
- Preventive vs reactive: Save ₹42,000/month
- Reduce downtime by 15%

**Total Potential Savings: ₹105,000/month**`,
        timestamp: new Date(),
        type: 'recommendation',
      };
    }
    
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: `I understand you're asking about: "${query}"

Let me analyze the data to provide you with actionable insights. This may take a moment to process your factory's specific context.`,
      timestamp: new Date(),
      type: 'text',
    };
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-[#1F3A5F]" />
            AI Factory Copilot
          </h1>
          <p className="text-[#6B7280]">Ask anything about your factory operations</p>
        </div>

        {/* Chat Container */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-[#1F3A5F] text-white'
                      : 'bg-[#F8F9FA] text-[#1A1A1A]'
                  }`}
                >
                  {message.type === 'recommendation' && (
                    <div className="mb-2 flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-[#2E8B57]" />
                      <span className="text-xs font-medium text-[#2E8B57]">AI Recommendation</span>
                    </div>
                  )}
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                    {message.content}
                  </div>
                  <p className="text-xs mt-2 opacity-60">
                    {message.timestamp.toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#F8F9FA] rounded-2xl p-4">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-[#1F3A5F] rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-[#1F3A5F] rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-[#1F3A5F] rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Example Prompts */}
          {messages.length === 1 && (
            <div className="px-6 pb-4">
              <p className="text-sm text-[#6B7280] mb-3">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(prompt)}
                    className="px-3 py-1.5 text-sm bg-[#F8F9FA] border border-[#E5E7EB] rounded-full hover:bg-[#E5E7EB] transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-[#E5E7EB]">
            <div className="flex space-x-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about production, machines, inventory, costs..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-[#1F3A5F] hover:bg-[#2A4A73]"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
