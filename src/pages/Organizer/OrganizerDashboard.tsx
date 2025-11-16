import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useEvents } from "../../hooks/EventContext";
import api from "../../api/axios";

interface Booking {
  id: number;
  eventTitle: string;
  quantity: number;
  bookingDate: string;
}

export default function OrganizerDashboard() {
  const { events, fetchEvents } = useEvents();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editEventId, setEditEventId] = useState<number | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    venue: "",
    startDate: "",
    endDate: "",
    totalSeats: 0,
    availableSeats: 0,
  });

  // Review modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<typeof events[0] | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchBookings();
  }, []);


  const fetchReviews = async (eventId: number) => {
    try {
      const res = await api.get(`/Reviews/${eventId}`);
      setReviews(res.data || []);
    } catch {
      toast.error("Failed to load reviews");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "totalSeats" || name === "availableSeats" ? parseInt(value || "0") : value,
    }));
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
      availableSeats: 0,
    });
    setEditEventId(null);
    setShowForm(false);
  };

 

  const handleEdit = (ev: typeof form & { id: number }) => {
    setForm({
      title: ev.title,
      description: ev.description,
      category: ev.category,
      venue: ev.venue,
      startDate: ev.startDate.split("T")[0],
      endDate: ev.endDate.split("T")[0],
      totalSeats: ev.totalSeats,
      availableSeats: ev.availableSeats,
    });
    setEditEventId(ev.id);
    setShowForm(true);
  };
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!form.title || !form.venue) return toast.error("Please fill all required fields");

  // Optional: frontend validation for start/end date vs current date
  const today = new Date();
  const start = new Date(form.startDate);
  const end = new Date(form.endDate);
  if (start < today || end < today) {
    toast.error("Event start and end dates cannot be earlier than today.");
    return;
  }

  setLoading(true);
  try {
    const payload: any = {
      title: form.title,
      description: form.description,
      category: form.category,
      venue: form.venue,
      startDate: form.startDate,
      endDate: form.endDate,
      totalSeats: editEventId ? undefined : form.totalSeats,
      availableSeats: editEventId ? form.availableSeats : undefined,
    };
    console.log(payload);

    if (editEventId) {
      payload.id = editEventId;
      await api.put(`/Event`, payload);
      toast.success(`Event "${form.title}" updated!`);
    } else {
      await api.post("/Event", payload);
      toast.success(`Event "${form.title}" created!`);
    }

    await fetchEvents();
    resetForm();
  } catch (err: any) {
    // Backend error handling
    const message =
      err.response?.data?.message ||
      "Failed to save event. Check start/end dates and venue availability.";
    toast.error(message);
  } finally {
    setLoading(false);
  }
};


const handleDelete = async (eventId: number) => {
  if (!confirm("Are you sure you want to delete this event?")) return;

  try {
    await api.delete(`/Event/${eventId}`);
    toast.success("Event deleted successfully!");
    fetchEvents();
  } catch (err: any) {
    const message = err.response?.data?.message || "Failed to delete event";
    toast.error(message);
  }
};

