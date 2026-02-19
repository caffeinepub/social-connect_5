import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { ExternalBlob, type UserProfile } from '../backend';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

interface EditProfileModalProps {
  profile: UserProfile;
  onClose: () => void;
}

export default function EditProfileModal({ profile, onClose }: EditProfileModalProps) {
  const [username, setUsername] = useState(profile.username);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio);
  const [profilePicture, setProfilePicture] = useState<ExternalBlob>(profile.profilePicture);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string>(profile.profilePicture.getDirectURL());

  const saveProfile = useSaveCallerUserProfile();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
      setUploadProgress(percentage);
    });

    setProfilePicture(blob);
    setPreviewUrl(URL.createObjectURL(file));
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !displayName.trim()) {
      toast.error('Username and display name are required');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        username: username.trim(),
        displayName: displayName.trim(),
        bio: bio.trim(),
        profilePicture,
        followerCount: profile.followerCount,
        followingCount: profile.followingCount,
      });
      toast.success('Profile updated successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <img src={previewUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-primary" />
              <label
                htmlFor="profile-pic-edit"
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <Upload className="h-4 w-4" />
                <input id="profile-pic-edit" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username-edit">Username *</Label>
            <Input id="username-edit" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName-edit">Display Name *</Label>
            <Input id="displayName-edit" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio-edit">Bio</Label>
            <Textarea id="bio-edit" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
          </div>

          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={saveProfile.isPending} className="flex-1">
              {saveProfile.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

