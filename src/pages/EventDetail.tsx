import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
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

interface Review {
  id: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchEvent();
    fetchReviews();
  }, [id]);

  const fetchReviews = async () => {
    try {
      // Fetch reviews from backend
      const res = await api.get(`/api/Reviews/${id}`);
      setReviews(res.data);
      
      // Fetch average rating
      const avgRes = await api.get(`/api/Reviews/${id}/average`);
      setAverageRating(avgRes.data.average || 0);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      // Don't show error toast for reviews - it's optional
    }
  };

  const fetchEvent = async () => {
    setLoading(true);
    try {
      // Fetch event details from backend
      const res = await api.get(`/Event/${id}`);
      setEvent(res.data);
    } catch (err) {
      console.error("Error fetching event:", err);
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
      // Call backend to book tickets
      await api.post("/bookings", {
        eventId: event.id,
        quantity: quantity,
        userId: user.id,
      });
      toast.success(`Booked ${quantity} ticket(s) for "${event.title}"`);
      navigate("/bookings");
    } catch (err) {
      console.error("Booking error:", err);
      toast.error("Booking failed");
    }
  };

  const handleAddReview = async () => {
    if (!user) {
      toast.error("Please login to add a review");
      navigate("/login");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      setReviewLoading(true);
      // Call backend to add review
      const newReview = await api.post(`/api/Reviews`, {
        eventId: event?.id,
        userId: user.id,
        rating: rating,
        comment: comment,
      });
      toast.success("Review added successfully!");
      setReviews([newReview.data, ...reviews]);
      setComment("");
      setRating(5);
      
      // Refresh average rating
      const avgRes = await api.get(`/api/Reviews/${id}/average`);
      setAverageRating(avgRes.data.average || 0);
    } catch (err) {
      console.error("Review error:", err);
      toast.error("Failed to add review");
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-300">Loading event...</p>;
  if (!event) return <p className="text-center mt-10 text-gray-400">Event not found.</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <Toaster />
      <div className="max-w-3xl mx-auto bg-gray-800 rounded-2xl shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-100">{event.title}</h1>
        <p className="text-gray-300 mb-1">{event.venue}</p>
        <p className="text-sm text-gray-400 mb-3">
          {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
        </p>

        <p className="text-gray-200 mb-4">{event.description}</p>

        <div className="flex justify-between items-center mb-6">
          <span className="text-gray-200 font-semibold">Available Seats: {event.availableSeats}</span>
          <span className="text-sm text-gray-400">Category: {event.category}</span>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <label className="text-gray-200 font-medium">Tickets:</label>
          <input
            type="number"
            min={1}
            max={event.availableSeats}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="bg-gray-700 border border-gray-600 rounded p-1 w-20 text-center text-gray-100"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleBooking}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Book Now
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition font-semibold"
          >
            Back to Events
          </button>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 border-t border-gray-700 pt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-100">Reviews & Ratings</h2>
            {averageRating > 0 && (
              <span className="text-lg font-semibold text-yellow-400">
                {"⭐".repeat(Math.round(averageRating))} {averageRating.toFixed(1)}
              </span>
            )}
          </div>

          {/* Add Review Form */}
          {user && (
            <div className="bg-gray-700 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-100">Add Your Review</h3>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-100 mb-2">Rating:</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value))}
                  className="bg-gray-600 border border-gray-600 p-2 rounded w-full text-gray-100"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ Excellent</option>
                  <option value={4}>⭐⭐⭐⭐ Good</option>
                  <option value={3}>⭐⭐⭐ Average</option>
                  <option value={2}>⭐⭐ Poor</option>
                  <option value={1}>⭐ Very Poor</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-100 mb-2">Comment:</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience..."
                  className="bg-gray-700 border border-gray-600 p-3 rounded w-full h-20 text-gray-100"
                />
              </div>
              <button
                onClick={handleAddReview}
                disabled={reviewLoading}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-gray-500"
              >
                {reviewLoading ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          )}

          {/* Display Reviews */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-gray-400">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-100">{review.userName}</h4>
                    <span className="text-sm text-yellow-400">{"⭐".repeat(review.rating)}</span>
                  </div>
                  <p className="text-gray-300 mb-2">{review.comment}</p>
                  <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
