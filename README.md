# Meditrack - PERN Stack Authentication System

A full-stack web application built with PostgreSQL, Express.js, React, and Node.js (PERN stack) featuring user authentication and activity logging using Supabase.

## Features

- **User Authentication**: Login/logout with username and password
- **Role-based Access Control**: Support for user, admin, and superadmin roles
- **Activity Logging**: Tracks user login/logout activities with timestamps and IP addresses
- **Admin Dashboard**: View user activity logs (admin and superadmin only)
- **Secure Backend**: JWT-based authentication with bcrypt password hashing

## Tech Stack

- **Frontend**: React with TypeScript
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL via Supabase
- **Authentication**: JWT tokens with bcrypt
- **Styling**: Custom CSS

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### 1. Clone the Repository

```bash
git clone https://github.com/PatzMain/MeditrackV7.git
cd MeditrackV7
```

### 2. Set up Supabase

1. Create a new project at [Supabase](https://supabase.com)
2. Go to the SQL Editor and run the schema from `server/database/schema.sql`
3. Get your project URL and service role key from the API settings

### 3. Configure Environment Variables

#### Server Configuration
Copy `server/.env.example` to `server/.env` and fill in your Supabase credentials:

```env
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

#### Client Configuration
Copy `client/.env.example` to `client/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 5. Create Default Users

Run the user creation script to set up admin and superadmin accounts:

```bash
cd server
node scripts/createUsers.js
```

This creates:
- **Admin**: username=`admin`, password=`admin123`
- **Superadmin**: username=`superadmin`, password=`superadmin123`

**Important**: Change these passwords after first login!

### 6. Start the Application

#### Start the Backend Server
```bash
cd server
npm run dev
```

#### Start the Frontend (in a new terminal)
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/profile` - Get current user profile
- `GET /api/users/activity` - Get user activity logs (admin/superadmin only)

## Database Schema

### Users Table
- `id` - Primary key
- `username` - Unique username
- `password` - Hashed password
- `role` - User role (user, admin, superadmin)
- `created_at` - Account creation timestamp

### User Activity Table
- `id` - Primary key
- `user_id` - Foreign key to users table
- `action` - Action performed (login, logout, register)
- `timestamp` - When the action occurred
- `ip_address` - User's IP address

## Default Credentials

After running the setup script, you can log in with:

- **Admin**: `admin` / `admin123`
- **Superadmin**: `superadmin` / `superadmin123`

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control
- Activity logging with IP tracking
- CORS protection
- Input validation

## Development

### Running in Development Mode

```bash
# Backend with nodemon
cd server
npm run dev

# Frontend with hot reload
cd client
npm start
```

### Database Management

All database operations are handled through Supabase. The schema is defined in `server/database/schema.sql`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.