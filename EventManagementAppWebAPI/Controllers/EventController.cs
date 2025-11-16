using EventManagementAppWebAPI.DTOs.Event;
using EventManagementAppWebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventManagementAppWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventController : ControllerBase
    {
        private readonly EventService _eventService;
        private readonly ILogger<EventController> _logger;

        public EventController(EventService eventService, ILogger<EventController> logger)
        {
            _eventService = eventService;
            _logger = logger;
        }

        // 🎯 Create Event (Organizer/Admin)
        [HttpPost]
        [Authorize(Roles = "Organizer,Admin")]
        public async Task<IActionResult> CreateEvent([FromBody] EventCreateDto dto)
        {
            try
            {
                int organizerId = int.Parse(User.FindFirst("UserId")!.Value);
                _logger.LogInformation("User {UserId} creating a new event: {Title}", organizerId, dto.Title);

                var message = await _eventService.CreateEventAsync(dto, organizerId);

                _logger.LogInformation("Event '{Title}' created successfully by User {UserId}", dto.Title, organizerId);
                return Ok(new { message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating event: {Title}", dto.Title);
                return StatusCode(500, new { message = "An error occurred while creating the event." });
            }
        }

        // 🎯 Update Event
        [HttpPut]
        [Authorize(Roles = "Organizer,Admin")]
        public async Task<IActionResult> UpdateEvent([FromBody] EventUpdateDto dto)
        {
            try
            {
                _logger.LogInformation("Updating event {EventId}", dto.Id);
                var message = await _eventService.UpdateEventAsync(dto);

                _logger.LogInformation("Event {EventId} updated successfully", dto.Id);
                return Ok(new { message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating event {EventId}", dto.Id);
                return StatusCode(500, new { message = "An error occurred while updating the event." });
            }
        }

        // 🎯 Delete Event
        [HttpDelete("{id}")]
        [Authorize(Roles = "Organizer,Admin")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            try
            {
                _logger.LogInformation("Deleting event {EventId}", id);
                var message = await _eventService.DeleteEventAsync(id);

                _logger.LogInformation("Event {EventId} deleted successfully", id);
                return Ok(new { message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting event {EventId}", id);
                return StatusCode(500, new { message = "An error occurred while deleting the event." });
            }
        }

        // 🎯 Get All Events
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                _logger.LogInformation("Fetching all events");
                var events = await _eventService.GetAllEventsAsync();
                return Ok(events);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching events");
                return StatusCode(500, new { message = "An error occurred while fetching events." });
            }
        }

        // 🎯 Get Event by ID
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                _logger.LogInformation("Fetching event {EventId}", id);
                var ev = await _eventService.GetEventByIdAsync(id);

                if (ev == null)
                {
                    _logger.LogWarning("Event {EventId} not found", id);
                    return NotFound(new { message = "Event not found" });
                }

                return Ok(ev);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching event {EventId}", id);
                return StatusCode(500, new { message = "An error occurred while fetching the event." });
            }
        }
        [HttpGet("search")]
        public async Task<IActionResult> Search(
        [FromQuery] string? q,
        [FromQuery] string? category,
        [FromQuery] DateTime? start,
        [FromQuery] DateTime? end)
        {
            var result = await _eventService.SearchEventsAsync(q, category, start, end);
            return Ok(result);
        }
        [HttpGet("popular")]
        public async Task<IActionResult> GetPopularEvents([FromQuery] int top = 5)
        {
            var result = await _eventService.GetPopularEventsCachedAsync(top);
            return Ok(result);
        }


    }
}
