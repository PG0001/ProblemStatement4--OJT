using EventManagementAppLibrary.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventManagementAppLibrary.Interfaces
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User?> GetByEmailAsync(string email);
        Task<IEnumerable<User>> GetByRoleAsync(string role);
    }

}
