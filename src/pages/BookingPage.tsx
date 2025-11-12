import { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

interface Booking {
  id: number;
  eventTitle: string;
  venue: string;
  startDate: string;
  endDate: string;
  tickets: number;
  status: "Booked" | "Cancelled";
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      // Replace with your API later (GET /api/bookings)
      const res = await axios.get("/mock/bookings.json");
      setBookings(res.data);
    } catch (err) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    try {
      // Replace with DELETE /api/bookings/:id later
      toast.success("Booking cancelled successfully");
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, status: "Cancelled" } : b
        )
      );
    } catch (err) {
      toast.error("Cancellation failed");
    }
  };

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-600">Loading your bookings...</p>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster />
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        🎫 My Bookings
      </h1>

      {bookings.length === 0 ? (
        <p className="text-center text-gray-500">
          You haven’t booked any events yet.
        </p>
      ) : (
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold mb-1">{b.eventTitle}</h2>
              <p className="text-gray-600 text-sm mb-1">{b.venue}</p>
              <p className="text-gray-500 text-sm mb-2">
                {new Date(b.startDate).toLocaleDateString()} -{" "}
                {new Date(b.endDate).toLocaleDateString()}
              </p>
              <p className="text-sm font-medium text-gray-700 mb-3">
                Tickets: {b.tickets}
              </p>
              <span
                className={`inline-block px-2 py-1 text-xs rounded mb-3 ${
                  b.status === "Booked"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {b.status}
              </span>

              {b.status === "Booked" && (
                <button
                  onClick={() => handleCancel(b.id)}
                  className="w-full bg-red-500 text-white py-1 rounded hover:bg-red-600 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
