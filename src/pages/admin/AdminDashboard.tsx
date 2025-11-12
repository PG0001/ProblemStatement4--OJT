import { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

interface Event {
  id: number;
  title: string;
  category: string;
  venue: string;
  startDate: string;
  endDate: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Later replace with backend endpoints
      const [eventRes, userRes] = await Promise.all([
        axios.get("/mock/events.json"),
        axios.get("/mock/users.json"),
      ]);
      setEvents(eventRes.data);
      setUsers(userRes.data);
    } catch (err) {
      toast.error("Error loading admin data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        🧩 Admin Dashboard
      </h1>

      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : (
        <>
          {/* Events Section */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">All Events</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border bg-white shadow-sm rounded-xl">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-3 text-left">Title</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-left">Venue</th>
                    <th className="p-3 text-left">Dates</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => (
                    <tr key={ev.id} className="border-t hover:bg-gray-50">
                      <td className="p-3">{ev.title}</td>
                      <td className="p-3">{ev.category}</td>
                      <td className="p-3">{ev.venue}</td>
                      <td className="p-3">
                        {new Date(ev.startDate).toLocaleDateString()} -{" "}
                        {new Date(ev.endDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Users Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Registered Users</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border bg-white shadow-sm rounded-xl">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t hover:bg-gray-50">
                      <td className="p-3">{u.name}</td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3">{u.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
