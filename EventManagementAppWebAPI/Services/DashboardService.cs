using EventManagementAppLibrary.Interfaces;

namespace EventManagementAppWebAPI.Services
{
    public class DashboardService
    {
        private readonly IUnitOfWork _unitOfWork;

        public DashboardService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<object> GetAdminDashboardAsync()
        {
            var users = await _unitOfWork.Users.GetAllAsync();
            var eventsList = await _unitOfWork.Events.GetAllAsync();
            var tickets = await _unitOfWork.Tickets.GetAllAsync();
            var reviews = await _unitOfWork.Reviews.GetAllAsync();

            int totalUsers = users.Count();
            int totalEvents = eventsList.Count();
            int totalTickets = tickets.Count();
            double totalRevenue = tickets.Sum(t => t.TotalPrice);
            double avgRating = reviews.Any() ? reviews.Average(r => r.Rating) : 0;

            return new
            {
                TotalUsers = totalUsers,
                TotalEvents = totalEvents,
                TotalTickets = totalTickets,
                TotalRevenue = totalRevenue,
                AverageRating = avgRating
            };
        }

        public async Task<object> GetOrganizerDashboardAsync(int organizerId)
        {
            var eventsList = (await _unitOfWork.Events.FindAsync(e => e.OrganizerId == organizerId)).ToList();
            var eventIds = eventsList.Select(e => e.Id).ToList();
            var tickets = (await _unitOfWork.Tickets.FindAsync(t => eventIds.Contains(t.EventId))).ToList();
            var reviews = (await _unitOfWork.Reviews.FindAsync(r => eventIds.Contains(r.EventId))).ToList();

            int totalEvents = eventsList.Count();
            int totalTickets = tickets.Count();
            double totalRevenue = tickets.Sum(t => t.TotalPrice);
            double avgRating = reviews.Any() ? reviews.Average(r => r.Rating) : 0;

            return new
            {
                TotalEvents = totalEvents,
                TotalTickets = totalTickets,
                TotalRevenue = totalRevenue,
                AverageRating = avgRating
            };
        }
    }
}
