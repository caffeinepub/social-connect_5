import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSendMessage } from '../hooks/useQueries';
import { Principal } from '@dfinity/principal';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

interface MessageInputProps {
  recipient: Principal;
}

export default function MessageInput({ recipient }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const sendMessage = useSendMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    try {
      await sendMessage.mutateAsync({ recipient, text: message.trim() });
      setMessage('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4 flex space-x-2">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        disabled={sendMessage.isPending}
      />
      <Button type="submit" disabled={!message.trim() || sendMessage.isPending}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}

