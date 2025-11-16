using AutoMapper;
using EventManagementAppLibrary.Interfaces;
using EventManagementAppLibrary.Models;
using EventManagementAppWebAPI.DTOs.Event;
using Microsoft.Extensions.Caching.Memory;

namespace EventManagementAppWebAPI.Services
{
    public class EventService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMemoryCache _cache;
        private readonly IMapper _mapper;

        public EventService(IUnitOfWork unitOfWork, IMemoryCache cache, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _cache = cache;
            _mapper = mapper;
        }

        // -------------------------------------------
        // SEARCH EVENTS
        // -------------------------------------------
        public async Task<IEnumerable<EventResponseDto>> SearchEventsAsync(
            string? search, string? category, DateTime? start, DateTime? end)
        {
            var events = await _unitOfWork.Events.SearchAsync(search, category, start, end);

            return _mapper.Map<IEnumerable<EventResponseDto>>(events);
        }

        // -------------------------------------------
        // CREATE EVENT
        // -------------------------------------------
        public async Task<string> CreateEventAsync(EventCreateDto dto, int organizerId)
        {
            if (await _unitOfWork.Events.HasOverlapAsync(null, dto.Venue, dto.StartDate, dto.EndDate))
                throw new Exception("Another event is already scheduled at this venue during the selected time.");

            var newEvent = _mapper.Map<Event>(dto);
            newEvent.OrganizerId = organizerId;
            newEvent.AvailableSeats = dto.TotalSeats;
            newEvent.CreatedAt = DateTime.Now;

            await _unitOfWork.Events.AddAsync(newEvent);
            await _unitOfWork.SaveAsync();

            return "Event created successfully.";
        }

        // -------------------------------------------
        // UPDATE EVENT
        // -------------------------------------------
        public async Task<string> UpdateEventAsync(EventUpdateDto dto)
        {
            var ev = await _unitOfWork.Events.GetByIdAsync(dto.Id);
            if (ev == null)
                throw new Exception("Event not found.");

            // Set the creation date to now if you want it to always be DateTime.Now
            var CreationDate = DateTime.Now;

            // Check: StartDate and EndDate should not be before CreationDate
            if (dto.StartDate < CreationDate || dto.EndDate < CreationDate)
                throw new Exception("Event start and end dates cannot be earlier than the creation date.");

            if (await _unitOfWork.Events.HasOverlapAsync(dto.Id, dto.Venue, dto.StartDate, dto.EndDate))
                throw new Exception("Another event is already scheduled at this venue during the selected time.");

            _mapper.Map(dto, ev);
            ev.AvailableSeats = dto.AvailableSeats;
            ev.TotalSeats = dto.AvailableSeats;

            _unitOfWork.Events.Update(ev);
            await _unitOfWork.SaveAsync();

            return "Event updated successfully.";
        }

        // -------------------------------------------
        // DELETE EVENT
        // -------------------------------------------
        public async Task<string> DeleteEventAsync(int eventId)
        {
            var ev = await _unitOfWork.Events.GetByIdAsync(eventId);
            if (ev == null)
                throw new Exception("Event not found.");

            // Remove tickets for this event first
            var tickets = await _unitOfWork.Tickets.FindAsync(t => t.EventId == eventId);

            foreach (var ticket in tickets)
            {
                _unitOfWork.Tickets.Remove(ticket);
            }
            var reviews = await _unitOfWork.Reviews.FindAsync(r => r.EventId == eventId);
            foreach (var review in reviews)
            {
                _unitOfWork.Reviews.Remove(review);
            }


            _unitOfWork.Events.Remove(ev);
            await _unitOfWork.SaveAsync();


            return "Event and related tickets deleted successfully.";
        }

        // -------------------------------------------
        // GET ALL EVENTS
        // -------------------------------------------
        public async Task<IEnumerable<EventResponseDto>> GetAllEventsAsync()
        {
            var events = await _unitOfWork.Events.GetAllAsync();
            return _mapper.Map<IEnumerable<EventResponseDto>>(events);
        }

        // -------------------------------------------
        // POPULAR EVENTS (CACHED)
        // -------------------------------------------
        public async Task<IEnumerable<EventResponseDto>> GetPopularEventsCachedAsync(int topN)
        {
            string cacheKey = $"popular-events-{topN}";

            if (_cache.TryGetValue(cacheKey, out IEnumerable<EventResponseDto> cached))
                return cached;

            var events = await _unitOfWork.Events.GetPopularEventsAsync(topN);

            var mapped = _mapper.Map<IEnumerable<EventResponseDto>>(events);

            _cache.Set(cacheKey, mapped, TimeSpan.FromMinutes(2));

            return mapped;
        }

        // -------------------------------------------
        // GET EVENT BY ID
        // -------------------------------------------
        public async Task<EventResponseDto?> GetEventByIdAsync(int id)
        {
            var e = await _unitOfWork.Events.GetByIdAsync(id);
            if (e == null) return null;

            return _mapper.Map<EventResponseDto>(e);
        }
    }
}
