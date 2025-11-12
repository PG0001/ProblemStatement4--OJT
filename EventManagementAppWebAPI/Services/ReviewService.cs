using EventManagementAppLibrary.Interfaces;
using EventManagementAppLibrary.Models;
using EventManagementAppWebAPI.DTOs.Review;

namespace EventManagementAppWebAPI.Services
{
    public class ReviewService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ReviewService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<string> AddReviewAsync(ReviewCreateDto dto, int userId)
        {
            // Ensure the user attended this event
            var hasTicket = (await _unitOfWork.Tickets.FindAsync(t => t.UserId == userId && t.EventId == dto.EventId)).Any();
            if (!hasTicket)
                throw new Exception("You can only review events you attended.");

            // Check if already reviewed
            var existing = await _unitOfWork.Reviews.FirstOrDefaultAsync(r => r.UserId == userId && r.EventId == dto.EventId);
            if (existing != null)
                throw new Exception("You already submitted a review for this event.");

            var review = new Review
            {
                EventId = dto.EventId,
                UserId = userId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreatedAt = DateTime.Now
            };

            await _unitOfWork.Reviews.AddAsync(review);
            await _unitOfWork.SaveAsync();

            return "Review added successfully.";
        }

        public async Task<IEnumerable<Review>> GetReviewsByEventAsync(int eventId)
        {
            return await _unitOfWork.Reviews.FindAsync(r => r.EventId == eventId);
        }

        public async Task<double> GetAverageRatingAsync(int eventId)
        {
            var reviews = await _unitOfWork.Reviews.FindAsync(r => r.EventId == eventId);
            return reviews.Any() ? reviews.Average(r => r.Rating) : 0;
        }
    }
}
