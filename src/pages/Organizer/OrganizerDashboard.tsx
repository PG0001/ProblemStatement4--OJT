import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import api from "../../api/axios";

interface Event {
  id: number;
  title: string;
  description: string;
  category: string;
  venue: string;
  startDate: string;
  endDate: string;
  totalSeats: number;
}

export default function OrganizerDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editEventId, setEditEventId] = useState<number | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    venue: "",
    startDate: "",
    endDate: "",
    totalSeats: 0,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fetchingBookings, setFetchingBookings] = useState(true);

  useEffect(() => {
    fetchEvents();
    fetchBookings();
  }, []);

  const fetchEvents = async () => {
    setFetching(true);
    try {
      const res = await api.get("/Event");
      setEvents(res.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load events");
    } finally {
      setFetching(false);
    }
  };

  const fetchBookings = async () => {
    setFetchingBookings(true);
    try {
      const res = await api.get("/bookings");
      setBookings(res.data || []);
    } catch {
      // ignore booking errors
    } finally {
      setFetchingBookings(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "totalSeats" ? parseInt(value || "0") : value,
    }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!form.title || !form.venue) {
    toast.error("Please fill all required fields!");
    return;
  }

  setLoading(true);
  try {
    // Common payload
    const payload: any = {
      title: form.title,
      description: form.description,
      category: form.category,
      venue: form.venue,
      startDate: form.startDate,
      endDate: form.endDate,
      totalSeats: form.totalSeats,
    };

    if (editEventId) {
      // Include ID when updating
      payload.id = editEventId;

      await api.put(`/Event`, payload);
      toast.success(`Event "${form.title}" updated successfully!`);

      // Update locally without refetch
      setEvents((prev) =>
        prev.map((ev) => (ev.id === editEventId ? { ...ev, ...payload } : ev))
      );
    } else {
      // Create new event (no id)
      const res = await api.post("/Event", payload);
      toast.success(`Event "${form.title}" created successfully!`);

      if (res?.data && res.data.id) {
        setEvents((prev) => [res.data, ...prev]);
      } else {
        fetchEvents();
      }
    }

    resetForm();
  } catch (err: any) {
    toast.error(err?.response?.data?.message || "Failed to save event");
  } finally {
    setLoading(false);
  }
};


  const handleEdit = (ev: Event) => {
    setForm({
      title: ev.title,
      description: ev.description,
      category: ev.category,
      venue: ev.venue,
      startDate: ev.startDate.split("T")[0],
      endDate: ev.endDate.split("T")[0],
      totalSeats: ev.totalSeats,
    });
    setEditEventId(ev.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      category: "",
      venue: "",
      startDate: "",
      endDate: "",
      totalSeats: 0,
    });
    setEditEventId(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <Toaster />
      <div className="max-w-6xl mx-auto mb-6">
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-100">🎤 Organizer Dashboard</h1>

        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={() => {
              if (editEventId) resetForm();
              else setShowForm((s) => !s);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            {showForm ? (editEventId ? "Cancel Edit" : "Close Form") : "Add New Event"}
          </button>
          <button
            onClick={() => fetchEvents()}
            className="bg-gray-700 text-gray-100 px-3 py-2 rounded hover:bg-gray-600 transition"
          >
            Refresh Events
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column */}
          <div className="flex-1">
            {showForm && (
              <div className="bg-gray-800 p-6 rounded-xl shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-100">
                  {editEventId ? "✏️ Edit Event" : "🆕 Create New Event"}
                </h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <input
                    type="text"
                    name="title"
                    placeholder="Event Title"
                    className="w-full bg-gray-700 border border-gray-600 p-2 rounded text-gray-100"
                    value={form.title}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    name="description"
                    placeholder="Description"
                    className="w-full bg-gray-700 border border-gray-600 p-2 rounded text-gray-100"
                    value={form.description}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    name="venue"
                    placeholder="Venue"
                    className="w-full bg-gray-700 border border-gray-600 p-2 rounded text-gray-100"
                    value={form.venue}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    name="category"
                    placeholder="Category (e.g., Music, Sports, Tech)"
                    className="w-full bg-gray-700 border border-gray-600 p-2 rounded text-gray-100"
                    value={form.category}
                    onChange={handleChange}
                  />
                  <div className="flex gap-4">
                    <input
                      type="date"
                      name="startDate"
                      className="bg-gray-700 border border-gray-600 p-2 rounded w-full text-gray-100"
                      value={form.startDate}
                      onChange={handleChange}
                    />
                    <input
                      type="date"
                      name="endDate"
                      className="bg-gray-700 border border-gray-600 p-2 rounded w-full text-gray-100"
                      value={form.endDate}
                      onChange={handleChange}
                    />
                  </div>
                  <input
                    type="number"
                    name="totalSeats"
                    placeholder="Available Seats"
                    className="w-full bg-gray-700 border border-gray-600 p-2 rounded text-gray-100"
                    value={form.totalSeats}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                    disabled={loading}
                  >
                    {loading
                      ? editEventId
                        ? "Updating..."
                        : "Creating..."
                      : editEventId
                      ? "Update Event"
                      : "Create Event"}
                  </button>
                </form>
              </div>
            )}

            {/* Event Cards */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-100 text-center">Your Events</h2>
              {fetching ? (
                <p className="text-center text-gray-300">Loading your events...</p>
              ) : events.length === 0 ? (
                <p className="text-center text-gray-400">No events yet.</p>
              ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
                  {events.map((ev) => (
                    <div
                      key={ev.id}
                      className="bg-gray-800 p-4 rounded-xl shadow hover:shadow-lg transition w-full max-w-sm mx-auto"
                    >
                      <h3 className="text-lg font-semibold text-gray-100">{ev.title}</h3>
                      <p className="text-gray-300 text-sm">{ev.description}</p>
                      <p className="text-gray-300 text-sm">{ev.venue}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(ev.startDate).toLocaleDateString()} -{" "}
                        {new Date(ev.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-300 mt-2">Seats: {ev.totalSeats}</p>

                      <button
                        onClick={() => handleEdit(ev)}
                        className="mt-3 bg-yellow-500 text-black px-3 py-1 rounded hover:bg-yellow-400 transition"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="w-full lg:w-80">
            <div className="bg-gray-800 p-4 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold text-gray-100 mb-3">Bookings</h3>
              {fetchingBookings ? (
                <p className="text-gray-300">Loading bookings...</p>
              ) : bookings.length === 0 ? (
                <p className="text-gray-400">No bookings yet.</p>
              ) : (
                <ul className="space-y-2 max-h-96 overflow-auto">
                  {bookings.map((b: any) => (
                    <li key={b.id || b.bookingId} className="bg-gray-700 p-2 rounded">
                      <p className="text-sm text-gray-100 font-medium">
                        {b.eventTitle || b.title || "Booking"}
                      </p>
                      <p className="text-xs text-gray-300">
                        By: {b.userName || b.customerName || "—"}
                      </p>
                      <p className="text-xs text-gray-400">Seats: {b.seats || 1}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
