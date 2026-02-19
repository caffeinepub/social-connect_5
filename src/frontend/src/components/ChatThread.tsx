import { useGetMessages } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';
import MessageInput from './MessageInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import EmptyState from './EmptyState';

interface ChatThreadProps {
  otherUser: Principal;
}

export default function ChatThread({ otherUser }: ChatThreadProps) {
  const { identity } = useInternetIdentity();
  const currentPrincipal = identity?.getPrincipal();
  const { data: messages = [], isLoading } = useGetMessages(otherUser);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <h3 className="font-semibold">Chat with User</h3>
      </div>

      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <EmptyState message="No messages yet. Start the conversation!" />
        ) : (
          <div className="space-y-4">
            {messages.map((message, idx) => {
              const isSent = message.sender.toString() === currentPrincipal?.toString();
              const timestamp = new Date(Number(message.timestamp) / 1_000_000);

              return (
                <div key={idx} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${isSent ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3`}>
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${isSent ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {formatDistanceToNow(timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      <MessageInput recipient={otherUser} />
    </div>
  );
}

