import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useEvents } from "../../hooks/EventContext";

interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  totalTickets: number;
  totalRevenue: number;
  averageRating: number;
}

export default function AdminDashboard() {
  const { events, fetchEvents } = useEvents();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(true);

  useEffect(() => {
    loadStats();
    loadEvents();
    loadTickets();
  }, []);

  // Load dashboard stats
  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const { data } = await api.get("/Dashboard/admin");
      setStats(data);
    } catch (err) {
      toast.error("Error loading dashboard stats");
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Load events using hook
  const loadEvents = async () => {
    setLoadingEvents(true);
    try {
      await fetchEvents();
    } catch (err) {
      toast.error("Error loading events");
      console.error(err);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Load tickets
  const loadTickets = async () => {
    setLoadingTickets(true);
    try {
      const { data } = await api.get("/Tickets/all");
      console.log("Loaded tickets:", data);
      setTickets(data);
    } catch (err) {
      toast.error("Error loading tickets");
      console.error(err);
    } finally {
      setLoadingTickets(false);
    }
  };

  // Map tickets to eventId -> booked quantity
  const ticketMap: Record<number, number> = {};
  tickets.forEach((t: any) => {
    ticketMap[t.eventId] = (ticketMap[t.eventId] || 0) + t.quantity;
  });

  // Prepare chart data
  const bookingsData = events.map((e: any) => {
    const booked = ticketMap[e.id] || 0;
    const available = Math.max((e.totalSeats || 0) - booked, 0);
    return { title: e.title, booked, available };
  });

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-100">
        🧩 Admin Dashboard
      </h1>

      {/* Stats */}
      {loadingStats ? (
        <p className="text-center text-gray-300 mb-6">Loading stats...</p>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gray-800 p-6 rounded-xl shadow-md text-center">
            <h2 className="text-xl font-semibold mb-2">Total Users</h2>
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl shadow-md text-center">
            <h2 className="text-xl font-semibold mb-2">Total Events</h2>
            <p className="text-3xl font-bold">{stats.totalEvents}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl shadow-md text-center">
            <h2 className="text-xl font-semibold mb-2">Total Tickets</h2>
            <p className="text-3xl font-bold">{stats.totalTickets}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl shadow-md text-center">
            <h2 className="text-xl font-semibold mb-2">Total Revenue</h2>
            <p className="text-3xl font-bold">${stats.totalRevenue}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl shadow-md text-center">
            <h2 className="text-xl font-semibold mb-2">Average Rating</h2>
            <p className="text-3xl font-bold">{stats.averageRating}</p>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-400 mb-6">No stats available</p>
      )}

      {/* Event Bookings Chart */}
      {loadingEvents || loadingTickets ? (
        <p className="text-center text-gray-300 mb-6">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="text-center text-gray-400">No events available</p>
      ) : (
        <section className="mb-10 bg-gray-800 p-4 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-100">
            Event Bookings
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bookingsData}>
              <XAxis
                dataKey="title"
                tick={{ fill: "#fff", fontSize: 12 }}
                interval={0}
                angle={-20}
                textAnchor="end"
              />
              <YAxis tick={{ fill: "#fff" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1F2937", borderRadius: 8 }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend wrapperStyle={{ color: "#fff" }} />
              <Bar dataKey="booked" stackId="a" fill="#0088FE" />
              <Bar dataKey="available" stackId="a" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}

      {/* Events Table */}
      {!loadingEvents && events.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-100">All Events</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border bg-gray-800 shadow-sm rounded-xl">
              <thead className="bg-gray-700 text-gray-100">
                <tr>
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Venue</th>
                  <th className="p-3 text-left">Dates</th>
                  <th className="p-3 text-left">Seats</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev: any) => {
                  const booked = ticketMap[ev.id] || 0;
                  const available = Math.max((ev.totalSeats || 0) - booked, 0);
                  return (
                    <tr
                      key={ev.id}
                      className="border-t hover:bg-gray-700 transition-colors"
                    >
                      <td className="p-3">{ev.title}</td>
                      <td className="p-3">{ev.category}</td>
                      <td className="p-3">{ev.venue}</td>
                      <td className="p-3">
                        {new Date(ev.startDate).toLocaleDateString()} -{" "}
                        {new Date(ev.endDate).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        {ev.totalSeats} (Booked: {booked}, Available: {available})
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
