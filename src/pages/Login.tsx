import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../hooks/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Load mock users data
      const res = await fetch("/mock/users.json");
      const users = await res.json();
      console.log(users);
      
if (!Array.isArray(users)) {
  toast.error("Invalid data format in users.json");
  return;
}

      // Find matching user
      const found = users.find(
        (u: any) => u.email === email && u.password === password
      );
      console.log(found);

      if (!found) {
        toast.error("Invalid credentials");
        return;
      }

      // Simulate token and login
      const fakeToken = JSON.stringify({
        id: found.id,
        name: found.name,
        role: found.role,
      });
      login(fakeToken);
      toast.success(`Welcome ${found.role}!`);

      // Navigate based on role
      if (found.role === "Admin") navigate("/admin/dashboard");
      else if (found.role === "Organizer") navigate("/organizer/dashboard");
      else navigate("/bookings");
    } catch (err) {
      toast.error("Login failed. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Toaster />
      <div className="bg-white shadow-lg rounded-xl p-8 w-96">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-600">
          Don’t have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
