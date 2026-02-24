import { useState } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Gender, Orientation, RelationshipStatus, Subscription } from '../../backend';

export default function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveMutation = useSaveCallerUserProfile();

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [interests, setInterests] = useState<Orientation | ''>('');
  const [lookingFor, setLookingFor] = useState<RelationshipStatus | ''>('');

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    if (!gender) {
      toast.error('Please select your gender');
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

    if (!interests) {
      toast.error('Please select your interests');
      return;
    }

    if (!lookingFor) {
      toast.error('Please select what you are looking for');
      return;
    }

    if (!identity) return;

    try {
      await saveMutation.mutateAsync({
        id: identity.getPrincipal(),
        username: username.trim(),
        bio: bio.trim(),
        gender: gender as Gender,
        city: city.trim(),
        state: state.trim(),
        interests: [interests as Orientation],
        lookingFor: [lookingFor as RelationshipStatus],
        subscription: Subscription.free,
        isAdmin: false,
        postCountDaily: BigInt(0),
        messageCountDaily: BigInt(0),
        lastActivityDay: BigInt(0),
      });
      toast.success('Profile created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create profile');
    }
  };

  return (
    <Dialog open={showProfileSetup}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to MeetGae!</DialogTitle>
          <DialogDescription>
            Let's set up your profile to get started.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
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
                <SelectValue placeholder="Select gender" />
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
                <SelectValue placeholder="Select interests" />
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
                <SelectValue placeholder="Select what you're looking for" />
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
                Creating Profile...
              </>
            ) : (
              'Create Profile'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
