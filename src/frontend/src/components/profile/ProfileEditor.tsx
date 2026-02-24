import { useState, useRef, useEffect } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile, useUploadProfilePhoto } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob, Gender, Orientation, RelationshipStatus } from '../../backend';

export default function ProfileEditor() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const saveMutation = useSaveCallerUserProfile();
  const uploadPhotoMutation = useUploadProfilePhoto();

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.other);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [interests, setInterests] = useState<Orientation>(Orientation.versatile);
  const [lookingFor, setLookingFor] = useState<RelationshipStatus>(RelationshipStatus.looking);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userProfile) {
      setUsername(userProfile.username);
      setBio(userProfile.bio);
      setGender(userProfile.gender);
      setCity(userProfile.city);
      setState(userProfile.state);
      setInterests(userProfile.interests[0] || Orientation.versatile);
      setLookingFor(userProfile.lookingFor[0] || RelationshipStatus.looking);
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    if (!city.trim()) {
      toast.error('Please enter your city');
      return;
    }

    if (!state.trim()) {
      toast.error('Please enter your state');
      return;
    }

    if (!identity || !userProfile) return;

    try {
      await saveMutation.mutateAsync({
        ...userProfile,
        username: username.trim(),
        bio: bio.trim(),
        gender,
        city: city.trim(),
        state: state.trim(),
        interests: [interests],
        lookingFor: [lookingFor],
      });
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await uploadPhotoMutation.mutateAsync(blob);
      setUploadProgress(0);
      toast.success('Photo uploaded successfully!');
    } catch (error: any) {
      setUploadProgress(0);
      toast.error(error.message || 'Failed to upload photo');
    }
  };

  const getAvatarUrl = () => {
    if (userProfile?.photo) {
      return userProfile.photo.getDirectURL();
    }
    return '/assets/generated/default-avatar.dim_256x256.png';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userProfile) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Please complete profile setup first
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={getAvatarUrl()} alt={username} />
              <AvatarFallback>{username[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadPhotoMutation.isPending}
                className="gap-2"
              >
                {uploadPhotoMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading... {uploadProgress}%
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Photo
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              required
              maxLength={30}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender *</Label>
            <Select value={gender} onValueChange={(value) => setGender(value as Gender)}>
              <SelectTrigger id="gender">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Gender.male}>Male</SelectItem>
                <SelectItem value={Gender.female}>Female</SelectItem>
                <SelectItem value={Gender.other}>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Your city"
              required
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="Your state"
              required
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interests">Interests *</Label>
            <Select value={interests} onValueChange={(value) => setInterests(value as Orientation)}>
              <SelectTrigger id="interests">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Orientation.top}>Top</SelectItem>
                <SelectItem value={Orientation.bottom}>Bottom</SelectItem>
                <SelectItem value={Orientation.versatile}>Versatile</SelectItem>
                <SelectItem value={Orientation.lesbian}>Lesbian</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lookingFor">Looking For *</Label>
            <Select value={lookingFor} onValueChange={(value) => setLookingFor(value as RelationshipStatus)}>
              <SelectTrigger id="lookingFor">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={RelationshipStatus.looking}>Relationship</SelectItem>
                <SelectItem value={RelationshipStatus.casual}>Casual</SelectItem>
                <SelectItem value={RelationshipStatus.fun}>Fun</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
