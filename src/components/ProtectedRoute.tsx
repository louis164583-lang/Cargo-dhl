import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '@/lib/auth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/admin/login" replace />;
}
