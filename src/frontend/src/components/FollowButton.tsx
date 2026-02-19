import { Button } from '@/components/ui/button';
import { useFollowUser, useUnfollowUser, useGetFollowing } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';
import { UserPlus, UserMinus } from 'lucide-react';

interface FollowButtonProps {
  targetPrincipal: Principal;
}

export default function FollowButton({ targetPrincipal }: FollowButtonProps) {
  const { identity } = useInternetIdentity();
  const currentPrincipal = identity?.getPrincipal();

  const { data: following = [] } = useGetFollowing(currentPrincipal || Principal.anonymous());
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const isFollowing = following.some((p) => p.toString() === targetPrincipal.toString());
  const isOwnProfile = currentPrincipal?.toString() === targetPrincipal.toString();

  if (isOwnProfile) return null;

  const handleToggleFollow = async () => {
    try {
      if (isFollowing) {
        await unfollowUser.mutateAsync(targetPrincipal);
      } else {
        await followUser.mutateAsync(targetPrincipal);
      }
    } catch (error) {
      console.error('Follow/unfollow error:', error);
    }
  };

  return (
    <Button
      onClick={handleToggleFollow}
      disabled={followUser.isPending || unfollowUser.isPending}
      variant={isFollowing ? 'outline' : 'default'}
      size="sm"
    >
      {isFollowing ? (
        <>
          <UserMinus className="h-4 w-4 mr-2" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
}

