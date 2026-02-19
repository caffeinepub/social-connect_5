import { useState } from 'react';
import ConversationList from '../components/ConversationList';
import ChatThread from '../components/ChatThread';
import { Principal } from '@dfinity/principal';
import EmptyState from '../components/EmptyState';

export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState<Principal | null>(null);

  return (
    <div className="container max-w-6xl py-6">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>

      <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        <div className="md:col-span-1 border rounded-lg overflow-hidden">
          <ConversationList onSelectUser={setSelectedUser} selectedUser={selectedUser} />
        </div>

        <div className="md:col-span-2 border rounded-lg overflow-hidden">
          {selectedUser ? (
            <ChatThread otherUser={selectedUser} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <EmptyState message="Select a conversation to start chatting" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

