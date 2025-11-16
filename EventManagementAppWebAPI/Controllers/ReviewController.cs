using EventManagementAppWebAPI.DTOs.Review;
using EventManagementAppWebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EventManagementAppWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Attendee,Organizer,Admin")]
    public class ReviewsController : ControllerBase
    {
        private readonly ReviewService _reviewService;
        private readonly ILogger<ReviewsController> _logger;

        public ReviewsController(ReviewService reviewService, ILogger<ReviewsController> logger)
        {
            _reviewService = reviewService;
            _logger = logger;
        }

        // ADD REVIEW
        [HttpPost]
        public async Task<IActionResult> AddReview([FromBody] ReviewCreateDto dto)
        {
            var userId = int.Parse(User.FindFirstValue("UserId")!);

            _logger.LogInformation("User {UserId} attempting to add review for Event {EventId}",
                                   userId, dto.EventId);

            try
            {
                var result = await _reviewService.AddReviewAsync(dto, userId);

                _logger.LogInformation("Review added successfully by User {UserId} for Event {EventId}",
                                        userId, dto.EventId);

                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while adding review by User {UserId} for Event {EventId}",
                                 userId, dto.EventId);

                return BadRequest(new { message = ex.Message });
            }
        }

        // GET REVIEWS FOR EVENT
        [HttpGet("{eventId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetReviews(int eventId)
        {
            _logger.LogInformation("Fetching all reviews for Event {EventId}", eventId);

            var reviews = await _reviewService.GetReviewsByEventAsync(eventId);

            _logger.LogInformation("Fetched {Count} reviews for Event {EventId}",
                                   reviews.Count(), eventId);

            return Ok(reviews);
        }

        // GET AVERAGE RATING
        [HttpGet("{eventId}/average")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAverageRating(int eventId)
        {
            _logger.LogInformation("Fetching average rating for Event {EventId}", eventId);

            var avg = await _reviewService.GetAverageRatingAsync(eventId);

            _logger.LogInformation("Average rating for Event {EventId} = {Avg}", eventId, avg);

            return Ok(new { EventId = eventId, AverageRating = avg });
        }
    }
}
