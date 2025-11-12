using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventManagementAppLibrary.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IUserRepository Users { get; }
        IEventRepository Events { get; }
        ITicketRepository Tickets { get; }
        IReviewRepository Reviews { get; }
        Task<int> SaveAsync();
    }

}
    