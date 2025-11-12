using EventManagementAppLibrary.Interfaces;
using EventManagementAppLibrary.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventManagementAppLibrary.Repositories
{
    public class EventRepository : Repository<Event>, IEventRepository
    {
        public EventRepository(EventContext context) : base(context) { }

        public async Task<IEnumerable<Event>> GetByOrganizerAsync(int organizerId)
        {
            return await _dbSet.Where(e => e.OrganizerId == organizerId).ToListAsync();
        }

        public async Task<IEnumerable<Event>> GetByCategoryAsync(string category)
        {
            return await _dbSet.Where(e => e.Category == category).ToListAsync();
        }

        public async Task<IEnumerable<Event>> GetByVenueAsync(string venue)
        {
            return await _dbSet.Where(e => e.Venue == venue).ToListAsync();
        }

        public async Task<IEnumerable<Event>> SearchAsync(string keyword)
        {
            return await _dbSet
                .Where(e => e.Title.Contains(keyword) || e.Description.Contains(keyword))
                .ToListAsync();
        }

        public async Task<IEnumerable<Event>> FilterAsync(string? category, string? venue, DateTime? start, DateTime? end)
        {
            var query = _dbSet.AsQueryable();

            if (!string.IsNullOrEmpty(category))
                query = query.Where(e => e.Category == category);

            if (!string.IsNullOrEmpty(venue))
                query = query.Where(e => e.Venue == venue);

            if (start.HasValue)
                query = query.Where(e => e.StartDate >= start.Value);

            if (end.HasValue)
                query = query.Where(e => e.EndDate <= end.Value);

            return await query.ToListAsync();
        }

        public async Task<bool> IsScheduleConflictAsync(string venue, DateTime startDate, DateTime endDate, int? excludeEventId = null)
        {
            return await _dbSet.AnyAsync(e =>
                e.Venue == venue &&
                e.Id != excludeEventId &&
                ((startDate >= e.StartDate && startDate <= e.EndDate) ||
                 (endDate >= e.StartDate && endDate <= e.EndDate)));
        }

        public async Task<IEnumerable<Event>> GetPopularEventsAsync(int topN)
        {
            return await _dbSet
                .OrderByDescending(e => e.TotalSeats - e.AvailableSeats)
                .Take(topN)
                .ToListAsync();
        }
    }
}
