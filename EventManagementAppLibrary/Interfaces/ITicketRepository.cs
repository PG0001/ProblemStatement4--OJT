using EventManagementAppLibrary.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventManagementAppLibrary.Interfaces
{
    public interface ITicketRepository : IRepository<Ticket>
    {
        Task<IEnumerable<Ticket>> GetByUserAsync(int userId);
        Task<IEnumerable<Ticket>> GetByEventAsync(int eventId);
        Task<int> GetTicketsSoldAsync(int eventId);
        Task<bool> HasUserBookedEventAsync(int userId, int eventId);
    }

}
