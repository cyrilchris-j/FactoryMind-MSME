'use client';

import { useState, useEffect } from 'react';
import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';

interface Manager {
  id: string;
  name: string;
  department?: string;
  componentCode?: string;
  machineNumber?: number | null;
}

export default function MessageManagerPage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    async function fetchManagers() {
      try {
        const res: any = await apiGet('/api/managers');
        setManagers(res.data || []);
      } catch (err) {
        console.error('Failed to fetch managers:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchManagers();
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedManagerId) return;
    setSending(true);
    try {
      await apiPost('/api/messages', {
        message,
        recipientId: selectedManagerId
      });
      setToast({ type: 'success', message: 'Message sent to Manager successfully!' });
      setMessage('');
      setSelectedManagerId('');
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed to send message' });
    }
    setSending(false);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <OwnerLayout>
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

        <div className="bg-primary rounded-xl p-6 text-white">
          <h1 className="text-xl font-bold mb-1">Message Manager</h1>
          <p className="text-white/70 text-sm">Send a direct notification to a specific manager.</p>
        </div>

        <Card className="p-6">
          {loading ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Select Manager</Label>
                <select
                  value={selectedManagerId}
                  onChange={(e) => setSelectedManagerId(e.target.value)}
                  className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                >
                  <option value="">-- Choose a Manager --</option>
                  {managers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.machineNumber ? `(Machine ${m.machineNumber})` : '(Unassigned)'}
                    </option>
                  ))}
                </select>
              </div>

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
                disabled={sending || !message.trim() || !selectedManagerId} 
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                {sending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</> : <><Send className="w-4 h-4 mr-2" /> Send Message</>}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </OwnerLayout>
  );
}
