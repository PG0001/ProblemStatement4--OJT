import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useEvents } from "../hooks/EventContext";
import { useAuth } from "../hooks/AuthContext";
import api from "../api/axios";

interface Booking {
  id: number;
  eventId: number;
  eventTitle: string;
  quantity: number;
  bookingDate: string;
}

export default function AttendeeDashboard() {
  const { events, fetchEvents } = useEvents();
  const { user } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<typeof events[0] | null>(null);
  const [quantity, setQuantity] = useState(1);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

  // Track already booked quantity per event
  const bookedQuantities = bookings.reduce<Record<number, number>>((acc, b) => {
    acc[b.eventId] = (acc[b.eventId] || 0) + b.quantity;
    return acc;
  }, {});

  useEffect(() => {
    fetchEvents();
    if (user) fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const res = await api.get("/Tickets/my");
      setBookings(res.data || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Could not load bookings");
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleBookTicket = async () => {
    if (!user || !selectedEvent) return;

    const remainingSeats = selectedEvent.availableSeats - (bookedQuantities[selectedEvent.id] || 0);
    if (quantity > remainingSeats) {
      toast.error(`Only ${remainingSeats} seats available`);
      return;
    }

    try {
      await api.post("/Tickets/book", { eventId: selectedEvent.id, quantity });
      toast.success("Ticket booked successfully!");
      setShowBookingModal(false);
      fetchEvents();
      fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Booking failed");
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await api.delete(`/Tickets/${bookingId}`);
      toast.success("Booking canceled successfully!");
      fetchEvents();
      fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to cancel booking");
    }
  };

  const fetchReviews = async (eventId: number) => {
    try {
      const res = await api.get(`/Reviews/${eventId}`);
      setReviews(res.data || []);
    } catch (err: any) {
      toast.error("Failed to load reviews");
    }
  };

  const submitReview = async () => {
    if (!selectedEvent || !reviewComment.trim()) return toast.error("Comment required");

    try {
      await api.post("/Reviews", {
        eventId: selectedEvent.id,
        rating: reviewRating,
        comment: reviewComment,
      });
      toast.success("Review submitted!");
      setReviewComment("");
      setReviewRating(5);
      fetchReviews(selectedEvent.id);
    } catch (err: any) {
      if (err.response?.status === 500 || err.response?.status === 400) {
        toast.error(err.response?.data?.message);
      } else {
        toast.error("Failed to submit review");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6 text-center">Book Your Tickets</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Event List */}
        <div className="flex-1">
          <h2 className="text-2xl mb-4 text-center">Available Events</h2>
          {events.length === 0 ? (
            <p className="text-center text-gray-400">No events available</p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {events.map((ev) => {
                const isPast = new Date(ev.endDate) < new Date();
                const userBookedQty = bookedQuantities[ev.id] || 0;
                const remainingSeats = ev.availableSeats - userBookedQty;

                return (
                  <div key={ev.id} className="bg-gray-800 p-4 rounded-xl shadow">
                    <h3 className="text-lg font-semibold">{ev.title}</h3>
                    <p className="text-gray-300">{ev.description}</p>
                    <p className="text-gray-300">{ev.venue}</p>
                    <p className="text-gray-400">
                      {new Date(ev.startDate).toLocaleDateString()} -{" "}
                      {new Date(ev.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-gray-300 mt-2">
                      Seats remaining: {remainingSeats}
                    </p>

                    {userBookedQty > 0 ? (
                      <button
                        onClick={() => {
                          const booking = bookings.find((b) => b.eventId === ev.id);
                          if (booking) handleCancelBooking(booking.id);
                        }}
                        className="mt-2 w-full py-1 rounded bg-red-600 hover:bg-red-700"
                      >
                        Cancel Booking
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedEvent(ev);
                          setQuantity(1);
                          setShowBookingModal(true);
                        }}
                        className={`mt-2 w-full py-1 rounded ${
                          isPast || remainingSeats <= 0
                            ? "bg-gray-600 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                        disabled={isPast || remainingSeats <= 0}
                      >
                        Book Ticket
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedEvent(ev);
                        fetchReviews(ev.id);
                        setShowReviewModal(true);
                      }}
                      className="mt-2 w-full bg-purple-600 py-1 rounded hover:bg-purple-700"
                    >
                      Add / View Review
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bookings Sidebar */}
        {user && (
          <aside className="w-full lg:w-80">
            <div className="bg-gray-800 p-4 rounded-xl shadow">
              <h3 className="text-lg font-semibold mb-3">My Bookings</h3>
              {loadingBookings ? (
                <p>Loading...</p>
              ) : bookings.length === 0 ? (
                <p>No bookings yet</p>
              ) : (
                <ul className="space-y-2 max-h-96 overflow-auto">
                  {bookings
                    .sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime())
                    .map((b) => (
                      <li key={b.id} className="p-2 rounded flex flex-col gap-1 bg-gray-700 hover:bg-gray-600">
                        <p className="text-sm font-medium">{b.eventTitle}</p>
                        <p className="text-xs">Tickets: {b.quantity}</p>
                        <p className="text-xs">
                          Event Date: {new Date(b.bookingDate).toLocaleDateString()}{" "}
                          {new Date(b.bookingDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-xs mt-1"
                        >
                          Cancel
                        </button>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl w-96">
            <h2 className="text-xl font-bold mb-4">{selectedEvent.title}</h2>
            <label>Quantity:</label>
            <input
              type="number"
              min={1}
              max={selectedEvent.availableSeats - (bookedQuantities[selectedEvent.id] || 0)}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-full p-2 bg-gray-700 rounded text-gray-100 mt-1"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowBookingModal(false)} className="px-4 py-2 bg-gray-600 rounded">
                Cancel
              </button>
              <button onClick={handleBookTicket} className="px-4 py-2 bg-green-600 rounded">
                Book
              </button>
            </div>
          </div>
        </div>
      )}

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
            <textarea
              className="w-full p-2 bg-gray-700 rounded text-gray-100 mb-2"
              placeholder="Write your review..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />
            <input
              type="number"
              min={1}
              max={5}
              value={reviewRating}
              onChange={(e) => setReviewRating(parseInt(e.target.value))}
              className="w-full p-2 bg-gray-700 rounded text-gray-100 mb-2"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowReviewModal(false)} className="px-4 py-2 bg-gray-600 rounded">
                Close
              </button>
              <button onClick={submitReview} className="px-4 py-2 bg-purple-600 rounded">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
