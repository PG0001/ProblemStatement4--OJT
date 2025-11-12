using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace EventManagementAppLibrary.Models;

public partial class EventContext : DbContext
{
    public EventContext()
    {
    }

    public EventContext(DbContextOptions<EventContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Event> Events { get; set; }

    public virtual DbSet<Review> Reviews { get; set; }

    public virtual DbSet<Ticket> Tickets { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=(localdb)\\MSSQLLocalDB;Database=EventManagement;Trusted_Connection=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Event>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Events__3214EC07B7852702");

            entity.HasIndex(e => e.Category, "IDX_Events_Category");

            entity.HasIndex(e => e.StartDate, "IDX_Events_StartDate");

            entity.HasIndex(e => e.Title, "IDX_Events_Title");

            entity.HasIndex(e => e.Venue, "IDX_Events_Venue");

            entity.Property(e => e.Category).HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.Venue).HasMaxLength(200);

            entity.HasOne(d => d.Organizer).WithMany(p => p.Events)
                .HasForeignKey(d => d.OrganizerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Events_Organizer");
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Reviews__3214EC07BEC621B2");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Event).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.EventId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Reviews_Event");

            entity.HasOne(d => d.User).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Reviews_User");
        });

        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Tickets__3214EC079C171C56");

            entity.Property(e => e.BookingDate).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.TotalPrice).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.Event).WithMany(p => p.Tickets)
                .HasForeignKey(d => d.EventId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Tickets_Event");

            entity.HasOne(d => d.User).WithMany(p => p.Tickets)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Tickets_User");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Users__3214EC07628E6119");

            entity.HasIndex(e => e.Email, "UQ__Users__A9D10534EBA46F34").IsUnique();

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Email).HasMaxLength(150);
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.PasswordHash).HasMaxLength(500);
            entity.Property(e => e.Role).HasMaxLength(50);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
