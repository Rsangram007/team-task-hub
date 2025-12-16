import { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { apiClient } from "@/services/apiClient";

interface ProfileImageUploadProps {
  avatarUrl: string | null;
  fullName: string | null;
  onUploadComplete: (url: string) => void;
}

export function ProfileImageUpload({
  avatarUrl,
  fullName,
  onUploadComplete,
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Image = e.target?.result as string;

        // Upload image to backend
        const response = await apiClient.uploadImage({
          image: base64Image,
          folder: "avatars",
        });

        // Call the completion callback with the uploaded image URL
        onUploadComplete(response.url);

        toast({ title: "Success", description: "Profile image updated" });
      };

      reader.onerror = () => {
        throw new Error("Failed to read image file");
      };

      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const initials =
    fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <div className='relative inline-block'>
      <Avatar className='h-20 w-20 border-2 border-border'>
        <AvatarImage src={avatarUrl || undefined} alt={fullName || "Profile"} />
        <AvatarFallback className='text-lg bg-primary/10 text-primary'>
          {initials}
        </AvatarFallback>
      </Avatar>
      <Button
        variant='secondary'
        size='icon'
        className='absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md'
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className='h-4 w-4 animate-spin' />
        ) : (
          <Camera className='h-4 w-4' />
        )}
      </Button>
      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={handleFileSelect}
      />
    </div>
  );
}
