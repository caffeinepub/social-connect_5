import { useGetMessages } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import ProfilePicture from './ProfilePicture';
import { Principal } from '@dfinity/principal';
import EmptyState from './EmptyState';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConversationListProps {
  onSelectUser: (user: Principal) => void;
  selectedUser: Principal | null;
}

export default function ConversationList({ onSelectUser, selectedUser }: ConversationListProps) {
  const { identity } = useInternetIdentity();
  const currentPrincipal = identity?.getPrincipal();

  // For demo purposes, we'll show a placeholder since we can't fetch all conversations
  // In a real app, you'd have a backend method to get conversation list
  const conversations: Principal[] = [];

  if (conversations.length === 0) {
    return (
      <div className="p-4">
        <EmptyState message="No conversations yet. Start chatting with someone!" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="divide-y">
        {conversations.map((user) => (
          <button
            key={user.toString()}
            onClick={() => onSelectUser(user)}
            className={`w-full p-4 flex items-center space-x-3 hover:bg-accent transition-colors ${
              selectedUser?.toString() === user.toString() ? 'bg-accent' : ''
            }`}
          >
            <ProfilePicture size="md" />
            <div className="flex-1 text-left">
              <p className="font-semibold">User</p>
              <p className="text-sm text-muted-foreground truncate">Click to view messages</p>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}

