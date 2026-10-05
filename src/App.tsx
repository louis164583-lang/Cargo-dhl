import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TrackPage from './pages/Track';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminShipments from './pages/admin/AdminShipments';
import AdminCharges from './pages/admin/AdminCharges';
import ContactPage from './pages/Contact';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/track" element={<TrackPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/track/:id" element={<TrackPage />} />
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
          path="/admin/charges"
          element={
            <ProtectedRoute>
              <AdminCharges />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
