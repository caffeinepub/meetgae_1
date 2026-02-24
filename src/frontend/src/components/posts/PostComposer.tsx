import { useState } from 'react';
import { useCreatePost, useCreatePhotoPost, useGetCallerUserProfile } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';
import { ExternalBlob } from '../../backend';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PostComposer() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const createTextMutation = useCreatePost();
  const createPhotoMutation = useCreatePhotoPost();
  
  const [postType, setPostType] = useState<'text' | 'photo'>('text');
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const isProOrAdmin = userProfile?.subscription === 'pro' || userProfile?.isAdmin;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) {
      toast.error('Please sign in to create posts');
      return;
    }

    // If image is attached, create photo post
    if (selectedImage) {
      try {
        const arrayBuffer = await selectedImage.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });

        await createPhotoMutation.mutateAsync({ photo: blob, caption: content.trim() || null });
        
        setSelectedImage(null);
        setImagePreview(null);
        setContent('');
        setUploadProgress(0);
        toast.success('Photo post created!');
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to create photo post';
        if (errorMsg.includes('Daily post limit reached')) {
          toast.error('Daily post limit reached. Check your plan for details.');
        } else if (errorMsg.includes('Only Pro users')) {
          toast.error('Photo posts are available for Pro users only.');
        } else {
          toast.error(errorMsg);
        }
        setUploadProgress(0);
      }
    } else {
      // Create text post
      if (!content.trim()) {
        toast.error('Please enter some content');
        return;
      }

      try {
        await createTextMutation.mutateAsync(content.trim());
        setContent('');
        toast.success('Post created!');
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to create post';
        if (errorMsg.includes('Daily post limit reached')) {
          toast.error('Daily post limit reached. Check your plan for details.');
        } else {
          toast.error(errorMsg);
        }
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setUploadProgress(0);
  };

  if (!identity) {
    return (
      <Card>
        <CardContent className="py-3">
          <p className="text-center text-sm text-muted-foreground">
            Please sign in to create posts
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-3">
        <Tabs value={postType} onValueChange={(v) => setPostType(v as 'text' | 'photo')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-3">
            <TabsTrigger value="text">Text Post</TabsTrigger>
            <TabsTrigger value="photo">Photo Post</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="mt-0">
            <form onSubmit={handleSubmit} className="space-y-3">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                rows={3}
                maxLength={500}
                className="resize-none"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {content.length}/500
                </p>
                <Button type="submit" disabled={createTextMutation.isPending || !content.trim()} className="gap-2">
                  {createTextMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Post
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="photo" className="mt-0">
            {!isProOrAdmin ? (
              <div className="space-y-3 text-center py-4">
                <div className="flex justify-center">
                  <ImageIcon className="h-10 w-10 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Photo Posts are Pro Only</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upgrade to Pro to share photos with your community
                  </p>
                  <Link to="/profile">
                    <Button size="sm">View Plans</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {!imagePreview ? (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <Input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <Label htmlFor="photo-upload" className="cursor-pointer">
                      <ImageIcon className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to select an image (max 5MB)
                      </p>
                    </Label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={clearImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Add a caption (optional)..."
                  rows={2}
                  maxLength={500}
                  className="resize-none"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {content.length}/500
                  </p>
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={createPhotoMutation.isPending || !selectedImage}
                    className="gap-2"
                  >
                    {createPhotoMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Post
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
