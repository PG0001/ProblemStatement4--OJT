using EventManagementAppWebAPI.DTOs.Review;
using EventManagementAppWebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EventManagementAppWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Attendee,Admin")]
    public class ReviewsController : ControllerBase
    {
        private readonly ReviewService _reviewService;

        public ReviewsController(ReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        [HttpPost]
        public async Task<IActionResult> AddReview(ReviewCreateDto dto)
        {
            var userId = int.Parse(User.Claims.First(c => c.Type == "nameid").Value);
            var result = await _reviewService.AddReviewAsync(dto, userId);
            return Ok(result);
        }

        [HttpGet("{eventId}")]
        public async Task<IActionResult> GetReviews(int eventId)
        {
            var reviews = await _reviewService.GetReviewsByEventAsync(eventId);
            return Ok(reviews);
        }

        [HttpGet("{eventId}/average")]
        public async Task<IActionResult> GetAverageRating(int eventId)
        {
            var avg = await _reviewService.GetAverageRatingAsync(eventId);
            return Ok(new { EventId = eventId, AverageRating = avg });
        }
    }
}
