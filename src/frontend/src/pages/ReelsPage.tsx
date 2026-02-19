import { useGetAllReels } from '../hooks/useQueries';
import EmptyState from '../components/EmptyState';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import AddReelModal from '../components/AddReelModal';
import ReelCard from '../components/ReelCard';

export default function ReelsPage() {
  const { data: reels = [], isLoading } = useGetAllReels();
  const [showAddReel, setShowAddReel] = useState(false);

  return (
    <div className="container max-w-2xl py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Reels</h1>
        <Button onClick={() => setShowAddReel(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Reel
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : reels.length === 0 ? (
        <EmptyState message="No reels yet. Create the first one!" />
      ) : (
        <div className="space-y-6">
          {reels.map((reel) => (
            <ReelCard key={reel.id} reel={reel} />
          ))}
        </div>
      )}

      {showAddReel && <AddReelModal onClose={() => setShowAddReel(false)} />}
    </div>
  );
}

