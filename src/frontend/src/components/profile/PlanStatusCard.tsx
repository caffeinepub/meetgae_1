import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Crown, Zap } from 'lucide-react';
import { Subscription } from '../../backend';
import { toast } from 'sonner';

export default function PlanStatusCard() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();

  const handleUpgrade = () => {
    toast.info('Stripe payment integration coming soon! Pro plan: ₹49/month or ₹499/year');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userProfile) {
    return null;
  }

  const isPro = userProfile.subscription === Subscription.pro;
  const isAdmin = userProfile.isAdmin;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isPro || isAdmin ? <Crown className="h-5 w-5 text-yellow-500" /> : <Zap className="h-5 w-5" />}
          Subscription Plan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Current Plan:</span>
          <Badge variant={isPro || isAdmin ? 'default' : 'secondary'}>
            {isAdmin ? 'Admin (Pro)' : isPro ? 'Pro' : 'Free'}
          </Badge>
        </div>

        {!isPro && !isAdmin && (
          <>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily Posts:</span>
                <span>{Number(userProfile.postCountDaily)} / 3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily Messages:</span>
                <span>{Number(userProfile.messageCountDaily)} / 10</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <p className="text-sm font-semibold">Upgrade to Pro for:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Unlimited posts</li>
                <li>Unlimited messages</li>
                <li>Priority support</li>
              </ul>
              <div className="pt-2">
                <p className="text-sm font-semibold">Pricing:</p>
                <p className="text-sm text-muted-foreground">₹49/month or ₹499/year</p>
              </div>
            </div>

            <Button onClick={handleUpgrade} className="w-full gap-2">
              <Crown className="h-4 w-4" />
              Upgrade to Pro
            </Button>
          </>
        )}

        {(isPro || isAdmin) && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {isAdmin 
                ? 'You have full admin access with unlimited features.'
                : 'You have unlimited posts and messages. Thank you for your support!'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
