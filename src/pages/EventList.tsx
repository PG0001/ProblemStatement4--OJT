import { useEffect, useState } from "react";
import axios from "axios";

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
  const [events, setEvents] = useState<Event[]>([]);
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
      const res = await axios.get("/mock/events.json"); // mock for now
      setEvents(res.data);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((ev) => {
    const matchSearch =
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category ? ev.category === category : true;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">🎟️ EventHub</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-center">
        <input
          type="text"
          placeholder="Search events..."
          className="border p-2 rounded w-full md:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border p-2 rounded w-full md:w-1/4"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >   
          <option value="">All Categories</option>
          <option value="Music">Music</option>
          <option value="Sports">Sports</option>
          <option value="Tech">Tech</option>
          <option value="Education">Education</option>
        </select>
      </div>

      {/* Event Cards */}
      {loading ? (
        <p className="text-center text-gray-500">Loading events...</p>
      ) : filteredEvents.length === 0 ? (
        <p className="text-center text-gray-500">No events found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredEvents.map((ev) => (
            <div key={ev.id} className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
              <h2 className="text-xl font-semibold mb-2">{ev.title}</h2>
              <p className="text-gray-600 mb-2">{ev.venue}</p>
              <p className="text-gray-500 text-sm mb-2">
                {new Date(ev.startDate).toLocaleDateString()} -{" "}
                {new Date(ev.endDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ev.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">
                  Seats: {ev.availableSeats}
                </span>
                <a
                  href={`/events/${ev.id}`}
                  className="text-blue-600 hover:underline text-sm font-semibold"
                >
                  View Details
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
