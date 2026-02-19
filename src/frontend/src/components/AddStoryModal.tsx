import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAddStory } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';

interface AddStoryModalProps {
  onClose: () => void;
}

export default function AddStoryModal({ onClose }: AddStoryModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const addStory = useAddStory();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error('Please select an image');
      return;
    }

    try {
      const bytes = new Uint8Array(await selectedFile.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await addStory.mutateAsync(blob);
      toast.success('Story posted successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to post story');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Story</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!previewUrl ? (
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
              </div>
              <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            </label>
          ) : (
            <div className="relative">
              <img src={previewUrl} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-2 hover:bg-destructive/90"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
          )}

          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!selectedFile || addStory.isPending} className="flex-1">
              {addStory.isPending ? 'Posting...' : 'Post Story'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

