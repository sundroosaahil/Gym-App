import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

function ProtectedRoute({ children }) {
  const { isLoggedIn, checkingAuth } = useAuth();

  if (checkingAuth) {
    return <LoadingScreen />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;