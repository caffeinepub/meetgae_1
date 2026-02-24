import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import LoginButton from '../components/auth/LoginButton';
import { Heart, Users, MessageCircle, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity) {
      navigate({ to: '/feed' });
    }
  }, [identity, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <img
                src="/assets/generated/meetgae-logo.dim_512x512.png"
                alt="MeetGae"
                className="h-24 w-24 rounded-2xl shadow-soft"
              />
            </div>

            <div className="space-y-4">
              <h1 
                className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #E40303 0%, #FF8C00 16.67%, #FFED00 33.33%, #008026 50%, #24408E 66.67%, #732982 83.33%, #E40303 100%)',
                  textShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
              >
                Welcome to MeetGae
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                Connect, share, and build meaningful relationships in a safe and inclusive community
              </p>
            </div>

            <div className="flex justify-center pt-4">
              <LoginButton />
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-12">
              <div className="bg-card rounded-xl p-6 shadow-soft border">
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">Connect</h3>
                <p className="text-sm text-muted-foreground">
                  Follow and connect with people who share your interests and values
                </p>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-soft border">
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">Chat</h3>
                <p className="text-sm text-muted-foreground">
                  Send messages and have meaningful conversations in a safe space
                </p>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-soft border">
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">Share</h3>
                <p className="text-sm text-muted-foreground">
                  Express yourself through posts and share your story with the community
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t mt-16">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            Built with <Heart className="h-4 w-4 text-primary fill-primary" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
          <p className="mt-2 text-xs">© {new Date().getFullYear()} MeetGae. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

