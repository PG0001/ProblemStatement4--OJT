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

    public class UserRepository : Repository<User>, IUserRepository
    {
        public UserRepository(EventContext context) : base(context) { }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _dbSet.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<IEnumerable<User>> GetByRoleAsync(string role)
        {
            return await _dbSet.Where(u => u.Role == role).ToListAsync();
        }
    }
}
