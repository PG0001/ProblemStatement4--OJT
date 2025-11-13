import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

interface Event {
  id: number;
  title: string;
  description: string;
  category: string;
  venue: string;
  startDate: string;
  endDate: string;
  availableSeats: number;
}

export default function EventList() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Later, replace with backend API: http://localhost:5000/api/events
      const res = await api.get("/Event"); // mock for now
      setEvents(res.data);
      
      // Extract unique categories from events
      const uniqueCategories = Array.from(
        new Set(res.data.map((event: Event) => event.category))
      );
      setCategories(uniqueCategories as string[]);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((ev) => {
    const matchSearch =
      (ev.title?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (ev.description?.toLowerCase() || "").includes(search.toLowerCase());
    const matchCategory = category ? ev.category === category : true;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-6 relative">
      <div className="max-w-6xl mx-auto w-full px-4">
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-3 bg-gray-800 shadow-sm rounded p-2">
            <input
              type="text"
              placeholder="Search..."
              className="bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-300 p-1 text-sm rounded w-56 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="flex items-center gap-2">
              <label className="sr-only">Filter</label>
              <select
                className="bg-gray-700 border border-gray-600 text-gray-100 p-1 text-sm rounded w-36 focus:outline-none"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-gray-800 text-gray-100">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Event Cards */}
        {loading ? (
          <p className="text-center text-gray-300">Loading events...</p>
        ) : filteredEvents.length === 0 ? (
          <p className="text-center text-gray-300">No events found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredEvents.map((ev) => (
              <div key={ev.id} className="bg-gray-800 p-3 rounded-lg shadow-sm hover:shadow-lg transition">
                <h2 className="text-lg font-semibold mb-1 text-gray-100">{ev.title}</h2>
                <p className="text-gray-300 mb-1">{ev.venue}</p>
                <p className="text-gray-400 text-sm mb-1">
                  {new Date(ev.startDate).toLocaleDateString()} - {new Date(ev.endDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-200 mb-2 line-clamp-2">{ev.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Seats: {ev.availableSeats}</span>
                  <button
                    onClick={() => navigate(`/events/${ev.id}`)}
                    className="text-blue-300 hover:text-blue-100 text-sm font-semibold hover:underline"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
