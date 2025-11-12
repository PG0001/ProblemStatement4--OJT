using System;
using System.Collections.Generic;

namespace EventManagementAppWebAPI.Models;

public partial class User
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string Role { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<Event> Events { get; set; } = new List<Event>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}
