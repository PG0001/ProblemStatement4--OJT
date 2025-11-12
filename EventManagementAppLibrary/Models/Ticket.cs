using System;
using System.Collections.Generic;

namespace EventManagementAppLibrary.Models;

public partial class Ticket
{
    public int Id { get; set; }

    public int EventId { get; set; }

    public int UserId { get; set; }

    public DateTime BookingDate { get; set; }

    public int Quantity { get; set; }

    public double TotalPrice { get; set; }

    public virtual Event Event { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
