import { Card, CardContent } from '@/components/ui/card';
import ProfilePicture from './ProfilePicture';
import type { Reel } from '../backend';
import { formatDistanceToNow } from 'date-fns';
import { Link } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useDeleteReel } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReelCardProps {
  reel: Reel;
}

export default function ReelCard({ reel }: ReelCardProps) {
  const { identity } = useInternetIdentity();
  const deleteReel = useDeleteReel();
  const timestamp = new Date(Number(reel.timestamp) / 1_000_000);
  const isOwner = identity?.getPrincipal().toString() === reel.author.toString();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this reel?')) return;

    try {
      await deleteReel.mutateAsync(reel.id);
      toast.success('Reel deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete reel');
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3">
            <Link to="/profile/$principal" params={{ principal: reel.author.toString() }}>
              <ProfilePicture size="md" />
            </Link>
            <div>
              <Link to="/profile/$principal" params={{ principal: reel.author.toString() }} className="font-semibold hover:underline">
                User
              </Link>
              <p className="text-xs text-muted-foreground">{formatDistanceToNow(timestamp, { addSuffix: true })}</p>
            </div>
          </div>
          {isOwner && (
            <Button variant="ghost" size="sm" onClick={handleDelete} disabled={deleteReel.isPending}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>

        <video src={reel.video.getDirectURL()} controls className="w-full rounded-lg bg-black" style={{ maxHeight: '500px' }} />

        {reel.caption && <p className="mt-3 text-sm">{reel.caption}</p>}
      </CardContent>
    </Card>
  );
}

