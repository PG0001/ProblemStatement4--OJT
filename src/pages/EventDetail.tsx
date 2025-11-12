import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../hooks/AuthContext";

interface Event {
  id: number;
  title: string;
  description: string;
  category: string;
  venue: string;
  startDate: string;
  endDate: string;
  availableSeats: number;
  organizerName?: string;
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      // Replace this mock with your real backend URL later
      const res = await axios.get(`/mock/event_${id}.json`);
      setEvent(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Error loading event details");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      toast.error("Please login to book tickets");
      navigate("/login");
      return;
    }
    if (user.role !== "Attendee") {
      toast.error("Only attendees can book tickets.");
      return;
    }

    if (!event) return;
    if (quantity > event.availableSeats) {
      toast.error("Not enough seats available!");
      return;
    }

    try {
      // Later replace with POST /api/tickets/book
      toast.success(`Booked ${quantity} ticket(s) for "${event.title}"`);
      navigate("/bookings");
    } catch (err) {
      toast.error("Booking failed");
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-600">Loading event...</p>;
  if (!event) return <p className="text-center mt-10 text-gray-500">Event not found.</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster />
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">{event.title}</h1>
        <p className="text-gray-600 mb-1">{event.venue}</p>
        <p className="text-sm text-gray-500 mb-3">
          {new Date(event.startDate).toLocaleDateString()} -{" "}
          {new Date(event.endDate).toLocaleDateString()}
        </p>

        <p className="text-gray-700 mb-4">{event.description}</p>

        <div className="flex justify-between items-center mb-6">
          <span className="text-gray-700 font-semibold">
            Available Seats: {event.availableSeats}
          </span>
          <span className="text-sm text-gray-500">Category: {event.category}</span>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <label className="text-gray-700 font-medium">Tickets:</label>
          <input
            type="number"
            min={1}
            max={event.availableSeats}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="border rounded p-1 w-20 text-center"
          />
        </div>

        <button
          onClick={handleBooking}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
