import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ExternalBlob } from '../backend';
import { User } from 'lucide-react';

interface ProfilePictureProps {
  profilePicture?: ExternalBlob;
  username?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function ProfilePicture({ profilePicture, username, size = 'md', className = '' }: ProfilePictureProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };

  const imageUrl = profilePicture?.getDirectURL() || '/assets/generated/default-avatar.dim_200x200.png';

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src={imageUrl} alt={username || 'User'} />
      <AvatarFallback>
        <User className="h-1/2 w-1/2" />
      </AvatarFallback>
    </Avatar>
  );
}

