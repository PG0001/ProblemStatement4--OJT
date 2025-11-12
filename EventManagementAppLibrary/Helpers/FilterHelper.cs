using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventManagementAppLibrary.Helpers
{
    public static class FilterHelper
    {
        public static IQueryable<T> ApplyDateRangeFilter<T>(
            this IQueryable<T> query,
            Func<T, DateTime> dateSelector,
            DateTime? startDate,
            DateTime? endDate)
        {
            if (startDate.HasValue)
                query = query.Where(x => dateSelector(x) >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(x => dateSelector(x) <= endDate.Value);

            return query;
        }
    }
}
