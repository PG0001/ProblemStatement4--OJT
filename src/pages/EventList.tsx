import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEvents } from "../hooks/EventContext";

export default function EventList() {
  const navigate = useNavigate();
  const { events, fetchEvents } = useEvents();
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [filterAttr, setFilterAttr] = useState("title"); // which attribute to search on
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchEvents();
      setLoading(false);
    };
    load();
  }, [fetchEvents]);

  // Extract unique categories
  useEffect(() => {
    const uniqueCategories = Array.from(new Set(events.map((ev) => ev.category)));
    setCategories(uniqueCategories as string[]);
  }, [events]);

  // Dynamic filter
  const filteredEvents = events.filter((ev) => {
    // Filter by category first
    const matchCategory = category ? ev.category === category : true;

    // Filter dynamically by chosen attribute
    let matchSearch = true;
    if (search.trim() !== "") {
   const attrValue = (ev as any)[filterAttr]; // TypeScript now knows it's valid
matchSearch = attrValue.toString().toLowerCase().includes(search.toLowerCase());

    }

    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-6 relative">
      <div className="max-w-6xl mx-auto w-full px-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center mb-6 gap-3">
          <div className="flex items-center gap-2 bg-gray-800 shadow-sm rounded p-2">
            <select
              className="bg-gray-700 border border-gray-600 text-gray-100 p-1 text-sm rounded w-36 focus:outline-none"
              value={filterAttr}
              onChange={(e) => setFilterAttr(e.target.value)}
            >
              <option value="title">Title</option>
              <option value="description">Description</option>
              <option value="venue">Venue</option>
              <option value="category">Category</option>
            </select>
            <input
              type="text"
              placeholder={`Search by ${filterAttr}`}
              className="bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-300 p-1 text-sm rounded w-56 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="bg-gray-700 border border-gray-600 text-gray-100 p-1 text-sm rounded w-36 focus:outline-none"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-gray-800 text-gray-100">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Event Cards */}
        {loading ? (
          <p className="text-center text-gray-300">Loading events...</p>
        ) : filteredEvents.length === 0 ? (
          <p className="text-center text-gray-300">No events found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className="bg-gray-800 p-3 rounded-lg shadow-sm hover:shadow-lg transition"
              >
                <h2 className="text-lg font-semibold mb-1 text-gray-100">{ev.title}</h2>
                <p className="text-gray-300 mb-1">{ev.venue}</p>
                <p className="text-gray-400 text-sm mb-1">
                  {new Date(ev.startDate).toLocaleDateString()} -{" "}
                  {new Date(ev.endDate).toLocaleDateString()}
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
