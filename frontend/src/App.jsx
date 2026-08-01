import { Routes, Route } from 'react-router-dom';
import PublicHome from './pages/PublicHome';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogs from './pages/AdminLogs';

function App() {
  return (
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
        path="/admin/logs"
        element={
          <ProtectedRoute>
            <AdminLogs />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;