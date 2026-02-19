import { useGetAllReels, useGetAllStories } from '../hooks/useQueries';
import EmptyState from '../components/EmptyState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import StoryViewer from '../components/StoryViewer';
import type { Story } from '../backend';

export default function ExplorePage() {
  const { data: reels = [], isLoading: reelsLoading } = useGetAllReels();
  const { data: stories = [], isLoading: storiesLoading } = useGetAllStories();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Explore</h1>

      <Tabs defaultValue="reels" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="reels">Reels</TabsTrigger>
          <TabsTrigger value="stories">Stories</TabsTrigger>
        </TabsList>

        <TabsContent value="reels" className="mt-6">
          {reelsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : reels.length === 0 ? (
            <EmptyState message="No reels to explore yet" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {reels.map((reel) => (
                <div key={reel.id} className="aspect-[9/16] relative group cursor-pointer overflow-hidden rounded-lg">
                  <video src={reel.video.getDirectURL()} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <p className="text-white text-sm line-clamp-2">{reel.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="stories" className="mt-6">
          {storiesLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : stories.length === 0 ? (
            <EmptyState message="No stories to explore yet" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {stories.map((story) => (
                <button
                  key={story.id}
                  onClick={() => setSelectedStory(story)}
                  className="aspect-[9/16] relative overflow-hidden rounded-lg hover:scale-105 transition-transform"
                >
                  <img src={story.content.getDirectURL()} alt="Story" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedStory && <StoryViewer story={selectedStory} onClose={() => setSelectedStory(null)} />}
    </div>
  );
}

