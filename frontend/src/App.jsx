import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicHome from './pages/PublicHome';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogs from './pages/AdminLogs';
import AnalyticsPage from './pages/AnalyticsPage';
import OfflineBanner from './components/OfflineBanner';
import { warmBackend } from './utils/warmBackend';

function App() {
  // Runs on every route (not just PublicHome), so it also covers cases
  // like an admin bookmarking /login directly and skipping the home page.
  useEffect(() => {
    warmBackend();
  }, []);

  return (
    <>
      <OfflineBanner />
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
    </>
  );
}

export default App;