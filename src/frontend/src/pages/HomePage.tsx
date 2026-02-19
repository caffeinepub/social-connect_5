import StoriesBar from '../components/StoriesBar';
import { useGetAllReels } from '../hooks/useQueries';
import EmptyState from '../components/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import ProfilePicture from '../components/ProfilePicture';
import { formatDistanceToNow } from 'date-fns';
import { Film } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export default function HomePage() {
  const { data: reels = [], isLoading } = useGetAllReels();

  return (
    <div className="container max-w-2xl py-6 space-y-6">
      <StoriesBar />

      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center">
          <Film className="h-6 w-6 mr-2 text-primary" />
          Latest Reels
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : reels.length === 0 ? (
          <EmptyState message="No reels yet. Be the first to post!" />
        ) : (
          <div className="grid gap-4">
            {reels.slice(0, 10).map((reel) => {
              const timestamp = new Date(Number(reel.timestamp) / 1_000_000);
              return (
                <Card key={reel.id} className="overflow-hidden hover:shadow-medium transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3 mb-3">
                      <Link to="/profile/$principal" params={{ principal: reel.author.toString() }}>
                        <ProfilePicture size="md" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to="/profile/$principal" params={{ principal: reel.author.toString() }} className="font-semibold hover:underline">
                          User
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(timestamp, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <video
                      src={reel.video.getDirectURL()}
                      controls
                      className="w-full rounded-lg bg-black"
                      style={{ maxHeight: '400px' }}
                    />
                    {reel.caption && <p className="mt-3 text-sm">{reel.caption}</p>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

