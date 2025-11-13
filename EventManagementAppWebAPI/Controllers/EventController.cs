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

        public EventController(EventService eventService)
        {
            _eventService = eventService;
        }

        // 🎯 Create Event (Organizer only)
        [HttpPost]
        [Authorize(Roles = "Organizer,Admin")]
        public async Task<IActionResult> CreateEvent([FromBody] EventCreateDto dto)
        {
            int organizerId = int.Parse(User.FindFirst("UserId")!.Value);
            var message = await _eventService.CreateEventAsync(dto, organizerId);
            return Ok(new { message });
        }

        // 🎯 Update Event
        [HttpPut]
        [Authorize(Roles = "Organizer,Admin")]
        public async Task<IActionResult> UpdateEvent([FromBody] EventUpdateDto dto)
        {
            var message = await _eventService.UpdateEventAsync(dto);
            return Ok(new { message });
        }

        // 🎯 Delete Event
        [HttpDelete("{id}")]
        [Authorize(Roles = "Organizer,Admin")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            var message = await _eventService.DeleteEventAsync(id);
            return Ok(new { message });
        }

        // 🎯 Get All Events
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var events = await _eventService.GetAllEventsAsync();
            return Ok(events);
        }

        // 🎯 Get Event by ID
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var ev = await _eventService.GetEventByIdAsync(id);
            if (ev == null) return NotFound(new { message = "Event not found" });
            return Ok(ev);
        }
    }
}
