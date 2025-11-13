import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/AuthContext";
import api from "../api/axios"; // Adjust path based on your folder structure

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting login for:", email);
    console.log("Password:", password);

    try {
      // Call backend API for login
      const response = await api.post("/auth/login", {
        email,
        password,
      });
      console.log("Login response:", response);

      const { token, role, name } = response.data;

      // Normalize role and name
      const Idstr =response.data.id;
      const roleStr = (role || "").toString();
      const normalizedRole = roleStr.charAt(0).toUpperCase() + roleStr.slice(1).toLowerCase();
      const displayName = name || email || "";

      // Store normalized user details in session storage first
      // so AuthContext.login can read them immediately if token lacks claims.
      sessionStorage.setItem("user_Id", Idstr);
      sessionStorage.setItem("user_role", normalizedRole);
      sessionStorage.setItem("user_name", displayName);
      sessionStorage.setItem("user_email", email);

      // Store JWT in localStorage and initialize auth
      localStorage.setItem("token", token);
      login(token);

      toast.success(`Welcome ${normalizedRole}!`);
      if (response) {
        console.log("Login successful:", response.data);
      }

      // Navigate based on normalized role (case-insensitive handling)
      if (normalizedRole === "Admin") navigate("/admin/dashboard");
      else if (normalizedRole === "Organizer") navigate("/organizer/dashboard");
      else navigate("/bookings");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Login failed. Please try again."
      );
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
      <div className="bg-gray-800 shadow-lg rounded-xl p-8 w-96">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-100">
          Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-300">
          Don’t have an account?{" "}
          <a href="/register" className="text-blue-300 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
