# EventHub - Full-Stack Event Management Application

EventHub is a full-stack web application that allows organizations to create events, users to browse and book tickets, and admins to monitor real-time statistics.

---

## **Table of Contents**

- [Features](#features)
- [Technologies](#technologies)
- [Setup Instructions](#setup-instructions)
- [Architecture Overview](#architecture-overview)
- [API Endpoints](#api-endpoints)
- [Frontend Modules](#frontend-modules)
- [Demo & Screenshots](#demo--screenshots)
- [License](#license)

---

## **Features**

### Backend
- ASP.NET Core 8 Web API + EF Core
- Entities:
  - **User:** Id, Name, Email, PasswordHash, Role (Admin, Organizer, Attendee)
  - **Event:** Id, Title, Description, Category, Venue, StartDate, EndDate, OrganizerId, TotalSeats, AvailableSeats, CreatedAt
  - **Ticket:** Id, EventId, UserId, BookingDate, Quantity, TotalPrice
  - **Review:** Id, EventId, UserId, Rating, Comment, CreatedAt
- JWT-based Authentication & Authorization
- Role-based API access:
  - Admin > Organizer > Attendee
- Event Management:
  - Create / Update events
  - Prevent overlapping events at the same venue/time
- Ticket Booking:
  - Check AvailableSeats before confirming
  - Safe concurrent bookings via transactions
- Search & Filtering:
  - Advanced filtering (category, venue, date range, organizer)
  - Full-text search on event titles/descriptions
- Caching (optional: In-memory / Redis)
- Analytics Endpoint: `/api/dashboard/stats` 
  - total users, events, tickets sold, average rating
- Reviews:
  - Attendees can leave ratings/comments post-event
- Advanced Patterns:
  - Repository + Unit of Work
  - Automapper DTOs
  - Pagination & filtering helpers
  - Global Exception Middleware & Serilog logging
- Swagger with JWT auth support

### Frontend
- React + Vite + TailwindCSS
- Auth Pages: Login / Register
- Event List: Search, filter, pagination, category chips
- Event Detail: Description, organizer info, available seats, reviews, booking form
- Booking Page: User's booked tickets, cancel/refund simulation
- Organizer Dashboard: Create/edit events, track remaining seats visually
- Admin Dashboard: System-wide statistics with charts (Recharts / Chart.js)
- Axios for API calls, JWT handling in localStorage
- Role-based route protection
- Loading/error states & toast notifications
- Responsive & polished UI

---

## **Technologies**

- **Backend:** .NET 8, Entity Framework Core, AutoMapper, Serilog, JWT
- **Frontend:** React, Vite, TailwindCSS, Axios, Recharts / Chart.js, react-hot-toast
- **Database:** SQL Server (via EF Core Migrations)
- **Tools:** Swagger, Postman

---

## **Setup Instructions**

### Backend
1. Clone the repository:
   ```bash
   git clone https://github.com/PG0001/ProblemStatement4--OJT.git
   cd ProblemHub.Api
Update appsettings.json for your database connection.

Run EF Core migrations:

bash
Copy code
dotnet ef database update
Start the API:

bash
Copy code
dotnet run
Access Swagger at https://localhost:<port>/swagger.

Frontend
Navigate to frontend folder:

bash
Copy code
cd eventhub-client
Install dependencies:

bash
Copy code
npm install
Start the development server:

bash
Copy code
npm run dev
Open browser at http://localhost:5173

Architecture Overview
Backend:

Clean architecture with Controllers, Services, Repositories, UnitOfWork

JWT authentication & role-based authorization

AutoMapper for DTO mapping

Global Exception Handling with Serilog logging

Frontend:

React context for auth and event management

Axios for API calls with JWT interceptor

Role-based routing for Admin / Organizer / Attendee

TailwindCSS for responsive UI and styling

Recharts / Chart.js for analytics

API Endpoints
POST /api/auth/register – Register user

POST /api/auth/login – Login

GET /api/events – List events (filterable)

POST /api/events – Create event (Organizer)

PUT /api/events/{id} – Update event (Organizer)

GET /api/tickets/my – Get user bookings

POST /api/tickets/book – Book ticket

DELETE /api/tickets/{id} – Cancel booking

GET /api/dashboard/stats – Admin analytics

GET /api/reviews/{eventId} – Fetch reviews

POST /api/reviews – Submit review

Frontend Modules
Auth Pages: Login / Register

Event Listing: Search, filter, pagination

Event Detail: Book tickets, view/add reviews

Booking Page: View & cancel tickets

Organizer Dashboard: Event creation/editing, track bookings

Admin Dashboard: Analytics charts and statistics

