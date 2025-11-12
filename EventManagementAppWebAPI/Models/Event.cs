using System;
using System.Collections.Generic;

namespace EventManagementAppWebAPI.Models;

public partial class Event
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public string Category { get; set; } = null!;

    public string Venue { get; set; } = null!;

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public int OrganizerId { get; set; }

    public int TotalSeats { get; set; }

    public int AvailableSeats { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual User Organizer { get; set; } = null!;

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}
