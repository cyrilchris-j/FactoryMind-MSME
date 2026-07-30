'use client';

import { useState } from 'react';
import { ManagerLayout } from '@/components/layout/manager-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { apiPost } from '@/lib/api';

export default function MessageOwnerPage() {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await apiPost('/api/messages', {
        message,
        recipientRole: 'owner'
      });
      setToast({ type: 'success', message: 'Message sent to Owner successfully!' });
      setMessage('');
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed to send message' });
    }
    setSending(false);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <ManagerLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {toast && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            {toast.message}
          </div>
        )}

        <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
          <h1 className="text-xl font-bold mb-1">Message Owner</h1>
          <p className="text-white/70 text-sm">Send a direct notification to the factory owner.</p>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Your Message</Label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={5}
                className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
            
            <Button 
              onClick={handleSendMessage} 
              disabled={sending || !message.trim()} 
              className="w-full bg-primary hover:bg-primary/90 text-white"
            >
              {sending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</> : <><Send className="w-4 h-4 mr-2" /> Send Message</>}
            </Button>
          </div>
        </Card>
      </div>
    </ManagerLayout>
  );
}
