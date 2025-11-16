using AutoMapper;
using EventManagementAppLibrary.Interfaces;
using EventManagementAppLibrary.Models;
using EventManagementAppWebAPI.DTOs.Review;

namespace EventManagementAppWebAPI.Services
{
    public class ReviewService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ReviewService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<string> AddReviewAsync(ReviewCreateDto dto, int userId)
        {
            var hasTicket = (await _unitOfWork.Tickets
                .FindAsync(t => t.UserId == userId && t.EventId == dto.EventId))
                .Any();

            if (!hasTicket)
                throw new Exception("You can only review events you attended.");

            var existing = (await _unitOfWork.Reviews
                .FindAsync(r => r.UserId == userId && r.EventId == dto.EventId))
                .FirstOrDefault();

            if (existing != null)
                throw new Exception("You already submitted a review for this event.");

            var review = _mapper.Map<Review>(dto);
            review.UserId = userId;
            review.CreatedAt = DateTime.Now;

            await _unitOfWork.Reviews.AddAsync(review);
            await _unitOfWork.SaveAsync();

            return "Review added successfully.";
        }

        public async Task<IEnumerable<ReviewResponseDto>> GetReviewsByEventAsync(int eventId)
        {
            var reviews = await _unitOfWork.Reviews.FindAsync(r => r.EventId == eventId);
            return _mapper.Map<IEnumerable<ReviewResponseDto>>(reviews);
        }

        public async Task<double> GetAverageRatingAsync(int eventId)
        {
            var reviews = await _unitOfWork.Reviews.FindAsync(r => r.EventId == eventId);
            return reviews.Any() ? reviews.Average(r => r.Rating) : 0;
        }
    }
}
