using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace EventManagementAppLibrary.Interfaces
{
    public interface IRepository<T> where T : class
    {
        // Basic CRUD
        Task<T?> GetByIdAsync(int id);
        Task<IEnumerable<T>> GetAllAsync();
        Task AddAsync(T entity);
        void Update(T entity);
        void Remove(T entity);

        // LINQ-based querying
        Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate);
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);

        // Utility
        Task<int> CountAsync();
    }
    }
