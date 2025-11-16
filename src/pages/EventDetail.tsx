import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useEvents } from "../hooks/EventContext";
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";

interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
}

export default function EventDetail() {
  const { id } = useParams();
  const { events, fetchEvents } = useEvents();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    const loadEvents = async () => {
      if (events.length === 0) {
        setLoading(true);
        await fetchEvents();
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    loadEvents();
  }, [events, fetchEvents]);

  useEffect(() => {
    const found = events.find((ev) => ev.id === Number(id));
    setEvent(found);
  }, [events, id]);

  useEffect(() => {
    if (event) fetchReviews();
  }, [event]);

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await api.get(`/Reviews/${event.id}`);
      setReviews(res.data || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load reviews");
    } finally {
      setLoadingReviews(false);
    }
  };

  const submitReview = async () => {
    if (!reviewComment.trim()) return toast.error("Comment required");
    try {
      await api.post("/Reviews", {
        eventId: event.id,
        rating: reviewRating,
        comment: reviewComment,
      });
      toast.success("Review submitted!");
      setReviewComment("");
      setReviewRating(5);
      fetchReviews();
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 500) {
        toast.error(err.response.data?.message || "You have already added a review for this event.");
      } else if (err.response?.status === 400) {
        toast.error(err.response.data?.message || "You can only review events you attended.");
      } else {
        toast.error("Failed to submit review");
      }
    }
  };

  if (loading) return <p className="text-center text-gray-300 mt-10">Loading...</p>;
  if (!event) return <p className="text-center text-gray-300 mt-10">Event not found</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-900 text-gray-100 rounded-xl shadow-lg mt-6">
      <Toaster />
      <h1 className="text-3xl font-bold mb-2 text-center">{event.title}</h1>
      <p className="text-gray-400 text-center mb-4">{event.category}</p>

      <div className="mb-4">
        <p className="text-gray-300">{event.description}</p>
        <p className="text-gray-400 mt-2">
          <span className="font-semibold">Venue:</span> {event.venue}
        </p>
        <p className="text-gray-400 mt-1">
          <span className="font-semibold">Dates:</span>{" "}
          {new Date(event.startDate).toLocaleDateString()} -{" "}
          {new Date(event.endDate).toLocaleDateString()}
        </p>
        <p className="text-gray-300 mt-1">
          <span className="font-semibold">Seats Available:</span> {event.availableSeats}
        </p>
      </div>

      {/* Reviews Section */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Reviews</h2>
        {loadingReviews ? (
          <p className="text-gray-300">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-gray-400">No reviews yet.</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-auto">
            {reviews.map((r) => (
              <div key={r.id} className="bg-gray-800 p-3 rounded-md shadow-sm">
                <p className="text-gray-100 font-medium">{r.userName}</p>
                <p className="text-yellow-400 text-sm">Rating: {r.rating}</p>
                <p className="text-gray-300 text-sm">{r.comment}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add Review */}
        <div className="mt-4">
          <textarea
            placeholder="Write your review..."
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded text-gray-100 mb-2"
          />
          <input
            type="number"
            min={1}
            max={5}
            value={reviewRating}
            onChange={(e) => setReviewRating(parseInt(e.target.value))}
            className="w-full p-2 bg-gray-700 rounded text-gray-100 mb-2"
          />
          <button
            onClick={submitReview}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}
