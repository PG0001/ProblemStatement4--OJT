using EventManagementAppLibrary.Interfaces;
using EventManagementAppLibrary.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventManagementAppLibrary.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly EventContext _context;

        public IUserRepository Users { get; }
        public IEventRepository Events { get; }
        public ITicketRepository Tickets { get; }
        public IReviewRepository Reviews { get; }

        public UnitOfWork(
            EventContext context,
            IUserRepository userRepository,
            IEventRepository eventRepository,
            ITicketRepository ticketRepository,
            IReviewRepository reviewRepository)
        {
            _context = context;
            Users = userRepository;
            Events = eventRepository;
            Tickets = ticketRepository;
            Reviews = reviewRepository;
        }

        public async Task<int> SaveAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