const fetchBookings = async () => {
  setLoadingBookings(true);
  try {
    const res = await api.get("/Tickets/organizer");
    setBookings(res.data || []);
  } catch (err: any) {
    const message = err.response?.data?.message || "Failed to load bookings";
    toast.error(message);
  } finally {
    setLoadingBookings(false);
  }
};


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <Toaster />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">🎤 Organizer Dashboard</h1>

        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => {
              if (editEventId) resetForm();
              else setShowForm((s) => !s);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showForm ? (editEventId ? "Cancel Edit" : "Close Form") : "Add New Event"}
          </button>
          <button
            onClick={fetchEvents}
            className="bg-gray-700 text-gray-100 px-3 py-2 rounded hover:bg-gray-600"
          >
            Refresh Events
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Events + Form */}
          <div className="flex-1">
            {showForm && (
              <div className="bg-gray-800 p-6 rounded-xl shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">
                  {editEventId ? "✏️ Edit Event" : "🆕 Create New Event"}
                </h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <input
                    type="text"
                    name="title"
                    placeholder="Event Title"
                    value={form.title}
                    onChange={handleChange}
                    className="w-full bg-gray-700 p-2 rounded text-gray-100"
                    required
                  />
                  <input
                    type="text"
                    name="description"
                    placeholder="Description"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full bg-gray-700 p-2 rounded text-gray-100"
                  />
                  <input
                    type="text"
                    name="venue"
                    placeholder="Venue"
                    value={form.venue}
                    onChange={handleChange}
                    className="w-full bg-gray-700 p-2 rounded text-gray-100"
                    required
                  />
                  <input
                    type="text"
                    name="category"
                    placeholder="Category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full bg-gray-700 p-2 rounded text-gray-100"
                  />
                  <div className="flex gap-4">
                    <input
                      type="date"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      className="bg-gray-700 p-2 rounded w-full text-gray-100"
                    />
                    <input
                      type="date"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleChange}
                      className="bg-gray-700 p-2 rounded w-full text-gray-100"
                    />
                  </div>

                 {/* Edit mode */}
{editEventId ? (
  <input
    type="number"
    name="availableSeats"
    placeholder="Available Seats"
    value={form.availableSeats}
    onChange={handleChange}
    className="w-full bg-gray-700 p-2 rounded text-gray-100"
    required
  />
) : (
  /* Create mode */
  <input
    type="number"
    name="totalSeats"
    placeholder="Total Seats"
    value={form.totalSeats}
    onChange={handleChange}
    className="w-full bg-gray-700 p-2 rounded text-gray-100"
    required
  />
)}


                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                  >
                    {loading ? (editEventId ? "Updating..." : "Creating...") : editEventId ? "Update Event" : "Create Event"}
                  </button>
                </form>
              </div>
            )}

            <h2 className="text-2xl font-semibold mb-4 text-gray-100 text-center">Your Events</h2>
            {events.length === 0 ? (
              <p className="text-center text-gray-400">No events created yet.</p>
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
                      {new Date(ev.startDate).toLocaleDateString()} - {new Date(ev.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-300 mt-2">Seats Available: {ev.availableSeats}</p>

                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleEdit(ev)}
                        className="bg-yellow-500 text-black px-3 py-1 rounded hover:bg-yellow-400 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedEvent(ev);
                          fetchReviews(ev.id);
                          setShowReviewModal(true);
                        }}
                        className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition"
                      >
                        Reviews
                      </button>
                    </div>
                    <button
                      onClick={() => handleDelete(ev.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition mt-1 w-full"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar: Bookings */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-gray-800 p-4 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold text-gray-100 mb-3">Bookings</h3>
              {loadingBookings ? (
                <p className="text-gray-300">Loading bookings...</p>
              ) : bookings.length === 0 ? (
                <p className="text-gray-400">No bookings yet.</p>
              ) : (
                <ul className="space-y-2 max-h-[500px] overflow-auto">
                  {bookings
                    .sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime())
                    .map((b) => (
                      <li key={b.id} className="p-2 rounded flex flex-col gap-1 bg-gray-700 hover:bg-gray-600">
                        <p className="text-sm font-medium text-gray-100">{b.eventTitle}</p>
                        <p className="text-xs text-gray-300">Tickets: {b.quantity}</p>
                        <p className="text-xs text-gray-400">
                          Booking Date: {new Date(b.bookingDate).toLocaleDateString()}{" "}
                          {new Date(b.bookingDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl w-96 max-h-[80vh] overflow-auto">
            <h2 className="text-xl font-bold mb-2">{selectedEvent.title} – Reviews</h2>
            <div className="space-y-2 mb-4 max-h-64 overflow-auto">
              {reviews.length === 0 ? (
                <p className="text-gray-300 text-sm">No reviews yet</p>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="bg-gray-700 p-2 rounded">
                    <p className="text-gray-100 font-medium">{r.userName}</p>
                    <p className="text-yellow-400 text-sm">Rating: {r.rating}</p>
                    <p className="text-gray-300 text-sm">{r.comment}</p>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => setShowReviewModal(false)}
              className="px-4 py-2 bg-gray-600 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
