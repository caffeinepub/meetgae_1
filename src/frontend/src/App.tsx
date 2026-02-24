import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import LandingPage from './pages/LandingPage';
import FeedPage from './pages/FeedPage';
import InboxPage from './pages/InboxPage';
import ConversationPage from './pages/ConversationPage';
import ProfileMePage from './pages/ProfileMePage';
import ProfileUserPage from './pages/ProfileUserPage';
import DiscoveryPage from './pages/DiscoveryPage';
import AppShell from './components/layout/AppShell';
import ProfileSetupModal from './components/profile/ProfileSetupModal';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

function Layout() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return <Outlet />;
  }

  return (
    <>
      <AppShell>
        <Outlet />
      </AppShell>
      <ProfileSetupModal />
    </>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const feedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/feed',
  component: FeedPage,
});

const inboxRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/inbox',
  component: InboxPage,
});

const conversationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/conversation/$userId',
  component: ConversationPage,
});

const profileMeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfileMePage,
});

const profileUserRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/$userId',
  component: ProfileUserPage,
});

const discoveryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/discovery',
  component: DiscoveryPage,
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  feedRoute,
  inboxRoute,
  conversationRoute,
  profileMeRoute,
  profileUserRoute,
  discoveryRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}

