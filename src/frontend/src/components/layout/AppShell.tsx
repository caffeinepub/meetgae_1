import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { Home, MessageSquare, Compass, User, LogOut, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const { data: userProfile } = useGetCallerUserProfile();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const navItems = [
    { to: '/feed', icon: Home, label: 'Feed' },
    { to: '/inbox', icon: MessageSquare, label: 'Inbox' },
    { to: '/discovery', icon: Compass, label: 'Discover' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const getAvatarUrl = () => {
    if (userProfile?.photo) {
      return userProfile.photo.getDirectURL();
    }
    return '/assets/generated/default-avatar.dim_256x256.png';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/feed" className="flex items-center space-x-3">
            <img
              src="/assets/generated/meetgae-logo.dim_512x512.png"
              alt="MeetGae"
              className="h-10 w-10 rounded-lg"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              MeetGae
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.to;
              return (
                <Link key={item.to} to={item.to}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {userProfile && (
              <div className="hidden sm:flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={getAvatarUrl()} alt={userProfile.username} />
                  <AvatarFallback>{userProfile.username[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{userProfile.username}</span>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 md:py-8">
        {children}
      </main>

      <footer className="border-t mt-12">
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

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.to;
            return (
              <Link key={item.to} to={item.to} className="flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`w-full h-full flex flex-col gap-1 ${isActive ? 'text-primary' : ''}`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

