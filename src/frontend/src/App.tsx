import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import ReelsPage from './pages/ReelsPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import Layout from './components/Layout';
import ProfileSetupModal from './components/ProfileSetupModal';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { useEffect } from 'react';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { identity, loginStatus } = useInternetIdentity();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;

  useEffect(() => {
    if (loginStatus !== 'initializing' && !isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, loginStatus, navigate]);

  if (loginStatus === 'initializing') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

function RootComponent() {
  const { identity, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <>
      <Layout>
        <Outlet />
      </Layout>
      {showProfileSetup && <ProfileSetupModal />}
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <AuthGuard>
      <HomePage />
    </AuthGuard>
  ),
});

const exploreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/explore',
  component: () => (
    <AuthGuard>
      <ExplorePage />
    </AuthGuard>
  ),
});

const reelsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reels',
  component: () => (
    <AuthGuard>
      <ReelsPage />
    </AuthGuard>
  ),
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chat',
  component: () => (
    <AuthGuard>
      <ChatPage />
    </AuthGuard>
  ),
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/$principal',
  component: () => (
    <AuthGuard>
      <ProfilePage />
    </AuthGuard>
  ),
});

const routeTree = rootRoute.addChildren([indexRoute, exploreRoute, reelsRoute, chatRoute, profileRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}

