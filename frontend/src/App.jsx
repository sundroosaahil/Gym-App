import { Routes, Route } from 'react-router-dom';
import PublicHome from './pages/PublicHome';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogs from './pages/AdminLogs';
import AnalyticsPage from './pages/AnalyticsPage';
import OfflineBanner from './components/OfflineBanner';

function App() {
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