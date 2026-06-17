import { lazy, Suspense, useState, useEffect, type ReactElement } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RideSalleLogo } from './components/RideSalleLogo';
import { Skeleton } from './components/ui/skeleton';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const RidesPage = lazy(() => import('./pages/rides/RidesPage'));
const RideDetailPage = lazy(() => import('./pages/rides/RideDetailPage'));
const PublishRidePage = lazy(() => import('./pages/rides/PublishRidePage'));
const MyRidesPage = lazy(() => import('./pages/rides/MyRidesPage'));
const MyBookingsPage = lazy(() => import('./pages/bookings/MyBookingsPage'));
const ChatsPage = lazy(() => import('./pages/chats/ChatsPage'));
const ChatDetailPage = lazy(() => import('./pages/chats/ChatDetailPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const PublicProfilePage = lazy(() => import('./pages/profile/PublicProfilePage'));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminRidesPage = lazy(() => import('./pages/admin/AdminRidesPage'));
const AdminStatsPage = lazy(() => import('./pages/admin/AdminStatsPage'));

function PageLoader(): ReactElement {
  return (
    <div className="container py-8 space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

function SplashScreen({ onDone }: { onDone: () => void }): ReactElement {
  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #1A3785 0%, #0d2060 100%)' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center gap-4"
      >
        <RideSalleLogo variant="light" size="lg" showTagline />
      </motion.div>

      <motion.div
        className="absolute bottom-12 flex gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-white/50"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
          />
        ))}
      </motion.div>

      <p className="absolute bottom-6 text-[10px] text-white/30">www.ridesalle.com</p>
    </motion.div>
  );
}

function App(): ReactElement {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <BrowserRouter>
      <AnimatePresence>
        {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      </AnimatePresence>

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<AppLayout><LandingPage /></AppLayout>} path="/" />

          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

          <Route path="/rides" element={<AppLayout><RidesPage /></AppLayout>} />
          <Route path="/rides/publish" element={
            <AppLayout>
              <ProtectedRoute><PublishRidePage /></ProtectedRoute>
            </AppLayout>
          } />
          <Route path="/rides/:id" element={<AppLayout><RideDetailPage /></AppLayout>} />

          <Route path="/my-rides" element={
            <AppLayout><ProtectedRoute><MyRidesPage /></ProtectedRoute></AppLayout>
          } />
          <Route path="/my-bookings" element={
            <AppLayout><ProtectedRoute><MyBookingsPage /></ProtectedRoute></AppLayout>
          } />

          <Route path="/chats" element={
            <AppLayout><ProtectedRoute><ChatsPage /></ProtectedRoute></AppLayout>
          } />
          <Route path="/chats/:id" element={
            <AppLayout><ProtectedRoute><ChatDetailPage /></ProtectedRoute></AppLayout>
          } />

          <Route path="/profile" element={
            <AppLayout><ProtectedRoute><ProfilePage /></ProtectedRoute></AppLayout>
          } />
          <Route path="/profile/:id" element={<AppLayout><PublicProfilePage /></AppLayout>} />

          <Route path="/notifications" element={
            <AppLayout><ProtectedRoute><NotificationsPage /></ProtectedRoute></AppLayout>
          } />

          <Route path="/admin" element={
            <AppLayout><ProtectedRoute requiredRole="admin"><AdminStatsPage /></ProtectedRoute></AppLayout>
          } />
          <Route path="/admin/users" element={
            <AppLayout><ProtectedRoute requiredRole="admin"><AdminUsersPage /></ProtectedRoute></AppLayout>
          } />
          <Route path="/admin/rides" element={
            <AppLayout><ProtectedRoute requiredRole="admin"><AdminRidesPage /></ProtectedRoute></AppLayout>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
