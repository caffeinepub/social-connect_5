import { useParams, Link } from '@tanstack/react-router';
import { useGetUserProfile, useGetCallerUserProfile, useGetFollowers, useGetFollowing, useGetAllReels } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';
import ProfilePicture from '../components/ProfilePicture';
import FollowButton from '../components/FollowButton';
import { Button } from '@/components/ui/button';
import { Settings, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import EditProfileModal from '../components/EditProfileModal';
import FollowersModal from '../components/FollowersModal';
import FollowingModal from '../components/FollowingModal';

export default function ProfilePage() {
  const { principal } = useParams({ from: '/profile/$principal' });
  const { identity } = useInternetIdentity();
  const currentPrincipal = identity?.getPrincipal();

  const isOwnProfile = currentPrincipal?.toString() === principal;

  // Always call both hooks, but only use the data from the appropriate one
  const callerProfileQuery = useGetCallerUserProfile();
  const userProfileQuery = useGetUserProfile(Principal.fromText(principal));

  // Select the appropriate profile data based on ownership
  const profile = isOwnProfile ? callerProfileQuery.data : userProfileQuery.data;
  const profileLoading = isOwnProfile ? callerProfileQuery.isLoading : userProfileQuery.isLoading;

  const { data: followers = [] } = useGetFollowers(Principal.fromText(principal));
  const { data: following = [] } = useGetFollowing(Principal.fromText(principal));
  const { data: allReels = [] } = useGetAllReels();

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  const userReels = allReels.filter((reel) => reel.author.toString() === principal);

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-12 text-center">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-6">
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-8">
          <ProfilePicture profilePicture={profile.profilePicture} username={profile.username} size="xl" />

          <div className="flex-1 space-y-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">{profile.username}</h1>
              {isOwnProfile ? (
                <Button variant="outline" size="sm" onClick={() => setShowEditProfile(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <FollowButton targetPrincipal={Principal.fromText(principal)} />
                  <Link to="/chat">
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <div className="flex space-x-6">
              <div>
                <span className="font-bold">{userReels.length}</span> <span className="text-muted-foreground">reels</span>
              </div>
              <button onClick={() => setShowFollowers(true)} className="hover:text-primary">
                <span className="font-bold">{followers.length}</span> <span className="text-muted-foreground">followers</span>
              </button>
              <button onClick={() => setShowFollowing(true)} className="hover:text-primary">
                <span className="font-bold">{following.length}</span> <span className="text-muted-foreground">following</span>
              </button>
            </div>

            <div>
              <p className="font-semibold">{profile.displayName}</p>
              {profile.bio && <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>}
            </div>
          </div>
        </div>

        {/* Reels Grid */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-bold mb-4">Reels</h2>
          {userReels.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No reels yet</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {userReels.map((reel) => (
                <div key={reel.id} className="aspect-[9/16] relative group cursor-pointer overflow-hidden rounded-lg">
                  <video src={reel.video.getDirectURL()} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <p className="text-white text-xs line-clamp-2">{reel.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showEditProfile && <EditProfileModal profile={profile} onClose={() => setShowEditProfile(false)} />}
      {showFollowers && <FollowersModal principal={Principal.fromText(principal)} onClose={() => setShowFollowers(false)} />}
      {showFollowing && <FollowingModal principal={Principal.fromText(principal)} onClose={() => setShowFollowing(false)} />}
    </div>
  );
}

