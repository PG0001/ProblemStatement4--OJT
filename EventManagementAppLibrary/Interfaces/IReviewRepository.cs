using EventManagementAppLibrary.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventManagementAppLibrary.Interfaces
{
    public interface IReviewRepository : IRepository<Review>
    {
        Task<IEnumerable<Review>> GetByEventAsync(int eventId);
        Task<IEnumerable<Review>> GetByUserAsync(int userId);
        Task<double> GetAverageRatingAsync(int eventId);
    }

}
