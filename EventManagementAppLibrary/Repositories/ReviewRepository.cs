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
    public class ReviewRepository : Repository<Review>, IReviewRepository
    {
        public ReviewRepository(EventContext context) : base(context) { }

        public async Task<IEnumerable<Review>> GetByEventAsync(int eventId)
        {
            return await _dbSet
                .Include(r => r.User)
                .Where(r => r.EventId == eventId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Review>> GetByUserAsync(int userId)
        {
            return await _dbSet
                .Include(r => r.Event)
                .Where(r => r.UserId == userId)
                .ToListAsync();
        }

        public async Task<double> GetAverageRatingAsync(int eventId)
        {
            var reviews = await _dbSet.Where(r => r.EventId == eventId).ToListAsync();
            if (reviews.Count == 0) return 0;
            return reviews.Average(r => r.Rating);
        }
    }
}
