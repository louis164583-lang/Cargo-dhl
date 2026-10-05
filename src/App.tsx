import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminShipments from './pages/admin/AdminShipments';
import AdminClients from './pages/admin/AdminClients';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/shipments"
          element={
            <ProtectedRoute>
              <AdminShipments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clients"
          element={
            <ProtectedRoute>
              <AdminClients />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
