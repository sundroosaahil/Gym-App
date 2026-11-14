import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicHome from './pages/PublicHome';
import ProtectedRoute from './components/ProtectedRoute';
import OfflineBanner from './components/OfflineBanner';
import { warmBackend } from './utils/warmBackend';

// Admin pages load only when someone opens them, so public visitors on the
// home page don't download dashboard, analytics and login code they never use.
const Login = lazy(() => import('./pages/Login'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const AdminLogs = lazy(() => import('./pages/AdminLogs'));

function App() {
  // Runs on every route (not just PublicHome), so it also covers cases
  // like an admin bookmarking /login directly and skipping the home page.
  useEffect(() => {
    warmBackend();
  }, []);

  return (
    <>
      <OfflineBanner />
      <Suspense fallback={<div className="min-h-screen bg-[#101010]" />}>
      <Routes>
        <Route path="/" element={<PublicHome />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/logs"
          element={
            <ProtectedRoute>
              <AdminLogs />
            </ProtectedRoute>
          }
        />
      </Routes>
      </Suspense>
    </>
  );
}

export default App;