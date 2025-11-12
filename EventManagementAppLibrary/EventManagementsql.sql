-- =========================================
-- DATABASE: EventManagement
-- =========================================
CREATE DATABASE EventManagement;
GO

USE EventManagement;
GO

-- =========================================
-- TABLE: Users
-- =========================================
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(500) NOT NULL,
    Role NVARCHAR(50) NOT NULL CHECK (Role IN ('Admin', 'Organizer', 'Attendee')),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- =========================================
-- TABLE: Events
-- =========================================
CREATE TABLE Events (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),
    Category NVARCHAR(100) NOT NULL,
    Venue NVARCHAR(200) NOT NULL,
    StartDate DATETIME2 NOT NULL,
    EndDate DATETIME2 NOT NULL,
    OrganizerId INT NOT NULL,
    TotalSeats INT NOT NULL CHECK (TotalSeats >= 0),
    AvailableSeats INT NOT NULL CHECK (AvailableSeats >= 0),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Events_Organizer FOREIGN KEY (OrganizerId) REFERENCES Users(Id)
);

-- =========================================
-- TABLE: Tickets
-- =========================================
CREATE TABLE Tickets (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    EventId INT NOT NULL,
    UserId INT NOT NULL,
    BookingDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    Quantity INT NOT NULL CHECK (Quantity > 0),
    TotalPrice DECIMAL(10, 2) NOT NULL CHECK (TotalPrice >= 0),
    CONSTRAINT FK_Tickets_Event FOREIGN KEY (EventId) REFERENCES Events(Id),
    CONSTRAINT FK_Tickets_User FOREIGN KEY (UserId) REFERENCES Users(Id)
);

-- =========================================
-- TABLE: Reviews
-- =========================================
CREATE TABLE Reviews (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    EventId INT NOT NULL,
    UserId INT NOT NULL,
    Rating INT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Comment NVARCHAR(MAX),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Reviews_Event FOREIGN KEY (EventId) REFERENCES Events(Id),
    CONSTRAINT FK_Reviews_User FOREIGN KEY (UserId) REFERENCES Users(Id)
);

-- =========================================
-- INDEXES (VALID)
-- =========================================
CREATE INDEX IDX_Events_Title ON Events(Title);
CREATE INDEX IDX_Events_Category ON Events(Category);
CREATE INDEX IDX_Events_Venue ON Events(Venue);
CREATE INDEX IDX_Events_StartDate ON Events(StartDate);

-- =========================================
-- SAMPLE DATA
-- =========================================
INSERT INTO Users (Name, Email, PasswordHash, Role) VALUES
('Admin User', 'admin@example.com', 'hashedpassword1', 'Admin'),
('Organizer One', 'org1@example.com', 'hashedpassword2', 'Organizer'),
('Attendee One', 'user1@example.com', 'hashedpassword3', 'Attendee');

INSERT INTO Events (Title, Description, Category, Venue, StartDate, EndDate, OrganizerId, TotalSeats, AvailableSeats) VALUES
('Tech Conference 2025', 'A tech conference for developers', 'Technology', 'Conference Hall A', '2025-12-01 10:00', '2025-12-01 18:00', 2, 200, 200),
('Music Festival', 'Live music festival', 'Music', 'Open Grounds', '2025-12-05 14:00', '2025-12-05 22:00', 2, 500, 500);

INSERT INTO Tickets (EventId, UserId, Quantity, TotalPrice) VALUES
(1, 3, 2, 100.00);

INSERT INTO Reviews (EventId, UserId, Rating, Comment) VALUES
(1, 3, 5, 'Amazing event!');

-- =========================================
-- DASHBOARD QUERY (TEST)
-- =========================================
SELECT 
    (SELECT COUNT(*) FROM Users) AS TotalUsers,
    (SELECT COUNT(*) FROM Events) AS TotalEvents,
    (SELECT COUNT(*) FROM Tickets) AS TotalTickets,
    (SELECT AVG(Rating*1.0) FROM Reviews) AS AverageRating;


go
select * from Users;
select * from Events;
select * from Tickets;
select * from Reviews;