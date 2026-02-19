import { useGetAllStories } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import ProfilePicture from './ProfilePicture';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import AddStoryModal from './AddStoryModal';
import StoryViewer from './StoryViewer';
import type { Story } from '../backend';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default function StoriesBar() {
  const { data: stories = [] } = useGetAllStories();
  const { identity } = useInternetIdentity();
  const [showAddStory, setShowAddStory] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  const myStories = stories.filter((s) => s.author.toString() === identity?.getPrincipal().toString());
  const otherStories = stories.filter((s) => s.author.toString() !== identity?.getPrincipal().toString());

  const groupedStories = otherStories.reduce((acc, story) => {
    const authorId = story.author.toString();
    if (!acc[authorId]) {
      acc[authorId] = [];
    }
    acc[authorId].push(story);
    return acc;
  }, {} as Record<string, Story[]>);

  return (
    <>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 p-4">
          {/* Add Story Button */}
          <button
            onClick={() => setShowAddStory(true)}
            className="flex flex-col items-center space-y-1 shrink-0 group"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Plus className="h-8 w-8 text-white" />
              </div>
            </div>
            <span className="text-xs font-medium">Your Story</span>
          </button>

          {/* My Stories */}
          {myStories.length > 0 && (
            <button
              onClick={() => setSelectedStory(myStories[0])}
              className="flex flex-col items-center space-y-1 shrink-0"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-br from-primary to-secondary">
                  <div className="w-full h-full rounded-full bg-background p-0.5">
                    <ProfilePicture size="lg" className="w-full h-full" />
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium">You</span>
            </button>
          )}

          {/* Other Users' Stories */}
          {Object.entries(groupedStories).map(([authorId, userStories]) => (
            <button
              key={authorId}
              onClick={() => setSelectedStory(userStories[0])}
              className="flex flex-col items-center space-y-1 shrink-0"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-br from-primary to-secondary">
                  <div className="w-full h-full rounded-full bg-background p-0.5">
                    <ProfilePicture size="lg" className="w-full h-full" />
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium truncate w-16">User</span>
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {showAddStory && <AddStoryModal onClose={() => setShowAddStory(false)} />}
      {selectedStory && <StoryViewer story={selectedStory} onClose={() => setSelectedStory(null)} />}
    </>
  );
}

