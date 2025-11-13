using EventManagementAppLibrary.Interfaces;
using EventManagementAppLibrary.Models;
using EventManagementAppWebAPI.DTOs.Event;

namespace EventManagementAppWebAPI.Services
{
    public class EventService
    {
        private readonly IUnitOfWork _unitOfWork;

        public EventService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // ✅ Create Event
        public async Task<string> CreateEventAsync(EventCreateDto dto, int organizerId)
        {
            var newEvent = new Event
            {
                Title = dto.Title,
                Description = dto.Description,
                Category = dto.Category,
                Venue = dto.Venue,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                TotalSeats = dto.TotalSeats,
                AvailableSeats = dto.TotalSeats,
                OrganizerId = organizerId,
                CreatedAt = DateTime.Now
            };

            await _unitOfWork.Events.AddAsync(newEvent);
            await _unitOfWork.SaveAsync();

            return "Event created successfully.";
        }

        // ✅ Update Event
        public async Task<string> UpdateEventAsync(EventUpdateDto dto)
        {
            var ev = await _unitOfWork.Events.GetByIdAsync(dto.Id);
            if (ev == null)
                throw new Exception("Event not found.");

            ev.Title = dto.Title;
            ev.Description = dto.Description;
            ev.Category = dto.Category;
            ev.Venue = dto.Venue;
            ev.StartDate = dto.StartDate;
            ev.EndDate = dto.EndDate;
            ev.TotalSeats = dto.TotalSeats;

            _unitOfWork.Events.Update(ev);
            await _unitOfWork.SaveAsync();

            return "Event updated successfully.";
        }

        // ✅ Delete Event
        public async Task<string> DeleteEventAsync(int eventId)
        {
            var ev = await _unitOfWork.Events.GetByIdAsync(eventId);
            if (ev == null)
                throw new Exception("Event not found.");

            _unitOfWork.Events.Remove(ev);
            await _unitOfWork.SaveAsync();

            return "Event deleted successfully.";
        }

        // ✅ Get All Events
        public async Task<IEnumerable<EventResponseDto>> GetAllEventsAsync()
        {
            var events = await _unitOfWork.Events.GetAllAsync();

            return events.Select(e => new EventResponseDto
            {
                Id = e.Id,
                Title = e.Title,
                Category = e.Category,
                Venue = e.Venue,
                StartDate = e.StartDate,
                EndDate = e.EndDate,
                AvailableSeats = e.AvailableSeats,
                AverageRating = e.Reviews?.Any() == true ? e.Reviews.Average(r => r.Rating) : 0
            });
        }

        // ✅ Get Event By ID
        public async Task<EventResponseDto?> GetEventByIdAsync(int id)
        {
            var e = await _unitOfWork.Events.GetByIdAsync(id);
            if (e == null) return null;

            return new EventResponseDto
            {
                Id = e.Id,
                Title = e.Title,
                Category = e.Category,
                Venue = e.Venue,
                StartDate = e.StartDate,
                EndDate = e.EndDate,
                AvailableSeats = e.AvailableSeats,
                AverageRating = e.Reviews?.Any() == true ? e.Reviews.Average(r => r.Rating) : 0
            };
        }
    }
}
