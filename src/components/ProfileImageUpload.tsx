import { useState, useRef } from 'react';
import { Camera, Loader2, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ProfileImageUploadProps {
  avatarUrl: string | null;
  fullName: string | null;
  onUploadComplete: (url: string) => void;
}

export function ProfileImageUpload({ avatarUrl, fullName, onUploadComplete }: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image file', variant: 'destructive' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Image must be less than 5MB', variant: 'destructive' });
      return;
    }

    setIsUploading(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;

        const { data, error } = await supabase.functions.invoke('cloudinary-upload', {
          body: { image: base64, folder: 'avatars' },
        });

        if (error) throw error;

        if (data?.url) {
          onUploadComplete(data.url);
          toast({ title: 'Success', description: 'Profile image updated' });
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const initials = fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <div className="relative inline-block">
      <Avatar className="h-20 w-20 border-2 border-border">
        <AvatarImage src={avatarUrl || undefined} alt={fullName || 'Profile'} />
        <AvatarFallback className="text-lg bg-primary/10 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      <Button
        variant="secondary"
        size="icon"
        className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
