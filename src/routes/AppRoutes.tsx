import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../hooks/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import EventList from "../pages/EventList";
import EventDetail from "../pages/EventDetail";
import Register from "../pages/Register";
import AdminDashboard from "../pages/admin/AdminDashboard";
import OrganizerDashboard from "../pages/Organizer/OrganizerDashboard";
import BookingPage from "../pages/BookingPage";
import Login from "../pages/Login";

export default function AppRoutes() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<EventList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events/:id" element={<EventDetail />} />

          {/* Protected routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Organizer"]}>
                <OrganizerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute allowedRoles={["Attendee"]}>
                <BookingPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
