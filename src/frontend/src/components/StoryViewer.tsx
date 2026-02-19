import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Story } from '../backend';
import { useGetAllStories } from '../hooks/useQueries';
import { formatDistanceToNow } from 'date-fns';

interface StoryViewerProps {
  story: Story;
  onClose: () => void;
}

export default function StoryViewer({ story, onClose }: StoryViewerProps) {
  const { data: allStories = [] } = useGetAllStories();
  const [currentIndex, setCurrentIndex] = useState(0);

  const authorStories = allStories.filter((s) => s.author.toString() === story.author.toString());
  const initialIndex = authorStories.findIndex((s) => s.id === story.id);

  useEffect(() => {
    if (initialIndex !== -1) {
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex]);

  const currentStory = authorStories[currentIndex];

  const handleNext = () => {
    if (currentIndex < authorStories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!currentStory) return null;

  const imageUrl = currentStory.content.getDirectURL();
  const timestamp = new Date(Number(currentStory.timestamp) / 1_000_000);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 bg-black border-0">
        <div className="relative h-[80vh]">
          {/* Progress bars */}
          <div className="absolute top-0 left-0 right-0 z-10 flex space-x-1 p-2">
            {authorStories.map((_, idx) => (
              <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-white transition-all ${idx === currentIndex ? 'w-full' : idx < currentIndex ? 'w-full' : 'w-0'}`}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-4 left-0 right-0 z-10 flex items-center justify-between px-4">
            <div className="flex items-center space-x-2">
              <div className="text-white text-sm font-medium">Story</div>
              <div className="text-white/70 text-xs">{formatDistanceToNow(timestamp, { addSuffix: true })}</div>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-1">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Story Image */}
          <img src={imageUrl} alt="Story" className="w-full h-full object-contain" />

          {/* Navigation */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          {currentIndex < authorStories.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

