import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Determine role from context or sessionStorage fallback
  const role = user?.role || sessionStorage.getItem("user_role") || "";

  return (
    <header className="w-full bg-gray-800 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3">
              <img src="/vite.svg" alt="Logo" className="h-8 w-8" />
              <span className="font-bold text-lg text-gray-100">EventHub</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-3 ml-6">
              <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
              <Link to="/events" className="text-gray-300 hover:text-white">Events</Link>

              {role.toLowerCase() === "admin" && (
                <Link to="/admin/dashboard" className="text-gray-300 hover:text-white">Admin Dashboard</Link>
              )}
              {role.toLowerCase() === "organizer" && (
                <Link to="/organizer/dashboard" className="text-gray-300 hover:text-white">Organizer Dashboard</Link>
              )}
              {role.toLowerCase() === "attendee" && (
                <Link to="/bookings" className="text-gray-300 hover:text-white">My Bookings</Link>
              )}
            </nav>
          </div>

          {/* Right side: user info / login */}
          <div className="flex items-center gap-4">
            {user || role ? (
              <div className="flex items-center gap-2">
                <div className="flex flex-col text-right mr-2">
                  <span className="text-sm text-gray-300">
                    Welcome, {user?.name || sessionStorage.getItem("user_name") || "Guest"}
                  </span>
                  <span className="text-xs text-gray-400">{role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm text-gray-200 hover:underline">Login</Link>
                <Link to="/register" className="text-sm text-gray-200 hover:underline">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
