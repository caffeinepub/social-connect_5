import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGetFollowing } from '../hooks/useQueries';
import { Principal } from '@dfinity/principal';
import ProfilePicture from './ProfilePicture';
import { Link } from '@tanstack/react-router';
import { ScrollArea } from '@/components/ui/scroll-area';
import EmptyState from './EmptyState';

interface FollowingModalProps {
  principal: Principal;
  onClose: () => void;
}

export default function FollowingModal({ principal, onClose }: FollowingModalProps) {
  const { data: following = [], isLoading } = useGetFollowing(principal);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Following</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-96">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : following.length === 0 ? (
            <EmptyState message="Not following anyone yet" />
          ) : (
            <div className="space-y-3">
              {following.map((user) => (
                <Link
                  key={user.toString()}
                  to="/profile/$principal"
                  params={{ principal: user.toString() }}
                  onClick={onClose}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <ProfilePicture size="md" />
                  <div className="flex-1">
                    <p className="font-semibold">User</p>
                    <p className="text-xs text-muted-foreground truncate">{user.toString().slice(0, 20)}...</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

