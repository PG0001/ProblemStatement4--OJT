import { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

interface Event {
  id: number;
  title: string;
  category: string;
  venue: string;
  startDate: string;
  endDate: string;
  availableSeats: number;
}

export default function OrganizerDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [form, setForm] = useState({
    title: "",
    category: "",
    venue: "",
    startDate: "",
    endDate: "",
    availableSeats: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // Replace this mock later with your backend endpoint
      const res = await axios.get("/mock/events.json");
      setEvents(res.data);
    } catch (err) {
      toast.error("Failed to load events");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.venue) {
      toast.error("Please fill all required fields!");
      return;
    }

    setLoading(true);
    try {
      // Later replace with POST /api/events
      toast.success(`Event "${form.title}" created successfully!`);
      setForm({
        title: "",
        category: "",
        venue: "",
        startDate: "",
        endDate: "",
        availableSeats: 0,
      });
      fetchEvents();
    } catch (err) {
      toast.error("Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        🎤 Organizer Dashboard
      </h1>

      {/* Create Event Form */}
      <div className="bg-white p-6 rounded-xl shadow-md max-w-xl mx-auto mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Create New Event</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Event Title"
            className="w-full border p-2 rounded"
            value={form.title}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="venue"
            placeholder="Venue"
            className="w-full border p-2 rounded"
            value={form.venue}
            onChange={handleChange}
            required
          />
          <select
            name="category"
            className="w-full border p-2 rounded"
            value={form.category}
            onChange={handleChange}
          >
            <option value="">Select Category</option>
            <option value="Music">Music</option>
            <option value="Sports">Sports</option>
            <option value="Tech">Tech</option>
            <option value="Education">Education</option>
          </select>
          <div className="flex gap-4">
            <input
              type="date"
              name="startDate"
              className="border p-2 rounded w-full"
              value={form.startDate}
              onChange={handleChange}
            />
            <input
              type="date"
              name="endDate"
              className="border p-2 rounded w-full"
              value={form.endDate}
              onChange={handleChange}
            />
          </div>
          <input
            type="number"
            name="availableSeats"
            placeholder="Available Seats"
            className="w-full border p-2 rounded"
            value={form.availableSeats}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Event"}
          </button>
        </form>
      </div>

      {/* Organizer's Events */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-700 text-center">
          Your Events
        </h2>
        {events.length === 0 ? (
          <p className="text-center text-gray-500">No events yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition"
              >
                <h3 className="text-lg font-semibold">{ev.title}</h3>
                <p className="text-gray-600 text-sm">{ev.venue}</p>
                <p className="text-sm text-gray-500">
                  {new Date(ev.startDate).toLocaleDateString()} -{" "}
                  {new Date(ev.endDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Seats: {ev.availableSeats}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
