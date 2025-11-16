using EventManagementAppLibrary.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventManagementAppLibrary.Interfaces
{
    public interface IEventRepository : IRepository<Event>
    {
        Task<IEnumerable<Event>> GetByOrganizerAsync(int organizerId);
        Task<IEnumerable<Event>> GetByCategoryAsync(string category);
        Task<IEnumerable<Event>> GetByVenueAsync(string venue);
        Task<IEnumerable<Event>> SearchAsync(string? search, string? category, DateTime? start, DateTime? end);

        Task<IEnumerable<Event>> FilterAsync(string? category, string? venue, DateTime? start, DateTime? end);
        Task<bool> IsScheduleConflictAsync(string venue, DateTime startDate, DateTime endDate, int? excludeEventId = null);
        Task<IEnumerable<Event>> GetPopularEventsAsync(int topN);
        Task<bool> HasOverlapAsync(int? excludeId, string venue, DateTime start, DateTime end);

    }

}
