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
    public class TicketRepository : Repository<Ticket>, ITicketRepository
    {
        public TicketRepository(EventContext context) : base(context) { }

        public async Task<IEnumerable<Ticket>> GetByUserAsync(int userId)
        {
            return await _dbSet
                .Include(t => t.Event)
                .Where(t => t.UserId == userId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Ticket>> GetByEventAsync(int eventId)
        {
            return await _dbSet
                .Include(t => t.User)
                .Where(t => t.EventId == eventId)
                .ToListAsync();
        }

        public async Task<int> GetTicketsSoldAsync(int eventId)
        {
            return await _dbSet.Where(t => t.EventId == eventId)
                               .SumAsync(t => t.Quantity);
        }

        public async Task<bool> HasUserBookedEventAsync(int userId, int eventId)
        {
            return await _dbSet.AnyAsync(t => t.UserId == userId && t.EventId == eventId);
        }
    }
}
