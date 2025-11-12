using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventManagementAppLibrary.Helpers
{
    public static class PaginationHelper
    {
        public static IQueryable<T> Paginate<T>(this IQueryable<T> query, int pageNumber, int pageSize)
        {
            if (pageNumber <= 0) pageNumber = 1;
            if (pageSize <= 0) pageSize = 10;
            return query.Skip((pageNumber - 1) * pageSize).Take(pageSize);
        }
    }
}
